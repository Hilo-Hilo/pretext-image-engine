# pretext-image-engine

A standalone, image-aware text layout engine built on [`@chenglou/pretext`](https://github.com/chenglou/pretext).

The engine takes:

- a full base image
- a same-canvas overlay image whose opaque pixels should stay in front
- structured scene JSON for text, regions, colors, highlight, fallback, and debug behavior

It then tries to place text inside the transparent openings without covering the subject. If the opening gets too tight and `preserveFullText` is enabled, it falls back below the image so nothing disappears.

## Why This Exists

This repo is intentionally isolated from any website implementation. It focuses on one thing:

> image input plus overlay-mask parsing plus `pretext` text layout

The goal is a reusable engine for editorial-image compositions, not a site-specific component.

## Features

- Base-image plus overlay-mask composition
- Row-by-row transparent-slot parsing from the overlay alpha
- `pretext`-powered manual line layout
- Region-aware layout for multi-opening overlays
- Automatic dark/light text selection from sampled image luminance
- Optional highlight pills or blocks for better legibility
- Long-opening column splitting
- Resize-aware fallback when full text should be preserved
- Debug overlays for slots and regions
- Package-friendly API plus demo app

## Install

```bash
npm install pretext-image-engine
```

## Local Development

```bash
npm install
npm run dev
```

Other commands:

```bash
npm run typecheck
npm run build:lib
npm run build:demo
npm run build
npm run preview
```

## Basic Usage

```ts
import { createPretextImageEngine, type ImageEngineSceneConfig } from 'pretext-image-engine'

const scene: ImageEngineSceneConfig = {
  meta: {
    name: 'Demo scene',
    alt: 'A photo with an editorial opening.'
  },
  assets: {
    baseSrc: '/scenes/demo/base.png',
    overlaySrc: '/scenes/demo/overlay.png'
  },
  blocks: [
    { style: 'heading', text: 'Editorial image layout.' },
    { style: 'body', text: 'The overlay keeps the subject in front while the text flows into the transparent region.' }
  ]
}

const mount = document.getElementById('engine')

if (!mount) {
  throw new Error('Missing mount node')
}

const engine = createPretextImageEngine(mount, scene)
await engine.ready
```

## Scene Config

The demo uses `src/demo/sample-scene.json` as a full reference scene.

There is also a schema file at `schemas/scene.schema.json`.

Main sections:

- `meta`: scene identity and accessibility text
- `assets`: base image, overlay image, alpha threshold, fit mode
- `stage`: aspect ratio, minimum height, background, frame styling
- `layout`: padding, min slot width, font downscaling, fallback trigger width
- `resize`: whether to preserve full text and what fallback mode to use
- `colors`: fixed or automatic text color, highlight behavior, shadows, selection colors
- `columnSplit`: how long transparent strips can become multiple columns
- `interaction`: whether text is selectable
- `debug`: slot and region visualization
- `regions`: named placement zones for multi-opening masks
- `styles`: reusable typography presets for `eyebrow`, `heading`, `lede`, `body`, `caption`, or custom styles
- `blocks`: the actual text content and per-block overrides

### Multi-Opening Overlays

If your overlay has several transparent openings, there are two modes:

- Automatic mode: blocks are laid out wherever the transparent slots fit best.
- Region-aware mode: define named `regions` and assign blocks to them.

Example:

```json
{
  "regions": {
    "sky": {
      "xStart": 0.58,
      "xEnd": 0.98,
      "yStart": 0.04,
      "yEnd": 0.42,
      "anchorX": 0.78
    },
    "water": {
      "xStart": 0.04,
      "xEnd": 0.72,
      "yStart": 0.5,
      "yEnd": 0.96,
      "anchorX": 0.22
    }
  },
  "blocks": [
    { "style": "heading", "region": "sky", "text": "Bridge into haze." },
    { "style": "body", "region": "water", "text": "Longer body copy..." }
  ]
}
```

## Contrast and Highlight

The engine can sample the image under each line and switch automatically between light and dark text.

Highlights can be:

- disabled
- fixed-color pills or blocks
- automatic pills/blocks that flip tone depending on the sampled background

That means you can keep text readable on haze, water, shadow, or mixed backgrounds without hard-coding one color for the whole image.

## Long Empty Regions

If an opening becomes a long strip, `columnSplit` can break it into multiple sub-slots on the same band.

Key fields:

- `mode`: `off`, `auto`, or `fixed`
- `preferredColumns`
- `maxColumns`
- `minColumnWidth`
- `gap`
- `applyToStyles`

## Resize Behavior

If `resize.preserveFullText` is `true`, the engine tries:

1. masked in-image layout
2. smaller font scales down to `layout.minScale`
3. fallback below the image if the scene still does not fit

If `resize.preserveFullText` is `false`, the engine keeps the text in the image and allows clipping instead of falling back.

## Demo Assets

The demo ships with a sample scene under:

```text
public/scenes/san-francisco/
```

The preview app lets you:

- resize the stage
- toggle debug overlays
- toggle text selection
- edit the scene JSON directly

## Package Surface

Exports:

- `createPretextImageEngine()`
- `PretextImageEngine`
- TypeScript types for the scene config

## Caveats

- The engine assumes the base image and overlay share the same composition and alignment.
- Automatic placement can only infer geometry. For art-directed multi-region layouts, define named regions.
- Very small openings still need either shorter copy or fallback behavior.

## License

MIT
