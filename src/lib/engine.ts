import { layoutNextLine, prepareWithSegments } from '@chenglou/pretext'

import {
  DEFAULT_BLOCK_STYLES,
  DEFAULT_COLORS,
  DEFAULT_COLUMN_SPLIT,
  DEFAULT_HIGHLIGHT,
  DEFAULT_INTERACTION,
  DEFAULT_LAYOUT,
  DEFAULT_RESIZE,
  DEFAULT_SCENE,
  DEFAULT_SHADOW,
  DEFAULT_STAGE,
} from './defaults'
import type {
  BlockStyleConfig,
  ColumnSplitConfig,
  ColorConfig,
  EngineState,
  HighlightConfig,
  ImageEngineSceneConfig,
  ImageTextEngine,
  InteractionConfig,
  LineAppearance,
  RegionConfig,
  SelectionConfig,
  ShadowConfig,
  TextBlockConfig,
} from './types'

type ResolvedBlockStyle = Omit<Required<BlockStyleConfig>, 'highlight' | 'columns'> & {
  highlight: Required<HighlightConfig>
  columns: Required<ColumnSplitConfig>
}

type ResolvedRegion = Omit<Required<RegionConfig>, 'columnSplit'> & {
  columnSplit: Required<ColumnSplitConfig>
}

type ResolvedAssets = Required<ImageEngineSceneConfig['assets']>
type ResolvedStage = Required<NonNullable<ImageEngineSceneConfig['stage']>>
type ResolvedLayout = Required<NonNullable<ImageEngineSceneConfig['layout']>>
type ResolvedResize = Required<NonNullable<ImageEngineSceneConfig['resize']>>
type ResolvedDebug = Required<NonNullable<ImageEngineSceneConfig['debug']>>
type ResolvedColors = {
  text: Required<NonNullable<ColorConfig['text']>>
  highlight: Required<HighlightConfig>
  shadow: Required<ShadowConfig>
  selection: Required<SelectionConfig>
}

type ResolvedScene = {
  meta: ImageEngineSceneConfig['meta']
  assets: ResolvedAssets
  stage: ResolvedStage
  layout: ResolvedLayout
  resize: ResolvedResize
  colors: ResolvedColors
  columnSplit: Required<ColumnSplitConfig>
  interaction: Required<InteractionConfig>
  debug: ResolvedDebug
  styles: Record<string, ResolvedBlockStyle>
  regions: Record<string, ResolvedRegion>
  blocks: TextBlockConfig[]
}

type Slot = {
  left: number
  right: number
}

type PositionedLine = {
  text: string
  x: number
  y: number
  width: number
  styleName: string
  style: ResolvedBlockStyle
  appearance: LineAppearance
}

type LayoutResult = {
  lines: PositionedLine[]
  debugSlots: Array<{ x: number; y: number; width: number; height: number }>
  overflowed: boolean
  renderedLines: number
  scale: number
}

const ENGINE_STYLE_ID = 'pretext-image-engine-styles'

const ENGINE_CSS = `
.pie-root {
  --pie-selection-bg: rgba(245, 221, 171, 0.72);
  --pie-selection-color: #0d1117;
  color: #11151a;
}

.pie-root,
.pie-root * {
  box-sizing: border-box;
}

.pie-root .pie-line::selection,
.pie-root .pie-fallback *::selection {
  background: var(--pie-selection-bg);
  color: var(--pie-selection-color);
}

.pie-stage-shell {
  display: grid;
  gap: 1rem;
}

.pie-stage {
  position: relative;
  overflow: hidden;
  min-height: 240px;
  background: #0f1116;
}

.pie-base,
.pie-overlay,
.pie-line-layer,
.pie-debug-layer,
.pie-status {
  position: absolute;
  inset: 0;
}

.pie-base,
.pie-overlay {
  width: 100%;
  height: 100%;
  object-position: center;
  pointer-events: none;
}

.pie-line-layer,
.pie-debug-layer {
  pointer-events: none;
}

.pie-root[data-selectable="true"] .pie-line-layer {
  pointer-events: auto;
}

.pie-line {
  position: absolute;
  white-space: pre;
  max-width: max-content;
}

.pie-slot {
  position: absolute;
  border: 1px dashed rgba(94, 237, 211, 0.85);
  background: rgba(94, 237, 211, 0.1);
}

.pie-region {
  position: absolute;
  border: 1px solid rgba(245, 221, 171, 0.8);
  background: rgba(245, 221, 171, 0.08);
}

.pie-status {
  pointer-events: none;
  z-index: 7;
  display: grid;
  align-content: end;
  justify-items: end;
  padding: 0.85rem;
}

.pie-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2rem;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(10, 11, 14, 0.68);
  color: rgba(248, 241, 230, 0.96);
  font: 700 0.72rem/1.2 "IBM Plex Mono", ui-monospace, monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  backdrop-filter: blur(14px);
}

.pie-fallback {
  padding: 1rem;
  border-radius: 18px;
  background: rgba(252, 247, 240, 0.94);
  color: #11151a;
}

.pie-fallback-label {
  margin: 0 0 0.75rem;
  color: #756657;
  font: 700 0.74rem/1.2 "IBM Plex Mono", ui-monospace, monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.pie-fallback-content {
  display: grid;
  gap: 0.8rem;
}

.pie-fallback-block {
  margin: 0;
}

.pie-fallback-eyebrow {
  color: #9b5b2c;
  font: 700 0.78rem/1.2 "IBM Plex Mono", ui-monospace, monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.pie-fallback-heading {
  font: 600 clamp(1.3rem, 2vw, 1.9rem)/1.04 "Fraunces", Georgia, serif;
}

.pie-fallback-lede {
  font: 600 1rem/1.6 "Source Serif 4", Georgia, serif;
  color: #3b4652;
}

.pie-fallback-body {
  font: 400 1rem/1.7 "Source Serif 4", Georgia, serif;
  color: #3b4652;
}

.pie-fallback-caption {
  font: italic 400 0.95rem/1.5 "Source Serif 4", Georgia, serif;
  color: #6e7884;
}
`

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const numberOr = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const textOr = (value: string | undefined, fallback: string): string =>
  typeof value === 'string' && value.trim() ? value : fallback

const objectOrEmpty = <T extends object>(value: T | undefined): Partial<T> =>
  value && typeof value === 'object' ? value : {}

const mergeHighlight = (base: Required<HighlightConfig>, patch?: HighlightConfig): Required<HighlightConfig> => ({
  ...base,
  ...objectOrEmpty(patch),
})

const mergeShadow = (base: Required<ShadowConfig>, patch?: ShadowConfig): Required<ShadowConfig> => ({
  ...base,
  ...objectOrEmpty(patch),
})

const mergeSelection = (base: Required<SelectionConfig>, patch?: SelectionConfig): Required<SelectionConfig> => ({
  ...base,
  ...objectOrEmpty(patch),
})

const mergeColumns = (
  base: Required<ColumnSplitConfig>,
  patch?: ColumnSplitConfig,
): Required<ColumnSplitConfig> => ({
  ...base,
  ...objectOrEmpty(patch),
  applyToStyles: patch?.applyToStyles ?? base.applyToStyles,
})

const mergeStyle = (base: ResolvedBlockStyle, patch?: BlockStyleConfig): ResolvedBlockStyle => ({
  ...base,
  ...objectOrEmpty(patch),
  highlight: mergeHighlight(base.highlight, patch?.highlight),
  columns: mergeColumns(base.columns, patch?.columns),
})

const resolveStyles = (
  styleOverrides: Record<string, BlockStyleConfig> | undefined,
  blocks: TextBlockConfig[],
): Record<string, ResolvedBlockStyle> => {
  const styles: Record<string, ResolvedBlockStyle> = {}
  const keys = new Set<string>([...Object.keys(DEFAULT_BLOCK_STYLES), ...Object.keys(styleOverrides ?? {})])

  blocks.forEach((block) => keys.add(block.style))

  keys.forEach((key) => {
    const base = (DEFAULT_BLOCK_STYLES[key] ?? DEFAULT_BLOCK_STYLES.body) as ResolvedBlockStyle
    styles[key] = mergeStyle(base, styleOverrides?.[key])
  })

  return styles
}

const resolveRegions = (regions: Record<string, RegionConfig> | undefined): Record<string, ResolvedRegion> => {
  const resolved: Record<string, ResolvedRegion> = {}

  Object.entries(regions ?? {}).forEach(([key, region]) => {
    resolved[key] = {
      xStart: clamp(numberOr(region.xStart, 0), 0, 1),
      xEnd: clamp(numberOr(region.xEnd, 1), 0, 1),
      yStart: clamp(numberOr(region.yStart, 0), 0, 1),
      yEnd: clamp(numberOr(region.yEnd, 1), 0, 1),
      anchorX: clamp(numberOr(region.anchorX, 0.5), 0, 1),
      slotOrder: region.slotOrder ?? 'left-to-right',
      minSlotWidth: Math.max(24, numberOr(region.minSlotWidth, DEFAULT_LAYOUT.minSlotWidth)),
      columnSplit: mergeColumns(DEFAULT_COLUMN_SPLIT, region.columnSplit),
    }
  })

  return resolved
}

const resolveScene = (scene: ImageEngineSceneConfig): ResolvedScene => {
  const mergedColors: ResolvedColors = {
    text: { ...DEFAULT_COLORS.text, ...objectOrEmpty(scene.colors?.text) } as ResolvedColors['text'],
    highlight: mergeHighlight(DEFAULT_HIGHLIGHT, scene.colors?.highlight),
    shadow: mergeShadow(DEFAULT_SHADOW, scene.colors?.shadow),
    selection: mergeSelection(
      DEFAULT_COLORS.selection as Required<SelectionConfig>,
      scene.colors?.selection,
    ),
  }

  const resolvedStage: ResolvedStage = { ...DEFAULT_STAGE, ...objectOrEmpty(scene.stage) }
  const resolvedLayout: ResolvedLayout = { ...DEFAULT_LAYOUT, ...objectOrEmpty(scene.layout) }
  const resolvedResize: ResolvedResize = { ...DEFAULT_RESIZE, ...objectOrEmpty(scene.resize) }
  const resolvedColumnSplit = mergeColumns(DEFAULT_COLUMN_SPLIT, scene.columnSplit)
  const resolvedInteraction: Required<InteractionConfig> = {
    ...DEFAULT_INTERACTION,
    ...objectOrEmpty(scene.interaction),
  }
  const resolvedDebug: ResolvedDebug = {
    enabled: false,
    showSlots: false,
    showRegions: false,
    showSampling: false,
    ...objectOrEmpty(scene.debug),
  }

  return {
    meta: { ...DEFAULT_SCENE.meta, ...scene.meta },
    assets: {
      baseSrc: textOr(scene.assets.baseSrc, ''),
      overlaySrc: textOr(scene.assets.overlaySrc, ''),
      alphaThreshold: Math.max(0, numberOr(scene.assets.alphaThreshold, 20)),
      fit: scene.assets.fit ?? 'cover',
    },
    stage: resolvedStage,
    layout: resolvedLayout,
    resize: resolvedResize,
    colors: mergedColors,
    columnSplit: resolvedColumnSplit,
    interaction: resolvedInteraction,
    debug: resolvedDebug,
    styles: resolveStyles(scene.styles, scene.blocks),
    regions: resolveRegions(scene.regions),
    blocks: scene.blocks,
  }
}

const buildScaleCandidates = (layout: ResolvedScene['layout']): number[] => {
  const scales: number[] = []
  let scale = 1

  while (scale >= layout.minScale - 0.001) {
    scales.push(Number(scale.toFixed(2)))
    scale -= layout.scaleStep
  }

  const finalScale = Number(layout.minScale.toFixed(2))

  if (!scales.includes(finalScale)) {
    scales.push(finalScale)
  }

  return scales
}

const sanitizeStyleName = (value: string): string => value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')

const srgbChannelToLinear = (value: number): number => {
  const normalized = value / 255
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

const relativeLuminance = (r: number, g: number, b: number): number =>
  0.2126 * srgbChannelToLinear(r) + 0.7152 * srgbChannelToLinear(g) + 0.0722 * srgbChannelToLinear(b)

const ensureEngineStyles = (): void => {
  if (document.getElementById(ENGINE_STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = ENGINE_STYLE_ID
  style.textContent = ENGINE_CSS
  document.head.append(style)
}

const waitForImage = async (image: HTMLImageElement): Promise<void> => {
  if (image.complete && image.naturalWidth > 0) {
    return
  }

  if (typeof image.decode === 'function') {
    try {
      await image.decode()
      return
    } catch {
      // Some browsers throw transient decode errors for images that still finish loading.
    }
  }

  await new Promise<void>((resolve, reject) => {
    image.addEventListener('load', () => resolve(), { once: true })
    image.addEventListener('error', () => reject(new Error(`Unable to load ${image.src}`)), {
      once: true,
    })
  })
}

const drawFittedImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  fit: 'cover' | 'contain',
): void => {
  ctx.clearRect(0, 0, width, height)
  const scale =
    fit === 'cover'
      ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
      : Math.min(width / image.naturalWidth, height / image.naturalHeight)

  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  const x = (width - drawWidth) / 2
  const y = (height - drawHeight) / 2

  ctx.drawImage(image, x, y, drawWidth, drawHeight)
}

const withOpacity = (color: string, opacity: number): string => {
  const clampedOpacity = clamp(opacity, 0, 1)

  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/, (_, r, g, b) => {
      return `rgba(${String(r).trim()}, ${String(g).trim()}, ${String(b).trim()}, ${clampedOpacity})`
    })
  }

  if (color.startsWith('rgb(')) {
    return color.replace(/rgb\(([^,]+),([^,]+),([^)]+)\)/, (_, r, g, b) => {
      return `rgba(${String(r).trim()}, ${String(g).trim()}, ${String(b).trim()}, ${clampedOpacity})`
    })
  }

  if (color.startsWith('#')) {
    let hex = color.slice(1)

    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    }

    if (hex.length === 6) {
      const red = Number.parseInt(hex.slice(0, 2), 16)
      const green = Number.parseInt(hex.slice(2, 4), 16)
      const blue = Number.parseInt(hex.slice(4, 6), 16)
      return `rgba(${red}, ${green}, ${blue}, ${clampedOpacity})`
    }
  }

  return color
}

const chooseSingleSlot = (slots: Slot[], anchorX: number): Slot => {
  return slots.reduce((best, slot) => {
    const bestCenter = best.left + (best.right - best.left) / 2
    const slotCenter = slot.left + (slot.right - slot.left) / 2
    const bestDelta = Math.abs(bestCenter - anchorX)
    const slotDelta = Math.abs(slotCenter - anchorX)

    if (slotDelta < bestDelta) {
      return slot
    }

    if (slotDelta > bestDelta) {
      return best
    }

    const bestWidth = best.right - best.left
    const slotWidth = slot.right - slot.left
    return slotWidth > bestWidth ? slot : best
  })
}

const sortSlots = (slots: Slot[], order: 'left-to-right' | 'right-to-left' | 'center-out', anchorX: number): Slot[] => {
  const next = [...slots]

  switch (order) {
    case 'right-to-left':
      return next.sort((left, right) => right.left - left.left)
    case 'center-out':
      return next.sort((left, right) => {
        const leftCenter = left.left + (left.right - left.left) / 2
        const rightCenter = right.left + (right.right - right.left) / 2
        return Math.abs(leftCenter - anchorX) - Math.abs(rightCenter - anchorX)
      })
    case 'left-to-right':
    default:
      return next.sort((left, right) => left.left - right.left)
  }
}

const maybeSplitSlot = (
  slot: Slot,
  split: Required<ColumnSplitConfig>,
): Slot[] => {
  if (split.mode === 'off') {
    return [slot]
  }

  const slotWidth = slot.right - slot.left
  const autoColumns = Math.floor((slotWidth + split.gap) / (split.minColumnWidth + split.gap))
  const requestedColumns =
    split.mode === 'fixed' ? split.preferredColumns : Math.min(split.maxColumns, autoColumns)
  const columns = clamp(requestedColumns, 1, split.maxColumns)

  if (columns < 2) {
    return [slot]
  }

  const columnWidth = (slotWidth - split.gap * (columns - 1)) / columns

  if (columnWidth < split.minColumnWidth) {
    return [slot]
  }

  return Array.from({ length: columns }, (_, index) => {
    const left = slot.left + index * (columnWidth + split.gap)
    return {
      left,
      right: left + columnWidth,
    }
  })
}

const buildFallbackBlock = (block: TextBlockConfig, style: ResolvedBlockStyle): HTMLElement => {
  const tag = block.style === 'heading' ? 'h3' : 'p'
  const element = document.createElement(tag)
  element.className = `pie-fallback-block pie-fallback-${sanitizeStyleName(block.style)}`
  element.textContent =
    style.textTransform === 'uppercase' ? block.text.toUpperCase() : block.text
  return element
}

export class PretextImageEngine implements ImageTextEngine {
  private readonly container: HTMLElement
  private readonly root: HTMLDivElement
  private readonly stageShell: HTMLDivElement
  private readonly stage: HTMLDivElement
  private readonly baseImage: HTMLImageElement
  private readonly overlayImage: HTMLImageElement
  private readonly lineLayer: HTMLDivElement
  private readonly debugLayer: HTMLDivElement
  private readonly status: HTMLDivElement
  private readonly statusBadge: HTMLDivElement
  private readonly fallback: HTMLDivElement
  private readonly fallbackLabel: HTMLParagraphElement
  private readonly fallbackContent: HTMLDivElement
  private readonly baseCanvas: HTMLCanvasElement
  private readonly overlayCanvas: HTMLCanvasElement
  private readonly baseContext: CanvasRenderingContext2D
  private readonly overlayContext: CanvasRenderingContext2D
  private resizeObserver: ResizeObserver | null = null
  private scene: ResolvedScene
  private imageSignature = ''
  private pendingFrame = 0
  readonly ready: Promise<void>
  state: EngineState = {
    layoutMode: 'masked',
    width: 0,
    height: 0,
    scale: 1,
  }

  constructor(container: HTMLElement, scene: ImageEngineSceneConfig) {
    ensureEngineStyles()

    this.container = container
    this.scene = resolveScene(scene)
    this.root = document.createElement('div')
    this.root.className = 'pie-root'
    this.stageShell = document.createElement('div')
    this.stageShell.className = 'pie-stage-shell'
    this.stage = document.createElement('div')
    this.stage.className = 'pie-stage'
    this.baseImage = document.createElement('img')
    this.baseImage.className = 'pie-base'
    this.baseImage.alt = ''
    this.baseImage.decoding = 'async'
    this.overlayImage = document.createElement('img')
    this.overlayImage.className = 'pie-overlay'
    this.overlayImage.alt = ''
    this.overlayImage.decoding = 'async'
    this.lineLayer = document.createElement('div')
    this.lineLayer.className = 'pie-line-layer'
    this.debugLayer = document.createElement('div')
    this.debugLayer.className = 'pie-debug-layer'
    this.status = document.createElement('div')
    this.status.className = 'pie-status'
    this.statusBadge = document.createElement('div')
    this.statusBadge.className = 'pie-status-badge'
    this.status.append(this.statusBadge)
    this.fallback = document.createElement('div')
    this.fallback.className = 'pie-fallback'
    this.fallback.hidden = true
    this.fallbackLabel = document.createElement('p')
    this.fallbackLabel.className = 'pie-fallback-label'
    this.fallbackContent = document.createElement('div')
    this.fallbackContent.className = 'pie-fallback-content'
    this.fallback.append(this.fallbackLabel, this.fallbackContent)
    this.stage.append(this.baseImage, this.lineLayer, this.debugLayer, this.overlayImage, this.status)
    this.stageShell.append(this.stage, this.fallback)
    this.root.append(this.stageShell)
    this.container.replaceChildren(this.root)

    this.baseCanvas = document.createElement('canvas')
    this.overlayCanvas = document.createElement('canvas')
    this.baseContext = this.baseCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D
    this.overlayContext = this.overlayCanvas.getContext('2d', {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D

    this.ready = this.loadAssets().then(() => {
      this.attachResizeObserver()
      this.render()
    })
  }

  async update(scene: ImageEngineSceneConfig): Promise<void> {
    this.scene = resolveScene(scene)
    await this.loadAssets()
    this.render()
  }

  render(): void {
    if (!this.baseImage.naturalWidth || !this.overlayImage.naturalWidth) {
      return
    }

    const width = Math.max(0, Math.round(this.stage.clientWidth))
    const height = Math.max(0, Math.round(this.stage.clientHeight))

    if (!width || !height) {
      return
    }

    this.state.width = width
    this.state.height = height
    this.root.dataset.selectable = String(this.scene.interaction.selectable)
    this.root.style.setProperty('--pie-selection-bg', this.scene.colors.selection.background)
    this.root.style.setProperty('--pie-selection-color', this.scene.colors.selection.color)

    this.syncCanvasBuffers(width, height)

    if (
      this.scene.resize.preserveFullText &&
      this.scene.resize.fallbackMode === 'below' &&
      width <= this.scene.layout.fallbackBelowWidth
    ) {
      this.applyFallback(this.scene.resize.fallbackLabel)
      return
    }

    const candidates = buildScaleCandidates(this.scene.layout)
    let bestPartial: LayoutResult | null = null

    for (const scale of candidates) {
      const result = this.measureMaskedLayout(width, height, scale)

      if (result.renderedLines > 0 && !result.overflowed) {
        this.applyMasked(result)
        return
      }

      if (bestPartial === null || result.renderedLines > bestPartial.renderedLines) {
        bestPartial = result
      }
    }

    if (this.scene.resize.preserveFullText && this.scene.resize.fallbackMode === 'below') {
      this.applyFallback(this.scene.resize.fallbackLabel)
      return
    }

    if (bestPartial !== null && bestPartial.renderedLines > 0) {
      this.applyMasked(bestPartial, 'Text clipped inside the image at this size.')
      return
    }

    this.applyFallback('No readable slots were available inside the overlay.')
  }

  destroy(): void {
    if (this.pendingFrame) {
      cancelAnimationFrame(this.pendingFrame)
    }

    this.resizeObserver?.disconnect()
    this.container.replaceChildren()
  }

  private attachResizeObserver(): void {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.pendingFrame) {
          cancelAnimationFrame(this.pendingFrame)
        }

        this.pendingFrame = requestAnimationFrame(() => {
          this.pendingFrame = 0
          this.render()
        })
      })
      this.resizeObserver.observe(this.stage)
    }
  }

  private async loadAssets(): Promise<void> {
    const signature = `${this.scene.assets.baseSrc}::${this.scene.assets.overlaySrc}`

    if (signature === this.imageSignature && this.baseImage.naturalWidth && this.overlayImage.naturalWidth) {
      this.syncStageAppearance()
      return
    }

    this.imageSignature = signature
    this.baseImage.src = this.scene.assets.baseSrc
    this.overlayImage.src = this.scene.assets.overlaySrc
    this.baseImage.style.objectFit = this.scene.assets.fit
    this.overlayImage.style.objectFit = this.scene.assets.fit

    await Promise.all([waitForImage(this.baseImage), waitForImage(this.overlayImage)])
    this.syncStageAppearance()
  }

  private syncStageAppearance(): void {
    const ratio = this.scene.stage.aspectRatio || this.baseImage.naturalWidth / this.baseImage.naturalHeight
    this.stageShell.style.padding = `${this.scene.stage.padding}px`
    this.stage.style.aspectRatio = `${ratio}`
    this.stage.style.minHeight = `${this.scene.stage.minHeight}px`
    this.stage.style.background = this.scene.stage.background
    this.stage.style.borderRadius = `${this.scene.stage.borderRadius}px`
  }

  private syncCanvasBuffers(width: number, height: number): void {
    this.baseCanvas.width = width
    this.baseCanvas.height = height
    this.overlayCanvas.width = width
    this.overlayCanvas.height = height
    drawFittedImage(this.baseContext, this.baseImage, width, height, this.scene.assets.fit)
    drawFittedImage(this.overlayContext, this.overlayImage, width, height, this.scene.assets.fit)
  }

  private sampleLuminance(x: number, y: number, width: number, height: number): number {
    const startX = clamp(Math.floor(x), 0, this.baseCanvas.width - 1)
    const startY = clamp(Math.floor(y), 0, this.baseCanvas.height - 1)
    const sampleWidth = clamp(Math.ceil(width), 1, this.baseCanvas.width - startX)
    const sampleHeight = clamp(Math.ceil(height), 1, this.baseCanvas.height - startY)
    const { data } = this.baseContext.getImageData(startX, startY, sampleWidth, sampleHeight)
    const stride = Math.max(1, Math.floor(Math.max(sampleWidth, sampleHeight) / 24))

    let total = 0
    let count = 0

    for (let yy = 0; yy < sampleHeight; yy += stride) {
      for (let xx = 0; xx < sampleWidth; xx += stride) {
        const offset = (yy * sampleWidth + xx) * 4
        total += relativeLuminance(data[offset]!, data[offset + 1]!, data[offset + 2]!)
        count++
      }
    }

    return count ? total / count : 0
  }

  private resolveLineAppearance(
    lineX: number,
    lineY: number,
    lineWidth: number,
    style: ResolvedBlockStyle,
    block: TextBlockConfig,
  ): LineAppearance {
    const textConfig = this.scene.colors.text
    const blockHighlight = mergeHighlight(style.highlight, block.highlight)
    const shadow = this.scene.colors.shadow
    const sample = this.sampleLuminance(
      lineX,
      lineY,
      lineWidth + blockHighlight.paddingX * 2,
      style.minFontSize * style.lineHeight + blockHighlight.paddingY * 2,
    )
    const useDarkText =
      textConfig.mode === 'auto' ? sample >= textConfig.luminanceThreshold : false
    const textColor =
      textConfig.mode === 'auto'
        ? useDarkText
          ? textConfig.darkColor
          : textConfig.lightColor
        : textConfig.color

    let backgroundColor: string | null = null

    if (blockHighlight.enabled && blockHighlight.mode !== 'off') {
      const highlightColor =
        blockHighlight.mode === 'auto'
          ? useDarkText
            ? blockHighlight.lightColor
            : blockHighlight.darkColor
          : blockHighlight.color

      backgroundColor = withOpacity(highlightColor, blockHighlight.opacity)
    }

    return {
      textColor,
      backgroundColor,
      shadowColor: shadow.color,
      shadowBlur: shadow.enabled ? shadow.blur : 0,
      shadowOffsetX: shadow.offsetX,
      shadowOffsetY: shadow.offsetY,
      paddingX: blockHighlight.enabled ? blockHighlight.paddingX : 0,
      paddingY: blockHighlight.enabled ? blockHighlight.paddingY : 0,
      radius: blockHighlight.radius,
    }
  }

  private getTransparentSlots(
    bandTop: number,
    bandBottom: number,
    region: ResolvedRegion | null,
  ): Slot[] {
    const leftLimit = Math.round(this.scene.layout.outerPadding)
    const rightLimit = this.overlayCanvas.width - Math.round(this.scene.layout.outerPadding)
    const regionLeft = region ? Math.round(region.xStart * this.overlayCanvas.width) : leftLimit
    const regionRight = region ? Math.round(region.xEnd * this.overlayCanvas.width) : rightLimit
    const startX = Math.max(leftLimit, regionLeft)
    const endX = Math.min(rightLimit, regionRight)
    const startY = clamp(
      Math.floor(bandTop - this.scene.layout.verticalPadding),
      0,
      this.overlayCanvas.height - 1,
    )
    const endY = clamp(
      Math.ceil(bandBottom + this.scene.layout.verticalPadding),
      0,
      this.overlayCanvas.height,
    )
    const { data } = this.overlayContext.getImageData(0, 0, this.overlayCanvas.width, this.overlayCanvas.height)

    const slots: Slot[] = []
    let runStart = -1

    for (let x = startX; x < endX; x++) {
      let blocked = false

      for (let y = startY; y < endY; y++) {
        if (data[(y * this.overlayCanvas.width + x) * 4 + 3]! > this.scene.assets.alphaThreshold) {
          blocked = true
          break
        }
      }

      if (!blocked) {
        if (runStart === -1) {
          runStart = x
        }

        continue
      }

      if (runStart !== -1) {
        slots.push({ left: runStart, right: x })
        runStart = -1
      }
    }

    if (runStart !== -1) {
      slots.push({ left: runStart, right: endX })
    }

    const minSlotWidth = region?.minSlotWidth ?? this.scene.layout.minSlotWidth

    return slots
      .map((slot) => ({
        left: slot.left + this.scene.layout.horizontalPadding,
        right: slot.right - this.scene.layout.horizontalPadding,
      }))
      .filter((slot) => slot.right - slot.left >= minSlotWidth)
  }

  private resolveBlockStyle(block: TextBlockConfig): ResolvedBlockStyle {
    const base = this.scene.styles[block.style] ?? this.scene.styles.body
    return mergeStyle(base, block.styleOverride)
  }

  private resolveColumns(styleName: string, style: ResolvedBlockStyle, block: TextBlockConfig, region: ResolvedRegion | null): Required<ColumnSplitConfig> {
    const fromRegion = region?.columnSplit
    const fromBlock = block.columns
    const merged = mergeColumns(this.scene.columnSplit, fromRegion)
    const mergedWithStyle = mergeColumns(merged, style.columns)
    const finalColumns = mergeColumns(mergedWithStyle, fromBlock)

    if (!finalColumns.applyToStyles.includes(styleName)) {
      return { ...finalColumns, mode: 'off' }
    }

    return finalColumns
  }

  private orderSlots(
    slots: Slot[],
    block: TextBlockConfig,
    style: ResolvedBlockStyle,
    region: ResolvedRegion | null,
  ): Slot[] {
    if (!slots.length) {
      return []
    }

    const anchorX = (region?.anchorX ?? 0.5) * this.overlayCanvas.width
    const order = block.regionOrder ?? region?.slotOrder ?? 'left-to-right'
    const split = this.resolveColumns(block.style, style, block, region)
    const sorted = sortSlots(slots, order, anchorX).flatMap((slot) => maybeSplitSlot(slot, split))

    if (block.allowMultiSlot ?? style.allowMultiSlot) {
      return sortSlots(sorted, order, anchorX)
    }

    return [chooseSingleSlot(sorted, anchorX)]
  }

  private measureMaskedLayout(width: number, height: number, scale: number): LayoutResult {
    const lines: PositionedLine[] = []
    const debugSlots: LayoutResult['debugSlots'] = []
    let globalCursor = this.scene.layout.outerPadding
    const regionCursors = new Map<string, number>()

    for (const block of this.scene.blocks) {
      const style = this.resolveBlockStyle(block)
      const text =
        style.textTransform === 'uppercase' ? block.text.toUpperCase() : block.text
      const fontSize = clamp(
        width * style.fontSizeRatio * scale,
        style.minFontSize * scale,
        style.maxFontSize * scale,
      )
      const lineHeightPx = Math.max(14, Math.round(fontSize * style.lineHeight))
      const font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`
      const prepared = prepareWithSegments(text, font)
      const region = block.region ? this.scene.regions[block.region] ?? null : null
      const regionTop = region ? Math.max(this.scene.layout.outerPadding, Math.round(region.yStart * height)) : this.scene.layout.outerPadding
      const regionBottom = region ? Math.min(height - this.scene.layout.outerPadding, Math.round(region.yEnd * height)) : height - this.scene.layout.outerPadding
      let cursorTop = region ? regionCursors.get(block.region!) ?? regionTop : globalCursor
      let cursor = { segmentIndex: 0, graphemeIndex: 0 }
      let blockFinished = false

      while (cursorTop + lineHeightPx <= regionBottom) {
        const bandTop = cursorTop
        const bandBottom = cursorTop + lineHeightPx
        const slots = this.orderSlots(this.getTransparentSlots(bandTop, bandBottom, region), block, style, region)
        let placed = false

        if (this.scene.debug.enabled && this.scene.debug.showSlots) {
          slots.forEach((slot) => {
            debugSlots.push({
              x: slot.left,
              y: bandTop,
              width: slot.right - slot.left,
              height: lineHeightPx,
            })
          })
        }

        if (!slots.length) {
          cursorTop += lineHeightPx
          continue
        }

        for (const slot of slots) {
          const line = layoutNextLine(prepared, cursor, slot.right - slot.left)

          if (line === null) {
            blockFinished = true
            break
          }

          const appearance = this.resolveLineAppearance(slot.left, bandTop, line.width, style, block)

          lines.push({
            text: line.text,
            x: slot.left,
            y: bandTop,
            width: line.width,
            styleName: block.style,
            style,
            appearance,
          })
          cursor = line.end
          placed = true
        }

        if (placed) {
          cursorTop += lineHeightPx
        }

        if (blockFinished) {
          cursorTop += style.gapAfter
          if (region && block.region) {
            regionCursors.set(block.region, cursorTop)
          } else {
            globalCursor = cursorTop
          }
          break
        }
      }

      if (!blockFinished) {
        return {
          lines,
          debugSlots,
          overflowed: true,
          renderedLines: lines.length,
          scale,
        }
      }
    }

    return {
      lines,
      debugSlots,
      overflowed: false,
      renderedLines: lines.length,
      scale,
    }
  }

  private applyMasked(result: LayoutResult, statusText = 'Masked layout active'): void {
    this.state.layoutMode = 'masked'
    this.state.scale = result.scale
    this.root.dataset.mode = 'masked'
    this.lineLayer.replaceChildren()
    this.debugLayer.replaceChildren()

    const lineFragment = document.createDocumentFragment()

    result.lines.forEach((line) => {
      const element = document.createElement('div')
      element.className = `pie-line pie-line-${sanitizeStyleName(line.styleName)}`
      element.textContent = line.text
      element.style.left = `${Math.round(line.x)}px`
      element.style.top = `${Math.round(line.y)}px`
      element.style.color = line.appearance.textColor
      element.style.font = `${line.style.fontWeight} ${Math.round(
        clamp(
          this.state.width * line.style.fontSizeRatio * result.scale,
          line.style.minFontSize * result.scale,
          line.style.maxFontSize * result.scale,
        ),
      )}px ${line.style.fontFamily}`
      element.style.lineHeight = `${Math.max(
        14,
        Math.round(this.state.width * line.style.fontSizeRatio * line.style.lineHeight * result.scale),
      )}px`
      element.style.letterSpacing = `${line.style.letterSpacing}px`
      element.style.textTransform = line.style.textTransform
      element.style.padding = `${line.appearance.paddingY}px ${line.appearance.paddingX}px`
      element.style.borderRadius = `${line.appearance.radius}px`
      element.style.background = line.appearance.backgroundColor ?? 'transparent'
      element.style.boxShadow = line.appearance.backgroundColor
        ? `0 0 ${line.style.minFontSize}px ${line.appearance.backgroundColor}`
        : 'none'
      element.style.textShadow =
        line.appearance.shadowBlur > 0
          ? `${line.appearance.shadowOffsetX}px ${line.appearance.shadowOffsetY}px ${line.appearance.shadowBlur}px ${line.appearance.shadowColor}`
          : 'none'
      element.style.userSelect = this.scene.interaction.selectable ? 'text' : 'none'
      lineFragment.append(element)
    })

    this.lineLayer.append(lineFragment)

    if (this.scene.debug.enabled && this.scene.debug.showSlots) {
      const debugFragment = document.createDocumentFragment()

      result.debugSlots.forEach((slot) => {
        const element = document.createElement('div')
        element.className = 'pie-slot'
        element.style.left = `${slot.x}px`
        element.style.top = `${slot.y}px`
        element.style.width = `${slot.width}px`
        element.style.height = `${slot.height}px`
        debugFragment.append(element)
      })

      if (this.scene.debug.showRegions) {
        Object.values(this.scene.regions).forEach((region) => {
          const element = document.createElement('div')
          element.className = 'pie-region'
          element.style.left = `${Math.round(region.xStart * this.state.width)}px`
          element.style.top = `${Math.round(region.yStart * this.state.height)}px`
          element.style.width = `${Math.round((region.xEnd - region.xStart) * this.state.width)}px`
          element.style.height = `${Math.round((region.yEnd - region.yStart) * this.state.height)}px`
          debugFragment.append(element)
        })
      }

      this.debugLayer.append(debugFragment)
    }

    this.fallback.hidden = true
    this.statusBadge.textContent = statusText
  }

  private applyFallback(label: string): void {
    this.state.layoutMode = 'fallback'
    this.state.scale = 1
    this.root.dataset.mode = 'fallback'
    this.lineLayer.replaceChildren()
    this.debugLayer.replaceChildren()
    this.fallbackContent.replaceChildren()

    const fragment = document.createDocumentFragment()

    this.scene.blocks.forEach((block) => {
      fragment.append(buildFallbackBlock(block, this.resolveBlockStyle(block)))
    })

    this.fallbackContent.append(fragment)
    this.fallbackLabel.textContent = label
    this.fallback.hidden = false
    this.statusBadge.textContent = 'Fallback layout active'
  }
}

export const createPretextImageEngine = (
  container: HTMLElement,
  scene: ImageEngineSceneConfig,
): ImageTextEngine => new PretextImageEngine(container, scene)
