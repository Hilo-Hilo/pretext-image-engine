import './style.css'
import './lib/styles.css'

import localTestSceneRaw from './demo/test-scene.json?raw'
import sampleSceneRaw from './demo/sample-scene.json?raw'
import { createPretextImageEngine, type ImageEngineSceneConfig, type ImageTextEngine } from './lib'

type DemoSceneKey = 'local-test' | 'sample'

type DemoSceneDefinition = {
  key: DemoSceneKey
  label: string
  title: string
  description: string
  assetPath: string
  sourceLabel: string
  localOnly: boolean
  raw: string
}

const demoScenes: DemoSceneDefinition[] = [
  {
    key: 'local-test',
    label: 'Local test scene',
    title: 'High-resolution Bay Bridge mask',
    description:
      'Uses ignored local assets copied into public/scenes/local-test so you can validate real-image masking and scroll-driven reveal behavior.',
    assetPath: 'public/scenes/local-test',
    sourceLabel: 'Ignored local assets',
    localOnly: true,
    raw: localTestSceneRaw,
  },
  {
    key: 'sample',
    label: 'Bundled sample',
    title: 'Bundled San Francisco sample',
    description:
      'Tracks the packaged public demo scene so you can compare local-only testing against a committed reference configuration.',
    assetPath: 'public/scenes/san-francisco',
    sourceLabel: 'Bundled public sample',
    localOnly: false,
    raw: sampleSceneRaw,
  },
]

const parseScene = (raw: string): ImageEngineSceneConfig => JSON.parse(raw) as ImageEngineSceneConfig

const cloneScene = (definition: DemoSceneDefinition): ImageEngineSceneConfig => parseScene(definition.raw)

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

const assetExists = async (src: string): Promise<boolean> => {
  try {
    const response = await fetch(src, { method: 'HEAD' })

    if (response.ok) {
      return true
    }

    if (response.status === 405) {
      const fallback = await fetch(src, { method: 'GET' })
      return fallback.ok
    }

    return false
  } catch {
    return false
  }
}

const sceneAssetsAvailable = async (scene: ImageEngineSceneConfig): Promise<boolean> => {
  const [baseReady, overlayReady] = await Promise.all([
    assetExists(scene.assets.baseSrc),
    assetExists(scene.assets.overlaySrc),
  ])

  return baseReady && overlayReady
}

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('#app not found')
}

const bootstrap = async (): Promise<void> => {
  const localSceneDefinition = demoScenes.find((scene) => scene.key === 'local-test')!
  const sampleSceneDefinition = demoScenes.find((scene) => scene.key === 'sample')!
  const localSceneReady = await sceneAssetsAvailable(cloneScene(localSceneDefinition))
  const sceneAvailability = new Map<DemoSceneKey, boolean>([
    ['local-test', localSceneReady],
    ['sample', true],
  ])
  const initialSceneKey: DemoSceneKey = localSceneReady ? 'local-test' : 'sample'

  app.innerHTML = `
    <main class="shell">
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Pretext Image Engine Test Site</p>
          <h1>Validate masked layout, sticky text openings, and scroll-driven progression on real imagery.</h1>
          <p class="lede">
            This Vite site is wired for two workflows: a committed sample scene for anyone cloning the repo, and a
            local-only Bay Bridge scene that pulls ignored assets from <code>public/scenes/local-test</code>.
          </p>
          <div class="scene-grid">
            ${demoScenes
              .map(
                (scene) => `
                  <button type="button" class="scene-card" data-scene-key="${scene.key}">
                    <span class="scene-card-label">${scene.label}</span>
                    <strong>${scene.title}</strong>
                    <p>${scene.description}</p>
                    <span class="scene-card-meta">${
                      scene.localOnly ? 'Requires local copied images' : 'Ready from the repo'
                    }</span>
                  </button>
                `,
              )
              .join('')}
          </div>
        </div>
        <div class="hero-notes">
          <div class="stat">
            <span>Test focus</span>
            <strong>Masked placement, reveal timing, and resize fallback</strong>
          </div>
          <div class="stat">
            <span>Asset strategy</span>
            <strong>Track JSON, ignore heavy image files</strong>
          </div>
          <div id="asset-callout" class="asset-callout"></div>
        </div>
      </section>

      <section class="workspace">
        <aside class="control-panel">
          <div class="panel-block">
            <div class="panel-heading">
              <p class="eyebrow">Active Scene</p>
              <h2 id="scene-title"></h2>
            </div>
            <p id="scene-description" class="field-note"></p>
            <p class="asset-path-label">
              Asset path
              <code id="scene-asset-path"></code>
            </p>
          </div>

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
            <label class="field">
              <span>Text progress</span>
              <input id="progress-slider" type="range" min="0" max="100" value="100" />
            </label>
            <p class="field-note"><span id="progress-value">100%</span> reveal progress for scroll-enabled blocks.</p>
            <div class="preset-row">
              <button type="button" class="button-secondary" data-width-preset="100">Wide</button>
              <button type="button" class="button-secondary" data-width-preset="76">Medium</button>
              <button type="button" class="button-secondary" data-width-preset="48">Narrow</button>
            </div>
            <label class="toggle">
              <input id="scroll-progress-toggle" type="checkbox" />
              <span>Map page scroll to reveal progress</span>
            </label>
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
              <button id="reset-scene" type="button" class="button-secondary">Reset active scene</button>
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
              <p class="eyebrow">Live Render</p>
              <h2>Masked preview</h2>
            </div>
            <p class="preview-hint">
              Import <code>pretext-image-engine/styles.css</code> in production code, then drive
              <code>setProgress()</code> from your host app. This page exposes both manual control and a page-scroll
              mapping so you can test the engine against real images.
            </p>
            <div class="preview-badges">
              <span id="scene-source-pill" class="pill"></span>
              <span id="scene-availability-pill" class="pill"></span>
            </div>
          </div>
          <div class="preview-frame">
            <div id="preview-stage-width" class="preview-stage-width">
              <div id="engine-mount"></div>
            </div>
          </div>
        </section>
      </section>

      <section class="scroll-guide">
        <div class="scroll-guide-copy">
          <p class="eyebrow">Test Flow</p>
          <h2>Use the page itself as the reveal driver.</h2>
          <p class="lede">
            Turn on page scroll mapping, keep the preview visible, and use the steps below to confirm local asset
            wiring, sticky line behavior, and responsive fallback.
          </p>
        </div>
        <div class="step-grid">
          <article class="step-card">
            <span>01</span>
            <h3>Verify the asset path</h3>
            <p>Confirm the local scene is reading from <code>public/scenes/local-test</code> and not from tracked demo assets.</p>
          </article>
          <article class="step-card">
            <span>02</span>
            <h3>Check sticky heading behavior</h3>
            <p>Use scroll mapping to confirm the heading opener stays pinned while later lines continue revealing inside the scene.</p>
          </article>
          <article class="step-card">
            <span>03</span>
            <h3>Force narrow widths</h3>
            <p>Drop to the narrow preset and confirm the engine chooses clipped or fallback rendering according to the active scene config.</p>
          </article>
          <article class="step-card">
            <span>04</span>
            <h3>Edit the JSON live</h3>
            <p>Adjust regions, copy, or scroll ranges, then apply the config to see whether the layout still holds against the real mask.</p>
          </article>
        </div>
      </section>
    </main>
  `

  const widthSlider = document.querySelector<HTMLInputElement>('#width-slider')
  const widthValue = document.querySelector<HTMLSpanElement>('#width-value')
  const progressSlider = document.querySelector<HTMLInputElement>('#progress-slider')
  const progressValue = document.querySelector<HTMLSpanElement>('#progress-value')
  const sceneEditor = document.querySelector<HTMLTextAreaElement>('#scene-editor')
  const applyButton = document.querySelector<HTMLButtonElement>('#apply-scene')
  const resetButton = document.querySelector<HTMLButtonElement>('#reset-scene')
  const scrollProgressToggle = document.querySelector<HTMLInputElement>('#scroll-progress-toggle')
  const debugToggle = document.querySelector<HTMLInputElement>('#debug-toggle')
  const selectableToggle = document.querySelector<HTMLInputElement>('#selectable-toggle')
  const preserveToggle = document.querySelector<HTMLInputElement>('#preserve-toggle')
  const statusMessage = document.querySelector<HTMLParagraphElement>('#status-message')
  const previewStageWidth = document.querySelector<HTMLDivElement>('#preview-stage-width')
  const engineMount = document.querySelector<HTMLDivElement>('#engine-mount')
  const sceneTitle = document.querySelector<HTMLHeadingElement>('#scene-title')
  const sceneDescription = document.querySelector<HTMLParagraphElement>('#scene-description')
  const sceneAssetPath = document.querySelector<HTMLElement>('#scene-asset-path')
  const assetCallout = document.querySelector<HTMLDivElement>('#asset-callout')
  const sceneSourcePill = document.querySelector<HTMLSpanElement>('#scene-source-pill')
  const sceneAvailabilityPill = document.querySelector<HTMLSpanElement>('#scene-availability-pill')
  const scrollGuide = document.querySelector<HTMLElement>('.scroll-guide')
  const presetButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-width-preset]')]
  const sceneButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-scene-key]')]

  if (
    !widthSlider ||
    !widthValue ||
    !progressSlider ||
    !progressValue ||
    !sceneEditor ||
    !applyButton ||
    !resetButton ||
    !scrollProgressToggle ||
    !debugToggle ||
    !selectableToggle ||
    !preserveToggle ||
    !statusMessage ||
    !previewStageWidth ||
    !engineMount ||
    !sceneTitle ||
    !sceneDescription ||
    !sceneAssetPath ||
    !assetCallout ||
    !sceneSourcePill ||
    !sceneAvailabilityPill ||
    !scrollGuide ||
    !presetButtons.length ||
    !sceneButtons.length
  ) {
    throw new Error('Demo controls failed to initialize.')
  }

  const getSceneDefinition = (key: DemoSceneKey): DemoSceneDefinition =>
    demoScenes.find((scene) => scene.key === key) ?? sampleSceneDefinition

  const syncSceneControls = (scene: ImageEngineSceneConfig): void => {
    const debugEnabled = Boolean(scene.debug?.enabled || scene.debug?.showRegions || scene.debug?.showSlots)
    debugToggle.checked = debugEnabled
    selectableToggle.checked = scene.interaction?.selectable ?? false
    preserveToggle.checked = scene.resize?.preserveFullText ?? true
  }

  const withUiOverrides = (scene: ImageEngineSceneConfig): ImageEngineSceneConfig => ({
    ...scene,
    debug: {
      ...(scene.debug ?? {}),
      enabled: debugToggle.checked,
      showSlots: debugToggle.checked,
      showRegions: debugToggle.checked,
    },
    interaction: {
      ...(scene.interaction ?? {}),
      selectable: selectableToggle.checked,
    },
    resize: {
      ...(scene.resize ?? {}),
      preserveFullText: preserveToggle.checked,
    },
  })

  let currentSceneKey = initialSceneKey
  let engine: ImageTextEngine = createPretextImageEngine(
    engineMount,
    withUiOverrides(cloneScene(getSceneDefinition(currentSceneKey))),
    {
      injectStyles: false,
      initialProgress: 1,
    },
  )

  const setPreviewWidth = (value: number): void => {
    previewStageWidth.style.width = `${value}%`
    widthValue.textContent = `${value}%`
  }

  const setStatus = (message: string, isError = false): void => {
    statusMessage.hidden = !message
    statusMessage.textContent = message
    statusMessage.dataset.error = String(isError)
  }

  const updateSceneChrome = (): void => {
    const definition = getSceneDefinition(currentSceneKey)
    const available = sceneAvailability.get(definition.key) ?? false

    sceneTitle.textContent = definition.title
    sceneDescription.textContent = definition.description
    sceneAssetPath.textContent = definition.assetPath
    sceneSourcePill.textContent = definition.sourceLabel
    sceneAvailabilityPill.textContent = available ? 'Assets available' : 'Local assets missing'
    sceneAvailabilityPill.dataset.available = String(available)
    assetCallout.dataset.ready = String(localSceneReady)
    assetCallout.innerHTML = localSceneReady
      ? `
          <p class="eyebrow">Local Assets Ready</p>
          <p class="asset-copy">
            The ignored test images were found, so this site defaults to the Bay Bridge scene and keeps them out of git.
          </p>
        `
      : `
          <p class="eyebrow">Bundled Fallback Active</p>
          <p class="asset-copy">
            No ignored local images were found in <code>public/scenes/local-test</code>, so the site falls back to the committed sample scene.
          </p>
        `

    sceneButtons.forEach((button) => {
      const buttonKey = button.dataset.sceneKey as DemoSceneKey
      const buttonReady = sceneAvailability.get(buttonKey) ?? false
      button.disabled = !buttonReady
      button.dataset.available = String(buttonReady)
      button.setAttribute('aria-pressed', String(buttonKey === currentSceneKey))
    })
  }

  const setEditorScene = (scene: ImageEngineSceneConfig): void => {
    sceneEditor.value = JSON.stringify(scene, null, 2)
  }

  const readSceneFromEditor = (): ImageEngineSceneConfig => withUiOverrides(parseScene(sceneEditor.value))

  const setProgressValue = (value: number): void => {
    progressSlider.value = String(value)
    progressValue.textContent = `${value}%`
    engine.setProgress(value / 100)
  }

  const scheduleRender = (): void => {
    requestAnimationFrame(() => {
      engine.render()
    })
  }

  const syncProgressFromScroll = (): void => {
    if (!scrollProgressToggle.checked) {
      return
    }

    const rect = scrollGuide.getBoundingClientRect()
    const viewportHeight = Math.max(window.innerHeight, 1)
    const total = Math.max(rect.height, 1) + viewportHeight
    const nextProgress = clamp((viewportHeight - rect.top) / total, 0, 1)
    const sliderValue = Math.round(nextProgress * 100)
    progressSlider.value = String(sliderValue)
    progressValue.textContent = `${sliderValue}%`
    engine.setProgress(nextProgress)
  }

  const applyScene = async (scene: ImageEngineSceneConfig, successMessage: string): Promise<void> => {
    await engine.ready
    await engine.update(scene)

    if (scrollProgressToggle.checked) {
      syncProgressFromScroll()
      setStatus(successMessage)
      return
    }

    setProgressValue(Number(progressSlider.value))
    setStatus(successMessage)
  }

  const loadScene = async (key: DemoSceneKey): Promise<void> => {
    if (!(sceneAvailability.get(key) ?? false)) {
      setStatus(`Scene assets were not found for ${getSceneDefinition(key).label}.`, true)
      return
    }

    currentSceneKey = key
    const scene = cloneScene(getSceneDefinition(key))
    syncSceneControls(scene)
    setEditorScene(scene)
    updateSceneChrome()
    await applyScene(readSceneFromEditor(), `${getSceneDefinition(key).label} loaded.`)
  }

  setPreviewWidth(Number(widthSlider.value))
  syncSceneControls(cloneScene(getSceneDefinition(currentSceneKey)))
  setEditorScene(cloneScene(getSceneDefinition(currentSceneKey)))
  updateSceneChrome()

  try {
    await engine.ready
    setProgressValue(Number(progressSlider.value))
    scheduleRender()
    setStatus(
      localSceneReady
        ? 'Local test scene loaded from ignored assets.'
        : 'Bundled sample loaded. Add images to public/scenes/local-test to enable the local scene.',
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to initialize the engine preview.'
    setStatus(message, true)
  }

  const applyEditedScene = async (): Promise<void> => {
    try {
      const nextScene = readSceneFromEditor()
      await applyScene(nextScene, 'Scene config applied.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to apply scene config.'
      setStatus(message, true)
    }
  }

  widthSlider.addEventListener('input', () => {
    setPreviewWidth(Number(widthSlider.value))
    scheduleRender()
    syncProgressFromScroll()
  })

  progressSlider.addEventListener('input', () => {
    if (scrollProgressToggle.checked) {
      return
    }

    setProgressValue(Number(progressSlider.value))
  })

  presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextWidth = Number(button.dataset.widthPreset)
      widthSlider.value = String(nextWidth)
      setPreviewWidth(nextWidth)
      scheduleRender()
      syncProgressFromScroll()
    })
  })

  sceneButtons.forEach((button) => {
    button.addEventListener('click', () => {
      void loadScene(button.dataset.sceneKey as DemoSceneKey)
    })
  })

  scrollProgressToggle.addEventListener('change', () => {
    progressSlider.disabled = scrollProgressToggle.checked

    if (scrollProgressToggle.checked) {
      syncProgressFromScroll()
      setStatus('Reveal progress is now driven by page scroll.')
      return
    }

    setProgressValue(Number(progressSlider.value))
    setStatus('Reveal progress is now driven by the manual slider.')
  })

  window.addEventListener('scroll', syncProgressFromScroll, { passive: true })
  window.addEventListener('resize', syncProgressFromScroll)

  applyButton.addEventListener('click', () => {
    void applyEditedScene()
  })

  resetButton.addEventListener('click', () => {
    void loadScene(currentSceneKey)
  })

  debugToggle.addEventListener('change', () => {
    void applyEditedScene()
  })

  selectableToggle.addEventListener('change', () => {
    void applyEditedScene()
  })

  preserveToggle.addEventListener('change', () => {
    void applyEditedScene()
  })
}

void bootstrap()
