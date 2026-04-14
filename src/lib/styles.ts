export const ENGINE_STYLE_ID = 'pretext-image-engine-styles'

export const ENGINE_CSS = `
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
`
