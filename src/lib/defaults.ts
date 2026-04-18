import type {
  BlockStyleConfig,
  ColorConfig,
  ColumnSplitConfig,
  HighlightConfig,
  ImageEngineSceneConfig,
  InteractionConfig,
  LayoutConfig,
  ResizeConfig,
  RevealConfig,
  ShadowConfig,
  StageConfig,
  TextBlockConfig,
} from './types'

export const DEFAULT_STAGE: Required<StageConfig> = {
  aspectRatio: 4 / 3,
  minHeight: 360,
  background: '#0f1116',
  padding: 14,
  borderRadius: 26,
}

export const DEFAULT_LAYOUT: Required<LayoutConfig> = {
  outerPadding: 22,
  horizontalPadding: 12,
  verticalPadding: 4,
  minSlotWidth: 96,
  minScale: 0.72,
  scaleStep: 0.08,
  fallbackBelowWidth: 560,
}

export const DEFAULT_RESIZE: Required<ResizeConfig> = {
  preserveFullText: true,
  fallbackMode: 'below',
  fallbackLabel: 'Full text moved below the image at this size.',
}

export const DEFAULT_HIGHLIGHT: Required<HighlightConfig> = {
  enabled: false,
  mode: 'off',
  color: 'rgba(8, 10, 15, 0.55)',
  lightColor: 'rgba(248, 241, 230, 0.92)',
  darkColor: 'rgba(8, 10, 15, 0.58)',
  opacity: 0.88,
  paddingX: 7,
  paddingY: 3,
  radius: 10,
  blur: 22,
}

export const DEFAULT_SHADOW: Required<ShadowConfig> = {
  enabled: true,
  color: 'rgba(8, 10, 14, 0.4)',
  blur: 16,
  offsetX: 0,
  offsetY: 6,
}

export const DEFAULT_COLORS: Required<ColorConfig> = {
  text: {
    mode: 'auto',
    color: '#f8f1e7',
    lightColor: '#f8f1e7',
    darkColor: '#101319',
    luminanceThreshold: 0.64,
  },
  highlight: DEFAULT_HIGHLIGHT,
  shadow: DEFAULT_SHADOW,
  selection: {
    enabled: true,
    color: '#0d1117',
    background: 'rgba(245, 221, 171, 0.7)',
  },
}

export const DEFAULT_COLUMN_SPLIT: Required<ColumnSplitConfig> = {
  mode: 'off',
  preferredColumns: 2,
  maxColumns: 3,
  minColumnWidth: 180,
  gap: 24,
  applyToStyles: ['body'],
}

export const DEFAULT_INTERACTION: Required<InteractionConfig> = {
  selectable: false,
}

export const DEFAULT_REVEAL: Required<RevealConfig> = {
  unit: 'line',
  monotonic: false,
}

export const DEFAULT_BLOCK_STYLES: Record<string, Required<BlockStyleConfig>> = {
  eyebrow: {
    fontFamily: '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace',
    fontWeight: 700,
    fontSizeRatio: 0.014,
    minFontSize: 11,
    maxFontSize: 15,
    lineHeight: 1.28,
    gapAfter: 10,
    allowMultiSlot: false,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT,
  },
  heading: {
    fontFamily: '"Inter Tight", "Inter", system-ui, sans-serif',
    fontWeight: 300,
    fontSizeRatio: 0.042,
    minFontSize: 26,
    maxFontSize: 54,
    lineHeight: 1.02,
    gapAfter: 14,
    allowMultiSlot: false,
    letterSpacing: -0.6,
    textTransform: 'none',
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT,
  },
  lede: {
    fontFamily: '"Inter Tight", "Inter", system-ui, sans-serif',
    fontWeight: 300,
    fontSizeRatio: 0.022,
    minFontSize: 17,
    maxFontSize: 26,
    lineHeight: 1.34,
    gapAfter: 12,
    allowMultiSlot: false,
    letterSpacing: -0.1,
    textTransform: 'none',
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT,
  },
  body: {
    fontFamily: '"Inter Tight", "Inter", system-ui, sans-serif',
    fontWeight: 300,
    fontSizeRatio: 0.018,
    minFontSize: 15,
    maxFontSize: 20,
    lineHeight: 1.5,
    gapAfter: 12,
    allowMultiSlot: true,
    letterSpacing: 0,
    textTransform: 'none',
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT,
  },
  caption: {
    fontFamily: '"Inter Tight", "Inter", system-ui, sans-serif',
    fontWeight: 300,
    fontSizeRatio: 0.016,
    minFontSize: 13,
    maxFontSize: 17,
    lineHeight: 1.36,
    gapAfter: 10,
    allowMultiSlot: false,
    letterSpacing: 0.02,
    textTransform: 'none',
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT,
  },
}

export const DEFAULT_SCENE: ImageEngineSceneConfig = {
  meta: {
    name: 'Untitled scene',
    alt: '',
  },
  assets: {
    baseSrc: '',
    overlaySrc: '',
    alphaThreshold: 20,
    fit: 'cover',
  },
  stage: DEFAULT_STAGE,
  layout: DEFAULT_LAYOUT,
  resize: DEFAULT_RESIZE,
  colors: DEFAULT_COLORS,
  columnSplit: DEFAULT_COLUMN_SPLIT,
  interaction: DEFAULT_INTERACTION,
  reveal: DEFAULT_REVEAL,
  debug: {
    enabled: false,
    showSlots: false,
    showRegions: false,
    showSampling: false,
  },
  styles: DEFAULT_BLOCK_STYLES,
  regions: {},
  blocks: [] as TextBlockConfig[],
}
