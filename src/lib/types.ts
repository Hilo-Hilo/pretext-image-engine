export type CSSColorValue = string
export type TextStyleName = 'eyebrow' | 'heading' | 'lede' | 'body' | 'caption' | string
export type SlotOrder = 'left-to-right' | 'right-to-left' | 'center-out'
export type ColumnSplitMode = 'off' | 'auto' | 'fixed'
export type TextColorMode = 'fixed' | 'auto'
export type HighlightMode = 'off' | 'pill' | 'block' | 'auto'
export type FallbackMode = 'below' | 'none'
export type TextBlockScrollMode = 'static' | 'reveal' | 'sticky-start-reveal'

export interface SceneMeta {
  id?: string
  name: string
  description?: string
  alt?: string
  author?: string
  tags?: string[]
}

export interface SceneAssetConfig {
  baseSrc: string
  overlaySrc: string
  alphaThreshold?: number
  fit?: 'cover' | 'contain'
}

export interface StageConfig {
  aspectRatio?: number
  minHeight?: number
  background?: CSSColorValue
  padding?: number
  borderRadius?: number
}

export interface LayoutConfig {
  outerPadding?: number
  horizontalPadding?: number
  verticalPadding?: number
  minSlotWidth?: number
  minScale?: number
  scaleStep?: number
  fallbackBelowWidth?: number
}

export interface ResizeConfig {
  preserveFullText?: boolean
  fallbackMode?: FallbackMode
  fallbackLabel?: string
}

export interface TextColorConfig {
  mode?: TextColorMode
  color?: CSSColorValue
  lightColor?: CSSColorValue
  darkColor?: CSSColorValue
  luminanceThreshold?: number
}

export interface HighlightConfig {
  enabled?: boolean
  mode?: HighlightMode
  color?: CSSColorValue
  lightColor?: CSSColorValue
  darkColor?: CSSColorValue
  opacity?: number
  paddingX?: number
  paddingY?: number
  radius?: number
  blur?: number
}

export interface ShadowConfig {
  enabled?: boolean
  color?: CSSColorValue
  blur?: number
  offsetX?: number
  offsetY?: number
}

export interface SelectionConfig {
  enabled?: boolean
  color?: CSSColorValue
  background?: CSSColorValue
}

export interface ColorConfig {
  text?: TextColorConfig
  highlight?: HighlightConfig
  shadow?: ShadowConfig
  selection?: SelectionConfig
}

export interface ColumnSplitConfig {
  mode?: ColumnSplitMode
  preferredColumns?: number
  maxColumns?: number
  minColumnWidth?: number
  gap?: number
  applyToStyles?: TextStyleName[]
}

export interface InteractionConfig {
  selectable?: boolean
}

export interface TextBlockScrollConfig {
  mode?: TextBlockScrollMode
  start?: number
  end?: number
  stickyTop?: number
}

export interface RegionConfig {
  xStart?: number
  xEnd?: number
  yStart?: number
  yEnd?: number
  anchorX?: number
  slotOrder?: SlotOrder
  minSlotWidth?: number
  columnSplit?: ColumnSplitConfig
}

export interface BlockStyleConfig {
  fontFamily?: string
  fontWeight?: number
  fontSizeRatio?: number
  minFontSize?: number
  maxFontSize?: number
  lineHeight?: number
  gapAfter?: number
  allowMultiSlot?: boolean
  letterSpacing?: number
  textTransform?: 'none' | 'uppercase'
  highlight?: HighlightConfig
  columns?: ColumnSplitConfig
}

export interface TextBlockConfig {
  id?: string
  style: TextStyleName
  text: string
  region?: string
  regionOrder?: SlotOrder
  allowMultiSlot?: boolean
  styleOverride?: BlockStyleConfig
  highlight?: HighlightConfig
  columns?: ColumnSplitConfig
  scroll?: TextBlockScrollConfig
}

export interface DebugConfig {
  enabled?: boolean
  showSlots?: boolean
  showRegions?: boolean
  showSampling?: boolean
}

export interface ImageEngineSceneConfig {
  meta: SceneMeta
  assets: SceneAssetConfig
  stage?: StageConfig
  layout?: LayoutConfig
  resize?: ResizeConfig
  colors?: ColorConfig
  columnSplit?: ColumnSplitConfig
  interaction?: InteractionConfig
  debug?: DebugConfig
  styles?: Record<string, BlockStyleConfig>
  regions?: Record<string, RegionConfig>
  blocks: TextBlockConfig[]
}

export interface LineAppearance {
  textColor: CSSColorValue
  backgroundColor: CSSColorValue | null
  shadowColor: CSSColorValue
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  paddingX: number
  paddingY: number
  radius: number
}

export interface EngineState {
  layoutMode: 'masked' | 'fallback'
  width: number
  height: number
  scale: number
  progress: number
}

export interface EngineOptions {
  injectStyles?: boolean
  initialProgress?: number
}

export interface ImageTextEngine {
  readonly ready: Promise<void>
  readonly state: EngineState
  update(scene: ImageEngineSceneConfig): Promise<void>
  render(): void
  setProgress(progress: number): void
  destroy(): void
}
