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

const mountEngine = async (
  scene = createScene(),
  options?: { injectStyles?: boolean; initialProgress?: number },
): Promise<{
  container: HTMLDivElement
  engine: ReturnType<typeof createPretextImageEngine>
  stage: HTMLElement
}> => {
  const container = document.createElement('div')
  document.body.append(container)

  const engine = createPretextImageEngine(container, scene, options)
  await engine.ready

  const stage = container.querySelector<HTMLElement>('.pie-stage')

  expect(stage).not.toBeNull()
  setElementSize(stage!, 220, 420)
  engine.render()

  return { container, engine, stage: stage! }
}

const getMaskedLines = (container: HTMLElement): HTMLElement[] =>
  [...container.querySelectorAll<HTMLElement>('.pie-line-layer .pie-line')]

const getVisibleMaskedLines = (container: HTMLElement): HTMLElement[] =>
  getMaskedLines(container).filter((line) => !line.hidden)

describe('PretextImageEngine', () => {
  it('updates object-fit when the scene changes without changing asset URLs', async () => {
    const { container, engine, stage } = await mountEngine(createScene())

    setElementSize(stage, 900, 600)
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
    const { container } = await mountEngine(
      createScene({
        meta: {
          name: 'Accessibility scene',
          alt: 'A skyline with text placed around the subject',
        },
      }),
    )

    const stage = container.querySelector<HTMLElement>('.pie-stage')

    expect(stage?.getAttribute('role')).toBe('img')
    expect(stage?.getAttribute('aria-label')).toBe('A skyline with text placed around the subject')
  })

  it('uses proportional font metrics when painting masked lines', async () => {
    const { container, engine, stage } = await mountEngine(
      createScene({
        blocks: [{ style: 'heading', text: 'Masked headline' }],
      }),
    )

    setElementSize(stage, 2000, 1200)
    engine.render()

    const line = container.querySelector<HTMLElement>('.pie-line')

    expect(line).not.toBeNull()
    expect(line?.style.font).toContain('80px')
    expect(line?.style.lineHeight).toBe('82px')
  })

  it('falls back on masked layout overflow by default', async () => {
    const { container, engine, stage } = await mountEngine(
      createScene({
        layout: {
          fallbackBelowWidth: 100,
          minScale: 1,
        },
        resize: {
          preserveFullText: true,
          fallbackMode: 'below',
        },
        blocks: [
          {
            id: 'long-copy',
            style: 'body',
            text: 'Overflow copy '.repeat(120),
          },
        ],
      }),
    )

    setElementSize(stage, 320, 80)
    engine.render()

    expect(engine.state.layoutMode).toBe('fallback')
    expect(container.querySelector<HTMLElement>('.pie-fallback')?.hidden).toBe(false)
  })

  it('keeps the best masked layout above the width fallback when overflow fallback is disabled', async () => {
    const { container, engine, stage } = await mountEngine(
      createScene({
        layout: {
          fallbackBelowWidth: 100,
          minScale: 1,
        },
        resize: {
          preserveFullText: true,
          fallbackMode: 'below',
          fallbackOnOverflow: false,
        },
        blocks: [
          {
            id: 'long-copy',
            style: 'body',
            text: 'Overflow copy '.repeat(120),
          },
        ],
      }),
    )

    setElementSize(stage, 320, 80)
    engine.render()

    expect(engine.state.layoutMode).toBe('masked')
    expect(container.querySelector<HTMLElement>('.pie-fallback')?.hidden).toBe(true)
    expect(getMaskedLines(container).length).toBeGreaterThan(0)
    expect(container.querySelector<HTMLElement>('.pie-status-badge')?.textContent).toBe(
      'Text clipped inside the image at this size.',
    )
  })

  it('uses width fallback before overflow policy', async () => {
    const { container, engine, stage } = await mountEngine(
      createScene({
        layout: {
          fallbackBelowWidth: 500,
        },
        resize: {
          preserveFullText: true,
          fallbackMode: 'below',
          fallbackOnOverflow: false,
        },
      }),
    )

    setElementSize(stage, 320, 240)
    engine.render()

    expect(engine.state.layoutMode).toBe('fallback')
    expect(container.querySelector<HTMLElement>('.pie-fallback')?.hidden).toBe(false)
  })

  it('keeps fallback disabled when fallbackMode is none', async () => {
    setCanvasState({ overlayAlpha: 255 })

    const { container, engine, stage } = await mountEngine(
      createScene({
        resize: {
          preserveFullText: true,
          fallbackMode: 'none',
        },
      }),
    )

    setElementSize(stage, 720, 540)
    engine.render()

    const fallback = container.querySelector<HTMLElement>('.pie-fallback')
    const status = container.querySelector<HTMLElement>('.pie-status-badge')

    expect(engine.state.layoutMode).toBe('masked')
    expect(fallback?.hidden).toBe(true)
    expect(status?.textContent).toBe('No readable slots were available inside the overlay.')
  })

  it('keeps static blocks visible regardless of progress changes', async () => {
    const { container, engine } = await mountEngine(
      createScene({
        blocks: [{ id: 'static-copy', style: 'body', text: 'Static masked copy remains visible.' }],
      }),
    )

    expect(getVisibleMaskedLines(container).length).toBeGreaterThan(0)

    engine.setProgress(0)

    expect(getVisibleMaskedLines(container).length).toBeGreaterThan(0)
  })

  it('reveals scroll-enabled lines deterministically across progress values', async () => {
    const { container, engine } = await mountEngine(
      createScene({
        blocks: [
          {
            id: 'reveal-copy',
            style: 'body',
            text: 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen.',
            scroll: {
              mode: 'reveal',
              start: 0,
              end: 1,
            },
          },
        ],
      }),
      { initialProgress: 0 },
    )

    const totalLines = getMaskedLines(container).length

    expect(totalLines).toBeGreaterThan(2)
    expect(getVisibleMaskedLines(container)).toHaveLength(1)

    engine.setProgress(0.4)
    expect(getVisibleMaskedLines(container)).toHaveLength(Math.floor(totalLines * 0.4) + 1)

    engine.setProgress(1)
    expect(getVisibleMaskedLines(container)).toHaveLength(totalLines)
  })

  it('keeps the first line in a sticky overlay while the block is active', async () => {
    const { container, engine } = await mountEngine(
      createScene({
        blocks: [
          {
            id: 'hero',
            style: 'heading',
            text: 'Sticky intro lines stay readable while the reveal continues below.',
            scroll: {
              mode: 'sticky-start-reveal',
              start: 0.1,
              end: 0.8,
              stickyTop: 18,
            },
          },
        ],
      }),
      { initialProgress: 0.5 },
    )

    const originalFirstLine = container.querySelector<HTMLElement>('.pie-line-layer .pie-line[data-line-id="hero-line-0"]')
    const stickyLine = container.querySelector<HTMLElement>('.pie-sticky-line')

    expect(originalFirstLine).not.toBeNull()
    expect(stickyLine).not.toBeNull()
    expect(originalFirstLine?.hidden).toBe(true)
    expect(stickyLine?.textContent).toBe(originalFirstLine?.textContent)
    expect(stickyLine?.style.top).toBe('18px')

    engine.setProgress(1)

    expect(container.querySelector('.pie-sticky-line')).toBeNull()
  })

  it('preserves current progress across resize-driven relayout', async () => {
    const { container, engine, stage } = await mountEngine(
      createScene({
        blocks: [
          {
            id: 'resizable',
            style: 'body',
            text: 'Resize should keep scroll progress stable even when line breaks change dramatically across multiple relayout passes in the same scene.',
            scroll: {
              mode: 'reveal',
              start: 0,
              end: 1,
            },
          },
        ],
      }),
    )

    engine.setProgress(0.35)

    setElementSize(stage, 260, 420)
    engine.render()

    expect(engine.state.progress).toBe(0.35)
    expect(getVisibleMaskedLines(container).length).toBeGreaterThan(0)
    expect(getVisibleMaskedLines(container).length).toBeLessThan(getMaskedLines(container).length)
  })

  it('preserves current progress when updating to a new scene', async () => {
    const { container, engine } = await mountEngine(
      createScene({
        blocks: [
          {
            id: 'before',
            style: 'body',
            text: 'Initial reveal copy for progress preservation.',
            scroll: {
              mode: 'reveal',
              start: 0,
              end: 1,
            },
          },
        ],
      }),
    )

    engine.setProgress(0.5)

    await engine.update(
      createScene({
        blocks: [
          {
            id: 'after',
            style: 'body',
            text: 'Updated reveal copy should reuse the existing normalized progress value.',
            scroll: {
              mode: 'reveal',
              start: 0,
              end: 1,
            },
          },
        ],
      }),
    )

    expect(engine.state.progress).toBe(0.5)
    expect(getVisibleMaskedLines(container).length).toBeGreaterThan(0)
    expect(getVisibleMaskedLines(container).length).toBeLessThan(getMaskedLines(container).length)
  })

  it('clamps engine progress and normalizes invalid block ranges', async () => {
    const { container, engine } = await mountEngine(
      createScene({
        blocks: [
          {
            id: 'instant',
            style: 'body',
            text: 'Invalid ranges become instant reveal at the normalized start point.',
            scroll: {
              mode: 'reveal',
              start: 2,
              end: -1,
            },
          },
        ],
      }),
      { initialProgress: -1 },
    )

    expect(engine.state.progress).toBe(0)
    expect(getVisibleMaskedLines(container)).toHaveLength(0)

    engine.setProgress(2)

    expect(engine.state.progress).toBe(1)
    expect(getVisibleMaskedLines(container).length).toBe(getMaskedLines(container).length)
  })

  it('renders a V2 auto-layout scene without requiring an overlay image', async () => {
    setCanvasState({ basePixel: [236, 232, 224, 255], overlayAlpha: 0 })

    const { container } = await mountEngine(
      createScene({
        assets: {
          baseSrc: '/base.png',
          overlaySrc: undefined,
        },
        debug: {
          enabled: true,
          showSlots: true,
          showRegions: true,
        },
        blocks: [
          {
            id: 'hero-kicker',
            style: 'eyebrow',
            text: 'Auto layout',
            v2: {
              role: 'eyebrow',
              pinnedSlotId: 'manual-right',
            },
          },
          {
            id: 'hero-headline',
            style: 'heading',
            text: 'Panels and slots should render from the V2 planner.',
            v2: {
              role: 'headline',
              pinnedSlotId: 'manual-right',
              backdrop: 'panel',
            },
          },
        ],
        v2: {
          enabled: true,
          layout: {
            gridColumns: 6,
            gridRows: 6,
            maxSlots: 2,
          },
          subjectZones: [
            {
              id: 'subject-core',
              x: 0.24,
              y: 0.18,
              width: 0.24,
              height: 0.42,
              padding: 0.02,
            },
          ],
          slots: [
            {
              id: 'manual-right',
              x: 0.58,
              y: 0.12,
              width: 0.28,
              height: 0.3,
              locked: true,
              preferredRoles: ['headline', 'eyebrow'],
            },
          ],
          backdrop: {
            mode: 'panel',
            panelOpacity: 0.82,
          },
        },
      }),
    )

    expect(getMaskedLines(container).length).toBeGreaterThan(0)
    expect(container.querySelector('.pie-panel')).not.toBeNull()
    expect(container.querySelectorAll('.pie-slot').length).toBeGreaterThan(0)
    expect(container.querySelector<HTMLElement>('.pie-status-badge')?.textContent).toMatch(/V2 auto layout active/i)
  })

  it('supports explicit CSS delivery and optional runtime style injection', async () => {
    await mountEngine(createScene())
    expect(document.getElementById('pretext-image-engine-styles')).not.toBeNull()

    document.getElementById('pretext-image-engine-styles')?.remove()

    await mountEngine(createScene(), { injectStyles: false })
    expect(document.getElementById('pretext-image-engine-styles')).toBeNull()
  })

  it('keeps content available across responsive stage sizes', async () => {
    setCanvasState({ basePixel: [236, 232, 224, 255], overlayAlpha: 0 })

    const scene = createScene({
      assets: {
        baseSrc: '/base.png',
        overlaySrc: undefined,
      },
      resize: {
        preserveFullText: true,
        fallbackMode: 'below',
      },
      blocks: [
        {
          id: 'hero-kicker',
          style: 'eyebrow',
          text: 'Selected work',
          v2: { role: 'eyebrow', pinnedSlotId: 'top-left' },
        },
        {
          id: 'hero-name',
          style: 'heading',
          text: 'Hanson Wen',
          v2: { role: 'headline', pinnedSlotId: 'bottom-left' },
        },
        {
          id: 'hero-summary',
          style: 'body',
          text: 'Product designer and creative technologist.',
          v2: { role: 'body', pinnedSlotId: 'bottom-left' },
        },
        {
          id: 'hero-card',
          style: 'body',
          text: 'Design systems, AI tooling, and product storytelling.',
          v2: { role: 'body', pinnedSlotId: 'top-right', backdrop: 'panel' },
        },
      ],
      v2: {
        enabled: true,
        layout: {
          gridColumns: 6,
          gridRows: 6,
          maxSlots: 4,
        },
        subjectZones: [
          {
            id: 'bridge-core',
            x: 0.36,
            y: 0.2,
            width: 0.28,
            height: 0.5,
            padding: 0.02,
          },
        ],
        slots: [
          { id: 'top-left', x: 0.04, y: 0.05, width: 0.24, height: 0.1, locked: true },
          { id: 'top-right', x: 0.63, y: 0.06, width: 0.29, height: 0.2, locked: true },
          { id: 'bottom-left', x: 0.08, y: 0.56, width: 0.36, height: 0.22, locked: true },
          { id: 'bottom-right', x: 0.66, y: 0.75, width: 0.24, height: 0.12, locked: true },
        ],
        backdrop: {
          mode: 'panel',
          panelOpacity: 0.82,
        },
      },
    })

    const { container, engine, stage } = await mountEngine(scene)
    const sizes = [
      [320, 240],
      [480, 320],
      [768, 432],
      [1024, 576],
    ] as const

    for (const [width, height] of sizes) {
      setElementSize(stage, width, height)
      engine.render()

      const maskedVisible = getVisibleMaskedLines(container).length
      const fallbackVisible = container.querySelector<HTMLElement>('.pie-fallback')?.hidden === false

      expect(maskedVisible > 0 || fallbackVisible).toBe(true)
    }
  })

  it('marks source images as decorative when the stage exposes alt text', async () => {
    const { container } = await mountEngine(
      createScene({
        meta: {
          name: 'Accessibility scene',
          alt: 'A skyline with text placed around the subject',
        },
      }),
    )

    const baseImage = container.querySelector<HTMLImageElement>('.pie-base')
    const overlayImage = container.querySelector<HTMLImageElement>('.pie-overlay')

    expect(baseImage?.alt).toBe('')
    expect(overlayImage?.alt).toBe('')
    expect(baseImage?.getAttribute('aria-hidden')).toBe('true')
    expect(overlayImage?.getAttribute('aria-hidden')).toBe('true')
  })

  it('throws a clear error when instantiated without a usable DOM container', () => {
    expect(() => {
      createPretextImageEngine({ ownerDocument: null } as unknown as HTMLElement, createScene())
    }).toThrow(/requires a browser dom container/i)
  })
})
