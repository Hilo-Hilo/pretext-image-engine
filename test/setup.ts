import { afterEach, beforeEach, vi } from 'vitest'

import type { ImageEngineSceneConfig } from '../src/lib'

type Pixel = [number, number, number, number]
type OverlayAlpha = number | ((x: number, y: number) => number)

type CanvasState = {
  basePixel: Pixel
  overlayAlpha: OverlayAlpha
}

const defaultCanvasState: CanvasState = {
  basePixel: [16, 18, 24, 255],
  overlayAlpha: 0,
}

const canvasState: CanvasState = { ...defaultCanvasState }

const createImageData = (
  width: number,
  height: number,
  pixelAt: (x: number, y: number) => Pixel,
): ImageData => {
  const data = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4
      const [r, g, b, a] = pixelAt(x, y)
      data[offset] = r
      data[offset + 1] = g
      data[offset + 2] = b
      data[offset + 3] = a
    }
  }

  return { data } as ImageData
}

const createBaseImageData = (width: number, height: number): ImageData =>
  createImageData(width, height, () => canvasState.basePixel)

const createOverlayImageData = (width: number, height: number, startX: number, startY: number): ImageData =>
  createImageData(width, height, (x, y) => {
    const alpha =
      typeof canvasState.overlayAlpha === 'function'
        ? canvasState.overlayAlpha(startX + x, startY + y)
        : canvasState.overlayAlpha

    return [0, 0, 0, alpha]
  })

const resetCanvasState = (): void => {
  canvasState.basePixel = [...defaultCanvasState.basePixel]
  canvasState.overlayAlpha = defaultCanvasState.overlayAlpha
}

export const setCanvasState = (next: Partial<CanvasState>): void => {
  if (next.basePixel) {
    canvasState.basePixel = [...next.basePixel]
  }

  if (next.overlayAlpha !== undefined) {
    canvasState.overlayAlpha = next.overlayAlpha
  }
}

export const setElementSize = (element: HTMLElement, width: number, height: number): void => {
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    get: () => width,
  })
  Object.defineProperty(element, 'clientHeight', {
    configurable: true,
    get: () => height,
  })
}

export const createScene = (
  overrides: Partial<ImageEngineSceneConfig> = {},
): ImageEngineSceneConfig => ({
  meta: {
    name: 'Test scene',
    alt: 'Masked editorial artwork',
    ...overrides.meta,
  },
  assets: {
    baseSrc: '/base.png',
    overlaySrc: '/overlay.png',
    fit: 'cover',
    ...overrides.assets,
  },
  resize: {
    preserveFullText: false,
    fallbackMode: 'below',
    fallbackLabel: 'Fallback copy',
    ...overrides.resize,
  },
  blocks: overrides.blocks ?? [{ style: 'heading', text: 'Masked headline' }],
  colors: overrides.colors,
  columnSplit: overrides.columnSplit,
  debug: overrides.debug,
  interaction: overrides.interaction,
  layout: overrides.layout,
  regions: overrides.regions,
  stage: overrides.stage,
  styles: overrides.styles,
})

beforeEach(() => {
  let contextIndex = 0

  resetCanvasState()
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe(): void {}
      disconnect(): void {}
      unobserve(): void {}
    },
  )
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(1200)
  vi.spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get').mockReturnValue(800)
  vi.spyOn(HTMLImageElement.prototype, 'decode').mockResolvedValue(undefined)
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
    const role = contextIndex % 2 === 0 ? 'base' : 'overlay'
    contextIndex += 1

    return {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn((x: number, y: number, width: number, height: number) => {
        return role === 'base'
          ? createBaseImageData(width, height)
          : createOverlayImageData(width, height, x, y)
      }),
    } as unknown as CanvasRenderingContext2D
  })
})

afterEach(() => {
  document.body.innerHTML = ''
  document.getElementById('pretext-image-engine-styles')?.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
