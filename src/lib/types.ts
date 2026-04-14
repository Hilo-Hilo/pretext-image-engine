export type CSSColorValue = string
export type TextStyleName = 'eyebrow' | 'heading' | 'lede' | 'body' | 'caption' | string
export type SlotOrder = 'left-to-right' | 'right-to-left' | 'center-out'
export type ColumnSplitMode = 'off' | 'auto' | 'fixed'
export type TextColorMode = 'fixed' | 'auto'
export type HighlightMode = 'off' | 'pill' | 'block' | 'auto'
export type FallbackMode = 'below' | 'none'
export type TextBlockScrollMode = 'static' | 'reveal' | 'sticky-start-reveal'
export type V2TextRole = 'eyebrow' | 'headline' | 'lede' | 'body' | 'caption' | 'cta' | 'annotation'
export type V2BackdropMode = 'auto' | 'none' | 'shadow' | 'line' | 'panel'
export type V2SubjectZoneKind = 'protect' | 'soft-protect'

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
  overlaySrc?: string
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

export interface V2SubjectZoneConfig {
  id?: string
  kind?: V2SubjectZoneKind
  x: number
  y: number
  width: number
  height: number
  padding?: number
}

export interface V2SlotConfig {
  id: string
  x: number
  y: number
  width: number
  height: number
  active?: boolean
  locked?: boolean
  preferredRoles?: V2TextRole[]
}

export interface V2BackdropConfig {
  mode?: V2BackdropMode
  panelOpacity?: number
  panelPadding?: number
  panelRadius?: number
  blur?: number
  tint?: CSSColorValue
}

export interface V2TextColorStrategyConfig {
  forceTone?: 'light' | 'dark' | 'auto'
  lightColor?: CSSColorValue
  darkColor?: CSSColorValue
  accentColor?: CSSColorValue
}

export interface V2LayoutConfig {
  gridColumns?: number
  gridRows?: number
  minCellScore?: number
  minSlotCells?: number
  subjectPadding?: number
  maxSlots?: number
  mobileSingleSlotBelow?: number
  preferWiderSlots?: boolean
}

export interface V2DebugConfig {
  showProtection?: boolean
  showSlotScores?: boolean
  showActiveSlotsOnly?: boolean
}

export interface V2SceneConfig {
  enabled?: boolean
  layout?: V2LayoutConfig
  subjectZones?: V2SubjectZoneConfig[]
  slots?: V2SlotConfig[]
  activeSlotIds?: string[]
  bannedSlotIds?: string[]
  backdrop?: V2BackdropConfig
  colors?: V2TextColorStrategyConfig
  debug?: V2DebugConfig
}

export interface V2TextBlockConfig {
  role?: V2TextRole
  priority?: number
  pinnedSlotId?: string
  backdrop?: V2BackdropMode
  preferredTone?: 'light' | 'dark' | 'auto'
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
  v2?: V2TextBlockConfig
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
  v2?: V2SceneConfig
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
