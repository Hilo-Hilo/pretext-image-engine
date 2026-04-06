"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/index.ts
var index_exports = {};
__export(index_exports, {
  PretextImageEngine: () => PretextImageEngine,
  createPretextImageEngine: () => createPretextImageEngine
});
module.exports = __toCommonJS(index_exports);

// src/lib/engine.ts
var import_pretext = require("@chenglou/pretext");

// src/lib/defaults.ts
var DEFAULT_STAGE = {
  aspectRatio: 4 / 3,
  minHeight: 360,
  background: "#0f1116",
  padding: 14,
  borderRadius: 26
};
var DEFAULT_LAYOUT = {
  outerPadding: 22,
  horizontalPadding: 12,
  verticalPadding: 4,
  minSlotWidth: 96,
  minScale: 0.72,
  scaleStep: 0.08,
  fallbackBelowWidth: 560
};
var DEFAULT_RESIZE = {
  preserveFullText: true,
  fallbackMode: "below",
  fallbackLabel: "Full text moved below the image at this size."
};
var DEFAULT_HIGHLIGHT = {
  enabled: false,
  mode: "off",
  color: "rgba(8, 10, 15, 0.55)",
  lightColor: "rgba(248, 241, 230, 0.92)",
  darkColor: "rgba(8, 10, 15, 0.58)",
  opacity: 0.88,
  paddingX: 7,
  paddingY: 3,
  radius: 10,
  blur: 22
};
var DEFAULT_SHADOW = {
  enabled: true,
  color: "rgba(8, 10, 14, 0.4)",
  blur: 16,
  offsetX: 0,
  offsetY: 6
};
var DEFAULT_COLORS = {
  text: {
    mode: "auto",
    color: "#f8f1e7",
    lightColor: "#f8f1e7",
    darkColor: "#101319",
    luminanceThreshold: 0.64
  },
  highlight: DEFAULT_HIGHLIGHT,
  shadow: DEFAULT_SHADOW,
  selection: {
    enabled: true,
    color: "#0d1117",
    background: "rgba(245, 221, 171, 0.7)"
  }
};
var DEFAULT_COLUMN_SPLIT = {
  mode: "off",
  preferredColumns: 2,
  maxColumns: 3,
  minColumnWidth: 180,
  gap: 24,
  applyToStyles: ["body"]
};
var DEFAULT_INTERACTION = {
  selectable: false
};
var DEFAULT_BLOCK_STYLES = {
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
    textTransform: "uppercase",
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT
  },
  heading: {
    fontFamily: '"Fraunces", "Iowan Old Style", Georgia, serif',
    fontWeight: 600,
    fontSizeRatio: 0.04,
    minFontSize: 24,
    maxFontSize: 44,
    lineHeight: 1.06,
    gapAfter: 14,
    allowMultiSlot: false,
    letterSpacing: -0.45,
    textTransform: "none",
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT
  },
  lede: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontWeight: 600,
    fontSizeRatio: 0.022,
    minFontSize: 16,
    maxFontSize: 24,
    lineHeight: 1.34,
    gapAfter: 12,
    allowMultiSlot: false,
    letterSpacing: 0,
    textTransform: "none",
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT
  },
  body: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontWeight: 400,
    fontSizeRatio: 0.018,
    minFontSize: 15,
    maxFontSize: 20,
    lineHeight: 1.48,
    gapAfter: 12,
    allowMultiSlot: true,
    letterSpacing: 0,
    textTransform: "none",
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT
  },
  caption: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontWeight: 400,
    fontSizeRatio: 0.016,
    minFontSize: 13,
    maxFontSize: 17,
    lineHeight: 1.36,
    gapAfter: 10,
    allowMultiSlot: false,
    letterSpacing: 0,
    textTransform: "none",
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT
  }
};
var DEFAULT_SCENE = {
  meta: {
    name: "Untitled scene",
    alt: ""
  },
  assets: {
    baseSrc: "",
    overlaySrc: "",
    alphaThreshold: 20,
    fit: "cover"
  },
  stage: DEFAULT_STAGE,
  layout: DEFAULT_LAYOUT,
  resize: DEFAULT_RESIZE,
  colors: DEFAULT_COLORS,
  columnSplit: DEFAULT_COLUMN_SPLIT,
  interaction: DEFAULT_INTERACTION,
  debug: {
    enabled: false,
    showSlots: false,
    showRegions: false,
    showSampling: false
  },
  styles: DEFAULT_BLOCK_STYLES,
  regions: {},
  blocks: []
};

// src/lib/styles.ts
var ENGINE_STYLE_ID = "pretext-image-engine-styles";
var ENGINE_CSS = `
.pie-root {
  --pie-selection-bg: rgba(245, 221, 171, 0.72);
  --pie-selection-color: #0d1117;
  color: #11151a;
}

.pie-root,
.pie-root * {
  box-sizing: border-box;
}

.pie-root[data-selection-enabled="true"] .pie-line::selection,
.pie-root[data-selection-enabled="true"] .pie-fallback *::selection {
  background: var(--pie-selection-bg);
  color: var(--pie-selection-color);
}

.pie-stage-shell {
  position: relative;
  display: grid;
  gap: 1rem;
}

.pie-sticky-layer {
  position: sticky;
  top: 0;
  z-index: 8;
  height: 0;
  pointer-events: none;
}

.pie-sticky-inner {
  position: relative;
  height: 0;
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
`;

// src/lib/engine.ts
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var numberOr = (value, fallback) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
var textOr = (value, fallback) => typeof value === "string" && value.trim() ? value : fallback;
var objectOrEmpty = (value) => value && typeof value === "object" ? value : {};
var clampProgress = (value) => clamp(numberOr(value, 0), 0, 1);
var mergeHighlight = (base, patch) => ({
  ...base,
  ...objectOrEmpty(patch)
});
var mergeShadow = (base, patch) => ({
  ...base,
  ...objectOrEmpty(patch)
});
var mergeSelection = (base, patch) => ({
  ...base,
  ...objectOrEmpty(patch)
});
var mergeColumns = (base, patch) => ({
  ...base,
  ...objectOrEmpty(patch),
  applyToStyles: patch?.applyToStyles ?? base.applyToStyles
});
var mergeStyle = (base, patch) => ({
  ...base,
  ...objectOrEmpty(patch),
  highlight: mergeHighlight(base.highlight, patch?.highlight),
  columns: mergeColumns(base.columns, patch?.columns)
});
var resolveStyles = (styleOverrides, blocks) => {
  const styles = {};
  const keys = /* @__PURE__ */ new Set([...Object.keys(DEFAULT_BLOCK_STYLES), ...Object.keys(styleOverrides ?? {})]);
  blocks.forEach((block) => keys.add(block.style));
  keys.forEach((key) => {
    const base = DEFAULT_BLOCK_STYLES[key] ?? DEFAULT_BLOCK_STYLES.body;
    styles[key] = mergeStyle(base, styleOverrides?.[key]);
  });
  return styles;
};
var resolveRegions = (regions) => {
  const resolved = {};
  Object.entries(regions ?? {}).forEach(([key, region]) => {
    resolved[key] = {
      xStart: clamp(numberOr(region.xStart, 0), 0, 1),
      xEnd: clamp(numberOr(region.xEnd, 1), 0, 1),
      yStart: clamp(numberOr(region.yStart, 0), 0, 1),
      yEnd: clamp(numberOr(region.yEnd, 1), 0, 1),
      anchorX: clamp(numberOr(region.anchorX, 0.5), 0, 1),
      slotOrder: region.slotOrder ?? "left-to-right",
      minSlotWidth: Math.max(24, numberOr(region.minSlotWidth, DEFAULT_LAYOUT.minSlotWidth)),
      columnSplit: mergeColumns(DEFAULT_COLUMN_SPLIT, region.columnSplit)
    };
  });
  return resolved;
};
var resolveStageConfig = (stage) => {
  const aspectRatio = numberOr(stage?.aspectRatio, DEFAULT_STAGE.aspectRatio);
  return {
    aspectRatio: aspectRatio > 0 ? aspectRatio : DEFAULT_STAGE.aspectRatio,
    minHeight: Math.max(0, numberOr(stage?.minHeight, DEFAULT_STAGE.minHeight)),
    background: textOr(stage?.background, DEFAULT_STAGE.background),
    padding: Math.max(0, numberOr(stage?.padding, DEFAULT_STAGE.padding)),
    borderRadius: Math.max(0, numberOr(stage?.borderRadius, DEFAULT_STAGE.borderRadius))
  };
};
var resolveLayoutConfig = (layout) => {
  const minScale = clamp(numberOr(layout?.minScale, DEFAULT_LAYOUT.minScale), 0.1, 1);
  return {
    outerPadding: Math.max(0, numberOr(layout?.outerPadding, DEFAULT_LAYOUT.outerPadding)),
    horizontalPadding: Math.max(0, numberOr(layout?.horizontalPadding, DEFAULT_LAYOUT.horizontalPadding)),
    verticalPadding: Math.max(0, numberOr(layout?.verticalPadding, DEFAULT_LAYOUT.verticalPadding)),
    minSlotWidth: Math.max(24, numberOr(layout?.minSlotWidth, DEFAULT_LAYOUT.minSlotWidth)),
    minScale,
    scaleStep: clamp(numberOr(layout?.scaleStep, DEFAULT_LAYOUT.scaleStep), 0.01, 1),
    fallbackBelowWidth: Math.max(0, numberOr(layout?.fallbackBelowWidth, DEFAULT_LAYOUT.fallbackBelowWidth))
  };
};
var getFontMetrics = (style, width, scale) => {
  const fontSize = clamp(
    width * style.fontSizeRatio * scale,
    style.minFontSize * scale,
    style.maxFontSize * scale
  );
  const lineHeightPx = Math.max(14, Math.round(fontSize * style.lineHeight));
  return {
    fontSize,
    lineHeightPx,
    font: `${style.fontWeight} ${fontSize}px ${style.fontFamily}`
  };
};
var resolveScrollConfig = (scroll) => {
  const mode = scroll?.mode ?? "static";
  const start = clampProgress(numberOr(scroll?.start, 0));
  const end = clampProgress(numberOr(scroll?.end, 1));
  return {
    mode,
    start,
    end: end <= start ? start : end,
    stickyTop: Math.max(0, numberOr(scroll?.stickyTop, 24))
  };
};
var resolveOptions = (options) => ({
  injectStyles: options?.injectStyles ?? true,
  initialProgress: clampProgress(numberOr(options?.initialProgress, 0))
});
var resolveScene = (scene) => {
  const mergedColors = {
    text: { ...DEFAULT_COLORS.text, ...objectOrEmpty(scene.colors?.text) },
    highlight: mergeHighlight(DEFAULT_HIGHLIGHT, scene.colors?.highlight),
    shadow: mergeShadow(DEFAULT_SHADOW, scene.colors?.shadow),
    selection: mergeSelection(
      DEFAULT_COLORS.selection,
      scene.colors?.selection
    )
  };
  const resolvedStage = resolveStageConfig(scene.stage);
  const resolvedLayout = resolveLayoutConfig(scene.layout);
  const resolvedResize = { ...DEFAULT_RESIZE, ...objectOrEmpty(scene.resize) };
  const resolvedColumnSplit = mergeColumns(DEFAULT_COLUMN_SPLIT, scene.columnSplit);
  const resolvedInteraction = {
    ...DEFAULT_INTERACTION,
    ...objectOrEmpty(scene.interaction)
  };
  const resolvedDebug = {
    enabled: false,
    showSlots: false,
    showRegions: false,
    showSampling: false,
    ...objectOrEmpty(scene.debug)
  };
  return {
    meta: { ...DEFAULT_SCENE.meta, ...scene.meta },
    assets: {
      baseSrc: textOr(scene.assets.baseSrc, ""),
      overlaySrc: textOr(scene.assets.overlaySrc, ""),
      alphaThreshold: Math.max(0, numberOr(scene.assets.alphaThreshold, 20)),
      fit: scene.assets.fit ?? "cover"
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
    blocks: scene.blocks
  };
};
var buildScaleCandidates = (layout) => {
  const scales = [];
  let scale = 1;
  while (scale >= layout.minScale - 1e-3) {
    scales.push(Number(scale.toFixed(2)));
    scale -= layout.scaleStep;
  }
  const finalScale = Number(layout.minScale.toFixed(2));
  if (!scales.includes(finalScale)) {
    scales.push(finalScale);
  }
  return scales;
};
var sanitizeStyleName = (value) => value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
var srgbChannelToLinear = (value) => {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
};
var relativeLuminance = (r, g, b) => 0.2126 * srgbChannelToLinear(r) + 0.7152 * srgbChannelToLinear(g) + 0.0722 * srgbChannelToLinear(b);
var ensureEngineStyles = (doc, injectStyles) => {
  if (!injectStyles || doc.getElementById(ENGINE_STYLE_ID)) {
    return;
  }
  const style = doc.createElement("style");
  style.id = ENGINE_STYLE_ID;
  style.textContent = ENGINE_CSS;
  doc.head.append(style);
};
var waitForImage = async (image) => {
  if (image.complete && image.naturalWidth > 0) {
    return;
  }
  if (typeof image.decode === "function") {
    try {
      await image.decode();
      return;
    } catch {
    }
  }
  await new Promise((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => reject(new Error(`Unable to load ${image.src}`)), {
      once: true
    });
  });
};
var drawFittedImage = (ctx, image, width, height, fit) => {
  ctx.clearRect(0, 0, width, height);
  const scale = fit === "cover" ? Math.max(width / image.naturalWidth, height / image.naturalHeight) : Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
};
var withOpacity = (color, opacity) => {
  const clampedOpacity = clamp(opacity, 0, 1);
  if (color.startsWith("rgba(")) {
    return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/, (_, r, g, b) => {
      return `rgba(${String(r).trim()}, ${String(g).trim()}, ${String(b).trim()}, ${clampedOpacity})`;
    });
  }
  if (color.startsWith("rgb(")) {
    return color.replace(/rgb\(([^,]+),([^,]+),([^)]+)\)/, (_, r, g, b) => {
      return `rgba(${String(r).trim()}, ${String(g).trim()}, ${String(b).trim()}, ${clampedOpacity})`;
    });
  }
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((char) => `${char}${char}`).join("");
    }
    if (hex.length === 6) {
      const red = Number.parseInt(hex.slice(0, 2), 16);
      const green = Number.parseInt(hex.slice(2, 4), 16);
      const blue = Number.parseInt(hex.slice(4, 6), 16);
      return `rgba(${red}, ${green}, ${blue}, ${clampedOpacity})`;
    }
  }
  return color;
};
var chooseSingleSlot = (slots, anchorX) => {
  return slots.reduce((best, slot) => {
    const bestCenter = best.left + (best.right - best.left) / 2;
    const slotCenter = slot.left + (slot.right - slot.left) / 2;
    const bestDelta = Math.abs(bestCenter - anchorX);
    const slotDelta = Math.abs(slotCenter - anchorX);
    if (slotDelta < bestDelta) {
      return slot;
    }
    if (slotDelta > bestDelta) {
      return best;
    }
    const bestWidth = best.right - best.left;
    const slotWidth = slot.right - slot.left;
    return slotWidth > bestWidth ? slot : best;
  });
};
var sortSlots = (slots, order, anchorX) => {
  const next = [...slots];
  switch (order) {
    case "right-to-left":
      return next.sort((left, right) => right.left - left.left);
    case "center-out":
      return next.sort((left, right) => {
        const leftCenter = left.left + (left.right - left.left) / 2;
        const rightCenter = right.left + (right.right - right.left) / 2;
        return Math.abs(leftCenter - anchorX) - Math.abs(rightCenter - anchorX);
      });
    case "left-to-right":
    default:
      return next.sort((left, right) => left.left - right.left);
  }
};
var maybeSplitSlot = (slot, split) => {
  if (split.mode === "off") {
    return [slot];
  }
  const slotWidth = slot.right - slot.left;
  const autoColumns = Math.floor((slotWidth + split.gap) / (split.minColumnWidth + split.gap));
  const requestedColumns = split.mode === "fixed" ? split.preferredColumns : Math.min(split.maxColumns, autoColumns);
  const columns = clamp(requestedColumns, 1, split.maxColumns);
  if (columns < 2) {
    return [slot];
  }
  const columnWidth = (slotWidth - split.gap * (columns - 1)) / columns;
  if (columnWidth < split.minColumnWidth) {
    return [slot];
  }
  return Array.from({ length: columns }, (_, index) => {
    const left = slot.left + index * (columnWidth + split.gap);
    return {
      left,
      right: left + columnWidth
    };
  });
};
var buildFallbackBlock = (doc, block, style) => {
  const tag = block.style === "heading" ? "h3" : "p";
  const element = doc.createElement(tag);
  element.className = `pie-fallback-block pie-fallback-${sanitizeStyleName(block.style)}`;
  element.textContent = style.textTransform === "uppercase" ? block.text.toUpperCase() : block.text;
  return element;
};
var getBlockProgress = (progress, scroll) => {
  if (scroll.mode === "static") {
    return 1;
  }
  if (scroll.end <= scroll.start) {
    return progress >= scroll.start ? 1 : 0;
  }
  return clamp((progress - scroll.start) / (scroll.end - scroll.start), 0, 1);
};
var isStickyBlockActive = (progress, block) => {
  if (block.scroll.mode !== "sticky-start-reveal") {
    return false;
  }
  if (block.scroll.end <= block.scroll.start) {
    return progress === block.scroll.start;
  }
  return progress >= block.scroll.start && progress <= block.scroll.end;
};
var isLineVisible = (line, progress) => {
  if (line.scroll.mode === "static") {
    return true;
  }
  if (progress < line.scroll.start) {
    return false;
  }
  return getBlockProgress(progress, line.scroll) >= line.revealThreshold;
};
var createLineElement = (doc, line, selectable, sticky = false) => {
  const element = doc.createElement("div");
  element.className = `pie-line${sticky ? " pie-sticky-line" : ""} pie-line-${sanitizeStyleName(line.styleName)}`;
  element.textContent = line.text;
  element.style.left = `${Math.round(line.x)}px`;
  element.style.top = `${Math.round(sticky ? line.scroll.stickyTop : line.y)}px`;
  element.style.color = line.appearance.textColor;
  element.style.font = `${line.style.fontWeight} ${Math.round(line.fontSize)}px ${line.style.fontFamily}`;
  element.style.lineHeight = `${line.lineHeightPx}px`;
  element.style.letterSpacing = `${line.style.letterSpacing}px`;
  element.style.textTransform = line.style.textTransform;
  element.style.padding = `${line.appearance.paddingY}px ${line.appearance.paddingX}px`;
  element.style.borderRadius = `${line.appearance.radius}px`;
  element.style.background = line.appearance.backgroundColor ?? "transparent";
  element.style.boxShadow = line.appearance.backgroundColor ? `0 0 ${line.style.minFontSize}px ${line.appearance.backgroundColor}` : "none";
  element.style.textShadow = line.appearance.shadowBlur > 0 ? `${line.appearance.shadowOffsetX}px ${line.appearance.shadowOffsetY}px ${line.appearance.shadowBlur}px ${line.appearance.shadowColor}` : "none";
  element.style.userSelect = selectable && !sticky ? "text" : "none";
  element.dataset.blockId = line.blockId;
  element.dataset.lineId = line.id;
  element.dataset.scrollMode = line.scroll.mode;
  if (sticky) {
    element.setAttribute("aria-hidden", "true");
  }
  return element;
};
var getSafeDocument = (container) => {
  const doc = container.ownerDocument;
  if (!doc?.defaultView) {
    throw new Error(
      "pretext-image-engine can be imported in SSR, but createPretextImageEngine() requires a browser DOM container."
    );
  }
  return doc;
};
var PretextImageEngine = class {
  container;
  doc;
  options;
  root;
  stageShell;
  stickyLayer;
  stickyInner;
  stage;
  baseImage;
  overlayImage;
  lineLayer;
  debugLayer;
  status;
  statusBadge;
  fallback;
  fallbackLabel;
  fallbackContent;
  baseCanvas;
  overlayCanvas;
  baseContext;
  overlayContext;
  resizeObserver = null;
  scene;
  imageSignature = "";
  pendingFrame = 0;
  activeLayout = null;
  lineElements = /* @__PURE__ */ new Map();
  ready;
  state;
  constructor(container, scene, options) {
    this.doc = getSafeDocument(container);
    this.options = resolveOptions(options);
    ensureEngineStyles(this.doc, this.options.injectStyles);
    this.container = container;
    this.scene = resolveScene(scene);
    this.state = {
      layoutMode: "masked",
      width: 0,
      height: 0,
      scale: 1,
      progress: this.options.initialProgress
    };
    this.root = this.doc.createElement("div");
    this.root.className = "pie-root";
    this.stageShell = this.doc.createElement("div");
    this.stageShell.className = "pie-stage-shell";
    this.stickyLayer = this.doc.createElement("div");
    this.stickyLayer.className = "pie-sticky-layer";
    this.stickyInner = this.doc.createElement("div");
    this.stickyInner.className = "pie-sticky-inner";
    this.stickyLayer.append(this.stickyInner);
    this.stage = this.doc.createElement("div");
    this.stage.className = "pie-stage";
    this.baseImage = this.doc.createElement("img");
    this.baseImage.className = "pie-base";
    this.baseImage.alt = "";
    this.baseImage.decoding = "async";
    this.overlayImage = this.doc.createElement("img");
    this.overlayImage.className = "pie-overlay";
    this.overlayImage.alt = "";
    this.overlayImage.decoding = "async";
    this.lineLayer = this.doc.createElement("div");
    this.lineLayer.className = "pie-line-layer";
    this.debugLayer = this.doc.createElement("div");
    this.debugLayer.className = "pie-debug-layer";
    this.status = this.doc.createElement("div");
    this.status.className = "pie-status";
    this.statusBadge = this.doc.createElement("div");
    this.statusBadge.className = "pie-status-badge";
    this.status.append(this.statusBadge);
    this.fallback = this.doc.createElement("div");
    this.fallback.className = "pie-fallback";
    this.fallback.hidden = true;
    this.fallbackLabel = this.doc.createElement("p");
    this.fallbackLabel.className = "pie-fallback-label";
    this.fallbackContent = this.doc.createElement("div");
    this.fallbackContent.className = "pie-fallback-content";
    this.fallback.append(this.fallbackLabel, this.fallbackContent);
    this.stage.append(this.baseImage, this.lineLayer, this.debugLayer, this.overlayImage, this.status);
    this.stageShell.append(this.stickyLayer, this.stage, this.fallback);
    this.root.append(this.stageShell);
    this.container.replaceChildren(this.root);
    this.baseCanvas = this.doc.createElement("canvas");
    this.overlayCanvas = this.doc.createElement("canvas");
    this.baseContext = this.baseCanvas.getContext("2d", { willReadFrequently: true });
    this.overlayContext = this.overlayCanvas.getContext("2d", {
      willReadFrequently: true
    });
    this.ready = this.loadAssets().then(() => {
      this.attachResizeObserver();
      this.render();
    });
  }
  async update(scene) {
    this.scene = resolveScene(scene);
    await this.loadAssets();
    this.render();
  }
  setProgress(progress) {
    this.state.progress = clampProgress(progress);
    if (this.state.layoutMode === "masked" && this.activeLayout) {
      this.applyProgressProjection();
    }
  }
  render() {
    if (!this.baseImage.naturalWidth || !this.overlayImage.naturalWidth) {
      return;
    }
    const width = Math.max(0, Math.round(this.stage.clientWidth));
    const height = Math.max(0, Math.round(this.stage.clientHeight));
    if (!width || !height) {
      return;
    }
    this.state.width = width;
    this.state.height = height;
    this.root.dataset.selectable = String(this.scene.interaction.selectable);
    this.root.dataset.selectionEnabled = String(
      this.scene.interaction.selectable && this.scene.colors.selection.enabled
    );
    this.root.style.setProperty("--pie-selection-bg", this.scene.colors.selection.background);
    this.root.style.setProperty("--pie-selection-color", this.scene.colors.selection.color);
    this.syncCanvasBuffers(width, height);
    const allowFallback = this.scene.resize.fallbackMode === "below";
    if (this.scene.resize.preserveFullText && allowFallback && width <= this.scene.layout.fallbackBelowWidth) {
      this.applyFallback(this.scene.resize.fallbackLabel);
      return;
    }
    const candidates = buildScaleCandidates(this.scene.layout);
    let bestPartial = null;
    for (const scale of candidates) {
      const result = this.measureMaskedLayout(width, height, scale);
      if (result.renderedLines > 0 && !result.overflowed) {
        this.applyMasked(result);
        return;
      }
      if (bestPartial === null || result.renderedLines > bestPartial.renderedLines) {
        bestPartial = result;
      }
    }
    if (this.scene.resize.preserveFullText && allowFallback) {
      this.applyFallback(this.scene.resize.fallbackLabel);
      return;
    }
    if (bestPartial !== null && bestPartial.renderedLines > 0) {
      this.applyMasked(bestPartial, "Text clipped inside the image at this size.");
      return;
    }
    if (allowFallback) {
      this.applyFallback("No readable slots were available inside the overlay.");
      return;
    }
    this.applyMasked(
      {
        lines: [],
        blocks: [],
        debugSlots: [],
        overflowed: true,
        renderedLines: 0,
        scale: bestPartial?.scale ?? candidates.at(-1) ?? 1
      },
      "No readable slots were available inside the overlay."
    );
  }
  destroy() {
    if (this.pendingFrame) {
      cancelAnimationFrame(this.pendingFrame);
    }
    this.resizeObserver?.disconnect();
    this.container.replaceChildren();
  }
  attachResizeObserver() {
    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.pendingFrame) {
          cancelAnimationFrame(this.pendingFrame);
        }
        this.pendingFrame = requestAnimationFrame(() => {
          this.pendingFrame = 0;
          this.render();
        });
      });
      this.resizeObserver.observe(this.stage);
    }
  }
  async loadAssets() {
    const signature = `${this.scene.assets.baseSrc}::${this.scene.assets.overlaySrc}`;
    this.baseImage.style.objectFit = this.scene.assets.fit;
    this.overlayImage.style.objectFit = this.scene.assets.fit;
    if (signature === this.imageSignature && this.baseImage.naturalWidth && this.overlayImage.naturalWidth) {
      this.syncStageAppearance();
      return;
    }
    this.imageSignature = signature;
    this.baseImage.src = this.scene.assets.baseSrc;
    this.overlayImage.src = this.scene.assets.overlaySrc;
    await Promise.all([waitForImage(this.baseImage), waitForImage(this.overlayImage)]);
    this.syncStageAppearance();
  }
  syncStageAppearance() {
    const ratio = this.scene.stage.aspectRatio || this.baseImage.naturalWidth / this.baseImage.naturalHeight;
    const alt = this.scene.meta.alt?.trim() ?? "";
    this.stageShell.style.padding = `${this.scene.stage.padding}px`;
    this.stage.style.aspectRatio = `${ratio}`;
    this.stage.style.minHeight = `${this.scene.stage.minHeight}px`;
    this.stage.style.background = this.scene.stage.background;
    this.stage.style.borderRadius = `${this.scene.stage.borderRadius}px`;
    if (alt) {
      this.stage.setAttribute("role", "img");
      this.stage.setAttribute("aria-label", alt);
      return;
    }
    this.stage.removeAttribute("role");
    this.stage.removeAttribute("aria-label");
  }
  syncCanvasBuffers(width, height) {
    this.baseCanvas.width = width;
    this.baseCanvas.height = height;
    this.overlayCanvas.width = width;
    this.overlayCanvas.height = height;
    drawFittedImage(this.baseContext, this.baseImage, width, height, this.scene.assets.fit);
    drawFittedImage(this.overlayContext, this.overlayImage, width, height, this.scene.assets.fit);
  }
  sampleLuminance(x, y, width, height) {
    const startX = clamp(Math.floor(x), 0, this.baseCanvas.width - 1);
    const startY = clamp(Math.floor(y), 0, this.baseCanvas.height - 1);
    const sampleWidth = clamp(Math.ceil(width), 1, this.baseCanvas.width - startX);
    const sampleHeight = clamp(Math.ceil(height), 1, this.baseCanvas.height - startY);
    const { data } = this.baseContext.getImageData(startX, startY, sampleWidth, sampleHeight);
    const stride = Math.max(1, Math.floor(Math.max(sampleWidth, sampleHeight) / 24));
    let total = 0;
    let count = 0;
    for (let yy = 0; yy < sampleHeight; yy += stride) {
      for (let xx = 0; xx < sampleWidth; xx += stride) {
        const offset = (yy * sampleWidth + xx) * 4;
        total += relativeLuminance(data[offset], data[offset + 1], data[offset + 2]);
        count++;
      }
    }
    return count ? total / count : 0;
  }
  resolveLineAppearance(lineX, lineY, lineWidth, lineHeightPx, style, block) {
    const textConfig = this.scene.colors.text;
    const blockHighlight = mergeHighlight(style.highlight, block.highlight);
    const shadow = this.scene.colors.shadow;
    const sample = this.sampleLuminance(
      lineX,
      lineY,
      lineWidth + blockHighlight.paddingX * 2,
      lineHeightPx + blockHighlight.paddingY * 2
    );
    const useDarkText = textConfig.mode === "auto" ? sample >= textConfig.luminanceThreshold : false;
    const textColor = textConfig.mode === "auto" ? useDarkText ? textConfig.darkColor : textConfig.lightColor : textConfig.color;
    let backgroundColor = null;
    if (blockHighlight.enabled && blockHighlight.mode !== "off") {
      const highlightColor = blockHighlight.mode === "auto" ? useDarkText ? blockHighlight.lightColor : blockHighlight.darkColor : blockHighlight.color;
      backgroundColor = withOpacity(highlightColor, blockHighlight.opacity);
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
      radius: blockHighlight.radius
    };
  }
  getTransparentSlots(bandTop, bandBottom, region) {
    const leftLimit = Math.round(this.scene.layout.outerPadding);
    const rightLimit = this.overlayCanvas.width - Math.round(this.scene.layout.outerPadding);
    const regionLeft = region ? Math.round(region.xStart * this.overlayCanvas.width) : leftLimit;
    const regionRight = region ? Math.round(region.xEnd * this.overlayCanvas.width) : rightLimit;
    const startX = Math.max(leftLimit, regionLeft);
    const endX = Math.min(rightLimit, regionRight);
    const startY = clamp(
      Math.floor(bandTop - this.scene.layout.verticalPadding),
      0,
      this.overlayCanvas.height - 1
    );
    const endY = clamp(
      Math.ceil(bandBottom + this.scene.layout.verticalPadding),
      0,
      this.overlayCanvas.height
    );
    const { data } = this.overlayContext.getImageData(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    const slots = [];
    let runStart = -1;
    for (let x = startX; x < endX; x++) {
      let blocked = false;
      for (let y = startY; y < endY; y++) {
        if (data[(y * this.overlayCanvas.width + x) * 4 + 3] > this.scene.assets.alphaThreshold) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        if (runStart === -1) {
          runStart = x;
        }
        continue;
      }
      if (runStart !== -1) {
        slots.push({ left: runStart, right: x });
        runStart = -1;
      }
    }
    if (runStart !== -1) {
      slots.push({ left: runStart, right: endX });
    }
    const minSlotWidth = region?.minSlotWidth ?? this.scene.layout.minSlotWidth;
    return slots.map((slot) => ({
      left: slot.left + this.scene.layout.horizontalPadding,
      right: slot.right - this.scene.layout.horizontalPadding
    })).filter((slot) => slot.right - slot.left >= minSlotWidth);
  }
  resolveBlockStyle(block) {
    const base = this.scene.styles[block.style] ?? this.scene.styles.body;
    return mergeStyle(base, block.styleOverride);
  }
  resolveColumns(styleName, style, block, region) {
    const fromRegion = region?.columnSplit;
    const fromBlock = block.columns;
    const merged = mergeColumns(this.scene.columnSplit, fromRegion);
    const mergedWithStyle = mergeColumns(merged, style.columns);
    const finalColumns = mergeColumns(mergedWithStyle, fromBlock);
    if (!finalColumns.applyToStyles.includes(styleName)) {
      return { ...finalColumns, mode: "off" };
    }
    return finalColumns;
  }
  orderSlots(slots, block, style, region) {
    if (!slots.length) {
      return [];
    }
    const anchorX = (region?.anchorX ?? 0.5) * this.overlayCanvas.width;
    const order = block.regionOrder ?? region?.slotOrder ?? "left-to-right";
    const split = this.resolveColumns(block.style, style, block, region);
    const sorted = sortSlots(slots, order, anchorX).flatMap((slot) => maybeSplitSlot(slot, split));
    if (block.allowMultiSlot ?? style.allowMultiSlot) {
      return sortSlots(sorted, order, anchorX);
    }
    return [chooseSingleSlot(sorted, anchorX)];
  }
  measureMaskedLayout(width, height, scale) {
    const lines = [];
    const blocks = [];
    const debugSlots = [];
    let globalCursor = this.scene.layout.outerPadding;
    const regionCursors = /* @__PURE__ */ new Map();
    for (const [blockIndex, block] of this.scene.blocks.entries()) {
      const blockId = block.id ?? `block-${blockIndex}`;
      const style = this.resolveBlockStyle(block);
      const text = style.textTransform === "uppercase" ? block.text.toUpperCase() : block.text;
      const { font, fontSize, lineHeightPx } = getFontMetrics(style, width, scale);
      const prepared = (0, import_pretext.prepareWithSegments)(text, font);
      const region = block.region ? this.scene.regions[block.region] ?? null : null;
      const scroll = resolveScrollConfig(block.scroll);
      const blockLineStart = lines.length;
      const regionTop = region ? Math.max(this.scene.layout.outerPadding, Math.round(region.yStart * height)) : this.scene.layout.outerPadding;
      const regionBottom = region ? Math.min(height - this.scene.layout.outerPadding, Math.round(region.yEnd * height)) : height - this.scene.layout.outerPadding;
      let cursorTop = region ? regionCursors.get(block.region) ?? regionTop : globalCursor;
      let cursor = { segmentIndex: 0, graphemeIndex: 0 };
      let blockFinished = false;
      let blockLineIndex = 0;
      while (cursorTop + lineHeightPx <= regionBottom) {
        const bandTop = cursorTop;
        const bandBottom = cursorTop + lineHeightPx;
        const slots = this.orderSlots(this.getTransparentSlots(bandTop, bandBottom, region), block, style, region);
        let placed = false;
        if (this.scene.debug.enabled && this.scene.debug.showSlots) {
          slots.forEach((slot) => {
            debugSlots.push({
              x: slot.left,
              y: bandTop,
              width: slot.right - slot.left,
              height: lineHeightPx
            });
          });
        }
        if (!slots.length) {
          cursorTop += lineHeightPx;
          continue;
        }
        for (const slot of slots) {
          const line = (0, import_pretext.layoutNextLine)(prepared, cursor, slot.right - slot.left);
          if (line === null) {
            blockFinished = true;
            break;
          }
          const appearance = this.resolveLineAppearance(
            slot.left,
            bandTop,
            line.width,
            lineHeightPx,
            style,
            block
          );
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
            revealThreshold: 0
          });
          blockLineIndex += 1;
          cursor = line.end;
          placed = true;
        }
        if (placed) {
          cursorTop += lineHeightPx;
        }
        if (blockFinished) {
          cursorTop += style.gapAfter;
          if (region && block.region) {
            regionCursors.set(block.region, cursorTop);
          } else {
            globalCursor = cursorTop;
          }
          break;
        }
      }
      const blockLineCount = lines.length - blockLineStart;
      for (let index = 0; index < blockLineCount; index += 1) {
        const line = lines[blockLineStart + index];
        line.revealThreshold = scroll.mode === "static" || blockLineCount <= 1 ? 0 : index / blockLineCount;
      }
      blocks.push({
        id: blockId,
        blockIndex,
        scroll,
        firstLineId: blockLineCount > 0 ? lines[blockLineStart].id : null
      });
      if (!blockFinished) {
        return {
          lines,
          blocks,
          debugSlots,
          overflowed: true,
          renderedLines: lines.length,
          scale
        };
      }
    }
    return {
      lines,
      blocks,
      debugSlots,
      overflowed: false,
      renderedLines: lines.length,
      scale
    };
  }
  applyMasked(result, statusText = "Masked layout active") {
    this.state.layoutMode = "masked";
    this.state.scale = result.scale;
    this.activeLayout = result;
    this.root.dataset.mode = "masked";
    this.lineElements.clear();
    this.lineLayer.replaceChildren();
    this.debugLayer.replaceChildren();
    this.stickyInner.replaceChildren();
    const lineFragment = this.doc.createDocumentFragment();
    result.lines.forEach((line) => {
      const element = createLineElement(this.doc, line, this.scene.interaction.selectable);
      this.lineElements.set(line.id, element);
      lineFragment.append(element);
    });
    this.lineLayer.append(lineFragment);
    if (this.scene.debug.enabled && (this.scene.debug.showSlots || this.scene.debug.showRegions)) {
      const debugFragment = this.doc.createDocumentFragment();
      if (this.scene.debug.showSlots) {
        result.debugSlots.forEach((slot) => {
          const element = this.doc.createElement("div");
          element.className = "pie-slot";
          element.style.left = `${slot.x}px`;
          element.style.top = `${slot.y}px`;
          element.style.width = `${slot.width}px`;
          element.style.height = `${slot.height}px`;
          debugFragment.append(element);
        });
      }
      if (this.scene.debug.showRegions) {
        Object.values(this.scene.regions).forEach((region) => {
          const element = this.doc.createElement("div");
          element.className = "pie-region";
          element.style.left = `${Math.round(region.xStart * this.state.width)}px`;
          element.style.top = `${Math.round(region.yStart * this.state.height)}px`;
          element.style.width = `${Math.round((region.xEnd - region.xStart) * this.state.width)}px`;
          element.style.height = `${Math.round((region.yEnd - region.yStart) * this.state.height)}px`;
          debugFragment.append(element);
        });
      }
      this.debugLayer.append(debugFragment);
    }
    this.fallback.hidden = true;
    this.statusBadge.textContent = statusText;
    this.applyProgressProjection();
  }
  applyProgressProjection() {
    if (!this.activeLayout) {
      this.stickyInner.replaceChildren();
      return;
    }
    let stickyLine = null;
    for (const block of this.activeLayout.blocks) {
      if (!isStickyBlockActive(this.state.progress, block) || !block.firstLineId) {
        continue;
      }
      stickyLine = this.activeLayout.lines.find((line) => line.id === block.firstLineId) ?? null;
    }
    this.activeLayout.lines.forEach((line) => {
      const element = this.lineElements.get(line.id);
      if (!element) {
        return;
      }
      const visible = isLineVisible(line, this.state.progress) && line.id !== stickyLine?.id;
      element.hidden = !visible;
    });
    this.stickyInner.replaceChildren();
    if (stickyLine) {
      const stickyElement = createLineElement(this.doc, stickyLine, false, true);
      this.stickyInner.append(stickyElement);
    }
  }
  applyFallback(label) {
    this.state.layoutMode = "fallback";
    this.state.scale = 1;
    this.activeLayout = null;
    this.lineElements.clear();
    this.root.dataset.mode = "fallback";
    this.lineLayer.replaceChildren();
    this.debugLayer.replaceChildren();
    this.stickyInner.replaceChildren();
    this.fallbackContent.replaceChildren();
    const fragment = this.doc.createDocumentFragment();
    this.scene.blocks.forEach((block) => {
      fragment.append(buildFallbackBlock(this.doc, block, this.resolveBlockStyle(block)));
    });
    this.fallbackContent.append(fragment);
    this.fallbackLabel.textContent = label;
    this.fallback.hidden = false;
    this.statusBadge.textContent = "Fallback layout active";
  }
};
var createPretextImageEngine = (container, scene, options) => new PretextImageEngine(container, scene, options);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PretextImageEngine,
  createPretextImageEngine
});
