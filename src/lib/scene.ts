import type {
  ImageEngineSceneConfig,
  RegionConfig,
  SceneAssetConfig,
  SceneMeta,
  TextBlockConfig,
} from './types'

export interface CreateSceneInput {
  baseSrc: string
  overlaySrc?: string
  blocks: TextBlockConfig[]
  alt?: string
  name?: string
  aspectRatio?: number
}

export function createScene(
  input: CreateSceneInput,
  overrides: Partial<ImageEngineSceneConfig> = {},
): ImageEngineSceneConfig {
  const base: ImageEngineSceneConfig = {
    meta: {
      name: input.name ?? 'Scene',
      alt: input.alt,
    },
    assets: {
      baseSrc: input.baseSrc,
      overlaySrc: input.overlaySrc,
      fit: 'contain',
      alphaThreshold: 20,
    },
    stage: {
      aspectRatio: input.aspectRatio ?? 3 / 2,
      minHeight: 0,
      background: 'transparent',
      padding: 0,
      borderRadius: 0,
    },
    resize: {
      preserveFullText: true,
      fallbackMode: 'below',
      fallbackLabel: '',
      fallbackOnOverflow: true,
    },
    interaction: {
      selectable: true,
    },
    reveal: {
      unit: 'char',
      monotonic: true,
    },
    blocks: input.blocks,
  }

  return {
    ...base,
    ...overrides,
    meta: { ...base.meta, ...overrides.meta },
    assets: { ...base.assets, ...overrides.assets },
    stage: { ...base.stage, ...overrides.stage },
    resize: { ...base.resize, ...overrides.resize },
    interaction: { ...base.interaction, ...overrides.interaction },
    reveal: { ...base.reveal, ...overrides.reveal },
  }
}

export interface PerImageScene
  extends Partial<Omit<ImageEngineSceneConfig, 'meta' | 'assets' | 'regions' | 'blocks'>> {
  meta: SceneMeta
  assets: SceneAssetConfig
  regions: Record<string, RegionConfig>
  blocks: TextBlockConfig[]
}

/**
 * Deep merge of scene-level fields. The previous version only folded
 * meta/assets/stage/regions/blocks and silently dropped every other
 * top-level override (styles, colors, layout, resize, interaction,
 * reveal, columnSplit, debug, v2). Scene JSONs relying on those fields
 * (per-scene font sizes, text color, highlight palette) were having
 * their overrides quietly discarded.
 *
 * Now: for each section the engine cares about, we shallow-merge
 * per-image over defaults. Nested objects (like `colors.text`) are
 * merged one level deep too.
 */
export function composeScene(
  defaults: Partial<ImageEngineSceneConfig>,
  perImage: PerImageScene,
): ImageEngineSceneConfig {
  return {
    ...defaults,
    ...perImage,
    meta: { ...defaults.meta, ...perImage.meta },
    assets: { ...defaults.assets, ...perImage.assets },
    stage: { ...defaults.stage, ...perImage.stage },
    layout: { ...defaults.layout, ...perImage.layout },
    resize: { ...defaults.resize, ...perImage.resize },
    interaction: { ...defaults.interaction, ...perImage.interaction },
    reveal: { ...defaults.reveal, ...perImage.reveal },
    columnSplit: { ...defaults.columnSplit, ...perImage.columnSplit },
    debug: { ...defaults.debug, ...perImage.debug },
    colors: perImage.colors
      ? {
          ...defaults.colors,
          ...perImage.colors,
          text: { ...defaults.colors?.text, ...perImage.colors?.text },
          highlight: {
            ...defaults.colors?.highlight,
            ...perImage.colors?.highlight,
          },
          shadow: {
            ...defaults.colors?.shadow,
            ...perImage.colors?.shadow,
          },
          selection: {
            ...defaults.colors?.selection,
            ...perImage.colors?.selection,
          },
        }
      : defaults.colors,
    styles: perImage.styles
      ? mergeStyles(defaults.styles, perImage.styles)
      : defaults.styles,
    regions: perImage.regions,
    blocks: perImage.blocks,
  } as ImageEngineSceneConfig
}

function mergeStyles(
  defaultStyles: ImageEngineSceneConfig['styles'],
  perImage: ImageEngineSceneConfig['styles'],
): ImageEngineSceneConfig['styles'] {
  if (!defaultStyles) return perImage
  if (!perImage) return defaultStyles
  const merged: Record<string, unknown> = { ...defaultStyles }
  for (const [name, override] of Object.entries(perImage)) {
    merged[name] = { ...(merged[name] as Record<string, unknown>), ...override }
  }
  return merged as ImageEngineSceneConfig['styles']
}
