type CSSColorValue = string;
type TextStyleName = 'eyebrow' | 'heading' | 'lede' | 'body' | 'caption' | string;
type SlotOrder = 'left-to-right' | 'right-to-left' | 'center-out';
type ColumnSplitMode = 'off' | 'auto' | 'fixed';
type TextColorMode = 'fixed' | 'auto';
type HighlightMode = 'off' | 'pill' | 'block' | 'auto';
type FallbackMode = 'below' | 'none';
type TextBlockScrollMode = 'static' | 'reveal' | 'sticky-start-reveal';
type RevealUnit = 'line' | 'word' | 'char';
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
interface RevealConfig {
    unit?: RevealUnit;
    monotonic?: boolean;
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
    /**
     * CSS font-style. Use `'italic'` for lede / caption / display text where
     * editorial italic is semantically appropriate. Defaults to `'normal'`.
     */
    fontStyle?: 'normal' | 'italic';
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
    /** Discriminator. Defaults to `'text'` when absent, for backward compatibility. */
    kind?: 'text';
    id?: string;
    style: TextStyleName;
    text?: string;
    lines?: string[];
    marker?: string;
    itemGap?: number;
    region?: string;
    regionOrder?: SlotOrder;
    allowMultiSlot?: boolean;
    styleOverride?: BlockStyleConfig;
    highlight?: HighlightConfig;
    columns?: ColumnSplitConfig;
    scroll?: TextBlockScrollConfig;
    v2?: V2TextBlockConfig;
}
/**
 * Non-text block. Placed inline in the reveal sequence alongside text: when
 * scroll reveal reaches the embed's position, it fades in atomically (opacity
 * 0→1 at the threshold), and text blocks that come after it reveal normally
 * once the embed is past.
 *
 * The engine reserves `width × height` pixels in the target region and calls
 * the `renderEmbed` option (supplied via `EngineOptions`) to populate the
 * container with whatever DOM the consumer wants (link cards, PDFs, iframes,
 * custom widgets). Factories live outside the engine so the engine stays free
 * of domain-specific rendering code.
 */
interface EmbedBlockConfig {
    /** Discriminator. */
    kind: 'embed';
    /** Stable id; useful for debug selectors and consumer-side dispatch. */
    id?: string;
    /** Registered factory name — `'link-card' | 'pdf' | 'iframe' | ...`. */
    embedKind: string;
    /** Named region to place this embed in; same semantics as text blocks. */
    region?: string;
    /** Ordering hint within the region (shared with text-block semantics). */
    regionOrder?: SlotOrder;
    /** Reserved width in pixels before `scale` is applied. */
    width: number;
    /** Reserved height in pixels before `scale` is applied. */
    height: number;
    /** Vertical gap below the embed, in px. Defaults to 14. */
    gapAfter?: number;
    /**
     * Virtual "char cost" of this embed in the reveal sequence. Defaults to 20.
     * Higher values give the embed more scroll runway before the next block
     * reveals; lower values make the transition snappier.
     */
    revealCost?: number;
    src?: string;
    href?: string;
    title?: string;
    description?: string;
    alt?: string;
    sandbox?: string;
    /** Escape hatch for custom factories that need extra data. */
    props?: Record<string, unknown>;
}
/** Discriminated union of everything that can go in `scene.blocks`. */
type BlockConfig = TextBlockConfig | EmbedBlockConfig;
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
    reveal?: RevealConfig;
    debug?: DebugConfig;
    styles?: Record<string, BlockStyleConfig>;
    regions?: Record<string, RegionConfig>;
    blocks: BlockConfig[];
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
    /**
     * Called by the engine when it lays out an embed block. The engine supplies
     * an empty container (already positioned absolutely at the embed's measured
     * rect); the callback populates it with whatever DOM the embed kind needs.
     *
     * If absent, embed blocks are skipped silently (text-only fallback).
     */
    renderEmbed?: (config: EmbedBlockConfig, container: HTMLElement) => void;
}
interface ScrollSourceOptions {
    easing?: (t: number) => number;
    throttle?: 'raf' | 'none';
}
interface ImageTextEngine {
    readonly ready: Promise<void>;
    readonly state: EngineState;
    update(scene: ImageEngineSceneConfig): Promise<void>;
    render(): void;
    setProgress(progress: number): void;
    onRender(listener: () => void): () => void;
    attachScrollSource(target?: Window | HTMLElement, options?: ScrollSourceOptions): () => void;
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
    private resizeDebounce;
    private activeLayout;
    private readonly lineElements;
    private readonly renderListeners;
    private peakProgress;
    readonly ready: Promise<void>;
    state: EngineState;
    constructor(container: HTMLElement, scene: ImageEngineSceneConfig, options?: EngineOptions);
    update(scene: ImageEngineSceneConfig): Promise<void>;
    setProgress(progress: number): void;
    onRender(listener: () => void): () => void;
    attachScrollSource(target?: Window | HTMLElement, options?: ScrollSourceOptions): () => void;
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
    private maybeAccumulatePanel;
    private applyMasked;
    private applyProgressProjection;
    private applyUnitLevelProjection;
    private splitTextIntoUnits;
    private emitRender;
    private applyFallback;
}
declare const createPretextImageEngine: (container: HTMLElement, scene: ImageEngineSceneConfig, options?: EngineOptions) => ImageTextEngine;

interface CreateSceneInput {
    baseSrc: string;
    overlaySrc?: string;
    blocks: TextBlockConfig[];
    alt?: string;
    name?: string;
    aspectRatio?: number;
}
declare function createScene(input: CreateSceneInput, overrides?: Partial<ImageEngineSceneConfig>): ImageEngineSceneConfig;
interface PerImageScene extends Partial<Omit<ImageEngineSceneConfig, 'meta' | 'assets' | 'regions' | 'blocks'>> {
    meta: SceneMeta;
    assets: SceneAssetConfig;
    regions: Record<string, RegionConfig>;
    blocks: TextBlockConfig[];
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
declare function composeScene(defaults: Partial<ImageEngineSceneConfig>, perImage: PerImageScene): ImageEngineSceneConfig;

export { type BlockConfig, type BlockStyleConfig, type CSSColorValue, type ColorConfig, type ColumnSplitConfig, type CreateSceneInput, type DebugConfig, type EmbedBlockConfig, type EngineOptions, type EngineState, type HighlightConfig, type ImageEngineSceneConfig, type ImageTextEngine, type InteractionConfig, type LayoutConfig, type PerImageScene, PretextImageEngine, type RegionConfig, type ResizeConfig, type RevealConfig, type RevealUnit, type SceneAssetConfig, type SceneMeta, type ScrollSourceOptions, type StageConfig, type TextBlockConfig, type TextBlockScrollConfig, type TextBlockScrollMode, type TextColorConfig, type TextStyleName, composeScene, createPretextImageEngine, createScene };
