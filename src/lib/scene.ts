import type {
  ImageEngineSceneConfig,
  RegionConfig,
  SceneAssetConfig,
  SceneMeta,
  StageConfig,
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

export interface PerImageScene {
  meta: SceneMeta
  assets: SceneAssetConfig
  regions: Record<string, RegionConfig>
  blocks: TextBlockConfig[]
  stage?: Pick<StageConfig, 'aspectRatio'>
}

export function composeScene(
  defaults: Partial<ImageEngineSceneConfig>,
  perImage: PerImageScene,
): ImageEngineSceneConfig {
  return {
    ...defaults,
    meta: { ...defaults.meta, ...perImage.meta },
    assets: { ...defaults.assets, ...perImage.assets },
    stage: { ...defaults.stage, ...perImage.stage },
    regions: perImage.regions,
    blocks: perImage.blocks,
  }
}
