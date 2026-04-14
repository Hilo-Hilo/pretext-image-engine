type CSSColorValue = string;
type TextStyleName = 'eyebrow' | 'heading' | 'lede' | 'body' | 'caption' | string;
type SlotOrder = 'left-to-right' | 'right-to-left' | 'center-out';
type ColumnSplitMode = 'off' | 'auto' | 'fixed';
type TextColorMode = 'fixed' | 'auto';
type HighlightMode = 'off' | 'pill' | 'block' | 'auto';
type FallbackMode = 'below' | 'none';
type TextBlockScrollMode = 'static' | 'reveal' | 'sticky-start-reveal';
type V2TextRole = 'eyebrow' | 'headline' | 'lede' | 'body' | 'caption' | 'cta' | 'annotation';
type V2BackdropMode = 'auto' | 'none' | 'shadow' | 'line' | 'panel';
type V2SubjectZoneKind = 'protect' | 'soft-protect';
interface SceneMeta {
    id?: string;
    name: string;
    description?: string;
    alt?: string;
    author?: string;
    tags?: string[];
}
interface SceneAssetConfig {
    baseSrc: string;
    overlaySrc?: string;
    alphaThreshold?: number;
    fit?: 'cover' | 'contain';
}
interface StageConfig {
    aspectRatio?: number;
    minHeight?: number;
    background?: CSSColorValue;
    padding?: number;
    borderRadius?: number;
}
interface LayoutConfig {
    outerPadding?: number;
    horizontalPadding?: number;
    verticalPadding?: number;
    minSlotWidth?: number;
    minScale?: number;
    scaleStep?: number;
    fallbackBelowWidth?: number;
}
interface ResizeConfig {
    preserveFullText?: boolean;
    fallbackMode?: FallbackMode;
    fallbackLabel?: string;
}
interface TextColorConfig {
    mode?: TextColorMode;
    color?: CSSColorValue;
    lightColor?: CSSColorValue;
    darkColor?: CSSColorValue;
    luminanceThreshold?: number;
}
interface HighlightConfig {
    enabled?: boolean;
    mode?: HighlightMode;
    color?: CSSColorValue;
    lightColor?: CSSColorValue;
    darkColor?: CSSColorValue;
    opacity?: number;
    paddingX?: number;
    paddingY?: number;
    radius?: number;
    blur?: number;
}
interface ShadowConfig {
    enabled?: boolean;
    color?: CSSColorValue;
    blur?: number;
    offsetX?: number;
    offsetY?: number;
}
interface SelectionConfig {
    enabled?: boolean;
    color?: CSSColorValue;
    background?: CSSColorValue;
}
interface ColorConfig {
    text?: TextColorConfig;
    highlight?: HighlightConfig;
    shadow?: ShadowConfig;
    selection?: SelectionConfig;
}
interface ColumnSplitConfig {
    mode?: ColumnSplitMode;
    preferredColumns?: number;
    maxColumns?: number;
    minColumnWidth?: number;
    gap?: number;
    applyToStyles?: TextStyleName[];
}
interface InteractionConfig {
    selectable?: boolean;
}
interface TextBlockScrollConfig {
    mode?: TextBlockScrollMode;
    start?: number;
    end?: number;
    stickyTop?: number;
}
interface RegionConfig {
    xStart?: number;
    xEnd?: number;
    yStart?: number;
    yEnd?: number;
    anchorX?: number;
    slotOrder?: SlotOrder;
    minSlotWidth?: number;
    columnSplit?: ColumnSplitConfig;
}
interface BlockStyleConfig {
    fontFamily?: string;
    fontWeight?: number;
    fontSizeRatio?: number;
    minFontSize?: number;
    maxFontSize?: number;
    lineHeight?: number;
    gapAfter?: number;
    allowMultiSlot?: boolean;
    letterSpacing?: number;
    textTransform?: 'none' | 'uppercase';
    highlight?: HighlightConfig;
    columns?: ColumnSplitConfig;
}
interface V2SubjectZoneConfig {
    id?: string;
    kind?: V2SubjectZoneKind;
    x: number;
    y: number;
    width: number;
    height: number;
    padding?: number;
}
interface V2SlotConfig {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    active?: boolean;
    locked?: boolean;
    preferredRoles?: V2TextRole[];
}
interface V2BackdropConfig {
    mode?: V2BackdropMode;
    panelOpacity?: number;
    panelPadding?: number;
    panelRadius?: number;
    blur?: number;
    tint?: CSSColorValue;
}
interface V2TextColorStrategyConfig {
    forceTone?: 'light' | 'dark' | 'auto';
    lightColor?: CSSColorValue;
    darkColor?: CSSColorValue;
    accentColor?: CSSColorValue;
}
interface V2LayoutConfig {
    gridColumns?: number;
    gridRows?: number;
    minCellScore?: number;
    minSlotCells?: number;
    subjectPadding?: number;
    maxSlots?: number;
    mobileSingleSlotBelow?: number;
    preferWiderSlots?: boolean;
}
interface V2DebugConfig {
    showProtection?: boolean;
    showSlotScores?: boolean;
    showActiveSlotsOnly?: boolean;
}
interface V2SceneConfig {
    enabled?: boolean;
    layout?: V2LayoutConfig;
    subjectZones?: V2SubjectZoneConfig[];
    slots?: V2SlotConfig[];
    activeSlotIds?: string[];
    bannedSlotIds?: string[];
    backdrop?: V2BackdropConfig;
    colors?: V2TextColorStrategyConfig;
    debug?: V2DebugConfig;
}
interface V2TextBlockConfig {
    role?: V2TextRole;
    priority?: number;
    pinnedSlotId?: string;
    backdrop?: V2BackdropMode;
    preferredTone?: 'light' | 'dark' | 'auto';
}
interface TextBlockConfig {
    id?: string;
    style: TextStyleName;
    text: string;
    region?: string;
    regionOrder?: SlotOrder;
    allowMultiSlot?: boolean;
    styleOverride?: BlockStyleConfig;
    highlight?: HighlightConfig;
    columns?: ColumnSplitConfig;
    scroll?: TextBlockScrollConfig;
    v2?: V2TextBlockConfig;
}
interface DebugConfig {
    enabled?: boolean;
    showSlots?: boolean;
    showRegions?: boolean;
    showSampling?: boolean;
}
interface ImageEngineSceneConfig {
    meta: SceneMeta;
    assets: SceneAssetConfig;
    stage?: StageConfig;
    layout?: LayoutConfig;
    resize?: ResizeConfig;
    colors?: ColorConfig;
    columnSplit?: ColumnSplitConfig;
    interaction?: InteractionConfig;
    debug?: DebugConfig;
    styles?: Record<string, BlockStyleConfig>;
    regions?: Record<string, RegionConfig>;
    blocks: TextBlockConfig[];
    v2?: V2SceneConfig;
}
interface EngineState {
    layoutMode: 'masked' | 'fallback';
    width: number;
    height: number;
    scale: number;
    progress: number;
}
interface EngineOptions {
    injectStyles?: boolean;
    initialProgress?: number;
}
interface ImageTextEngine {
    readonly ready: Promise<void>;
    readonly state: EngineState;
    update(scene: ImageEngineSceneConfig): Promise<void>;
    render(): void;
    setProgress(progress: number): void;
    destroy(): void;
}

declare class PretextImageEngine implements ImageTextEngine {
    private readonly container;
    private readonly doc;
    private readonly options;
    private readonly root;
    private readonly stageShell;
    private readonly stickyLayer;
    private readonly stickyInner;
    private readonly stage;
    private readonly baseImage;
    private readonly overlayImage;
    private readonly lineLayer;
    private readonly panelLayer;
    private readonly debugLayer;
    private readonly status;
    private readonly statusBadge;
    private readonly fallback;
    private readonly fallbackLabel;
    private readonly fallbackContent;
    private readonly baseCanvas;
    private readonly overlayCanvas;
    private readonly baseContext;
    private readonly overlayContext;
    private resizeObserver;
    private scene;
    private imageSignature;
    private pendingFrame;
    private activeLayout;
    private readonly lineElements;
    readonly ready: Promise<void>;
    state: EngineState;
    constructor(container: HTMLElement, scene: ImageEngineSceneConfig, options?: EngineOptions);
    update(scene: ImageEngineSceneConfig): Promise<void>;
    setProgress(progress: number): void;
    render(): void;
    destroy(): void;
    private attachResizeObserver;
    private loadAssets;
    private syncStageAppearance;
    private syncCanvasBuffers;
    private applyProtectionMask;
    private sampleLuminance;
    private resolveLineAppearance;
    private getTransparentSlots;
    private resolveBlockStyle;
    private resolveColumns;
    private orderSlots;
    private measureMaskedLayout;
    private applyMasked;
    private applyProgressProjection;
    private applyFallback;
}
declare const createPretextImageEngine: (container: HTMLElement, scene: ImageEngineSceneConfig, options?: EngineOptions) => ImageTextEngine;

export { type BlockStyleConfig, type CSSColorValue, type ColorConfig, type ColumnSplitConfig, type DebugConfig, type EngineOptions, type EngineState, type HighlightConfig, type ImageEngineSceneConfig, type ImageTextEngine, type InteractionConfig, type LayoutConfig, PretextImageEngine, type RegionConfig, type ResizeConfig, type SceneAssetConfig, type SceneMeta, type StageConfig, type TextBlockConfig, type TextBlockScrollConfig, type TextBlockScrollMode, type TextColorConfig, type TextStyleName, createPretextImageEngine };
