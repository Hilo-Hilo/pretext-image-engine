# pretext-image-engine

[![npm version](https://img.shields.io/npm/v/pretext-image-engine)](https://www.npmjs.com/package/pretext-image-engine)
[![CI](https://github.com/Hilo-Hilo/pretext-image-engine/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Hilo-Hilo/pretext-image-engine/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/pretext-image-engine)](https://github.com/Hilo-Hilo/pretext-image-engine/blob/main/LICENSE)

Image-aware text layout for editorial compositions, built on [`@chenglou/pretext`](https://github.com/chenglou/pretext).

The engine takes a base image, a same-canvas overlay mask, and structured scene data, then lays text into transparent openings so the subject stays visually in front. It now also supports host-controlled scroll progression, so frontend apps can reveal text over time or keep a leading line sticky while the image moves through the page.

## Links

- npm package: https://www.npmjs.com/package/pretext-image-engine
- GitHub repo: https://github.com/Hilo-Hilo/pretext-image-engine
- Engine stylesheet: `pretext-image-engine/styles.css`
- Scene schema: https://github.com/Hilo-Hilo/pretext-image-engine/blob/main/schemas/scene.schema.json

## Install

```bash
npm install pretext-image-engine
```

## Recommended Usage

Import the packaged stylesheet explicitly in your app and disable runtime style injection. This is the cleanest convention for most frontend projects.

```ts
import 'pretext-image-engine/styles.css'

import {
  createPretextImageEngine,
  type ImageEngineSceneConfig,
} from 'pretext-image-engine'

  const scene: ImageEngineSceneConfig = {
    meta: {
      name: 'Sample scene',
      alt: 'A photo with text placed around the subject.',
    },
    assets: {
      baseSrc: '/path/to/base.png',
      overlaySrc: '/path/to/overlay.png',
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

const engine = createPretextImageEngine(mount, scene, {
  injectStyles: false,
  initialProgress: 1,
})

await engine.ready
```

If you want zero-config adoption, omit the third argument and the engine will inject its own stylesheet into `document.head` once.

## Scroll Progression

The core library does **not** register scroll listeners. Instead, your host app computes normalized progress and passes it in with `setProgress()`.

```ts
const engine = createPretextImageEngine(mount, scene, {
  injectStyles: false,
  initialProgress: 0,
})

await engine.ready

const syncProgress = (): void => {
  const rect = mount.getBoundingClientRect()
  const total = rect.height + window.innerHeight
  const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total))

  engine.setProgress(progress)
}

window.addEventListener('scroll', syncProgress, { passive: true })
window.addEventListener('resize', syncProgress)
syncProgress()
```

This keeps the engine framework-agnostic and easy to integrate in React, Vue, Svelte, Astro, and plain DOM apps.

## Scroll Block Modes

Each text block can opt into scroll behavior with `scroll`:

- `static`: current behavior, always visible
- `reveal`: lines reveal progressively across `start..end`
- `sticky-start-reveal`: progressive reveal plus a sticky copy of the first rendered line

Example:

```json
{
  "blocks": [
    {
      "id": "headline",
      "style": "heading",
      "text": "Bridge into haze.",
      "scroll": {
        "mode": "sticky-start-reveal",
        "start": 0.1,
        "end": 0.55,
        "stickyTop": 24
      }
    },
    {
      "id": "body",
      "style": "body",
      "text": "Longer copy continues after the headline.",
      "scroll": {
        "mode": "reveal",
        "start": 0.45,
        "end": 1
      }
    }
  ]
}
```

## Public API

Core exports:

- `createPretextImageEngine(container, scene, options?)`
- `PretextImageEngine`
- `ImageTextEngine`
- `EngineOptions`
- `TextBlockScrollConfig`
- scene and style TypeScript types

Runtime methods:

- `await engine.ready`
- `engine.render()`
- `engine.update(scene)`
- `engine.setProgress(progress)`
- `engine.destroy()`

## Engine Options

```ts
type EngineOptions = {
  injectStyles?: boolean
  initialProgress?: number
}
```

Defaults:

- `injectStyles: true`
- `initialProgress: 0`

## What It Solves

- Keeps text out of protected parts of an image by reading overlay alpha.
- Uses `pretext` line fitting instead of naive DOM wrapping.
- Supports art-directed layouts with named placement regions.
- Preserves legibility with luminance-aware text color and optional highlight fills.
- Supports host-controlled reveal timing without coupling the library to any one scroll system.
- Falls back below the image when preserving the full copy matters more than staying in-frame.

## Feature Highlights

- Base image plus overlay mask composition
- Row-by-row transparent slot detection
- Region-aware layout for multi-opening masks
- Automatic dark/light text selection from the sampled image
- Highlight pills or blocks for legibility
- Optional column splitting in long empty regions
- Resize-aware fallback behavior
- Host-controlled line reveal progression
- Sticky leading-line support for scroll storytelling
- Typed public API and JSON schema

## Scene Model

Scene data follows `schemas/scene.schema.json`; build your own JSON config from that schema in your host app.

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
- `blocks`: the text content and per-block overrides, including optional `scroll`

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

1. Fallback below the image when width is at or below `layout.fallbackBelowWidth`
2. Masked in-image layout
3. Smaller scale values down to `layout.minScale`
4. Fallback below the image if the scene still cannot fit and `resize.fallbackOnOverflow` is not `false`

When `resize.preserveFullText` is `false`, the engine keeps the text inside the image and allows clipping instead of falling back.

## SSR and Browser Constraints

- The package is safe to import in SSR and build environments.
- `createPretextImageEngine()` requires a real browser DOM container at runtime.
- The library does not attach scroll listeners by itself; your host environment owns scroll state.

## Frontend Integration Guidance

- **React/Vue/Svelte**: create the engine after mount, keep progress in component state or a scroll utility, and call `setProgress()` from effects or event handlers.
- **Vanilla DOM**: import the stylesheet once, instantiate on a container, and wire scroll/resize listeners in the host page.
- **Agents and tooling**: prefer explicit CSS import plus `injectStyles: false`, since that makes bundling and head management predictable.

## Pretext Image Engine V2 Blueprint

A repository-local redesign blueprint for the next-generation composition-aware engine now lives in `docs/`:

- `docs/pretext-image-engine-v2.md` — detailed system design and implementation plan
- `docs/pretext-image-engine-v2.html` — browser-viewable rendering of the blueprint
- `docs/pretext-image-engine-v2-example.json` — example V2 scene export with detected and active slots
- `docs/pretext-image-engine-v2-architecture.png` — rendered architecture diagram

## Local Development

```bash
npm install
npm run build
npm run typecheck
npm test
```

## Caveats

- The base image and overlay need to share the same composition and alignment.
- Automatic placement can infer geometry, but not art direction. Use named regions when layout intent matters.
- Scroll progression is normalized `0..1`; your host app is responsible for mapping viewport state into that range.
- Very small openings still require shorter copy, lower scale limits, or fallback behavior.

## License

MIT
