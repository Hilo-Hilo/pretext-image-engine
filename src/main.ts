import './style.css'

import sampleSceneRaw from './demo/sample-scene.json?raw'
import { createPretextImageEngine, type ImageEngineSceneConfig, type ImageTextEngine } from './lib'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('#app not found')
}

app.innerHTML = `
  <main class="shell">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Pretext Image Engine</p>
        <h1>Image-aware text layout without covering the subject.</h1>
        <p class="lede">
          A standalone engine for base images plus overlay masks, powered by
          <code>@chenglou/pretext</code>. The demo below lets you edit the scene JSON,
          resize the stage, and verify masked vs fallback behavior.
        </p>
      </div>
      <div class="hero-notes">
        <div class="stat">
          <span>Engine focus</span>
          <strong>Masked editorial text on images</strong>
        </div>
        <div class="stat">
          <span>Config depth</span>
          <strong>Regions, colors, highlight, columns, fallback</strong>
        </div>
      </div>
    </section>

    <section class="workspace">
      <aside class="control-panel">
        <div class="panel-block">
          <div class="panel-heading">
            <p class="eyebrow">Controls</p>
            <h2>Preview controls</h2>
          </div>
          <label class="field">
            <span>Preview width</span>
            <input id="width-slider" type="range" min="36" max="100" value="100" />
          </label>
          <p class="field-note"><span id="width-value">100%</span> of the available preview width.</p>
          <div class="preset-row">
            <button type="button" class="button-secondary" data-width-preset="100">Wide</button>
            <button type="button" class="button-secondary" data-width-preset="72">Medium</button>
            <button type="button" class="button-secondary" data-width-preset="44">Narrow</button>
          </div>
          <label class="toggle">
            <input id="debug-toggle" type="checkbox" />
            <span>Show debug slots and regions</span>
          </label>
          <label class="toggle">
            <input id="selectable-toggle" type="checkbox" />
            <span>Allow selecting text</span>
          </label>
          <label class="toggle">
            <input id="preserve-toggle" type="checkbox" checked />
            <span>Preserve full text on resize</span>
          </label>
          <div class="button-row">
            <button id="apply-scene" type="button">Apply config</button>
            <button id="reset-scene" type="button" class="button-secondary">Reset sample</button>
          </div>
          <p id="status-message" class="status-message" hidden></p>
        </div>

        <div class="panel-block">
          <div class="panel-heading">
            <p class="eyebrow">Config</p>
            <h2>Scene JSON</h2>
          </div>
          <textarea id="scene-editor" spellcheck="false"></textarea>
        </div>
      </aside>

      <section class="preview-panel">
        <div class="preview-meta">
          <div>
            <p class="eyebrow">Live demo</p>
            <h2>Engine preview</h2>
          </div>
          <p class="preview-hint">Desktop should stay masked if the opening fits. Narrow widths should fall back below.</p>
        </div>
        <div class="preview-frame">
          <div id="preview-stage-width" class="preview-stage-width">
            <div id="engine-mount"></div>
          </div>
        </div>
      </section>
    </section>
  </main>
`

const widthSlider = document.querySelector<HTMLInputElement>('#width-slider')
const widthValue = document.querySelector<HTMLSpanElement>('#width-value')
const sceneEditor = document.querySelector<HTMLTextAreaElement>('#scene-editor')
const applyButton = document.querySelector<HTMLButtonElement>('#apply-scene')
const resetButton = document.querySelector<HTMLButtonElement>('#reset-scene')
const debugToggle = document.querySelector<HTMLInputElement>('#debug-toggle')
const selectableToggle = document.querySelector<HTMLInputElement>('#selectable-toggle')
const preserveToggle = document.querySelector<HTMLInputElement>('#preserve-toggle')
const statusMessage = document.querySelector<HTMLParagraphElement>('#status-message')
const previewStageWidth = document.querySelector<HTMLDivElement>('#preview-stage-width')
const engineMount = document.querySelector<HTMLDivElement>('#engine-mount')
const presetButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-width-preset]')]

if (
  !widthSlider ||
  !widthValue ||
  !sceneEditor ||
  !applyButton ||
  !resetButton ||
  !debugToggle ||
  !selectableToggle ||
  !preserveToggle ||
  !statusMessage ||
  !previewStageWidth ||
  !engineMount ||
  !presetButtons.length
) {
  throw new Error('Demo controls failed to initialize.')
}

const sampleScene = JSON.parse(sampleSceneRaw) as ImageEngineSceneConfig
sceneEditor.value = JSON.stringify(sampleScene, null, 2)

const setPreviewWidth = (value: number): void => {
  previewStageWidth.style.width = `${value}%`
  widthValue.textContent = `${value}%`
}

const setStatus = (message: string, isError = false): void => {
  statusMessage.hidden = !message
  statusMessage.textContent = message
  statusMessage.dataset.error = String(isError)
}

const readSceneFromEditor = (): ImageEngineSceneConfig => {
  const parsed = JSON.parse(sceneEditor.value) as ImageEngineSceneConfig

  parsed.debug = {
    ...(parsed.debug ?? {}),
    enabled: debugToggle.checked,
    showSlots: debugToggle.checked,
    showRegions: debugToggle.checked,
  }
  parsed.interaction = {
    ...(parsed.interaction ?? {}),
    selectable: selectableToggle.checked,
  }
  parsed.resize = {
    ...(parsed.resize ?? {}),
    preserveFullText: preserveToggle.checked,
  }

  return parsed
}

let engine: ImageTextEngine = createPretextImageEngine(engineMount, sampleScene)

const scheduleRender = (): void => {
  requestAnimationFrame(() => {
    engine.render()
  })
}

engine.ready.then(() => {
  setPreviewWidth(Number(widthSlider.value))
  scheduleRender()
  setStatus('Sample scene loaded.')
})

const applyScene = async (): Promise<void> => {
  try {
    const nextScene = readSceneFromEditor()
    await engine.update(nextScene)
    setStatus('Scene config applied.')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to apply scene config.'
    setStatus(message, true)
  }
}

widthSlider.addEventListener('input', () => {
  setPreviewWidth(Number(widthSlider.value))
  scheduleRender()
})

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextWidth = Number(button.dataset.widthPreset)
    widthSlider.value = String(nextWidth)
    setPreviewWidth(nextWidth)
    scheduleRender()
  })
})

applyButton.addEventListener('click', () => {
  void applyScene()
})

resetButton.addEventListener('click', async () => {
  sceneEditor.value = JSON.stringify(sampleScene, null, 2)
  debugToggle.checked = false
  selectableToggle.checked = false
  preserveToggle.checked = true
  await engine.update(sampleScene)
  setStatus('Sample scene restored.')
})

debugToggle.addEventListener('change', () => {
  void applyScene()
})

selectableToggle.addEventListener('change', () => {
  void applyScene()
})

preserveToggle.addEventListener('change', () => {
  void applyScene()
})
