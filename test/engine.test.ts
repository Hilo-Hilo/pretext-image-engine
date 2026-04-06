import { describe, expect, it, vi } from 'vitest'

import { createPretextImageEngine } from '../src/lib'

import { createScene, setCanvasState, setElementSize } from './setup'

vi.mock('@chenglou/pretext', () => ({
  prepareWithSegments: (text: string, font: string) => ({ text, font }),
  layoutNextLine: (
    prepared: { text: string },
    cursor: { segmentIndex: number; graphemeIndex: number },
    width: number,
  ) => {
    if (cursor.segmentIndex > 0) {
      return null
    }

    const remaining = prepared.text.slice(cursor.graphemeIndex)

    if (!remaining) {
      return null
    }

    const maxCharacters = Math.max(1, Math.floor(width / 10))
    const text = remaining.slice(0, maxCharacters)
    const endIndex = cursor.graphemeIndex + text.length
    const done = endIndex >= prepared.text.length

    return {
      text,
      width: text.length * 10,
      end: done
        ? { segmentIndex: 1, graphemeIndex: endIndex }
        : { segmentIndex: 0, graphemeIndex: endIndex },
    }
  },
}))

describe('PretextImageEngine', () => {
  it('updates object-fit when the scene changes without changing asset URLs', async () => {
    const container = document.createElement('div')
    const engine = createPretextImageEngine(container, createScene())
    await engine.ready

    const stage = container.querySelector<HTMLElement>('.pie-stage')
    expect(stage).not.toBeNull()
    setElementSize(stage!, 900, 600)
    engine.render()

    const baseImage = container.querySelector<HTMLImageElement>('.pie-base')
    const overlayImage = container.querySelector<HTMLImageElement>('.pie-overlay')

    expect(baseImage?.style.objectFit).toBe('cover')
    expect(overlayImage?.style.objectFit).toBe('cover')

    await engine.update(
      createScene({
        assets: {
          baseSrc: '/base.png',
          overlaySrc: '/overlay.png',
          fit: 'contain',
        },
      }),
    )

    expect(baseImage?.style.objectFit).toBe('contain')
    expect(overlayImage?.style.objectFit).toBe('contain')
  })

  it('exposes scene alt text on the rendered stage', async () => {
    const container = document.createElement('div')
    const engine = createPretextImageEngine(
      container,
      createScene({
        meta: {
          name: 'Accessibility scene',
          alt: 'A skyline with text placed around the subject',
        },
      }),
    )
    await engine.ready

    const stage = container.querySelector<HTMLElement>('.pie-stage')

    expect(stage?.getAttribute('role')).toBe('img')
    expect(stage?.getAttribute('aria-label')).toBe('A skyline with text placed around the subject')
  })

  it('uses the clamped font metrics when painting masked lines', async () => {
    const container = document.createElement('div')
    const engine = createPretextImageEngine(
      container,
      createScene({
        blocks: [{ style: 'heading', text: 'Masked headline' }],
      }),
    )
    await engine.ready

    const stage = container.querySelector<HTMLElement>('.pie-stage')
    expect(stage).not.toBeNull()
    setElementSize(stage!, 2000, 1200)
    engine.render()

    const line = container.querySelector<HTMLElement>('.pie-line')

    expect(line).not.toBeNull()
    expect(line?.style.font).toContain('44px')
    expect(line?.style.lineHeight).toBe('47px')
  })

  it('keeps fallback disabled when fallbackMode is none', async () => {
    setCanvasState({ overlayAlpha: 255 })

    const container = document.createElement('div')
    const engine = createPretextImageEngine(
      container,
      createScene({
        resize: {
          preserveFullText: true,
          fallbackMode: 'none',
        },
      }),
    )
    await engine.ready

    const stage = container.querySelector<HTMLElement>('.pie-stage')
    expect(stage).not.toBeNull()
    setElementSize(stage!, 720, 540)
    engine.render()

    const fallback = container.querySelector<HTMLElement>('.pie-fallback')
    const status = container.querySelector<HTMLElement>('.pie-status-badge')

    expect(engine.state.layoutMode).toBe('masked')
    expect(fallback?.hidden).toBe(true)
    expect(status?.textContent).toBe('No readable slots were available inside the overlay.')
  })
})
