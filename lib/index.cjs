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
  composeScene: () => composeScene,
  createPretextImageEngine: () => createPretextImageEngine,
  createScene: () => createScene
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
  fallbackLabel: "Full text moved below the image at this size.",
  fallbackOnOverflow: true
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
var DEFAULT_REVEAL = {
  unit: "line",
  monotonic: false
};
var DEFAULT_BLOCK_STYLES = {
  eyebrow: {
    fontFamily: '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace',
    fontWeight: 500,
    fontStyle: "normal",
    fontSizeRatio: 0.011,
    minFontSize: 0,
    maxFontSize: Infinity,
    lineHeight: 1.28,
    gapAfter: 10,
    allowMultiSlot: false,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT
  },
  heading: {
    fontFamily: '"Cormorant Garamond", "Cormorant", "Iowan Old Style", Georgia, serif',
    fontWeight: 300,
    fontStyle: "normal",
    fontSizeRatio: 0.04,
    minFontSize: 0,
    maxFontSize: Infinity,
    lineHeight: 1.02,
    gapAfter: 16,
    allowMultiSlot: false,
    letterSpacing: -0.5,
    textTransform: "none",
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT
  },
  lede: {
    fontFamily: '"Cormorant Garamond", "Cormorant", "Iowan Old Style", Georgia, serif',
    fontWeight: 400,
    fontStyle: "italic",
    fontSizeRatio: 0.02,
    minFontSize: 0,
    maxFontSize: Infinity,
    lineHeight: 1.3,
    gapAfter: 14,
    allowMultiSlot: false,
    letterSpacing: 0,
    textTransform: "none",
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT
  },
  body: {
    fontFamily: '"Cormorant Garamond", "Cormorant", "Iowan Old Style", Georgia, serif',
    fontWeight: 400,
    fontStyle: "normal",
    fontSizeRatio: 0.016,
    minFontSize: 0,
    maxFontSize: Infinity,
    lineHeight: 1.45,
    gapAfter: 14,
    allowMultiSlot: true,
    letterSpacing: 5e-3,
    textTransform: "none",
    highlight: DEFAULT_HIGHLIGHT,
    columns: DEFAULT_COLUMN_SPLIT
  },
  caption: {
    fontFamily: '"Cormorant Garamond", "Cormorant", "Iowan Old Style", Georgia, serif',
    fontWeight: 300,
    fontStyle: "italic",
    fontSizeRatio: 0.014,
    minFontSize: 0,
    maxFontSize: Infinity,
    lineHeight: 1.34,
    gapAfter: 10,
    allowMultiSlot: false,
    letterSpacing: 0.02,
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
  reveal: DEFAULT_REVEAL,
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
.pie-panel-layer,
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

.pie-panel-layer,
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

.pie-slot[data-variant="manual"] {
  border-style: solid;
  background: rgba(245, 221, 171, 0.1);
}

.pie-slot[data-active="false"] {
  opacity: 0.42;
}

.pie-region {
  position: absolute;
  border: 1px solid rgba(245, 221, 171, 0.8);
  background: rgba(245, 221, 171, 0.08);
}

.pie-panel {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 42px rgba(7, 9, 12, 0.24);
}

.pie-debug-label {
  position: absolute;
  top: -1.35rem;
  left: 0;
  display: inline-flex;
  align-items: center;
  min-height: 1.25rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgba(10, 11, 14, 0.8);
  color: rgba(248, 241, 230, 0.96);
  font: 700 0.62rem/1.1 "IBM Plex Mono", ui-monospace, monospace;
  letter-spacing: 0.08em;
  white-space: nowrap;
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
  font: 300 clamp(1.5rem, 2.4vw, 2.4rem)/1.04 "Cormorant Garamond", "Iowan Old Style", Georgia, serif;
  letter-spacing: -0.01em;
}

.pie-fallback-lede {
  font: italic 400 1.1rem/1.4 "Cormorant Garamond", "Iowan Old Style", Georgia, serif;
  color: #3b4652;
}

.pie-fallback-body {
  font: 400 1.05rem/1.55 "Cormorant Garamond", "Iowan Old Style", Georgia, serif;
  color: #3b4652;
}

.pie-fallback-caption {
  font: italic 300 0.98rem/1.45 "Cormorant Garamond", "Iowan Old Style", Georgia, serif;
  color: #6e7884;
}
`;

// src/lib/v2.ts
var isTextBlock = (block) => block.kind !== "embed";
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var numberOr = (value, fallback) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
var srgbChannelToLinear = (value) => {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
};
var relativeLuminance = (r, g, b) => 0.2126 * srgbChannelToLinear(r) + 0.7152 * srgbChannelToLinear(g) + 0.0722 * srgbChannelToLinear(b);
var rgbToHex = (r, g, b) => `#${[r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")).join("")}`;
var withOpacity = (color, opacity) => {
  if (color.startsWith("rgba(")) {
    return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/, (_, r, g, b) => {
      return `rgba(${String(r).trim()}, ${String(g).trim()}, ${String(b).trim()}, ${clamp(opacity, 0, 1)})`;
    });
  }
  if (color.startsWith("rgb(")) {
    return color.replace(/rgb\(([^,]+),([^,]+),([^)]+)\)/, (_, r, g, b) => {
      return `rgba(${String(r).trim()}, ${String(g).trim()}, ${String(b).trim()}, ${clamp(opacity, 0, 1)})`;
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
      return `rgba(${red}, ${green}, ${blue}, ${clamp(opacity, 0, 1)})`;
    }
  }
  return color;
};
var resolveRoleFromStyle = (style) => {
  switch (style) {
    case "eyebrow":
      return "eyebrow";
    case "heading":
      return "headline";
    case "lede":
      return "lede";
    case "caption":
      return "caption";
    case "body":
    default:
      return "body";
  }
};
var rolePriority = (block) => {
  const role = block.v2?.role ?? resolveRoleFromStyle(block.style);
  switch (role) {
    case "eyebrow":
      return 10;
    case "headline":
      return 20;
    case "lede":
      return 30;
    case "body":
      return 40;
    case "cta":
      return 50;
    case "caption":
      return 60;
    case "annotation":
    default:
      return 70;
  }
};
var rectToRegion = (rect, width, height) => ({
  xStart: clamp(rect.x / width, 0, 1),
  xEnd: clamp((rect.x + rect.width) / width, 0, 1),
  yStart: clamp(rect.y / height, 0, 1),
  yEnd: clamp((rect.y + rect.height) / height, 0, 1),
  anchorX: clamp((rect.x + rect.width / 2) / width, 0, 1),
  slotOrder: "center-out",
  minSlotWidth: Math.max(32, Math.round(rect.width * 0.45))
});
var resolveCellRect = (col, row, gridColumns, gridRows, width, height) => {
  const x = Math.round(col / gridColumns * width);
  const y = Math.round(row / gridRows * height);
  const nextX = Math.round((col + 1) / gridColumns * width);
  const nextY = Math.round((row + 1) / gridRows * height);
  return {
    x,
    y,
    width: Math.max(1, nextX - x),
    height: Math.max(1, nextY - y)
  };
};
var normalizeRect = (rect, width, height) => {
  const normalizeAxis = (value, size) => Math.abs(value) <= 1 ? value * size : value;
  return {
    x: clamp(Math.round(normalizeAxis(rect.x, width)), 0, width),
    y: clamp(Math.round(normalizeAxis(rect.y, height)), 0, height),
    width: Math.max(1, Math.round(normalizeAxis(rect.width, width))),
    height: Math.max(1, Math.round(normalizeAxis(rect.height, height)))
  };
};
var rectIntersects = (left, right) => {
  return !(left.x + left.width <= right.x || right.x + right.width <= left.x || left.y + left.height <= right.y || right.y + right.height <= left.y);
};
var averageStatsForRect = (rect, cells) => {
  const overlapping = cells.filter(
    (cell) => rectIntersects(rect, { x: cell.x, y: cell.y, width: cell.width, height: cell.height })
  );
  if (!overlapping.length) {
    return {
      averageLuminance: 0.5,
      averageContrast: 0.3,
      averageTexture: 0.3,
      accentColor: "#d9c6a0",
      recommendedTone: "light",
      recommendedBackdrop: "shadow"
    };
  }
  const totals = overlapping.reduce(
    (acc, cell) => {
      acc.luminance += cell.luminance;
      acc.contrast += cell.contrast;
      acc.texture += cell.texture;
      acc.r += cell.avgR;
      acc.g += cell.avgG;
      acc.b += cell.avgB;
      return acc;
    },
    { luminance: 0, contrast: 0, texture: 0, r: 0, g: 0, b: 0 }
  );
  const count = overlapping.length;
  const averageLuminance = totals.luminance / count;
  const averageContrast = totals.contrast / count;
  const averageTexture = totals.texture / count;
  const accentColor = rgbToHex(totals.r / count, totals.g / count, totals.b / count);
  const recommendedTone = averageLuminance >= 0.58 ? "dark" : "light";
  const recommendedBackdrop = averageContrast > 0.2 || averageTexture > 0.18 ? "panel" : "shadow";
  return {
    averageLuminance,
    averageContrast,
    averageTexture,
    accentColor,
    recommendedTone,
    recommendedBackdrop
  };
};
var preferredRolesForRect = (rect, stageWidth, stageHeight) => {
  const areaRatio = rect.width * rect.height / Math.max(1, stageWidth * stageHeight);
  const isWide = rect.width / Math.max(1, rect.height) > 1.4;
  if (areaRatio > 0.16 && isWide) {
    return ["headline", "body", "lede", "eyebrow", "caption"];
  }
  if (areaRatio > 0.09) {
    return ["lede", "body", "headline", "caption", "eyebrow"];
  }
  return ["eyebrow", "caption", "annotation", "headline", "body"];
};
var expandRect = (rect, padding, width, height) => ({
  x: clamp(rect.x - padding, 0, width),
  y: clamp(rect.y - padding, 0, height),
  width: clamp(rect.width + padding * 2, 1, width),
  height: clamp(rect.height + padding * 2, 1, height)
});
var buildGrid = ({ scene, width, height, basePixels, overlayPixels }) => {
  const gridColumns = Math.max(6, Math.round(numberOr(scene.v2?.layout?.gridColumns, 12)));
  const gridRows = Math.max(6, Math.round(numberOr(scene.v2?.layout?.gridRows, 10)));
  const alphaThreshold = numberOr(scene.assets.alphaThreshold, 20);
  const cells = [];
  for (let row = 0; row < gridRows; row += 1) {
    for (let col = 0; col < gridColumns; col += 1) {
      const rect = resolveCellRect(col, row, gridColumns, gridRows, width, height);
      let luminanceTotal = 0;
      let contrastTotal = 0;
      let textureTotal = 0;
      let rTotal = 0;
      let gTotal = 0;
      let bTotal = 0;
      let count = 0;
      let blocked = 0;
      const sampleStepX = Math.max(1, Math.floor(rect.width / 4));
      const sampleStepY = Math.max(1, Math.floor(rect.height / 4));
      for (let y = rect.y; y < rect.y + rect.height; y += sampleStepY) {
        for (let x = rect.x; x < rect.x + rect.width; x += sampleStepX) {
          const offset = (y * width + x) * 4;
          const r = basePixels[offset] ?? 0;
          const g = basePixels[offset + 1] ?? 0;
          const b = basePixels[offset + 2] ?? 0;
          const luminance2 = relativeLuminance(r, g, b);
          const rightOffset = (y * width + clamp(x + sampleStepX, 0, width - 1)) * 4;
          const downOffset = (clamp(y + sampleStepY, 0, height - 1) * width + x) * 4;
          const rightLuminance = relativeLuminance(
            basePixels[rightOffset] ?? r,
            basePixels[rightOffset + 1] ?? g,
            basePixels[rightOffset + 2] ?? b
          );
          const downLuminance = relativeLuminance(
            basePixels[downOffset] ?? r,
            basePixels[downOffset + 1] ?? g,
            basePixels[downOffset + 2] ?? b
          );
          luminanceTotal += luminance2;
          contrastTotal += Math.abs(luminance2 - 0.5);
          textureTotal += Math.abs(luminance2 - rightLuminance) + Math.abs(luminance2 - downLuminance);
          rTotal += r;
          gTotal += g;
          bTotal += b;
          count += 1;
          if (overlayPixels && (overlayPixels[offset + 3] ?? 0) > alphaThreshold) {
            blocked += 1;
          }
        }
      }
      const luminance = count ? luminanceTotal / count : 0.5;
      const contrast = count ? contrastTotal / count : 0;
      const texture = count ? textureTotal / (count * 2) : 0;
      const overlayCoverage = count ? blocked / count : 0;
      const distanceFromCenter = Math.hypot(col + 0.5 - gridColumns / 2, row + 0.5 - gridRows / 2) / Math.hypot(gridColumns / 2, gridRows / 2);
      const centerBias = 1 - clamp(distanceFromCenter, 0, 1);
      const autoSubjectScore = texture * 0.65 + contrast * 0.35 + centerBias * 0.08;
      const protectedByHeuristic = centerBias > 0.45 && autoSubjectScore > 0.22;
      const protectedByOverlay = overlayCoverage > 0.18;
      const safeScore = clamp(1 - (texture * 2.8 + contrast * 1.2), 0, 1);
      cells.push({
        col,
        row,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        luminance,
        contrast,
        texture,
        avgR: count ? rTotal / count : 0,
        avgG: count ? gTotal / count : 0,
        avgB: count ? bTotal / count : 0,
        blockedByOverlay: protectedByOverlay,
        protected: protectedByOverlay || protectedByHeuristic,
        safeScore
      });
    }
  }
  return cells;
};
var applyManualSubjectZones = (cells, zones, width, height) => {
  const applied = [];
  zones.forEach((zone, index) => {
    const padding = Math.round(numberOr(zone.padding, 0));
    const normalized = expandRect(normalizeRect(zone, width, height), padding, width, height);
    applied.push(normalized);
    cells.forEach((cell) => {
      if (rectIntersects(normalized, { x: cell.x, y: cell.y, width: cell.width, height: cell.height })) {
        cell.protected = true;
      }
    });
    if (!zone.id) {
      zone.id = `subject-zone-${index}`;
    }
  });
  return applied;
};
var applyProtectionPadding = (cells, width, height, padding) => {
  if (padding <= 0) {
    return;
  }
  const rects = cells.filter((cell) => cell.protected).map((cell) => expandRect({ x: cell.x, y: cell.y, width: cell.width, height: cell.height }, padding, width, height));
  cells.forEach((cell) => {
    if (rects.some(
      (rect) => rectIntersects(rect, { x: cell.x, y: cell.y, width: cell.width, height: cell.height })
    )) {
      cell.protected = true;
    }
  });
};
var collectSafeComponents = (cells, scene) => {
  if (!cells.length) {
    return [];
  }
  const maxCol = Math.max(...cells.map((cell) => cell.col)) + 1;
  const maxRow = Math.max(...cells.map((cell) => cell.row)) + 1;
  const minCellScore = clamp(numberOr(scene.v2?.layout?.minCellScore, 0.42), 0, 1);
  const minSlotCells = Math.max(1, Math.round(numberOr(scene.v2?.layout?.minSlotCells, 2)));
  const map = new Map(cells.map((cell) => [`${cell.col}:${cell.row}`, cell]));
  const visited = /* @__PURE__ */ new Set();
  const components = [];
  for (const cell of cells) {
    const key = `${cell.col}:${cell.row}`;
    if (visited.has(key) || cell.protected || cell.safeScore < minCellScore) {
      continue;
    }
    const queue = [cell];
    const members = [];
    visited.add(key);
    while (queue.length) {
      const current = queue.shift();
      members.push(current);
      const neighbors = [
        [current.col - 1, current.row],
        [current.col + 1, current.row],
        [current.col, current.row - 1],
        [current.col, current.row + 1]
      ];
      neighbors.forEach(([col, row]) => {
        if (col < 0 || row < 0 || col >= maxCol || row >= maxRow) {
          return;
        }
        const neighborKey = `${col}:${row}`;
        const neighbor = map.get(neighborKey);
        if (!neighbor || visited.has(neighborKey) || neighbor.protected || neighbor.safeScore < minCellScore) {
          return;
        }
        visited.add(neighborKey);
        queue.push(neighbor);
      });
    }
    if (members.length < minSlotCells) {
      continue;
    }
    const x = Math.min(...members.map((member) => member.x));
    const y = Math.min(...members.map((member) => member.y));
    const right = Math.max(...members.map((member) => member.x + member.width));
    const bottom = Math.max(...members.map((member) => member.y + member.height));
    components.push({ x, y, width: right - x, height: bottom - y });
  }
  return components;
};
var scoreSlot = (rect, cells, width, height, preferWiderSlots) => {
  const stats = averageStatsForRect(rect, cells);
  const areaScore = rect.width * rect.height / Math.max(1, width * height);
  const widthBias = preferWiderSlots ? rect.width / Math.max(1, width) : rect.height / Math.max(1, height);
  return areaScore * 2.6 + (1 - stats.averageContrast) * 0.28 + (1 - stats.averageTexture) * 0.28 + widthBias * 0.22;
};
var upsertManualSlots = (slots, cells, scene, width, height) => {
  scene.v2?.slots?.forEach((slotConfig) => {
    const rect = normalizeRect(slotConfig, width, height);
    const stats = averageStatsForRect(rect, cells);
    const next = {
      id: slotConfig.id,
      ...rect,
      score: scoreSlot(rect, cells, width, height, true) + (slotConfig.locked ? 0.4 : 0),
      active: slotConfig.active ?? true,
      preferredRoles: slotConfig.preferredRoles ?? preferredRolesForRect(rect, width, height),
      recommendedTone: stats.recommendedTone,
      recommendedBackdrop: stats.recommendedBackdrop,
      accentColor: stats.accentColor,
      averageLuminance: stats.averageLuminance,
      averageContrast: stats.averageContrast,
      averageTexture: stats.averageTexture
    };
    const existingIndex = slots.findIndex((slot) => slot.id === next.id);
    if (existingIndex >= 0) {
      slots.splice(existingIndex, 1, next);
    } else {
      slots.push(next);
    }
  });
};
var activateSlots = (slots, scene, width) => {
  const activeIds = new Set(scene.v2?.activeSlotIds ?? []);
  const bannedIds = new Set(scene.v2?.bannedSlotIds ?? []);
  const maxSlots = Math.max(1, Math.round(numberOr(scene.v2?.layout?.maxSlots, 4)));
  const mobileSingleSlotBelow = Math.round(numberOr(scene.v2?.layout?.mobileSingleSlotBelow, 640));
  const limit = width <= mobileSingleSlotBelow ? 1 : maxSlots;
  const next = slots.filter((slot) => !bannedIds.has(slot.id)).sort((left, right) => right.score - left.score).map((slot, index) => ({
    ...slot,
    active: activeIds.size ? activeIds.has(slot.id) : (slot.active ?? true) && index < limit
  }));
  if (!next.some((slot) => slot.active) && next.length) {
    next[0] = { ...next[0], active: true };
  }
  return next;
};
var slotRoleAffinity = (slot, role) => {
  const preferenceIndex = slot.preferredRoles.indexOf(role);
  return preferenceIndex === -1 ? 0 : Math.max(0.15, 1 - preferenceIndex * 0.18);
};
var assignBlocksToSlots = (scene, slots, width, height) => {
  const activeSlots = slots.filter((slot) => slot.active);
  const regions = {};
  activeSlots.forEach((slot) => {
    regions[slot.id] = rectToRegion(slot, width, height);
  });
  if (!activeSlots.length) {
    return { blocks: scene.blocks, regions: {} };
  }
  const usage = /* @__PURE__ */ new Map();
  const sortedBlocks = scene.blocks.map((block, blockIndex) => ({ block, blockIndex })).filter(
    (entry) => isTextBlock(entry.block)
  ).map((entry) => ({
    ...entry,
    priority: numberOr(entry.block.v2?.priority, rolePriority(entry.block)),
    role: entry.block.v2?.role ?? resolveRoleFromStyle(entry.block.style)
  }));
  sortedBlocks.sort((left, right) => left.priority - right.priority || left.blockIndex - right.blockIndex);
  const assignments = /* @__PURE__ */ new Map();
  sortedBlocks.forEach(({ block, blockIndex, role }) => {
    const pinned = block.v2?.pinnedSlotId;
    if (pinned && activeSlots.some((slot) => slot.id === pinned)) {
      assignments.set(blockIndex, pinned);
      usage.set(pinned, (usage.get(pinned) ?? 0) + 1);
      return;
    }
    const best = activeSlots.map((slot) => {
      const used = usage.get(slot.id) ?? 0;
      const roleAffinity = slotRoleAffinity(slot, role);
      const widthBonus = role === "body" || role === "lede" ? slot.width / Math.max(1, width) : slot.height / Math.max(1, height);
      return {
        slot,
        score: slot.score * 0.55 + roleAffinity * 0.3 + widthBonus * 0.2 - used * 0.18
      };
    }).sort((left, right) => right.score - left.score)[0]?.slot;
    if (best) {
      assignments.set(blockIndex, best.id);
      usage.set(best.id, (usage.get(best.id) ?? 0) + 1);
    }
  });
  const blocks = scene.blocks.map((block, blockIndex) => {
    const slotId = assignments.get(blockIndex);
    if (!slotId) {
      return block;
    }
    return {
      ...block,
      region: slotId,
      regionOrder: "center-out"
    };
  });
  return { blocks, regions };
};
var buildProtectionRects = (cells) => {
  return cells.filter((cell) => cell.protected).map((cell) => ({ x: cell.x, y: cell.y, width: cell.width, height: cell.height }));
};
var resolveV2PanelColor = (slot, scene) => {
  const tint = scene.v2?.backdrop?.tint ?? slot.accentColor;
  return withOpacity(tint, clamp(numberOr(scene.v2?.backdrop?.panelOpacity, 0.18), 0.06, 0.4));
};
var resolveV2BlockBackdrop = (slot, block, scene) => {
  const requested = block.v2?.backdrop ?? scene.v2?.backdrop?.mode ?? "auto";
  return requested === "auto" ? slot.recommendedBackdrop : requested;
};
var buildV2Plan = (input) => {
  const { scene, width, height } = input;
  if (!scene.v2?.enabled) {
    return null;
  }
  const cells = buildGrid(input);
  const subjectZones = applyManualSubjectZones(cells, scene.v2.subjectZones ?? [], width, height);
  applyProtectionPadding(cells, width, height, Math.max(0, Math.round(numberOr(scene.v2.layout?.subjectPadding, 18))));
  const preferWiderSlots = scene.v2.layout?.preferWiderSlots ?? true;
  const discoveredRects = collectSafeComponents(cells, scene);
  const slots = discoveredRects.map((rect, index) => {
    const stats = averageStatsForRect(rect, cells);
    return {
      id: `auto-slot-${index + 1}`,
      ...rect,
      score: scoreSlot(rect, cells, width, height, preferWiderSlots),
      active: true,
      preferredRoles: preferredRolesForRect(rect, width, height),
      recommendedTone: stats.recommendedTone,
      recommendedBackdrop: stats.recommendedBackdrop,
      accentColor: stats.accentColor,
      averageLuminance: stats.averageLuminance,
      averageContrast: stats.averageContrast,
      averageTexture: stats.averageTexture
    };
  }).filter((slot) => slot.width >= Math.max(48, numberOr(scene.layout?.minSlotWidth, 96)) && slot.height >= 24);
  upsertManualSlots(slots, cells, scene, width, height);
  const activeSlots = activateSlots(slots, scene, width);
  const assignment = assignBlocksToSlots(scene, activeSlots, width, height);
  const debugRects = [];
  activeSlots.forEach((slot) => {
    debugRects.push({
      id: slot.id,
      kind: scene.v2?.slots?.some((manual) => manual.id === slot.id) ? "manual-slot" : "slot",
      x: slot.x,
      y: slot.y,
      width: slot.width,
      height: slot.height,
      label: `${slot.id}${scene.v2?.debug?.showSlotScores ? ` \xB7 ${slot.score.toFixed(2)}` : ""}`,
      score: slot.score,
      active: slot.active
    });
  });
  subjectZones.forEach((rect, index) => {
    debugRects.push({
      id: `subject-zone-${index + 1}`,
      kind: "subject-zone",
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      label: "subject protection",
      active: true
    });
  });
  const activeCount = activeSlots.filter((slot) => slot.active).length;
  const statusText = activeCount ? `V2 auto layout active \xB7 ${activeCount} slot${activeCount === 1 ? "" : "s"} planned` : "V2 auto layout could not find a safe slot";
  return {
    blocks: assignment.blocks,
    regions: assignment.regions,
    slots: activeSlots,
    debugRects,
    protectionRects: buildProtectionRects(cells),
    statusText
  };
};

// src/lib/engine.ts
function buildLinkedSegments(text, links) {
  const matches = [];
  for (const link of links) {
    if (!link.match) continue;
    const idx = text.indexOf(link.match);
    if (idx < 0) continue;
    matches.push({ start: idx, end: idx + link.match.length, href: link.href, alt: link.alt });
  }
  matches.sort((a, b) => a.start - b.start);
  const clean = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    clean.push(m);
    cursor = m.end;
  }
  const segments = [];
  cursor = 0;
  for (const m of clean) {
    if (m.start > cursor) segments.push({ text: text.slice(cursor, m.start) });
    segments.push({ text: text.slice(m.start, m.end), href: m.href, alt: m.alt });
    cursor = m.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}
function createInlineAnchor(doc, href, alt) {
  const a = doc.createElement("a");
  a.className = "pie-inline-link";
  a.href = href;
  if (alt) a.setAttribute("aria-label", alt);
  if (/^https?:\/\//.test(href)) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  return a;
}
function perLineLinksForElement(el, block, cursors) {
  if (!block.links || block.links.length === 0) return void 0;
  const blockText = block.text ?? (block.lines ?? []).join("\n");
  if (!blockText) return void 0;
  const lineText = el.textContent ?? "";
  if (!lineText) return void 0;
  const blockId = el.dataset.blockId ?? "";
  const cursor = cursors.get(blockId) ?? 0;
  const lineStart = blockText.indexOf(lineText, cursor);
  if (lineStart < 0) return void 0;
  const lineEnd = lineStart + lineText.length;
  cursors.set(blockId, lineEnd);
  const result = [];
  for (const link of block.links) {
    if (!link.match) continue;
    const matchStart = blockText.indexOf(link.match);
    if (matchStart < 0) continue;
    const matchEnd = matchStart + link.match.length;
    const overlapStart = Math.max(matchStart, lineStart);
    const overlapEnd = Math.min(matchEnd, lineEnd);
    if (overlapStart >= overlapEnd) continue;
    const localMatch = lineText.slice(overlapStart - lineStart, overlapEnd - lineStart);
    if (localMatch.length === 0) continue;
    result.push({ match: localMatch, href: link.href, alt: link.alt });
  }
  return result.length > 0 ? result : void 0;
}
var isTextBlock2 = (block) => block.kind !== "embed";
var isEmbedBlock = (block) => block.kind === "embed";
var DEFAULT_EMBED_REVEAL_COST = 20;
var DEFAULT_EMBED_GAP_AFTER = 14;
var clamp2 = (value, min, max) => Math.min(max, Math.max(min, value));
var numberOr2 = (value, fallback) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
var textOr = (value, fallback) => typeof value === "string" && value.trim() ? value : fallback;
var objectOrEmpty = (value) => value && typeof value === "object" ? value : {};
var clampProgress = (value) => clamp2(numberOr2(value, 0), 0, 1);
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
  blocks.forEach((block) => {
    if (isTextBlock2(block)) keys.add(block.style);
  });
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
      xStart: clamp2(numberOr2(region.xStart, 0), 0, 1),
      xEnd: clamp2(numberOr2(region.xEnd, 1), 0, 1),
      yStart: clamp2(numberOr2(region.yStart, 0), 0, 1),
      yEnd: clamp2(numberOr2(region.yEnd, 1), 0, 1),
      anchorX: clamp2(numberOr2(region.anchorX, 0.5), 0, 1),
      slotOrder: region.slotOrder ?? "left-to-right",
      minSlotWidth: Math.max(24, numberOr2(region.minSlotWidth, DEFAULT_LAYOUT.minSlotWidth)),
      columnSplit: mergeColumns(DEFAULT_COLUMN_SPLIT, region.columnSplit)
    };
  });
  return resolved;
};
var resolveStageConfig = (stage) => {
  const aspectRatio = numberOr2(stage?.aspectRatio, DEFAULT_STAGE.aspectRatio);
  return {
    aspectRatio: aspectRatio > 0 ? aspectRatio : DEFAULT_STAGE.aspectRatio,
    minHeight: Math.max(0, numberOr2(stage?.minHeight, DEFAULT_STAGE.minHeight)),
    background: textOr(stage?.background, DEFAULT_STAGE.background),
    padding: Math.max(0, numberOr2(stage?.padding, DEFAULT_STAGE.padding)),
    borderRadius: Math.max(0, numberOr2(stage?.borderRadius, DEFAULT_STAGE.borderRadius))
  };
};
var resolveLayoutConfig = (layout) => {
  const minScale = clamp2(numberOr2(layout?.minScale, DEFAULT_LAYOUT.minScale), 0.1, 1);
  return {
    outerPadding: Math.max(0, numberOr2(layout?.outerPadding, DEFAULT_LAYOUT.outerPadding)),
    horizontalPadding: Math.max(0, numberOr2(layout?.horizontalPadding, DEFAULT_LAYOUT.horizontalPadding)),
    verticalPadding: Math.max(0, numberOr2(layout?.verticalPadding, DEFAULT_LAYOUT.verticalPadding)),
    minSlotWidth: Math.max(24, numberOr2(layout?.minSlotWidth, DEFAULT_LAYOUT.minSlotWidth)),
    minScale,
    scaleStep: clamp2(numberOr2(layout?.scaleStep, DEFAULT_LAYOUT.scaleStep), 0.01, 1),
    fallbackBelowWidth: Math.max(0, numberOr2(layout?.fallbackBelowWidth, DEFAULT_LAYOUT.fallbackBelowWidth))
  };
};
var getFontMetrics = (style, width, scale) => {
  const fontSize = clamp2(
    width * style.fontSizeRatio * scale,
    style.minFontSize * scale,
    style.maxFontSize * scale
  );
  const lineHeightPx = Math.max(14, Math.round(fontSize * style.lineHeight));
  const fontStyle = style.fontStyle ?? "normal";
  return {
    fontSize,
    lineHeightPx,
    font: `${fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`
  };
};
var isLayoutCursorComplete = (prepared, cursor) => {
  const segmentCount = Array.isArray(prepared.widths) ? prepared.widths.length : typeof prepared.text === "string" ? 1 : 0;
  return cursor.segmentIndex >= segmentCount;
};
var resolveScrollConfig = (scroll) => {
  const mode = scroll?.mode ?? "static";
  const start = clampProgress(numberOr2(scroll?.start, 0));
  const end = clampProgress(numberOr2(scroll?.end, 1));
  return {
    mode,
    start,
    end: end <= start ? start : end,
    stickyTop: Math.max(0, numberOr2(scroll?.stickyTop, 24))
  };
};
var resolveOptions = (options) => ({
  injectStyles: options?.injectStyles ?? true,
  initialProgress: clampProgress(numberOr2(options?.initialProgress, 0)),
  renderEmbed: options?.renderEmbed
});
var DEFAULT_ITEM_GAP = 4;
var expandBlocks = (blocks) => {
  const result = [];
  blocks.forEach((block, blockIndex) => {
    if (isEmbedBlock(block)) {
      result.push(block);
      return;
    }
    if (Array.isArray(block.lines) && block.lines.length > 0) {
      const marker = block.marker ?? "";
      const baseId = block.id ?? `block-${blockIndex}`;
      const itemGap = block.itemGap ?? DEFAULT_ITEM_GAP;
      const lastIndex = block.lines.length - 1;
      block.lines.forEach((lineText, lineIndex) => {
        const { lines: _lines, marker: _marker, text: _text, itemGap: _ig, styleOverride, ...rest } = block;
        const isLast = lineIndex === lastIndex;
        const mergedOverride = isLast ? styleOverride : { ...styleOverride ?? {}, gapAfter: styleOverride?.gapAfter ?? itemGap };
        result.push({
          ...rest,
          id: `${baseId}-item-${lineIndex}`,
          text: `${marker}${lineText}`,
          ...mergedOverride ? { styleOverride: mergedOverride } : {}
        });
      });
      return;
    }
    if (typeof block.text === "string") {
      result.push(block);
      return;
    }
    console.warn(
      `[pretext-image-engine] block ${block.id ?? blockIndex} has neither text nor lines; skipping.`
    );
  });
  return result;
};
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
  const resolvedReveal = {
    ...DEFAULT_REVEAL,
    ...objectOrEmpty(scene.reveal)
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
      alphaThreshold: Math.max(0, numberOr2(scene.assets.alphaThreshold, 20)),
      fit: scene.assets.fit ?? "cover"
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
    v2: scene.v2
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
var srgbChannelToLinear2 = (value) => {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
};
var relativeLuminance2 = (r, g, b) => 0.2126 * srgbChannelToLinear2(r) + 0.7152 * srgbChannelToLinear2(g) + 0.0722 * srgbChannelToLinear2(b);
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
  if (image.complete) {
    if (image.naturalWidth > 0) {
      return;
    }
    throw new Error(`Unable to load ${image.currentSrc || image.src}`);
  }
  await new Promise((resolve, reject) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve();
    };
    const fail = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new Error(`Unable to load ${image.currentSrc || image.src}`));
    };
    const cleanup = () => {
      image.removeEventListener("load", finish);
      image.removeEventListener("error", fail);
      if (pollTimer !== null) {
        clearInterval(pollTimer);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", fail, { once: true });
    const pollTimer = window.setInterval(() => {
      if (!image.complete) {
        return;
      }
      if (image.naturalWidth > 0) {
        finish();
        return;
      }
      fail();
    }, 50);
    const timeoutId = window.setTimeout(() => {
      if (image.complete && image.naturalWidth > 0) {
        finish();
        return;
      }
      fail();
    }, 6e4);
    if (typeof image.decode === "function") {
      void image.decode().then(finish).catch(() => {
        if (image.complete && image.naturalWidth > 0) {
          finish();
        }
      });
    }
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
var withOpacity2 = (color, opacity) => {
  const clampedOpacity = clamp2(opacity, 0, 1);
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
  const columns = clamp2(requestedColumns, 1, split.maxColumns);
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
var buildFallbackBlock = (doc, block, style, blockIndex) => {
  const tag = block.style === "heading" ? "h3" : "p";
  const element = doc.createElement(tag);
  element.className = `pie-fallback-block pie-fallback-${sanitizeStyleName(block.style)}`;
  element.dataset.blockId = block.id ?? `block-${blockIndex}`;
  const rawText = block.text ?? "";
  element.textContent = style.textTransform === "uppercase" ? rawText.toUpperCase() : rawText;
  return element;
};
var getBlockProgress = (progress, scroll) => {
  if (scroll.mode === "static") {
    return 1;
  }
  if (scroll.end <= scroll.start) {
    return progress >= scroll.start ? 1 : 0;
  }
  return clamp2((progress - scroll.start) / (scroll.end - scroll.start), 0, 1);
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
  element.style.font = `${line.style.fontStyle ?? "normal"} ${line.style.fontWeight} ${Math.round(line.fontSize)}px ${line.style.fontFamily}`;
  element.style.lineHeight = `${line.lineHeightPx}px`;
  element.style.letterSpacing = `${line.style.letterSpacing}px`;
  element.style.textTransform = line.style.textTransform;
  element.style.padding = `${line.appearance.paddingY}px ${line.appearance.paddingX}px`;
  element.style.borderRadius = `${line.appearance.radius}px`;
  element.style.background = line.appearance.backgroundColor ?? "transparent";
  element.style.boxShadow = line.appearance.backgroundColor ? `0 0 ${line.style.minFontSize}px ${line.appearance.backgroundColor}` : "none";
  const textShadow = line.appearance.shadowBlur > 0 ? `${line.appearance.shadowOffsetX}px ${line.appearance.shadowOffsetY}px ${line.appearance.shadowBlur}px ${line.appearance.shadowColor}` : "none";
  element.style.textShadow = `var(--pie-line-text-shadow, ${textShadow})`;
  element.style.userSelect = selectable && !sticky ? "text" : "none";
  element.dataset.blockId = line.blockId;
  element.dataset.lineId = line.id;
  element.dataset.scrollMode = line.scroll.mode;
  if (sticky) {
    element.setAttribute("aria-hidden", "true");
  }
  return element;
};
var createPanelElement = (doc, panel) => {
  const element = doc.createElement("div");
  element.className = "pie-panel";
  element.dataset.panelId = panel.id;
  element.style.left = `${panel.x}px`;
  element.style.top = `${panel.y}px`;
  element.style.width = `${panel.width}px`;
  element.style.height = `${panel.height}px`;
  element.style.background = panel.color;
  element.style.backdropFilter = `blur(${panel.blur}px)`;
  element.style.borderRadius = `${panel.radius}px`;
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
  panelLayer;
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
  resizeDebounce = 0;
  activeLayout = null;
  lineElements = /* @__PURE__ */ new Map();
  renderListeners = /* @__PURE__ */ new Set();
  peakProgress = 0;
  ready;
  state;
  constructor(container, scene, options) {
    this.doc = getSafeDocument(container);
    this.options = resolveOptions(options);
    ensureEngineStyles(this.doc, this.options.injectStyles);
    this.container = container;
    this.scene = resolveScene(scene);
    const initial = clampProgress(this.options.initialProgress);
    this.peakProgress = initial;
    this.state = {
      layoutMode: "masked",
      width: 0,
      height: 0,
      scale: 1,
      progress: initial
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
    this.baseImage.setAttribute("aria-hidden", "true");
    this.baseImage.decoding = "async";
    this.overlayImage = this.doc.createElement("img");
    this.overlayImage.className = "pie-overlay";
    this.overlayImage.alt = "";
    this.overlayImage.setAttribute("aria-hidden", "true");
    this.overlayImage.decoding = "async";
    this.lineLayer = this.doc.createElement("div");
    this.lineLayer.className = "pie-line-layer";
    this.panelLayer = this.doc.createElement("div");
    this.panelLayer.className = "pie-panel-layer";
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
    this.stage.append(this.baseImage, this.panelLayer, this.lineLayer, this.debugLayer, this.overlayImage, this.status);
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
    const clamped = clampProgress(progress);
    const effective = this.scene.reveal.monotonic ? Math.max(this.peakProgress, clamped) : clamped;
    this.peakProgress = effective;
    this.state.progress = effective;
    this.applyProgressProjection();
  }
  onRender(listener) {
    this.renderListeners.add(listener);
    return () => {
      this.renderListeners.delete(listener);
    };
  }
  attachScrollSource(target = this.doc.defaultView ?? window, options = {}) {
    const throttle = options.throttle ?? "raf";
    const easing = options.easing ?? ((t) => t);
    let rafId = 0;
    let frameQueued = false;
    const read = () => {
      if (target === this.doc.defaultView || target === window) {
        const scroller = this.doc.scrollingElement ?? this.doc.documentElement;
        const total2 = scroller.scrollHeight - (this.doc.defaultView?.innerHeight ?? window.innerHeight);
        return total2 > 0 ? clampProgress(scroller.scrollTop / total2) : 0;
      }
      const el = target;
      const total = el.scrollHeight - el.clientHeight;
      return total > 0 ? clampProgress(el.scrollTop / total) : 0;
    };
    const tick = () => {
      frameQueued = false;
      this.setProgress(easing(read()));
    };
    const onScroll = () => {
      if (throttle === "none") {
        tick();
        return;
      }
      if (frameQueued) return;
      frameQueued = true;
      rafId = requestAnimationFrame(tick);
    };
    target.addEventListener("scroll", onScroll, { passive: true });
    tick();
    return () => {
      target.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }
  render() {
    const runtimeDebug = globalThis;
    if (!this.baseImage.naturalWidth) {
      runtimeDebug.__pieLastRender = { reason: "base-image-not-ready" };
      return;
    }
    const width = Math.max(0, Math.round(this.stage.clientWidth));
    const height = Math.max(0, Math.round(this.stage.clientHeight));
    if (!width || !height) {
      runtimeDebug.__pieLastRender = { reason: "stage-size-zero", width, height };
      return;
    }
    const fallbackWidthBasis = Math.max(
      0,
      Math.round(this.doc.defaultView?.innerWidth ?? width)
    );
    runtimeDebug.__pieLastRender = {
      reason: "entered-render",
      width,
      height,
      preserveFullText: this.scene.resize.preserveFullText,
      fallbackMode: this.scene.resize.fallbackMode,
      fallbackBelowWidth: this.scene.layout.fallbackBelowWidth,
      fallbackWidthBasis,
      fallbackOnOverflow: this.scene.resize.fallbackOnOverflow,
      v2Enabled: Boolean(this.scene.v2?.enabled)
    };
    this.state.width = width;
    this.state.height = height;
    this.root.dataset.selectable = String(this.scene.interaction.selectable);
    this.root.dataset.selectionEnabled = String(
      this.scene.interaction.selectable && this.scene.colors.selection.enabled
    );
    this.root.style.setProperty("--pie-selection-bg", this.scene.colors.selection.background);
    this.root.style.setProperty("--pie-selection-color", this.scene.colors.selection.color);
    this.syncCanvasBuffers(width, height);
    const v2Plan = this.scene.v2?.enabled ? buildV2Plan({
      scene: this.scene,
      width,
      height,
      basePixels: this.baseContext.getImageData(0, 0, width, height).data,
      overlayPixels: this.scene.assets.overlaySrc ? this.overlayContext.getImageData(0, 0, width, height).data : null
    }) : null;
    if (v2Plan && !this.scene.assets.overlaySrc) {
      this.applyProtectionMask(v2Plan.protectionRects);
    }
    const canFallback = this.scene.resize.preserveFullText && this.scene.resize.fallbackMode === "below";
    if (canFallback && fallbackWidthBasis <= this.scene.layout.fallbackBelowWidth) {
      runtimeDebug.__pieLastRender = {
        ...runtimeDebug.__pieLastRender ?? {},
        reason: "fallback-below-width",
        width,
        height,
        fallbackWidthBasis
      };
      this.applyFallback(this.scene.resize.fallbackLabel);
      return;
    }
    const candidates = buildScaleCandidates(this.scene.layout);
    let bestPartial = null;
    for (const scale of candidates) {
      const result = this.measureMaskedLayout(width, height, scale, v2Plan?.blocks, v2Plan?.regions, v2Plan?.slots);
      if (result.renderedLines > 0 && !result.overflowed) {
        runtimeDebug.__pieLastRender = {
          ...runtimeDebug.__pieLastRender ?? {},
          reason: "applied-masked-layout",
          renderedLines: result.renderedLines,
          overflowed: result.overflowed,
          scale
        };
        this.applyMasked(result, result.statusText ?? v2Plan?.statusText ?? "Masked layout active");
        return;
      }
      if (bestPartial === null || result.renderedLines > bestPartial.renderedLines) {
        bestPartial = result;
      }
    }
    if (canFallback && this.scene.resize.fallbackOnOverflow) {
      runtimeDebug.__pieLastRender = {
        ...runtimeDebug.__pieLastRender ?? {},
        reason: "fallback-after-measurement",
        bestPartialRenderedLines: bestPartial?.renderedLines ?? 0
      };
      this.applyFallback(this.scene.resize.fallbackLabel);
      return;
    }
    if (bestPartial !== null && bestPartial.renderedLines > 0) {
      runtimeDebug.__pieLastRender = {
        ...runtimeDebug.__pieLastRender ?? {},
        reason: "applied-partial-layout",
        renderedLines: bestPartial.renderedLines,
        overflowed: bestPartial.overflowed,
        fallbackOnOverflow: this.scene.resize.fallbackOnOverflow
      };
      this.applyMasked(bestPartial, bestPartial.statusText ?? "Text clipped inside the image at this size.");
      return;
    }
    if (canFallback) {
      runtimeDebug.__pieLastRender = {
        ...runtimeDebug.__pieLastRender ?? {},
        reason: "fallback-no-readable-slots"
      };
      this.applyFallback("No readable slots were available inside the overlay.");
      return;
    }
    runtimeDebug.__pieLastRender = {
      ...runtimeDebug.__pieLastRender ?? {},
      reason: "applied-empty-layout"
    };
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
          active: rect.active
        })) ?? [],
        overflowed: true,
        renderedLines: 0,
        scale: bestPartial?.scale ?? candidates.at(-1) ?? 1,
        statusText: v2Plan?.statusText
      },
      v2Plan?.statusText ?? "No readable slots were available inside the overlay."
    );
  }
  destroy() {
    if (this.pendingFrame) {
      cancelAnimationFrame(this.pendingFrame);
    }
    if (this.resizeDebounce) {
      clearTimeout(this.resizeDebounce);
      this.resizeDebounce = 0;
    }
    this.resizeObserver?.disconnect();
    this.renderListeners.clear();
    this.container.replaceChildren();
  }
  attachResizeObserver() {
    if ("ResizeObserver" in window) {
      let firstFire = true;
      this.resizeObserver = new ResizeObserver(() => {
        if (firstFire) {
          firstFire = false;
          this.render();
          return;
        }
        if (this.resizeDebounce) clearTimeout(this.resizeDebounce);
        this.resizeDebounce = window.setTimeout(() => {
          this.resizeDebounce = 0;
          this.render();
        }, 120);
      });
      this.resizeObserver.observe(this.stage);
    }
  }
  async loadAssets() {
    const signature = `${this.scene.assets.baseSrc}::${this.scene.assets.overlaySrc}`;
    this.baseImage.style.objectFit = this.scene.assets.fit;
    this.overlayImage.style.objectFit = this.scene.assets.fit;
    this.overlayImage.hidden = !this.scene.assets.overlaySrc;
    if (signature === this.imageSignature && this.baseImage.naturalWidth && (!this.scene.assets.overlaySrc || this.overlayImage.naturalWidth)) {
      this.syncStageAppearance();
      return;
    }
    this.imageSignature = signature;
    this.baseImage.src = this.scene.assets.baseSrc;
    if (this.scene.assets.overlaySrc) {
      this.overlayImage.src = this.scene.assets.overlaySrc;
      await Promise.all([waitForImage(this.baseImage), waitForImage(this.overlayImage)]);
    } else {
      this.overlayImage.removeAttribute("src");
      await waitForImage(this.baseImage);
    }
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
    this.overlayContext.clearRect(0, 0, width, height);
    if (this.scene.assets.overlaySrc && this.overlayImage.naturalWidth) {
      drawFittedImage(this.overlayContext, this.overlayImage, width, height, this.scene.assets.fit);
    }
  }
  applyProtectionMask(rects) {
    if (!rects.length || typeof this.overlayContext.fillRect !== "function") {
      return;
    }
    if (typeof this.overlayContext.save === "function") {
      this.overlayContext.save();
    }
    this.overlayContext.fillStyle = "rgba(255, 255, 255, 1)";
    rects.forEach((rect) => {
      this.overlayContext.fillRect(rect.x, rect.y, rect.width, rect.height);
    });
    if (typeof this.overlayContext.restore === "function") {
      this.overlayContext.restore();
    }
  }
  sampleLuminance(x, y, width, height) {
    const startX = clamp2(Math.floor(x), 0, this.baseCanvas.width - 1);
    const startY = clamp2(Math.floor(y), 0, this.baseCanvas.height - 1);
    const sampleWidth = clamp2(Math.ceil(width), 1, this.baseCanvas.width - startX);
    const sampleHeight = clamp2(Math.ceil(height), 1, this.baseCanvas.height - startY);
    const { data } = this.baseContext.getImageData(startX, startY, sampleWidth, sampleHeight);
    const stride = Math.max(1, Math.floor(Math.max(sampleWidth, sampleHeight) / 24));
    let total = 0;
    let count = 0;
    for (let yy = 0; yy < sampleHeight; yy += stride) {
      for (let xx = 0; xx < sampleWidth; xx += stride) {
        const offset = (yy * sampleWidth + xx) * 4;
        total += relativeLuminance2(data[offset], data[offset + 1], data[offset + 2]);
        count++;
      }
    }
    return count ? total / count : 0;
  }
  resolveLineAppearance(lineX, lineY, lineWidth, lineHeightPx, style, block, slotPlan = null) {
    const textConfig = this.scene.colors.text;
    const blockHighlight = mergeHighlight(style.highlight, block.highlight);
    const shadow = this.scene.colors.shadow;
    const sample = this.sampleLuminance(
      lineX,
      lineY,
      lineWidth + blockHighlight.paddingX * 2,
      lineHeightPx + blockHighlight.paddingY * 2
    );
    const requestedTone = block.v2?.preferredTone ?? this.scene.v2?.colors?.forceTone ?? "auto";
    const useDarkText = requestedTone === "dark" ? true : requestedTone === "light" ? false : slotPlan ? slotPlan.recommendedTone === "dark" : textConfig.mode === "auto" ? sample >= textConfig.luminanceThreshold : false;
    const v2Colors = this.scene.v2?.colors;
    const textColor = textConfig.mode === "auto" || slotPlan ? useDarkText ? v2Colors?.darkColor ?? textConfig.darkColor : v2Colors?.lightColor ?? textConfig.lightColor : textConfig.color;
    const resolvedBackdrop = slotPlan ? resolveV2BlockBackdrop(slotPlan, block, this.scene) : blockHighlight.enabled && blockHighlight.mode !== "off" ? "line" : "shadow";
    let backgroundColor = null;
    if (resolvedBackdrop === "line" && blockHighlight.enabled && blockHighlight.mode !== "off") {
      const highlightColor = blockHighlight.mode === "auto" ? useDarkText ? blockHighlight.lightColor : blockHighlight.darkColor : blockHighlight.color;
      backgroundColor = withOpacity2(highlightColor, blockHighlight.opacity);
    }
    return {
      textColor,
      backgroundColor,
      shadowColor: shadow.color,
      shadowBlur: shadow.enabled || resolvedBackdrop === "shadow" ? shadow.blur : 0,
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
    const startY = clamp2(
      Math.floor(bandTop - this.scene.layout.verticalPadding),
      0,
      this.overlayCanvas.height - 1
    );
    const endY = clamp2(
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
  measureMaskedLayout(width, height, scale, blockSource = this.scene.blocks, regionSource, plannedSlots) {
    const lines = [];
    const embeds = [];
    const blocks = [];
    const debugSlots = [];
    const resolvedRegions = regionSource ? resolveRegions(regionSource) : this.scene.regions;
    let globalCursor = this.scene.layout.outerPadding;
    const regionCursors = /* @__PURE__ */ new Map();
    if (this.scene.debug.enabled && this.scene.debug.showRegions && plannedSlots?.length) {
      plannedSlots.forEach((slot) => {
        debugSlots.push({
          x: slot.x,
          y: slot.y,
          width: slot.width,
          height: slot.height,
          label: slot.id,
          kind: "slot",
          active: slot.active
        });
      });
    }
    for (const [blockIndex, block] of blockSource.entries()) {
      const blockId = block.id ?? `block-${blockIndex}`;
      if (isEmbedBlock(block)) {
        const region2 = block.region ? resolvedRegions[block.region] ?? null : null;
        const regionTop2 = region2 ? Math.max(this.scene.layout.outerPadding, Math.round(region2.yStart * height)) : this.scene.layout.outerPadding;
        const regionBottom2 = region2 ? Math.min(height - this.scene.layout.outerPadding, Math.round(region2.yEnd * height)) : height - this.scene.layout.outerPadding;
        let cursorTop2 = region2 ? regionCursors.get(block.region) ?? regionTop2 : globalCursor;
        const REFERENCE_STAGE_WIDTH = 1200;
        const stageRatio = width / REFERENCE_STAGE_WIDTH;
        const embedWidth = Math.max(1, Math.round(block.width * stageRatio));
        const embedHeight = Math.max(1, Math.round(block.height * stageRatio));
        const gapAfter = Math.max(0, block.gapAfter ?? DEFAULT_EMBED_GAP_AFTER);
        const regionLeft = region2 ? Math.max(this.scene.layout.outerPadding, Math.round(region2.xStart * width)) : this.scene.layout.outerPadding;
        const regionRight = region2 ? Math.min(width - this.scene.layout.outerPadding, Math.round(region2.xEnd * width)) : width - this.scene.layout.outerPadding;
        const anchor = region2 ? region2.anchorX : 0.5;
        const usableWidth = Math.max(1, regionRight - regionLeft);
        const effectiveWidth = Math.min(embedWidth, usableWidth);
        const desiredCenter = regionLeft + anchor * usableWidth;
        let embedX = Math.round(desiredCenter - effectiveWidth / 2);
        if (embedX < regionLeft) embedX = regionLeft;
        if (embedX + effectiveWidth > regionRight) embedX = regionRight - effectiveWidth;
        if (cursorTop2 + embedHeight > regionBottom2) {
          blocks.push({
            id: blockId,
            blockIndex,
            scroll: resolveScrollConfig(void 0),
            firstLineId: null,
            slotId: block.region ?? null
          });
          return {
            lines,
            embeds,
            blocks,
            debugSlots,
            overflowed: true,
            renderedLines: lines.length,
            scale,
            statusText: plannedSlots?.length ? `V2 auto layout active \xB7 ${plannedSlots.filter((slot) => slot.active).length} slot${plannedSlots.filter((slot) => slot.active).length === 1 ? "" : "s"} planned` : void 0
          };
        }
        embeds.push({
          id: blockId,
          blockId,
          blockIndex,
          config: block,
          x: embedX,
          y: cursorTop2,
          width: effectiveWidth,
          height: embedHeight,
          slotId: block.region ?? null,
          revealCost: Math.max(1, Math.round(block.revealCost ?? DEFAULT_EMBED_REVEAL_COST))
        });
        blocks.push({
          id: blockId,
          blockIndex,
          scroll: resolveScrollConfig(void 0),
          firstLineId: null,
          slotId: block.region ?? null
        });
        cursorTop2 += embedHeight + gapAfter;
        if (region2 && block.region) {
          regionCursors.set(block.region, cursorTop2);
        } else {
          globalCursor = cursorTop2;
        }
        continue;
      }
      const style = this.resolveBlockStyle(block);
      const rawBlockText = block.text ?? "";
      const text = style.textTransform === "uppercase" ? rawBlockText.toUpperCase() : rawBlockText;
      const { font, fontSize, lineHeightPx } = getFontMetrics(style, width, scale);
      const prepared = (0, import_pretext.prepareWithSegments)(text, font);
      const region = block.region ? resolvedRegions[block.region] ?? null : null;
      const slotPlan = block.region ? plannedSlots?.find((slot) => slot.id === block.region) ?? null : null;
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
        const rawSlots = this.getTransparentSlots(bandTop, bandBottom, region);
        const slots = this.orderSlots(rawSlots, block, style, region);
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
            block,
            slotPlan
          );
          const backdropMode = slotPlan ? resolveV2BlockBackdrop(slotPlan, block, this.scene) : appearance.backgroundColor ? "line" : "shadow";
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
            panelColor: slotPlan && backdropMode === "panel" ? resolveV2PanelColor(slotPlan, this.scene) : null
          });
          blockLineIndex += 1;
          cursor = line.end;
          placed = true;
          if (isLayoutCursorComplete(prepared, cursor)) {
            blockFinished = true;
            break;
          }
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
        firstLineId: blockLineCount > 0 ? lines[blockLineStart].id : null,
        slotId: block.region ?? null
      });
      if (!blockFinished) {
        return {
          lines,
          embeds,
          blocks,
          debugSlots,
          overflowed: true,
          renderedLines: lines.length,
          scale,
          statusText: plannedSlots?.length ? `V2 auto layout active \xB7 ${plannedSlots.filter((slot) => slot.active).length} slot${plannedSlots.filter((slot) => slot.active).length === 1 ? "" : "s"} planned` : void 0
        };
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
      statusText: plannedSlots?.length ? `V2 auto layout active \xB7 ${plannedSlots.filter((slot) => slot.active).length} slot${plannedSlots.filter((slot) => slot.active).length === 1 ? "" : "s"} planned` : void 0
    };
  }
  maybeAccumulatePanel(line, panelGroups) {
    if (line.backdropMode !== "panel" || !line.panelColor) return;
    const key = line.slotId ?? line.blockId;
    const current = panelGroups.get(key);
    const paddedLeft = Math.max(0, line.x - Math.max(8, line.appearance.paddingX * 2));
    const paddedTop = Math.max(0, line.y - Math.max(6, line.appearance.paddingY * 2));
    const paddedRight = line.x + line.width + Math.max(8, line.appearance.paddingX * 2);
    const paddedBottom = line.y + line.lineHeightPx + Math.max(6, line.appearance.paddingY * 2);
    if (current) {
      current.x = Math.min(current.x, paddedLeft);
      current.y = Math.min(current.y, paddedTop);
      current.right = Math.max(current.right, paddedRight);
      current.bottom = Math.max(current.bottom, paddedBottom);
    } else {
      panelGroups.set(key, {
        x: paddedLeft,
        y: paddedTop,
        right: paddedRight,
        bottom: paddedBottom,
        color: line.panelColor
      });
    }
  }
  applyMasked(result, statusText = "Masked layout active") {
    this.state.layoutMode = "masked";
    this.state.scale = result.scale;
    this.activeLayout = result;
    this.root.dataset.mode = "masked";
    this.lineElements.clear();
    this.panelLayer.replaceChildren();
    this.lineLayer.replaceChildren();
    this.debugLayer.replaceChildren();
    this.stickyInner.replaceChildren();
    const lineFragment = this.doc.createDocumentFragment();
    const panelFragment = this.doc.createDocumentFragment();
    const panelGroups = /* @__PURE__ */ new Map();
    let __lineIdx = 0;
    let __embedIdx = 0;
    const __appendNextLine = () => {
      const line = result.lines[__lineIdx++];
      const element = createLineElement(this.doc, line, this.scene.interaction.selectable);
      this.lineElements.set(line.id, element);
      lineFragment.append(element);
      this.maybeAccumulatePanel(line, panelGroups);
    };
    const __appendNextEmbed = () => {
      const embed = result.embeds[__embedIdx++];
      const container = this.doc.createElement("div");
      container.className = `pie-embed pie-embed-${sanitizeStyleName(embed.config.embedKind)}`;
      container.dataset.embedId = embed.id;
      container.dataset.embedKind = embed.config.embedKind;
      container.dataset.revealCost = String(embed.revealCost);
      container.style.position = "absolute";
      container.style.left = `${embed.x}px`;
      container.style.top = `${embed.y}px`;
      container.style.width = `${embed.width}px`;
      container.style.height = `${embed.height}px`;
      const embedScale = embed.width / Math.max(1, embed.config.width);
      container.style.setProperty("--pie-embed-scale", embedScale.toFixed(4));
      if (this.scene.interaction.selectable) {
        container.style.userSelect = "text";
      }
      if (this.options.renderEmbed) {
        try {
          this.options.renderEmbed(embed.config, container);
        } catch (err) {
          console.error("[pretext-image-engine] renderEmbed threw:", err);
        }
      }
      lineFragment.append(container);
    };
    while (__lineIdx < result.lines.length || __embedIdx < result.embeds.length) {
      const nextLineBI = result.lines[__lineIdx]?.blockIndex ?? Infinity;
      const nextEmbedBI = result.embeds[__embedIdx]?.blockIndex ?? Infinity;
      if (nextLineBI <= nextEmbedBI) __appendNextLine();
      else __appendNextEmbed();
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
          radius: this.scene.v2?.backdrop?.panelRadius ?? 22
        })
      );
    });
    this.panelLayer.append(panelFragment);
    this.lineLayer.append(lineFragment);
    if (this.scene.debug.enabled && (this.scene.debug.showSlots || this.scene.debug.showRegions)) {
      const debugFragment = this.doc.createDocumentFragment();
      if (this.scene.debug.showSlots) {
        result.debugSlots.forEach((slot) => {
          const element = this.doc.createElement("div");
          element.className = slot.kind === "subject-zone" || slot.kind === "protection" ? "pie-region" : "pie-slot";
          if (slot.kind === "manual-slot") {
            element.dataset.variant = "manual";
          }
          if (slot.active === false) {
            element.dataset.active = "false";
          }
          element.style.left = `${slot.x}px`;
          element.style.top = `${slot.y}px`;
          element.style.width = `${slot.width}px`;
          element.style.height = `${slot.height}px`;
          if (slot.label) {
            const label = this.doc.createElement("span");
            label.className = "pie-debug-label";
            label.textContent = slot.label;
            element.append(label);
          }
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
    this.statusBadge.textContent = result.statusText ?? statusText;
    if (this.scene.reveal.unit !== "line") {
      const blockCursors = /* @__PURE__ */ new Map();
      this.lineElements.forEach((el) => {
        const blockId = el.dataset.blockId;
        const block = blockId ? this.scene.blocks.find((b) => !isEmbedBlock(b) && b.id === blockId) : void 0;
        const perLineLinks = block ? perLineLinksForElement(el, block, blockCursors) : void 0;
        this.splitTextIntoUnits(
          el,
          this.scene.reveal.unit,
          perLineLinks
        );
      });
    }
    this.applyProgressProjection();
    this.emitRender();
  }
  applyProgressProjection() {
    const unit = this.scene.reveal.unit;
    if (unit !== "line") {
      this.applyUnitLevelProjection();
      return;
    }
    if (this.state.layoutMode !== "masked" || !this.activeLayout) {
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
  applyUnitLevelProjection() {
    this.stickyInner.replaceChildren();
    const units = [];
    const pushFrom = (root) => {
      root.querySelectorAll(".pie-char, .pie-word, .pie-embed").forEach((el) => {
        if (el.classList.contains("pie-embed")) {
          const cost = Number(el.dataset.revealCost);
          units.push({
            el,
            slots: Number.isFinite(cost) && cost > 0 ? cost : DEFAULT_EMBED_REVEAL_COST,
            atomic: true
          });
        } else {
          units.push({ el, slots: 1, atomic: false });
        }
      });
    };
    pushFrom(this.lineLayer);
    pushFrom(this.fallbackContent);
    if (units.length === 0) return;
    const totalSlots = units.reduce((sum, u) => sum + u.slots, 0);
    const target = Math.floor(this.state.progress * totalSlots);
    let cumulative = 0;
    for (const unit of units) {
      const visible = cumulative < target;
      if (visible) {
        if (!unit.el.classList.contains("pie-visible")) unit.el.classList.add("pie-visible");
      } else {
        if (unit.el.classList.contains("pie-visible")) unit.el.classList.remove("pie-visible");
      }
      cumulative += unit.slots;
    }
  }
  splitTextIntoUnits(el, unit, links) {
    const text = el.textContent ?? "";
    if (!text) return;
    el.textContent = "";
    const className = unit === "char" ? "pie-char" : "pie-word";
    const segments = links && links.length > 0 ? buildLinkedSegments(text, links) : [{ text, href: void 0, alt: void 0 }];
    for (const segment of segments) {
      const parent = segment.href ? createInlineAnchor(this.doc, segment.href, segment.alt) : el;
      if (parent !== el) el.appendChild(parent);
      const tokens = unit === "char" ? [...segment.text] : segment.text.match(/\s+|\S+/g) ?? [];
      for (const token of tokens) {
        if (unit === "word" && /^\s+$/.test(token)) {
          parent.appendChild(this.doc.createTextNode(token));
          continue;
        }
        const span = this.doc.createElement("span");
        span.className = className;
        span.textContent = token;
        parent.appendChild(span);
      }
    }
  }
  emitRender() {
    this.root.dataset.revealUnit = this.scene.reveal.unit;
    this.renderListeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error("[pretext-image-engine] onRender listener threw:", err);
      }
    });
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
    this.scene.blocks.forEach((block, blockIndex) => {
      if (isEmbedBlock(block)) {
        const container = this.doc.createElement("div");
        container.className = `pie-embed pie-embed-${sanitizeStyleName(block.embedKind)} pie-embed-fallback`;
        container.dataset.embedId = block.id ?? `block-${blockIndex}`;
        container.dataset.embedKind = block.embedKind;
        container.dataset.revealCost = String(
          Math.max(1, Math.round(block.revealCost ?? DEFAULT_EMBED_REVEAL_COST))
        );
        if (this.options?.renderEmbed) {
          try {
            this.options.renderEmbed(block, container);
          } catch (err) {
            console.error("[pretext-image-engine] renderEmbed threw:", err);
          }
        }
        fragment.append(container);
        return;
      }
      fragment.append(buildFallbackBlock(this.doc, block, this.resolveBlockStyle(block), blockIndex));
    });
    this.fallbackContent.append(fragment);
    this.fallbackLabel.textContent = label;
    this.fallback.hidden = false;
    this.statusBadge.textContent = "Fallback layout active";
    if (this.scene.reveal.unit !== "line") {
      const blockCursors = /* @__PURE__ */ new Map();
      this.fallbackContent.querySelectorAll(".pie-fallback-block").forEach((el) => {
        const blockId = el.dataset.blockId;
        const block = blockId ? this.scene.blocks.find((b) => !isEmbedBlock(b) && b.id === blockId) : void 0;
        const perLineLinks = block ? perLineLinksForElement(el, block, blockCursors) : void 0;
        this.splitTextIntoUnits(
          el,
          this.scene.reveal.unit,
          perLineLinks
        );
      });
      this.applyProgressProjection();
    }
    this.emitRender();
  }
};
var createPretextImageEngine = (container, scene, options) => new PretextImageEngine(container, scene, options);

// src/lib/scene.ts
function createScene(input, overrides = {}) {
  const base = {
    meta: {
      name: input.name ?? "Scene",
      alt: input.alt
    },
    assets: {
      baseSrc: input.baseSrc,
      overlaySrc: input.overlaySrc,
      fit: "contain",
      alphaThreshold: 20
    },
    stage: {
      aspectRatio: input.aspectRatio ?? 3 / 2,
      minHeight: 0,
      background: "transparent",
      padding: 0,
      borderRadius: 0
    },
    resize: {
      preserveFullText: true,
      fallbackMode: "below",
      fallbackLabel: "",
      fallbackOnOverflow: true
    },
    interaction: {
      selectable: true
    },
    reveal: {
      unit: "char",
      monotonic: true
    },
    blocks: input.blocks
  };
  return {
    ...base,
    ...overrides,
    meta: { ...base.meta, ...overrides.meta },
    assets: { ...base.assets, ...overrides.assets },
    stage: { ...base.stage, ...overrides.stage },
    resize: { ...base.resize, ...overrides.resize },
    interaction: { ...base.interaction, ...overrides.interaction },
    reveal: { ...base.reveal, ...overrides.reveal }
  };
}
function composeScene(defaults, perImage) {
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
    colors: perImage.colors ? {
      ...defaults.colors,
      ...perImage.colors,
      text: { ...defaults.colors?.text, ...perImage.colors?.text },
      highlight: {
        ...defaults.colors?.highlight,
        ...perImage.colors?.highlight
      },
      shadow: {
        ...defaults.colors?.shadow,
        ...perImage.colors?.shadow
      },
      selection: {
        ...defaults.colors?.selection,
        ...perImage.colors?.selection
      }
    } : defaults.colors,
    styles: perImage.styles ? mergeStyles(defaults.styles, perImage.styles) : defaults.styles,
    regions: perImage.regions,
    blocks: perImage.blocks
  };
}
function mergeStyles(defaultStyles, perImage) {
  if (!defaultStyles) return perImage;
  if (!perImage) return defaultStyles;
  const merged = { ...defaultStyles };
  for (const [name, override] of Object.entries(perImage)) {
    merged[name] = { ...merged[name], ...override };
  }
  return merged;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PretextImageEngine,
  composeScene,
  createPretextImageEngine,
  createScene
});
