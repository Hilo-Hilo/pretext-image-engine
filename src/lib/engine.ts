import { layoutNextLine, prepareWithSegments } from '@chenglou/pretext'
import type { LayoutCursor, PreparedTextWithSegments } from '@chenglou/pretext'

import {
  DEFAULT_BLOCK_STYLES,
  DEFAULT_COLORS,
  DEFAULT_COLUMN_SPLIT,
  DEFAULT_HIGHLIGHT,
  DEFAULT_INTERACTION,
  DEFAULT_LAYOUT,
  DEFAULT_RESIZE,
  DEFAULT_REVEAL,
  DEFAULT_SCENE,
  DEFAULT_SHADOW,
  DEFAULT_STAGE,
} from './defaults'
import { ENGINE_CSS, ENGINE_STYLE_ID } from './styles'
import { buildV2Plan, resolveV2BlockBackdrop, resolveV2PanelColor, type PlannedV2Slot } from './v2'
import type {
  BlockConfig,
  BlockStyleConfig,
  ColumnSplitConfig,
  ColorConfig,
  EmbedBlockConfig,
  EngineOptions,
  EngineState,
  HighlightConfig,
  ImageEngineSceneConfig,
  ImageTextEngine,
  InlineLinkConfig,
  InteractionConfig,
  LineAppearance,
  RegionConfig,
  RevealConfig,
  RevealUnit,
  ScrollSourceOptions,
  SelectionConfig,
  ShadowConfig,
  TextBlockConfig,
  TextBlockScrollConfig,
  TextBlockScrollMode,
} from './types'

/**
 * Break a line's text into alternating plain / linked segments so each
 * link's matched substring can be wrapped in its own `<a>` during reveal
 * splitting. First match per link wins (non-overlapping); links that
 * don't match the current line's text contribute nothing.
 */
function buildLinkedSegments(
  text: string,
  links: InlineLinkConfig[],
): Array<{ text: string; href?: string; alt?: string }> {
  type Match = { start: number; end: number; href: string; alt?: string }
  const matches: Match[] = []
  for (const link of links) {
    if (!link.match) continue
    const idx = text.indexOf(link.match)
    if (idx < 0) continue
    matches.push({ start: idx, end: idx + link.match.length, href: link.href, alt: link.alt })
  }
  matches.sort((a, b) => a.start - b.start)
  // Drop overlapping matches, keep earliest-start winner.
  const clean: Match[] = []
  let cursor = 0
  for (const m of matches) {
    if (m.start < cursor) continue
    clean.push(m)
    cursor = m.end
  }
  const segments: Array<{ text: string; href?: string; alt?: string }> = []
  cursor = 0
  for (const m of clean) {
    if (m.start > cursor) segments.push({ text: text.slice(cursor, m.start) })
    segments.push({ text: text.slice(m.start, m.end), href: m.href, alt: m.alt })
    cursor = m.end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) })
  return segments
}

function createInlineAnchor(doc: Document, href: string, alt?: string): HTMLAnchorElement {
  const a = doc.createElement('a')
  a.className = 'pie-inline-link'
  a.href = href
  if (alt) a.setAttribute('aria-label', alt)
  if (/^https?:\/\//.test(href)) {
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
  }
  return a
}

/**
 * Given a line element and its source block, compute the per-line inline
 * link descriptors — translating each link's match range from the block's
 * full text into this line's local text. Handles links whose match spans
 * multiple layout lines by emitting a partial link for each line the
 * match touches.
 *
 * Relies on the caller iterating lines in block order; the `cursors` map
 * tracks how many characters of each block's text have been consumed.
 */
function perLineLinksForElement(
  el: HTMLElement,
  block: TextBlockConfig,
  cursors: Map<string, number>,
): InlineLinkConfig[] | undefined {
  if (!block.links || block.links.length === 0) return undefined
  const blockText = block.text ?? (block.lines ?? []).join('\n')
  if (!blockText) return undefined
  const lineText = el.textContent ?? ''
  if (!lineText) return undefined
  const blockId = el.dataset.blockId ?? ''
  const cursor = cursors.get(blockId) ?? 0
  const lineStart = blockText.indexOf(lineText, cursor)
  if (lineStart < 0) return undefined
  const lineEnd = lineStart + lineText.length
  cursors.set(blockId, lineEnd)

  const result: InlineLinkConfig[] = []
  for (const link of block.links) {
    if (!link.match) continue
    // For a simple single-occurrence match we search from the start of
    // the block text. Multiple occurrences would need ranged tracking;
    // rare enough to skip until someone needs it.
    const matchStart = blockText.indexOf(link.match)
    if (matchStart < 0) continue
    const matchEnd = matchStart + link.match.length
    const overlapStart = Math.max(matchStart, lineStart)
    const overlapEnd = Math.min(matchEnd, lineEnd)
    if (overlapStart >= overlapEnd) continue
    const localMatch = lineText.slice(overlapStart - lineStart, overlapEnd - lineStart)
    if (localMatch.length === 0) continue
    result.push({ match: localMatch, href: link.href, alt: link.alt })
  }
  return result.length > 0 ? result : undefined
}

const isTextBlock = (block: BlockConfig): block is TextBlockConfig =>
  block.kind !== 'embed'
const isEmbedBlock = (block: BlockConfig): block is EmbedBlockConfig =>
  block.kind === 'embed'
const DEFAULT_EMBED_REVEAL_COST = 20
const DEFAULT_EMBED_GAP_AFTER = 14

type ResolvedBlockStyle = Omit<Required<BlockStyleConfig>, 'highlight' | 'columns'> & {
  highlight: Required<HighlightConfig>
  columns: Required<ColumnSplitConfig>
}

type ResolvedRegion = Omit<Required<RegionConfig>, 'columnSplit'> & {
  columnSplit: Required<ColumnSplitConfig>
}

type ResolvedBlockScroll = {
  mode: TextBlockScrollMode
  start: number
  end: number
  stickyTop: number
}

type ResolvedAssets = Required<ImageEngineSceneConfig['assets']>
type ResolvedStage = Required<NonNullable<ImageEngineSceneConfig['stage']>>
type ResolvedLayout = Required<NonNullable<ImageEngineSceneConfig['layout']>>
type ResolvedResize = Required<NonNullable<ImageEngineSceneConfig['resize']>>
type ResolvedDebug = Required<NonNullable<ImageEngineSceneConfig['debug']>>
type ResolvedOptions = Required<Pick<EngineOptions, 'injectStyles' | 'initialProgress'>> &
  Pick<EngineOptions, 'renderEmbed'>
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
  reveal: Required<RevealConfig>
  debug: ResolvedDebug
  styles: Record<string, ResolvedBlockStyle>
  regions: Record<string, ResolvedRegion>
  blocks: BlockConfig[]
  v2: ImageEngineSceneConfig['v2']
}

type Slot = {
  left: number
  right: number
}

type LayoutLine = {
  id: string
  blockId: string
  blockIndex: number
  lineIndex: number
  text: string
  x: number
  y: number
  width: number
  styleName: string
  style: ResolvedBlockStyle
  fontSize: number
  lineHeightPx: number
  appearance: LineAppearance
  scroll: ResolvedBlockScroll
  revealThreshold: number
  slotId: string | null
  backdropMode: 'none' | 'shadow' | 'line' | 'panel'
  panelColor: string | null
}

type LayoutBlock = {
  id: string
  blockIndex: number
  scroll: ResolvedBlockScroll
  firstLineId: string | null
  slotId: string | null
}

type LayoutEmbed = {
  id: string
  blockId: string
  blockIndex: number
  config: EmbedBlockConfig
  x: number
  y: number
  width: number
  height: number
  slotId: string | null
  revealCost: number
}

type MaskedLayoutResult = {
  lines: LayoutLine[]
  embeds: LayoutEmbed[]
  blocks: LayoutBlock[]
  debugSlots: Array<{
    x: number
    y: number
    width: number
    height: number
    label?: string
    kind?: 'slot' | 'region' | 'protection' | 'manual-slot' | 'subject-zone'
    active?: boolean
  }>
  overflowed: boolean
  renderedLines: number
  scale: number
  statusText?: string
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const numberOr = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const textOr = (value: string | undefined, fallback: string): string =>
  typeof value === 'string' && value.trim() ? value : fallback

const objectOrEmpty = <T extends object>(value: T | undefined): Partial<T> =>
  value && typeof value === 'object' ? value : {}

const clampProgress = (value: number): number => clamp(numberOr(value, 0), 0, 1)

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
  blocks: BlockConfig[],
): Record<string, ResolvedBlockStyle> => {
  const styles: Record<string, ResolvedBlockStyle> = {}
  const keys = new Set<string>([...Object.keys(DEFAULT_BLOCK_STYLES), ...Object.keys(styleOverrides ?? {})])

  blocks.forEach((block) => {
    if (isTextBlock(block)) keys.add(block.style)
  })

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

const resolveStageConfig = (stage: ImageEngineSceneConfig['stage']): ResolvedStage => {
  const aspectRatio = numberOr(stage?.aspectRatio, DEFAULT_STAGE.aspectRatio)

  return {
    aspectRatio: aspectRatio > 0 ? aspectRatio : DEFAULT_STAGE.aspectRatio,
    minHeight: Math.max(0, numberOr(stage?.minHeight, DEFAULT_STAGE.minHeight)),
    background: textOr(stage?.background, DEFAULT_STAGE.background),
    padding: Math.max(0, numberOr(stage?.padding, DEFAULT_STAGE.padding)),
    borderRadius: Math.max(0, numberOr(stage?.borderRadius, DEFAULT_STAGE.borderRadius)),
  }
}

const resolveLayoutConfig = (layout: ImageEngineSceneConfig['layout']): ResolvedLayout => {
  const minScale = clamp(numberOr(layout?.minScale, DEFAULT_LAYOUT.minScale), 0.1, 1)

  return {
    outerPadding: Math.max(0, numberOr(layout?.outerPadding, DEFAULT_LAYOUT.outerPadding)),
    horizontalPadding: Math.max(0, numberOr(layout?.horizontalPadding, DEFAULT_LAYOUT.horizontalPadding)),
    verticalPadding: Math.max(0, numberOr(layout?.verticalPadding, DEFAULT_LAYOUT.verticalPadding)),
    minSlotWidth: Math.max(24, numberOr(layout?.minSlotWidth, DEFAULT_LAYOUT.minSlotWidth)),
    minScale,
    scaleStep: clamp(numberOr(layout?.scaleStep, DEFAULT_LAYOUT.scaleStep), 0.01, 1),
    fallbackBelowWidth: Math.max(0, numberOr(layout?.fallbackBelowWidth, DEFAULT_LAYOUT.fallbackBelowWidth)),
  }
}

const getFontMetrics = (
  style: ResolvedBlockStyle,
  width: number,
  scale: number,
): { fontSize: number; lineHeightPx: number; font: string } => {
  const fontSize = clamp(
    width * style.fontSizeRatio * scale,
    style.minFontSize * scale,
    style.maxFontSize * scale,
  )
  const lineHeightPx = Math.max(14, Math.round(fontSize * style.lineHeight))

  const fontStyle = style.fontStyle ?? 'normal'
  return {
    fontSize,
    lineHeightPx,
    font: `${fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`,
  }
}

const isLayoutCursorComplete = (
  prepared: PreparedTextWithSegments & { text?: string },
  cursor: LayoutCursor,
): boolean => {
  const segmentCount = Array.isArray(prepared.widths)
    ? prepared.widths.length
    : typeof prepared.text === 'string'
      ? 1
      : 0

  return cursor.segmentIndex >= segmentCount
}

const resolveScrollConfig = (scroll?: TextBlockScrollConfig): ResolvedBlockScroll => {
  const mode = scroll?.mode ?? 'static'
  const start = clampProgress(numberOr(scroll?.start, 0))
  const end = clampProgress(numberOr(scroll?.end, 1))

  return {
    mode,
    start,
    end: end <= start ? start : end,
    stickyTop: Math.max(0, numberOr(scroll?.stickyTop, 24)),
  }
}

const resolveOptions = (options?: EngineOptions): ResolvedOptions => ({
  injectStyles: options?.injectStyles ?? true,
  initialProgress: clampProgress(numberOr(options?.initialProgress, 0)),
  renderEmbed: options?.renderEmbed,
})

const DEFAULT_ITEM_GAP = 4

const expandBlocks = (blocks: BlockConfig[]): BlockConfig[] => {
  const result: BlockConfig[] = []
  blocks.forEach((block, blockIndex) => {
    if (isEmbedBlock(block)) {
      // Embeds pass through unchanged; no text to expand.
      result.push(block)
      return
    }
    if (Array.isArray(block.lines) && block.lines.length > 0) {
      const marker = block.marker ?? ''
      const baseId = block.id ?? `block-${blockIndex}`
      const itemGap = block.itemGap ?? DEFAULT_ITEM_GAP
      const lastIndex = block.lines.length - 1
      block.lines.forEach((lineText, lineIndex) => {
        const { lines: _lines, marker: _marker, text: _text, itemGap: _ig, styleOverride, ...rest } = block
        const isLast = lineIndex === lastIndex
        const mergedOverride = isLast
          ? styleOverride
          : { ...(styleOverride ?? {}), gapAfter: styleOverride?.gapAfter ?? itemGap }
        result.push({
          ...rest,
          id: `${baseId}-item-${lineIndex}`,
          text: `${marker}${lineText}`,
          ...(mergedOverride ? { styleOverride: mergedOverride } : {}),
        })
      })
      return
    }
    if (typeof block.text === 'string') {
      result.push(block)
      return
    }
    console.warn(
      `[pretext-image-engine] block ${block.id ?? blockIndex} has neither text nor lines; skipping.`,
    )
  })
  return result
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

  const resolvedStage = resolveStageConfig(scene.stage)
  const resolvedLayout = resolveLayoutConfig(scene.layout)
  const resolvedResize: ResolvedResize = { ...DEFAULT_RESIZE, ...objectOrEmpty(scene.resize) }
  const resolvedColumnSplit = mergeColumns(DEFAULT_COLUMN_SPLIT, scene.columnSplit)
  const resolvedInteraction: Required<InteractionConfig> = {
    ...DEFAULT_INTERACTION,
    ...objectOrEmpty(scene.interaction),
  }
  const resolvedReveal: Required<RevealConfig> = {
    ...DEFAULT_REVEAL,
    ...objectOrEmpty(scene.reveal),
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
    reveal: resolvedReveal,
    debug: resolvedDebug,
    styles: resolveStyles(scene.styles, scene.blocks),
    regions: resolveRegions(scene.regions),
    blocks: expandBlocks(scene.blocks),
    v2: scene.v2,
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

const ensureEngineStyles = (doc: Document, injectStyles: boolean): void => {
  if (!injectStyles || doc.getElementById(ENGINE_STYLE_ID)) {
    return
  }

  const style = doc.createElement('style')
  style.id = ENGINE_STYLE_ID
  style.textContent = ENGINE_CSS
  doc.head.append(style)
}

const waitForImage = async (image: HTMLImageElement): Promise<void> => {
  if (image.complete) {
    if (image.naturalWidth > 0) {
      return
    }

    throw new Error(`Unable to load ${image.currentSrc || image.src}`)
  }

  await new Promise<void>((resolve, reject) => {
    let settled = false

    const finish = (): void => {
      if (settled) {
        return
      }

      settled = true
      cleanup()
      resolve()
    }

    const fail = (): void => {
      if (settled) {
        return
      }

      settled = true
      cleanup()
      reject(new Error(`Unable to load ${image.currentSrc || image.src}`))
    }

    const cleanup = (): void => {
      image.removeEventListener('load', finish)
      image.removeEventListener('error', fail)
      if (pollTimer !== null) {
        clearInterval(pollTimer)
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }

    image.addEventListener('load', finish, { once: true })
    image.addEventListener('error', fail, { once: true })

    const pollTimer = window.setInterval(() => {
      if (!image.complete) {
        return
      }

      if (image.naturalWidth > 0) {
        finish()
        return
      }

      fail()
    }, 50)

    const timeoutId = window.setTimeout(() => {
      if (image.complete && image.naturalWidth > 0) {
        finish()
        return
      }

      fail()
    }, 60_000)

    if (typeof image.decode === 'function') {
      void image.decode().then(finish).catch(() => {
        if (image.complete && image.naturalWidth > 0) {
          finish()
        }
      })
    }
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

const buildFallbackBlock = (
  doc: Document,
  block: TextBlockConfig,
  style: ResolvedBlockStyle,
  blockIndex: number,
): HTMLElement => {
  const tag = block.style === 'heading' ? 'h3' : 'p'
  const element = doc.createElement(tag)
  element.className = `pie-fallback-block pie-fallback-${sanitizeStyleName(block.style)}`
  element.dataset.blockId = block.id ?? `block-${blockIndex}`
  const rawText = block.text ?? ''
  element.textContent = style.textTransform === 'uppercase' ? rawText.toUpperCase() : rawText
  return element
}

const getBlockProgress = (progress: number, scroll: ResolvedBlockScroll): number => {
  if (scroll.mode === 'static') {
    return 1
  }

  if (scroll.end <= scroll.start) {
    return progress >= scroll.start ? 1 : 0
  }

  return clamp((progress - scroll.start) / (scroll.end - scroll.start), 0, 1)
}

const isStickyBlockActive = (progress: number, block: LayoutBlock): boolean => {
  if (block.scroll.mode !== 'sticky-start-reveal') {
    return false
  }

  if (block.scroll.end <= block.scroll.start) {
    return progress === block.scroll.start
  }

  return progress >= block.scroll.start && progress <= block.scroll.end
}

const isLineVisible = (line: LayoutLine, progress: number): boolean => {
  if (line.scroll.mode === 'static') {
    return true
  }

  if (progress < line.scroll.start) {
    return false
  }

  return getBlockProgress(progress, line.scroll) >= line.revealThreshold
}

const createLineElement = (
  doc: Document,
  line: LayoutLine,
  selectable: boolean,
  sticky = false,
): HTMLDivElement => {
  const element = doc.createElement('div')
  element.className = `pie-line${sticky ? ' pie-sticky-line' : ''} pie-line-${sanitizeStyleName(line.styleName)}`
  element.textContent = line.text
  element.style.left = `${Math.round(line.x)}px`
  element.style.top = `${Math.round(sticky ? line.scroll.stickyTop : line.y)}px`
  element.style.color = line.appearance.textColor
  element.style.font = `${line.style.fontStyle ?? 'normal'} ${line.style.fontWeight} ${Math.round(line.fontSize)}px ${line.style.fontFamily}`
  element.style.lineHeight = `${line.lineHeightPx}px`
  element.style.letterSpacing = `${line.style.letterSpacing}px`
  element.style.textTransform = line.style.textTransform
  element.style.padding = `${line.appearance.paddingY}px ${line.appearance.paddingX}px`
  element.style.borderRadius = `${line.appearance.radius}px`
  element.style.background = line.appearance.backgroundColor ?? 'transparent'
  element.style.boxShadow = line.appearance.backgroundColor
    ? `0 0 ${line.style.minFontSize}px ${line.appearance.backgroundColor}`
    : 'none'
  const textShadow =
    line.appearance.shadowBlur > 0
      ? `${line.appearance.shadowOffsetX}px ${line.appearance.shadowOffsetY}px ${line.appearance.shadowBlur}px ${line.appearance.shadowColor}`
      : 'none'
  element.style.textShadow = `var(--pie-line-text-shadow, ${textShadow})`
  element.style.userSelect = selectable && !sticky ? 'text' : 'none'
  element.dataset.blockId = line.blockId
  element.dataset.lineId = line.id
  element.dataset.scrollMode = line.scroll.mode

  if (sticky) {
    element.setAttribute('aria-hidden', 'true')
  }

  return element
}

type PanelElementConfig = {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  blur: number
  radius: number
}

const createPanelElement = (doc: Document, panel: PanelElementConfig): HTMLDivElement => {
  const element = doc.createElement('div')
  element.className = 'pie-panel'
  element.dataset.panelId = panel.id
  element.style.left = `${panel.x}px`
  element.style.top = `${panel.y}px`
  element.style.width = `${panel.width}px`
  element.style.height = `${panel.height}px`
  element.style.background = panel.color
  element.style.backdropFilter = `blur(${panel.blur}px)`
  element.style.borderRadius = `${panel.radius}px`
  return element
}

const getSafeDocument = (container: HTMLElement): Document => {
  const doc = container.ownerDocument

  if (!doc?.defaultView) {
    throw new Error(
      'pretext-image-engine can be imported in SSR, but createPretextImageEngine() requires a browser DOM container.',
    )
  }

  return doc
}

export class PretextImageEngine implements ImageTextEngine {
  private readonly container: HTMLElement
  private readonly doc: Document
  private readonly options: ResolvedOptions
  private readonly root: HTMLDivElement
  private readonly stageShell: HTMLDivElement
  private readonly stickyLayer: HTMLDivElement
  private readonly stickyInner: HTMLDivElement
  private readonly stage: HTMLDivElement
  private readonly baseImage: HTMLImageElement
  private readonly overlayImage: HTMLImageElement
  private readonly lineLayer: HTMLDivElement
  private readonly panelLayer: HTMLDivElement
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
  private resizeDebounce = 0
  private activeLayout: MaskedLayoutResult | null = null
  private readonly lineElements = new Map<string, HTMLDivElement>()
  private readonly renderListeners = new Set<() => void>()
  private peakProgress = 0
  readonly ready: Promise<void>
  state: EngineState

  constructor(container: HTMLElement, scene: ImageEngineSceneConfig, options?: EngineOptions) {
    this.doc = getSafeDocument(container)
    this.options = resolveOptions(options)
    ensureEngineStyles(this.doc, this.options.injectStyles)

    this.container = container
    this.scene = resolveScene(scene)
    const initial = clampProgress(this.options.initialProgress)
    this.peakProgress = initial
    this.state = {
      layoutMode: 'masked',
      width: 0,
      height: 0,
      scale: 1,
      progress: initial,
    }

    this.root = this.doc.createElement('div')
    this.root.className = 'pie-root'
    this.stageShell = this.doc.createElement('div')
    this.stageShell.className = 'pie-stage-shell'
    this.stickyLayer = this.doc.createElement('div')
    this.stickyLayer.className = 'pie-sticky-layer'
    this.stickyInner = this.doc.createElement('div')
    this.stickyInner.className = 'pie-sticky-inner'
    this.stickyLayer.append(this.stickyInner)
    this.stage = this.doc.createElement('div')
    this.stage.className = 'pie-stage'
    this.baseImage = this.doc.createElement('img')
    this.baseImage.className = 'pie-base'
    this.baseImage.alt = ''
    this.baseImage.setAttribute('aria-hidden', 'true')
    this.baseImage.decoding = 'async'
    this.overlayImage = this.doc.createElement('img')
    this.overlayImage.className = 'pie-overlay'
    this.overlayImage.alt = ''
    this.overlayImage.setAttribute('aria-hidden', 'true')
    this.overlayImage.decoding = 'async'
    this.lineLayer = this.doc.createElement('div')
    this.lineLayer.className = 'pie-line-layer'
    this.panelLayer = this.doc.createElement('div')
    this.panelLayer.className = 'pie-panel-layer'
    this.debugLayer = this.doc.createElement('div')
    this.debugLayer.className = 'pie-debug-layer'
    this.status = this.doc.createElement('div')
    this.status.className = 'pie-status'
    this.statusBadge = this.doc.createElement('div')
    this.statusBadge.className = 'pie-status-badge'
    this.status.append(this.statusBadge)
    this.fallback = this.doc.createElement('div')
    this.fallback.className = 'pie-fallback'
    this.fallback.hidden = true
    this.fallbackLabel = this.doc.createElement('p')
    this.fallbackLabel.className = 'pie-fallback-label'
    this.fallbackContent = this.doc.createElement('div')
    this.fallbackContent.className = 'pie-fallback-content'
    this.fallback.append(this.fallbackLabel, this.fallbackContent)
    this.stage.append(this.baseImage, this.panelLayer, this.lineLayer, this.debugLayer, this.overlayImage, this.status)
    this.stageShell.append(this.stickyLayer, this.stage, this.fallback)
    this.root.append(this.stageShell)
    this.container.replaceChildren(this.root)

    this.baseCanvas = this.doc.createElement('canvas')
    this.overlayCanvas = this.doc.createElement('canvas')
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

  setProgress(progress: number): void {
    const clamped = clampProgress(progress)
    const effective = this.scene.reveal.monotonic
      ? Math.max(this.peakProgress, clamped)
      : clamped
    this.peakProgress = effective
    this.state.progress = effective

    this.applyProgressProjection()
  }

  onRender(listener: () => void): () => void {
    this.renderListeners.add(listener)
    return () => {
      this.renderListeners.delete(listener)
    }
  }

  attachScrollSource(
    target: Window | HTMLElement = this.doc.defaultView ?? window,
    options: ScrollSourceOptions = {},
  ): () => void {
    const throttle = options.throttle ?? 'raf'
    const easing = options.easing ?? ((t: number) => t)
    let rafId = 0
    let frameQueued = false

    const read = (): number => {
      if (target === this.doc.defaultView || target === window) {
        const scroller = this.doc.scrollingElement ?? this.doc.documentElement
        const total = scroller.scrollHeight - (this.doc.defaultView?.innerHeight ?? window.innerHeight)
        return total > 0 ? clampProgress(scroller.scrollTop / total) : 0
      }
      const el = target as HTMLElement
      const total = el.scrollHeight - el.clientHeight
      return total > 0 ? clampProgress(el.scrollTop / total) : 0
    }

    const tick = () => {
      frameQueued = false
      this.setProgress(easing(read()))
    }

    const onScroll = () => {
      if (throttle === 'none') {
        tick()
        return
      }
      if (frameQueued) return
      frameQueued = true
      rafId = requestAnimationFrame(tick)
    }

    target.addEventListener('scroll', onScroll, { passive: true })
    tick()

    return () => {
      target.removeEventListener('scroll', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }

  render(): void {
    const runtimeDebug = globalThis as typeof globalThis & { __pieLastRender?: Record<string, unknown> }

    if (!this.baseImage.naturalWidth) {
      runtimeDebug.__pieLastRender = { reason: 'base-image-not-ready' }
      return
    }

    const width = Math.max(0, Math.round(this.stage.clientWidth))
    const height = Math.max(0, Math.round(this.stage.clientHeight))

    if (!width || !height) {
      runtimeDebug.__pieLastRender = { reason: 'stage-size-zero', width, height }
      return
    }

    const fallbackWidthBasis = Math.max(
      0,
      Math.round(this.doc.defaultView?.innerWidth ?? width),
    )

    runtimeDebug.__pieLastRender = {
      reason: 'entered-render',
      width,
      height,
      preserveFullText: this.scene.resize.preserveFullText,
      fallbackMode: this.scene.resize.fallbackMode,
      fallbackBelowWidth: this.scene.layout.fallbackBelowWidth,
      fallbackWidthBasis,
      fallbackOnOverflow: this.scene.resize.fallbackOnOverflow,
      v2Enabled: Boolean(this.scene.v2?.enabled),
    }

    this.state.width = width
    this.state.height = height
    this.root.dataset.selectable = String(this.scene.interaction.selectable)
    this.root.dataset.selectionEnabled = String(
      this.scene.interaction.selectable && this.scene.colors.selection.enabled,
    )
    this.root.style.setProperty('--pie-selection-bg', this.scene.colors.selection.background)
    this.root.style.setProperty('--pie-selection-color', this.scene.colors.selection.color)

    this.syncCanvasBuffers(width, height)

    const v2Plan = this.scene.v2?.enabled
      ? buildV2Plan({
          scene: this.scene as unknown as ImageEngineSceneConfig,
          width,
          height,
          basePixels: this.baseContext.getImageData(0, 0, width, height).data,
          overlayPixels: this.scene.assets.overlaySrc
            ? this.overlayContext.getImageData(0, 0, width, height).data
            : null,
        })
      : null

    if (v2Plan && !this.scene.assets.overlaySrc) {
      this.applyProtectionMask(v2Plan.protectionRects)
    }

    const canFallback =
      this.scene.resize.preserveFullText && this.scene.resize.fallbackMode === 'below'

    if (canFallback && fallbackWidthBasis <= this.scene.layout.fallbackBelowWidth) {
      runtimeDebug.__pieLastRender = {
        ...(runtimeDebug.__pieLastRender ?? {}),
        reason: 'fallback-below-width',
        width,
        height,
        fallbackWidthBasis,
      }
      this.applyFallback(this.scene.resize.fallbackLabel)
      return
    }

    const candidates = buildScaleCandidates(this.scene.layout)
    let bestPartial: MaskedLayoutResult | null = null

    for (const scale of candidates) {
      const result = this.measureMaskedLayout(width, height, scale, v2Plan?.blocks, v2Plan?.regions, v2Plan?.slots)

      if (result.renderedLines > 0 && !result.overflowed) {
        runtimeDebug.__pieLastRender = {
          ...(runtimeDebug.__pieLastRender ?? {}),
          reason: 'applied-masked-layout',
          renderedLines: result.renderedLines,
          overflowed: result.overflowed,
          scale,
        }
        this.applyMasked(result, result.statusText ?? v2Plan?.statusText ?? 'Masked layout active')
        return
      }

      if (bestPartial === null || result.renderedLines > bestPartial.renderedLines) {
        bestPartial = result
      }
    }

    if (canFallback && this.scene.resize.fallbackOnOverflow) {
      runtimeDebug.__pieLastRender = {
        ...(runtimeDebug.__pieLastRender ?? {}),
        reason: 'fallback-after-measurement',
        bestPartialRenderedLines: bestPartial?.renderedLines ?? 0,
      }
      this.applyFallback(this.scene.resize.fallbackLabel)
      return
    }

    if (bestPartial !== null && bestPartial.renderedLines > 0) {
      runtimeDebug.__pieLastRender = {
        ...(runtimeDebug.__pieLastRender ?? {}),
        reason: 'applied-partial-layout',
        renderedLines: bestPartial.renderedLines,
        overflowed: bestPartial.overflowed,
        fallbackOnOverflow: this.scene.resize.fallbackOnOverflow,
      }
      this.applyMasked(bestPartial, bestPartial.statusText ?? 'Text clipped inside the image at this size.')
      return
    }

    if (canFallback) {
      runtimeDebug.__pieLastRender = {
        ...(runtimeDebug.__pieLastRender ?? {}),
        reason: 'fallback-no-readable-slots',
      }
      this.applyFallback('No readable slots were available inside the overlay.')
      return
    }

    runtimeDebug.__pieLastRender = {
      ...(runtimeDebug.__pieLastRender ?? {}),
      reason: 'applied-empty-layout',
    }
    this.applyMasked(
      {
        lines: [],
        embeds: [],
        blocks: [],
        debugSlots: v2Plan?.debugRects.map((rect) => ({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          label: rect.label,
          kind: rect.kind,
          active: rect.active,
        })) ?? [],
        overflowed: true,
        renderedLines: 0,
        scale: bestPartial?.scale ?? candidates.at(-1) ?? 1,
        statusText: v2Plan?.statusText,
      },
      v2Plan?.statusText ?? 'No readable slots were available inside the overlay.',
    )
  }

  destroy(): void {
    if (this.pendingFrame) {
      cancelAnimationFrame(this.pendingFrame)
    }
    if (this.resizeDebounce) {
      clearTimeout(this.resizeDebounce)
      this.resizeDebounce = 0
    }

    this.resizeObserver?.disconnect()
    this.renderListeners.clear()
    this.container.replaceChildren()
  }

  private attachResizeObserver(): void {
    if ('ResizeObserver' in window) {
      let firstFire = true
      this.resizeObserver = new ResizeObserver(() => {
        if (firstFire) {
          firstFire = false
          this.render()
          return
        }
        if (this.resizeDebounce) clearTimeout(this.resizeDebounce)
        this.resizeDebounce = window.setTimeout(() => {
          this.resizeDebounce = 0
          this.render()
        }, 120)
      })
      this.resizeObserver.observe(this.stage)
    }
  }

  private async loadAssets(): Promise<void> {
    const signature = `${this.scene.assets.baseSrc}::${this.scene.assets.overlaySrc}`
    this.baseImage.style.objectFit = this.scene.assets.fit
    this.overlayImage.style.objectFit = this.scene.assets.fit
    this.overlayImage.hidden = !this.scene.assets.overlaySrc

    if (
      signature === this.imageSignature &&
      this.baseImage.naturalWidth &&
      (!this.scene.assets.overlaySrc || this.overlayImage.naturalWidth)
    ) {
      this.syncStageAppearance()
      return
    }

    this.imageSignature = signature
    this.baseImage.src = this.scene.assets.baseSrc

    if (this.scene.assets.overlaySrc) {
      this.overlayImage.src = this.scene.assets.overlaySrc
      await Promise.all([waitForImage(this.baseImage), waitForImage(this.overlayImage)])
    } else {
      this.overlayImage.removeAttribute('src')
      await waitForImage(this.baseImage)
    }

    this.syncStageAppearance()
  }

  private syncStageAppearance(): void {
    const ratio = this.scene.stage.aspectRatio || this.baseImage.naturalWidth / this.baseImage.naturalHeight
    const alt = this.scene.meta.alt?.trim() ?? ''
    this.stageShell.style.padding = `${this.scene.stage.padding}px`
    this.stage.style.aspectRatio = `${ratio}`
    this.stage.style.minHeight = `${this.scene.stage.minHeight}px`
    this.stage.style.background = this.scene.stage.background
    this.stage.style.borderRadius = `${this.scene.stage.borderRadius}px`

    if (alt) {
      this.stage.setAttribute('role', 'img')
      this.stage.setAttribute('aria-label', alt)
      return
    }

    this.stage.removeAttribute('role')
    this.stage.removeAttribute('aria-label')
  }

  private syncCanvasBuffers(width: number, height: number): void {
    this.baseCanvas.width = width
    this.baseCanvas.height = height
    this.overlayCanvas.width = width
    this.overlayCanvas.height = height
    drawFittedImage(this.baseContext, this.baseImage, width, height, this.scene.assets.fit)
    this.overlayContext.clearRect(0, 0, width, height)

    if (this.scene.assets.overlaySrc && this.overlayImage.naturalWidth) {
      drawFittedImage(this.overlayContext, this.overlayImage, width, height, this.scene.assets.fit)
    }
  }

  private applyProtectionMask(rects: Array<{ x: number; y: number; width: number; height: number }>): void {
    if (!rects.length || typeof this.overlayContext.fillRect !== 'function') {
      return
    }

    if (typeof this.overlayContext.save === 'function') {
      this.overlayContext.save()
    }

    this.overlayContext.fillStyle = 'rgba(255, 255, 255, 1)'

    rects.forEach((rect) => {
      this.overlayContext.fillRect(rect.x, rect.y, rect.width, rect.height)
    })

    if (typeof this.overlayContext.restore === 'function') {
      this.overlayContext.restore()
    }
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
    lineHeightPx: number,
    style: ResolvedBlockStyle,
    block: TextBlockConfig,
    slotPlan: PlannedV2Slot | null = null,
  ): LineAppearance {
    const textConfig = this.scene.colors.text
    const blockHighlight = mergeHighlight(style.highlight, block.highlight)
    const shadow = this.scene.colors.shadow
    const sample = this.sampleLuminance(
      lineX,
      lineY,
      lineWidth + blockHighlight.paddingX * 2,
      lineHeightPx + blockHighlight.paddingY * 2,
    )
    const requestedTone = block.v2?.preferredTone ?? this.scene.v2?.colors?.forceTone ?? 'auto'
    const useDarkText =
      requestedTone === 'dark'
        ? true
        : requestedTone === 'light'
          ? false
          : slotPlan
            ? slotPlan.recommendedTone === 'dark'
            : textConfig.mode === 'auto'
              ? sample >= textConfig.luminanceThreshold
              : false
    const v2Colors = this.scene.v2?.colors
    const textColor =
      textConfig.mode === 'auto' || slotPlan
        ? useDarkText
          ? v2Colors?.darkColor ?? textConfig.darkColor
          : v2Colors?.lightColor ?? textConfig.lightColor
        : textConfig.color

    const resolvedBackdrop = slotPlan
      ? resolveV2BlockBackdrop(slotPlan, block, this.scene as unknown as ImageEngineSceneConfig)
      : blockHighlight.enabled && blockHighlight.mode !== 'off'
        ? 'line'
        : 'shadow'

    let backgroundColor: string | null = null

    if (resolvedBackdrop === 'line' && blockHighlight.enabled && blockHighlight.mode !== 'off') {
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
      shadowBlur: shadow.enabled || resolvedBackdrop === 'shadow' ? shadow.blur : 0,
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

  private resolveColumns(
    styleName: string,
    style: ResolvedBlockStyle,
    block: TextBlockConfig,
    region: ResolvedRegion | null,
  ): Required<ColumnSplitConfig> {
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

  private measureMaskedLayout(
    width: number,
    height: number,
    scale: number,
    blockSource: BlockConfig[] = this.scene.blocks,
    regionSource?: Record<string, RegionConfig>,
    plannedSlots?: PlannedV2Slot[],
  ): MaskedLayoutResult {
    const lines: LayoutLine[] = []
    const embeds: LayoutEmbed[] = []
    const blocks: LayoutBlock[] = []
    const debugSlots: MaskedLayoutResult['debugSlots'] = []
    const resolvedRegions = regionSource ? resolveRegions(regionSource) : this.scene.regions
    let globalCursor = this.scene.layout.outerPadding
    const regionCursors = new Map<string, number>()

    if (this.scene.debug.enabled && this.scene.debug.showRegions && plannedSlots?.length) {
      plannedSlots.forEach((slot) => {
        debugSlots.push({
          x: slot.x,
          y: slot.y,
          width: slot.width,
          height: slot.height,
          label: slot.id,
          kind: 'slot',
          active: slot.active,
        })
      })
    }

    for (const [blockIndex, block] of blockSource.entries()) {
      const blockId = block.id ?? `block-${blockIndex}`

      // --- Embed branch -------------------------------------------------
      // Embeds don't go through pretext text layout. We just reserve a
      // `width × height` rectangle in the target region, emit a LayoutEmbed,
      // and advance the region's cursor so subsequent blocks stack below.
      if (isEmbedBlock(block)) {
        const region = block.region ? resolvedRegions[block.region] ?? null : null
        const regionTop = region
          ? Math.max(this.scene.layout.outerPadding, Math.round(region.yStart * height))
          : this.scene.layout.outerPadding
        const regionBottom = region
          ? Math.min(height - this.scene.layout.outerPadding, Math.round(region.yEnd * height))
          : height - this.scene.layout.outerPadding

        let cursorTop = region
          ? regionCursors.get(block.region!) ?? regionTop
          : globalCursor

        // Embeds are sized proportional to stage width (not scene-scale)
        // so their size relative to the image stays constant regardless
        // of how the layout engine chooses to scale text to fit content.
        // The declared `block.width`/`block.height` are interpreted as
        // pixels at a reference stage width of 1200 (a typical desktop
        // render). At a 600-wide stage each embed is half-size; at 2400,
        // double-size. Keeps embed/image ratio fixed across viewports.
        const REFERENCE_STAGE_WIDTH = 1200
        const stageRatio = width / REFERENCE_STAGE_WIDTH
        const embedWidth = Math.max(1, Math.round(block.width * stageRatio))
        const embedHeight = Math.max(1, Math.round(block.height * stageRatio))
        const gapAfter = Math.max(0, block.gapAfter ?? DEFAULT_EMBED_GAP_AFTER)

        // Horizontal placement within the region: use the region's anchorX as
        // the center bias, same heuristic as text (but no slot carving since
        // embeds are opaque blocks that don't flow around mask geometry).
        const regionLeft = region
          ? Math.max(this.scene.layout.outerPadding, Math.round(region.xStart * width))
          : this.scene.layout.outerPadding
        const regionRight = region
          ? Math.min(width - this.scene.layout.outerPadding, Math.round(region.xEnd * width))
          : width - this.scene.layout.outerPadding
        const anchor = region ? region.anchorX : 0.5
        const usableWidth = Math.max(1, regionRight - regionLeft)
        const effectiveWidth = Math.min(embedWidth, usableWidth)
        const desiredCenter = regionLeft + anchor * usableWidth
        let embedX = Math.round(desiredCenter - effectiveWidth / 2)
        if (embedX < regionLeft) embedX = regionLeft
        if (embedX + effectiveWidth > regionRight) embedX = regionRight - effectiveWidth

        // Overflow check uses the FULL declared height (not a clamped value).
        // If the embed would extend past the region's bottom, signal overflow
        // so the engine tries the next smaller scale candidate — same
        // contract text blocks use. Silent truncation here produced clipped
        // cards at awkward zoom levels.
        if (cursorTop + embedHeight > regionBottom) {
          blocks.push({
            id: blockId,
            blockIndex,
            scroll: resolveScrollConfig(undefined),
            firstLineId: null,
            slotId: block.region ?? null,
          })
          return {
            lines,
            embeds,
            blocks,
            debugSlots,
            overflowed: true,
            renderedLines: lines.length,
            scale,
            statusText: plannedSlots?.length
              ? `V2 auto layout active · ${plannedSlots.filter((slot) => slot.active).length} slot${plannedSlots.filter((slot) => slot.active).length === 1 ? '' : 's'} planned`
              : undefined,
          }
        }

        embeds.push({
          id: blockId,
          blockId,
          blockIndex,
          config: block,
          x: embedX,
          y: cursorTop,
          width: effectiveWidth,
          height: embedHeight,
          slotId: block.region ?? null,
          revealCost: Math.max(1, Math.round(block.revealCost ?? DEFAULT_EMBED_REVEAL_COST)),
        })
        blocks.push({
          id: blockId,
          blockIndex,
          scroll: resolveScrollConfig(undefined),
          firstLineId: null,
          slotId: block.region ?? null,
        })

        cursorTop += embedHeight + gapAfter
        if (region && block.region) {
          regionCursors.set(block.region, cursorTop)
        } else {
          globalCursor = cursorTop
        }
        continue
      }
      // --- End embed branch ---------------------------------------------

      const style = this.resolveBlockStyle(block)
      const rawBlockText = block.text ?? ''
      const text =
        style.textTransform === 'uppercase' ? rawBlockText.toUpperCase() : rawBlockText
      const { font, fontSize, lineHeightPx } = getFontMetrics(style, width, scale)
      const prepared = prepareWithSegments(text, font)
      const region = block.region ? resolvedRegions[block.region] ?? null : null
      const slotPlan = block.region ? plannedSlots?.find((slot) => slot.id === block.region) ?? null : null
      const scroll = resolveScrollConfig(block.scroll)
      const blockLineStart = lines.length
      const regionTop = region
        ? Math.max(this.scene.layout.outerPadding, Math.round(region.yStart * height))
        : this.scene.layout.outerPadding
      const regionBottom = region
        ? Math.min(height - this.scene.layout.outerPadding, Math.round(region.yEnd * height))
        : height - this.scene.layout.outerPadding
      let cursorTop = region ? regionCursors.get(block.region!) ?? regionTop : globalCursor
      let cursor = { segmentIndex: 0, graphemeIndex: 0 }
      let blockFinished = false
      let blockLineIndex = 0

      while (cursorTop + lineHeightPx <= regionBottom) {
        const bandTop = cursorTop
        const bandBottom = cursorTop + lineHeightPx
        const rawSlots = this.getTransparentSlots(bandTop, bandBottom, region)
        const slots = this.orderSlots(rawSlots, block, style, region)
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

          const appearance = this.resolveLineAppearance(
            slot.left,
            bandTop,
            line.width,
            lineHeightPx,
            style,
            block,
            slotPlan,
          )
          const backdropMode = slotPlan ? resolveV2BlockBackdrop(slotPlan, block, this.scene as unknown as ImageEngineSceneConfig) : appearance.backgroundColor ? 'line' : 'shadow'

          lines.push({
            id: `${blockId}-line-${blockLineIndex}`,
            blockId,
            blockIndex,
            lineIndex: blockLineIndex,
            text: line.text,
            x: slot.left,
            y: bandTop,
            width: line.width,
            styleName: block.style,
            style,
            fontSize,
            lineHeightPx,
            appearance,
            scroll,
            revealThreshold: 0,
            slotId: slotPlan?.id ?? block.region ?? null,
            backdropMode,
            panelColor: slotPlan && backdropMode === 'panel'
              ? resolveV2PanelColor(slotPlan, this.scene as unknown as ImageEngineSceneConfig)
              : null,
          })
          blockLineIndex += 1
          cursor = line.end
          placed = true

          if (isLayoutCursorComplete(prepared, cursor)) {
            blockFinished = true
            break
          }
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

      const blockLineCount = lines.length - blockLineStart

      for (let index = 0; index < blockLineCount; index += 1) {
        const line = lines[blockLineStart + index]!
        line.revealThreshold = scroll.mode === 'static' || blockLineCount <= 1 ? 0 : index / blockLineCount
      }

      blocks.push({
        id: blockId,
        blockIndex,
        scroll,
        firstLineId: blockLineCount > 0 ? lines[blockLineStart]!.id : null,
        slotId: block.region ?? null,
      })

      if (!blockFinished) {
        return {
          lines,
          embeds,
          blocks,
          debugSlots,
          overflowed: true,
          renderedLines: lines.length,
          scale,
          statusText: plannedSlots?.length ? `V2 auto layout active · ${plannedSlots.filter((slot) => slot.active).length} slot${plannedSlots.filter((slot) => slot.active).length === 1 ? '' : 's'} planned` : undefined,
        }
      }
    }

    return {
      lines,
      embeds,
      blocks,
      debugSlots,
      overflowed: false,
      renderedLines: lines.length,
      scale,
      statusText: plannedSlots?.length ? `V2 auto layout active · ${plannedSlots.filter((slot) => slot.active).length} slot${plannedSlots.filter((slot) => slot.active).length === 1 ? '' : 's'} planned` : undefined,
    }
  }

  private maybeAccumulatePanel(
    line: LayoutLine,
    panelGroups: Map<string, { x: number; y: number; right: number; bottom: number; color: string }>,
  ): void {
    if (line.backdropMode !== 'panel' || !line.panelColor) return
    const key = line.slotId ?? line.blockId
    const current = panelGroups.get(key)
    const paddedLeft = Math.max(0, line.x - Math.max(8, line.appearance.paddingX * 2))
    const paddedTop = Math.max(0, line.y - Math.max(6, line.appearance.paddingY * 2))
    const paddedRight = line.x + line.width + Math.max(8, line.appearance.paddingX * 2)
    const paddedBottom = line.y + line.lineHeightPx + Math.max(6, line.appearance.paddingY * 2)
    if (current) {
      current.x = Math.min(current.x, paddedLeft)
      current.y = Math.min(current.y, paddedTop)
      current.right = Math.max(current.right, paddedRight)
      current.bottom = Math.max(current.bottom, paddedBottom)
    } else {
      panelGroups.set(key, {
        x: paddedLeft,
        y: paddedTop,
        right: paddedRight,
        bottom: paddedBottom,
        color: line.panelColor,
      })
    }
  }

  private applyMasked(result: MaskedLayoutResult, statusText = 'Masked layout active'): void {
    this.state.layoutMode = 'masked'
    this.state.scale = result.scale
    this.activeLayout = result
    this.root.dataset.mode = 'masked'
    this.lineElements.clear()
    this.panelLayer.replaceChildren()
    this.lineLayer.replaceChildren()
    this.debugLayer.replaceChildren()
    this.stickyInner.replaceChildren()

    const lineFragment = this.doc.createDocumentFragment()
    const panelFragment = this.doc.createDocumentFragment()
    const panelGroups = new Map<string, { x: number; y: number; right: number; bottom: number; color: string }>()

    // Walk text lines and embeds together in scene-block order so DOM order
    // reflects authoring order. Unit-level progress projection depends on
    // this because it toggles `.pie-visible` by document-order iteration.
    let __lineIdx = 0
    let __embedIdx = 0
    const __appendNextLine = () => {
      const line = result.lines[__lineIdx++]!
      const element = createLineElement(this.doc, line, this.scene.interaction.selectable)
      this.lineElements.set(line.id, element)
      lineFragment.append(element)
      this.maybeAccumulatePanel(line, panelGroups)
    }
    const __appendNextEmbed = () => {
      const embed = result.embeds[__embedIdx++]!
      const container = this.doc.createElement('div')
      container.className = `pie-embed pie-embed-${sanitizeStyleName(embed.config.embedKind)}`
      container.dataset.embedId = embed.id
      container.dataset.embedKind = embed.config.embedKind
      container.dataset.revealCost = String(embed.revealCost)
      container.style.position = 'absolute'
      container.style.left = `${embed.x}px`
      container.style.top = `${embed.y}px`
      container.style.width = `${embed.width}px`
      container.style.height = `${embed.height}px`
      // Publish the same ratio the engine used to scale the embed box, so
      // consumer stylesheets can scale their internal typography/spacing in
      // lockstep. Without this, em-based text inside an embed stays a fixed
      // pixel size regardless of stage width and overflows the box as soon
      // as the stage shrinks (e.g. the user zooms in / resizes narrower).
      // `embed.width / embed.config.width` naturally covers both the
      // stage-ratio path and the narrow-region clamp path.
      const embedScale = embed.width / Math.max(1, embed.config.width)
      container.style.setProperty('--pie-embed-scale', embedScale.toFixed(4))
      if (this.scene.interaction.selectable) {
        container.style.userSelect = 'text'
      }
      if (this.options.renderEmbed) {
        try {
          this.options.renderEmbed(embed.config, container)
        } catch (err) {
          console.error('[pretext-image-engine] renderEmbed threw:', err)
        }
      }
      lineFragment.append(container)
    }
    while (__lineIdx < result.lines.length || __embedIdx < result.embeds.length) {
      const nextLineBI = result.lines[__lineIdx]?.blockIndex ?? Infinity
      const nextEmbedBI = result.embeds[__embedIdx]?.blockIndex ?? Infinity
      if (nextLineBI <= nextEmbedBI) __appendNextLine()
      else __appendNextEmbed()
    }
    panelGroups.forEach((panel, key) => {
      panelFragment.append(
        createPanelElement(this.doc, {
          id: key,
          x: panel.x,
          y: panel.y,
          width: panel.right - panel.x,
          height: panel.bottom - panel.y,
          color: panel.color,
          blur: this.scene.v2?.backdrop?.blur ?? 18,
          radius: this.scene.v2?.backdrop?.panelRadius ?? 22,
        }),
      )
    })

    this.panelLayer.append(panelFragment)
    this.lineLayer.append(lineFragment)

    if (this.scene.debug.enabled && (this.scene.debug.showSlots || this.scene.debug.showRegions)) {
      const debugFragment = this.doc.createDocumentFragment()

      if (this.scene.debug.showSlots) {
        result.debugSlots.forEach((slot) => {
          const element = this.doc.createElement('div')
          element.className = slot.kind === 'subject-zone' || slot.kind === 'protection' ? 'pie-region' : 'pie-slot'
          if (slot.kind === 'manual-slot') {
            element.dataset.variant = 'manual'
          }
          if (slot.active === false) {
            element.dataset.active = 'false'
          }
          element.style.left = `${slot.x}px`
          element.style.top = `${slot.y}px`
          element.style.width = `${slot.width}px`
          element.style.height = `${slot.height}px`

          if (slot.label) {
            const label = this.doc.createElement('span')
            label.className = 'pie-debug-label'
            label.textContent = slot.label
            element.append(label)
          }

          debugFragment.append(element)
        })
      }

      if (this.scene.debug.showRegions) {
        Object.values(this.scene.regions).forEach((region) => {
          const element = this.doc.createElement('div')
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
    this.statusBadge.textContent = result.statusText ?? statusText

    if (this.scene.reveal.unit !== 'line') {
      // Track a cursor per block so wrapped lines can resolve their offset
      // into the block's full text. Needed for inline links whose match
      // spans the line boundary — we translate the [matchStart, matchEnd)
      // range from block-text coords to this line's local coords.
      const blockCursors = new Map<string, number>()
      this.lineElements.forEach((el) => {
        const blockId = el.dataset.blockId
        const block = blockId
          ? (this.scene.blocks.find((b) => !isEmbedBlock(b) && b.id === blockId) as
              | TextBlockConfig
              | undefined)
          : undefined
        const perLineLinks = block
          ? perLineLinksForElement(el, block, blockCursors)
          : undefined
        this.splitTextIntoUnits(
          el,
          this.scene.reveal.unit as Exclude<RevealUnit, 'line'>,
          perLineLinks,
        )
      })
    }

    this.applyProgressProjection()
    this.emitRender()
  }

  private applyProgressProjection(): void {
    const unit = this.scene.reveal.unit

    if (unit !== 'line') {
      this.applyUnitLevelProjection()
      return
    }

    if (this.state.layoutMode !== 'masked' || !this.activeLayout) {
      this.stickyInner.replaceChildren()
      return
    }

    let stickyLine: LayoutLine | null = null

    for (const block of this.activeLayout.blocks) {
      if (!isStickyBlockActive(this.state.progress, block) || !block.firstLineId) {
        continue
      }

      stickyLine = this.activeLayout.lines.find((line) => line.id === block.firstLineId) ?? null
    }

    this.activeLayout.lines.forEach((line) => {
      const element = this.lineElements.get(line.id)

      if (!element) {
        return
      }

      const visible = isLineVisible(line, this.state.progress) && line.id !== stickyLine?.id
      element.hidden = !visible
    })

    this.stickyInner.replaceChildren()

    if (stickyLine) {
      const stickyElement = createLineElement(this.doc, stickyLine, false, true)
      this.stickyInner.append(stickyElement)
    }
  }

  private applyUnitLevelProjection(): void {
    this.stickyInner.replaceChildren()
    // Collect every revealable unit in DOM order. Text chars/words count as
    // one slot each; embeds count as `revealCost` slots (default 20) so they
    // get meaningful scroll runway around them — but display atomically:
    // a single `.pie-visible` toggle either shows the whole embed or hides it.
    const units: Array<{ el: HTMLElement; slots: number; atomic: boolean }> = []
    const pushFrom = (root: HTMLElement): void => {
      root
        .querySelectorAll<HTMLElement>('.pie-char, .pie-word, .pie-embed')
        .forEach((el) => {
          if (el.classList.contains('pie-embed')) {
            const cost = Number(el.dataset.revealCost)
            units.push({
              el,
              slots: Number.isFinite(cost) && cost > 0 ? cost : DEFAULT_EMBED_REVEAL_COST,
              atomic: true,
            })
          } else {
            units.push({ el, slots: 1, atomic: false })
          }
        })
    }
    pushFrom(this.lineLayer)
    pushFrom(this.fallbackContent)

    if (units.length === 0) return

    const totalSlots = units.reduce((sum, u) => sum + u.slots, 0)
    const target = Math.floor(this.state.progress * totalSlots)
    let cumulative = 0
    for (const unit of units) {
      // Unit becomes visible once the target slot has advanced past its start.
      // Atomic units (embeds) flip all-or-nothing at the same threshold, which
      // then drives a CSS opacity transition for the fade-in.
      const visible = cumulative < target
      if (visible) {
        if (!unit.el.classList.contains('pie-visible')) unit.el.classList.add('pie-visible')
      } else {
        if (unit.el.classList.contains('pie-visible')) unit.el.classList.remove('pie-visible')
      }
      cumulative += unit.slots
    }
  }

  private splitTextIntoUnits(
    el: HTMLElement,
    unit: Exclude<RevealUnit, 'line'>,
    links?: InlineLinkConfig[],
  ): void {
    const text = el.textContent ?? ''
    if (!text) return
    el.textContent = ''
    const className = unit === 'char' ? 'pie-char' : 'pie-word'

    // Build non-overlapping segments. Each segment is either plain text or
    // inside a link. Missing links → single plain segment.
    const segments = links && links.length > 0
      ? buildLinkedSegments(text, links)
      : [{ text, href: undefined as string | undefined, alt: undefined as string | undefined }]

    for (const segment of segments) {
      const parent = segment.href ? createInlineAnchor(this.doc, segment.href, segment.alt) : el
      if (parent !== el) el.appendChild(parent)
      const tokens =
        unit === 'char'
          ? [...segment.text]
          : (segment.text.match(/\s+|\S+/g) ?? [])
      for (const token of tokens) {
        if (unit === 'word' && /^\s+$/.test(token)) {
          parent.appendChild(this.doc.createTextNode(token))
          continue
        }
        const span = this.doc.createElement('span')
        span.className = className
        span.textContent = token
        parent.appendChild(span)
      }
    }
  }

  private emitRender(): void {
    this.root.dataset.revealUnit = this.scene.reveal.unit
    this.renderListeners.forEach((cb) => {
      try {
        cb()
      } catch (err) {
        console.error('[pretext-image-engine] onRender listener threw:', err)
      }
    })
  }

  private applyFallback(label: string): void {
    this.state.layoutMode = 'fallback'
    this.state.scale = 1
    this.activeLayout = null
    this.lineElements.clear()
    this.root.dataset.mode = 'fallback'
    this.lineLayer.replaceChildren()
    this.debugLayer.replaceChildren()
    this.stickyInner.replaceChildren()
    this.fallbackContent.replaceChildren()

    const fragment = this.doc.createDocumentFragment()

    this.scene.blocks.forEach((block, blockIndex) => {
      if (isEmbedBlock(block)) {
        // In fallback mode the embed flows in document order — no absolute
        // positioning, no aspect ratio preservation beyond CSS. We give the
        // factory a container and let it populate.
        const container = this.doc.createElement('div')
        container.className = `pie-embed pie-embed-${sanitizeStyleName(block.embedKind)} pie-embed-fallback`
        container.dataset.embedId = block.id ?? `block-${blockIndex}`
        container.dataset.embedKind = block.embedKind
        container.dataset.revealCost = String(
          Math.max(1, Math.round(block.revealCost ?? DEFAULT_EMBED_REVEAL_COST)),
        )
        if (this.options?.renderEmbed) {
          try {
            this.options.renderEmbed(block, container)
          } catch (err) {
            console.error('[pretext-image-engine] renderEmbed threw:', err)
          }
        }
        fragment.append(container)
        return
      }
      fragment.append(buildFallbackBlock(this.doc, block, this.resolveBlockStyle(block), blockIndex))
    })

    this.fallbackContent.append(fragment)
    this.fallbackLabel.textContent = label
    this.fallback.hidden = false
    this.statusBadge.textContent = 'Fallback layout active'

    if (this.scene.reveal.unit !== 'line') {
      const blockCursors = new Map<string, number>()
      this.fallbackContent
        .querySelectorAll<HTMLElement>('.pie-fallback-block')
        .forEach((el) => {
          const blockId = el.dataset.blockId
          const block = blockId
            ? (this.scene.blocks.find((b) => !isEmbedBlock(b) && b.id === blockId) as
                | TextBlockConfig
                | undefined)
            : undefined
          const perLineLinks = block
            ? perLineLinksForElement(el, block, blockCursors)
            : undefined
          this.splitTextIntoUnits(
            el,
            this.scene.reveal.unit as Exclude<RevealUnit, 'line'>,
            perLineLinks,
          )
        })
      this.applyProgressProjection()
    }

    this.emitRender()
  }
}

export const createPretextImageEngine = (
  container: HTMLElement,
  scene: ImageEngineSceneConfig,
  options?: EngineOptions,
): ImageTextEngine => new PretextImageEngine(container, scene, options)
