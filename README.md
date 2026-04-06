# pretext-image-engine

[![npm version](https://img.shields.io/npm/v/pretext-image-engine)](https://www.npmjs.com/package/pretext-image-engine)
[![CI](https://github.com/Hilo-Hilo/pretext-image-engine/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Hilo-Hilo/pretext-image-engine/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/pretext-image-engine)](https://github.com/Hilo-Hilo/pretext-image-engine/blob/main/LICENSE)

Image-aware text layout for editorial compositions, built on [`@chenglou/pretext`](https://github.com/chenglou/pretext).

The engine takes a base image, a same-canvas overlay mask, and structured scene data, then lays text into transparent openings so the subject stays visually in front. If the opening becomes too tight and full-copy preservation is enabled, it can move the text below the image instead of clipping it away.

<p align="center">
  <img
    src="https://raw.githubusercontent.com/Hilo-Hilo/pretext-image-engine/main/src/assets/hero.png"
    alt="Pretext Image Engine preview"
    width="320"
  />
</p>

## Links

- npm package: https://www.npmjs.com/package/pretext-image-engine
- GitHub repo: https://github.com/Hilo-Hilo/pretext-image-engine
- Scene schema: https://github.com/Hilo-Hilo/pretext-image-engine/blob/main/schemas/scene.schema.json
- Sample scene: https://github.com/Hilo-Hilo/pretext-image-engine/blob/main/src/demo/sample-scene.json

## Install

```bash
npm install pretext-image-engine
```

## Quick Start

```ts
import { createPretextImageEngine, type ImageEngineSceneConfig } from 'pretext-image-engine'

const scene: ImageEngineSceneConfig = {
  meta: {
    name: 'Demo scene',
    alt: 'A photo with text placed around the subject.',
  },
  assets: {
    baseSrc: '/scenes/demo/base.png',
    overlaySrc: '/scenes/demo/overlay.png',
    fit: 'cover',
  },
  blocks: [
    { style: 'heading', text: 'Editorial image layout.' },
    {
      style: 'body',
      text: 'The overlay keeps the subject on top while the copy flows into the transparent opening.',
    },
  ],
}

const mount = document.getElementById('engine')

if (!mount) {
  throw new Error('Missing mount node')
}

const engine = createPretextImageEngine(mount, scene)
await engine.ready
```

## What It Solves

- Keeps text out of protected parts of an image by reading overlay alpha.
- Uses `pretext` line fitting instead of naive DOM wrapping.
- Supports art-directed layouts with named placement regions.
- Preserves legibility with luminance-aware text color and optional highlight fills.
- Falls back below the image when preserving the full copy matters more than staying in-frame.

## Feature Highlights

- Base image plus overlay mask composition
- Row-by-row transparent slot detection
- Region-aware layout for multi-opening masks
- Automatic dark/light text selection from the sampled image
- Highlight pills or blocks for legibility
- Optional column splitting in long empty regions
- Resize-aware fallback behavior
- Debug overlays for slots and regions
- Typed public API and JSON schema

## How It Works

1. The overlay image is sampled row by row to find transparent horizontal slots.
2. Each text block is assigned to either the global layout flow or a named region.
3. `@chenglou/pretext` fits the next line inside each available slot.
4. The base image is sampled under each line to decide light or dark text when auto contrast is enabled.
5. If the scene cannot fit within the configured constraints, the engine either scales down or falls back below the image.

## Scene Model

The demo uses `src/demo/sample-scene.json` as a full reference. The JSON schema lives in `schemas/scene.schema.json`.

Main sections:

- `meta`: scene identity and accessibility text
- `assets`: base image, overlay image, alpha threshold, and fit mode
- `stage`: aspect ratio, minimum height, background, and frame styling
- `layout`: padding, min slot width, font downscaling, and fallback trigger width
- `resize`: full-text preservation and fallback behavior
- `colors`: fixed or automatic text color, highlight behavior, shadows, and selection colors
- `columnSplit`: multi-column behavior for long transparent strips
- `interaction`: text selection behavior
- `debug`: slot and region overlays
- `regions`: named layout zones for multi-opening masks
- `styles`: reusable typography presets for `eyebrow`, `heading`, `lede`, `body`, `caption`, or custom styles
- `blocks`: the text content and per-block overrides

### Multi-Opening Overlays

If your mask has several transparent openings, define named regions and assign blocks to them:

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

## Resize Strategy

When `resize.preserveFullText` is `true`, the engine tries this sequence:

1. Masked in-image layout
2. Smaller scale values down to `layout.minScale`
3. Fallback below the image if the scene still cannot fit

When `resize.preserveFullText` is `false`, the engine keeps the text inside the image and allows clipping instead of falling back.

## Local Development

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

## Package Surface

Exports:

- `createPretextImageEngine()`
- `PretextImageEngine`
- TypeScript types for the scene config

## Caveats

- The base image and overlay need to share the same composition and alignment.
- Automatic placement can infer geometry, but not art direction. Use named regions when layout intent matters.
- Very small openings still require shorter copy, lower scale limits, or fallback behavior.

## License

MIT
