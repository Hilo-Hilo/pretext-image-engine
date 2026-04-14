import type {
  ImageEngineSceneConfig,
  RegionConfig,
  TextBlockConfig,
  V2BackdropMode,
  V2SubjectZoneConfig,
  V2TextRole,
} from './types'

type CellStats = {
  col: number
  row: number
  x: number
  y: number
  width: number
  height: number
  luminance: number
  contrast: number
  texture: number
  avgR: number
  avgG: number
  avgB: number
  blockedByOverlay: boolean
  protected: boolean
  safeScore: number
}

type PixelRect = {
  x: number
  y: number
  width: number
  height: number
}

export type V2DebugRect = PixelRect & {
  id: string
  label?: string
  kind: 'slot' | 'manual-slot' | 'protection' | 'subject-zone'
  score?: number
  active?: boolean
}

export type PlannedV2Slot = PixelRect & {
  id: string
  score: number
  active: boolean
  preferredRoles: V2TextRole[]
  recommendedTone: 'light' | 'dark'
  recommendedBackdrop: Exclude<V2BackdropMode, 'auto'>
  accentColor: string
  averageLuminance: number
  averageContrast: number
  averageTexture: number
}

export type V2Plan = {
  blocks: TextBlockConfig[]
  regions: Record<string, RegionConfig>
  slots: PlannedV2Slot[]
  debugRects: V2DebugRect[]
  protectionRects: PixelRect[]
  statusText: string
}

type BuildV2PlanInput = {
  scene: ImageEngineSceneConfig
  width: number
  height: number
  basePixels: Uint8ClampedArray
  overlayPixels: Uint8ClampedArray | null
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
const numberOr = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const srgbChannelToLinear = (value: number): number => {
  const normalized = value / 255
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

const relativeLuminance = (r: number, g: number, b: number): number =>
  0.2126 * srgbChannelToLinear(r) + 0.7152 * srgbChannelToLinear(g) + 0.0722 * srgbChannelToLinear(b)

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`

const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/, (_, r, g, b) => {
      return `rgba(${String(r).trim()}, ${String(g).trim()}, ${String(b).trim()}, ${clamp(opacity, 0, 1)})`
    })
  }

  if (color.startsWith('rgb(')) {
    return color.replace(/rgb\(([^,]+),([^,]+),([^)]+)\)/, (_, r, g, b) => {
      return `rgba(${String(r).trim()}, ${String(g).trim()}, ${String(b).trim()}, ${clamp(opacity, 0, 1)})`
    })
  }

  if (color.startsWith('#')) {
    let hex = color.slice(1)

    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    }

    if (hex.length === 6) {
      const red = Number.parseInt(hex.slice(0, 2), 16)
      const green = Number.parseInt(hex.slice(2, 4), 16)
      const blue = Number.parseInt(hex.slice(4, 6), 16)
      return `rgba(${red}, ${green}, ${blue}, ${clamp(opacity, 0, 1)})`
    }
  }

  return color
}

const resolveRoleFromStyle = (style: string): V2TextRole => {
  switch (style) {
    case 'eyebrow':
      return 'eyebrow'
    case 'heading':
      return 'headline'
    case 'lede':
      return 'lede'
    case 'caption':
      return 'caption'
    case 'body':
    default:
      return 'body'
  }
}

const rolePriority = (block: TextBlockConfig): number => {
  const role = block.v2?.role ?? resolveRoleFromStyle(block.style)

  switch (role) {
    case 'eyebrow':
      return 10
    case 'headline':
      return 20
    case 'lede':
      return 30
    case 'body':
      return 40
    case 'cta':
      return 50
    case 'caption':
      return 60
    case 'annotation':
    default:
      return 70
  }
}

const rectToRegion = (rect: PixelRect, width: number, height: number): RegionConfig => ({
  xStart: clamp(rect.x / width, 0, 1),
  xEnd: clamp((rect.x + rect.width) / width, 0, 1),
  yStart: clamp(rect.y / height, 0, 1),
  yEnd: clamp((rect.y + rect.height) / height, 0, 1),
  anchorX: clamp((rect.x + rect.width / 2) / width, 0, 1),
  slotOrder: 'center-out',
  minSlotWidth: Math.max(32, Math.round(rect.width * 0.45)),
})

const resolveCellRect = (
  col: number,
  row: number,
  gridColumns: number,
  gridRows: number,
  width: number,
  height: number,
): PixelRect => {
  const x = Math.round((col / gridColumns) * width)
  const y = Math.round((row / gridRows) * height)
  const nextX = Math.round(((col + 1) / gridColumns) * width)
  const nextY = Math.round(((row + 1) / gridRows) * height)

  return {
    x,
    y,
    width: Math.max(1, nextX - x),
    height: Math.max(1, nextY - y),
  }
}

const normalizeRect = (rect: V2SubjectZoneConfig | { x: number; y: number; width: number; height: number }, width: number, height: number): PixelRect => {
  const normalizeAxis = (value: number, size: number): number => (Math.abs(value) <= 1 ? value * size : value)

  return {
    x: clamp(Math.round(normalizeAxis(rect.x, width)), 0, width),
    y: clamp(Math.round(normalizeAxis(rect.y, height)), 0, height),
    width: Math.max(1, Math.round(normalizeAxis(rect.width, width))),
    height: Math.max(1, Math.round(normalizeAxis(rect.height, height))),
  }
}

const rectIntersects = (left: PixelRect, right: PixelRect): boolean => {
  return !(
    left.x + left.width <= right.x ||
    right.x + right.width <= left.x ||
    left.y + left.height <= right.y ||
    right.y + right.height <= left.y
  )
}

const averageStatsForRect = (rect: PixelRect, cells: CellStats[]): Pick<PlannedV2Slot, 'averageLuminance' | 'averageContrast' | 'averageTexture' | 'accentColor' | 'recommendedTone' | 'recommendedBackdrop'> => {
  const overlapping = cells.filter((cell) =>
    rectIntersects(rect, { x: cell.x, y: cell.y, width: cell.width, height: cell.height }),
  )

  if (!overlapping.length) {
    return {
      averageLuminance: 0.5,
      averageContrast: 0.3,
      averageTexture: 0.3,
      accentColor: '#d9c6a0',
      recommendedTone: 'light',
      recommendedBackdrop: 'shadow',
    }
  }

  const totals = overlapping.reduce(
    (acc, cell) => {
      acc.luminance += cell.luminance
      acc.contrast += cell.contrast
      acc.texture += cell.texture
      acc.r += cell.avgR
      acc.g += cell.avgG
      acc.b += cell.avgB
      return acc
    },
    { luminance: 0, contrast: 0, texture: 0, r: 0, g: 0, b: 0 },
  )
  const count = overlapping.length
  const averageLuminance = totals.luminance / count
  const averageContrast = totals.contrast / count
  const averageTexture = totals.texture / count
  const accentColor = rgbToHex(totals.r / count, totals.g / count, totals.b / count)
  const recommendedTone = averageLuminance >= 0.58 ? 'dark' : 'light'
  const recommendedBackdrop = averageContrast > 0.2 || averageTexture > 0.18 ? 'panel' : 'shadow'

  return {
    averageLuminance,
    averageContrast,
    averageTexture,
    accentColor,
    recommendedTone,
    recommendedBackdrop,
  }
}

const preferredRolesForRect = (rect: PixelRect, stageWidth: number, stageHeight: number): V2TextRole[] => {
  const areaRatio = (rect.width * rect.height) / Math.max(1, stageWidth * stageHeight)
  const isWide = rect.width / Math.max(1, rect.height) > 1.4

  if (areaRatio > 0.16 && isWide) {
    return ['headline', 'body', 'lede', 'eyebrow', 'caption']
  }

  if (areaRatio > 0.09) {
    return ['lede', 'body', 'headline', 'caption', 'eyebrow']
  }

  return ['eyebrow', 'caption', 'annotation', 'headline', 'body']
}

const expandRect = (rect: PixelRect, padding: number, width: number, height: number): PixelRect => ({
  x: clamp(rect.x - padding, 0, width),
  y: clamp(rect.y - padding, 0, height),
  width: clamp(rect.width + padding * 2, 1, width),
  height: clamp(rect.height + padding * 2, 1, height),
})

const buildGrid = ({ scene, width, height, basePixels, overlayPixels }: BuildV2PlanInput): CellStats[] => {
  const gridColumns = Math.max(6, Math.round(numberOr(scene.v2?.layout?.gridColumns, 12)))
  const gridRows = Math.max(6, Math.round(numberOr(scene.v2?.layout?.gridRows, 10)))
  const alphaThreshold = numberOr(scene.assets.alphaThreshold, 20)
  const cells: CellStats[] = []

  for (let row = 0; row < gridRows; row += 1) {
    for (let col = 0; col < gridColumns; col += 1) {
      const rect = resolveCellRect(col, row, gridColumns, gridRows, width, height)
      let luminanceTotal = 0
      let contrastTotal = 0
      let textureTotal = 0
      let rTotal = 0
      let gTotal = 0
      let bTotal = 0
      let count = 0
      let blocked = 0
      const sampleStepX = Math.max(1, Math.floor(rect.width / 4))
      const sampleStepY = Math.max(1, Math.floor(rect.height / 4))

      for (let y = rect.y; y < rect.y + rect.height; y += sampleStepY) {
        for (let x = rect.x; x < rect.x + rect.width; x += sampleStepX) {
          const offset = (y * width + x) * 4
          const r = basePixels[offset] ?? 0
          const g = basePixels[offset + 1] ?? 0
          const b = basePixels[offset + 2] ?? 0
          const luminance = relativeLuminance(r, g, b)
          const rightOffset = (y * width + clamp(x + sampleStepX, 0, width - 1)) * 4
          const downOffset = (clamp(y + sampleStepY, 0, height - 1) * width + x) * 4
          const rightLuminance = relativeLuminance(
            basePixels[rightOffset] ?? r,
            basePixels[rightOffset + 1] ?? g,
            basePixels[rightOffset + 2] ?? b,
          )
          const downLuminance = relativeLuminance(
            basePixels[downOffset] ?? r,
            basePixels[downOffset + 1] ?? g,
            basePixels[downOffset + 2] ?? b,
          )

          luminanceTotal += luminance
          contrastTotal += Math.abs(luminance - 0.5)
          textureTotal += Math.abs(luminance - rightLuminance) + Math.abs(luminance - downLuminance)
          rTotal += r
          gTotal += g
          bTotal += b
          count += 1

          if (overlayPixels && (overlayPixels[offset + 3] ?? 0) > alphaThreshold) {
            blocked += 1
          }
        }
      }

      const luminance = count ? luminanceTotal / count : 0.5
      const contrast = count ? contrastTotal / count : 0
      const texture = count ? textureTotal / (count * 2) : 0
      const overlayCoverage = count ? blocked / count : 0
      const distanceFromCenter = Math.hypot(col + 0.5 - gridColumns / 2, row + 0.5 - gridRows / 2) /
        Math.hypot(gridColumns / 2, gridRows / 2)
      const centerBias = 1 - clamp(distanceFromCenter, 0, 1)
      const autoSubjectScore = texture * 0.65 + contrast * 0.35 + centerBias * 0.08
      const protectedByHeuristic = centerBias > 0.45 && autoSubjectScore > 0.22
      const protectedByOverlay = overlayCoverage > 0.18
      const safeScore = clamp(1 - (texture * 2.8 + contrast * 1.2), 0, 1)

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
        safeScore,
      })
    }
  }

  return cells
}

const applyManualSubjectZones = (
  cells: CellStats[],
  zones: V2SubjectZoneConfig[],
  width: number,
  height: number,
): PixelRect[] => {
  const applied: PixelRect[] = []

  zones.forEach((zone, index) => {
    const padding = Math.round(numberOr(zone.padding, 0))
    const normalized = expandRect(normalizeRect(zone, width, height), padding, width, height)
    applied.push(normalized)

    cells.forEach((cell) => {
      if (rectIntersects(normalized, { x: cell.x, y: cell.y, width: cell.width, height: cell.height })) {
        cell.protected = true
      }
    })

    if (!zone.id) {
      zone.id = `subject-zone-${index}`
    }
  })

  return applied
}

const applyProtectionPadding = (cells: CellStats[], width: number, height: number, padding: number): void => {
  if (padding <= 0) {
    return
  }

  const rects = cells
    .filter((cell) => cell.protected)
    .map((cell) => expandRect({ x: cell.x, y: cell.y, width: cell.width, height: cell.height }, padding, width, height))

  cells.forEach((cell) => {
    if (
      rects.some((rect) =>
        rectIntersects(rect, { x: cell.x, y: cell.y, width: cell.width, height: cell.height }),
      )
    ) {
      cell.protected = true
    }
  })
}

const collectSafeComponents = (cells: CellStats[], scene: ImageEngineSceneConfig): PixelRect[] => {
  if (!cells.length) {
    return []
  }

  const maxCol = Math.max(...cells.map((cell) => cell.col)) + 1
  const maxRow = Math.max(...cells.map((cell) => cell.row)) + 1
  const minCellScore = clamp(numberOr(scene.v2?.layout?.minCellScore, 0.42), 0, 1)
  const minSlotCells = Math.max(1, Math.round(numberOr(scene.v2?.layout?.minSlotCells, 2)))
  const map = new Map(cells.map((cell) => [`${cell.col}:${cell.row}`, cell]))
  const visited = new Set<string>()
  const components: PixelRect[] = []

  for (const cell of cells) {
    const key = `${cell.col}:${cell.row}`

    if (visited.has(key) || cell.protected || cell.safeScore < minCellScore) {
      continue
    }

    const queue = [cell]
    const members: CellStats[] = []
    visited.add(key)

    while (queue.length) {
      const current = queue.shift()!
      members.push(current)

      const neighbors = [
        [current.col - 1, current.row],
        [current.col + 1, current.row],
        [current.col, current.row - 1],
        [current.col, current.row + 1],
      ]

      neighbors.forEach(([col, row]) => {
        if (col < 0 || row < 0 || col >= maxCol || row >= maxRow) {
          return
        }

        const neighborKey = `${col}:${row}`
        const neighbor = map.get(neighborKey)

        if (!neighbor || visited.has(neighborKey) || neighbor.protected || neighbor.safeScore < minCellScore) {
          return
        }

        visited.add(neighborKey)
        queue.push(neighbor)
      })
    }

    if (members.length < minSlotCells) {
      continue
    }

    const x = Math.min(...members.map((member) => member.x))
    const y = Math.min(...members.map((member) => member.y))
    const right = Math.max(...members.map((member) => member.x + member.width))
    const bottom = Math.max(...members.map((member) => member.y + member.height))
    components.push({ x, y, width: right - x, height: bottom - y })
  }

  return components
}

const scoreSlot = (rect: PixelRect, cells: CellStats[], width: number, height: number, preferWiderSlots: boolean): number => {
  const stats = averageStatsForRect(rect, cells)
  const areaScore = (rect.width * rect.height) / Math.max(1, width * height)
  const widthBias = preferWiderSlots ? rect.width / Math.max(1, width) : rect.height / Math.max(1, height)
  return areaScore * 2.6 + (1 - stats.averageContrast) * 0.28 + (1 - stats.averageTexture) * 0.28 + widthBias * 0.22
}

const upsertManualSlots = (
  slots: PlannedV2Slot[],
  cells: CellStats[],
  scene: ImageEngineSceneConfig,
  width: number,
  height: number,
): void => {
  scene.v2?.slots?.forEach((slotConfig) => {
    const rect = normalizeRect(slotConfig, width, height)
    const stats = averageStatsForRect(rect, cells)
    const next: PlannedV2Slot = {
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
      averageTexture: stats.averageTexture,
    }
    const existingIndex = slots.findIndex((slot) => slot.id === next.id)

    if (existingIndex >= 0) {
      slots.splice(existingIndex, 1, next)
    } else {
      slots.push(next)
    }
  })
}

const activateSlots = (slots: PlannedV2Slot[], scene: ImageEngineSceneConfig, width: number): PlannedV2Slot[] => {
  const activeIds = new Set(scene.v2?.activeSlotIds ?? [])
  const bannedIds = new Set(scene.v2?.bannedSlotIds ?? [])
  const maxSlots = Math.max(1, Math.round(numberOr(scene.v2?.layout?.maxSlots, 4)))
  const mobileSingleSlotBelow = Math.round(numberOr(scene.v2?.layout?.mobileSingleSlotBelow, 640))
  const limit = width <= mobileSingleSlotBelow ? 1 : maxSlots

  const next = slots
    .filter((slot) => !bannedIds.has(slot.id))
    .sort((left, right) => right.score - left.score)
    .map((slot, index) => ({
      ...slot,
      active: activeIds.size ? activeIds.has(slot.id) : (slot.active ?? true) && index < limit,
    }))

  if (!next.some((slot) => slot.active) && next.length) {
    next[0] = { ...next[0]!, active: true }
  }

  return next
}

const slotRoleAffinity = (slot: PlannedV2Slot, role: V2TextRole): number => {
  const preferenceIndex = slot.preferredRoles.indexOf(role)
  return preferenceIndex === -1 ? 0 : Math.max(0.15, 1 - preferenceIndex * 0.18)
}

const assignBlocksToSlots = (scene: ImageEngineSceneConfig, slots: PlannedV2Slot[], width: number, height: number): Pick<V2Plan, 'blocks' | 'regions'> => {
  const activeSlots = slots.filter((slot) => slot.active)
  const regions: Record<string, RegionConfig> = {}
  activeSlots.forEach((slot) => {
    regions[slot.id] = rectToRegion(slot, width, height)
  })

  if (!activeSlots.length) {
    return { blocks: scene.blocks, regions: {} }
  }

  const usage = new Map<string, number>()
  const sortedBlocks = scene.blocks.map((block, blockIndex) => ({
    block,
    blockIndex,
    priority: numberOr(block.v2?.priority, rolePriority(block)),
    role: block.v2?.role ?? resolveRoleFromStyle(block.style),
  }))
  sortedBlocks.sort((left, right) => left.priority - right.priority || left.blockIndex - right.blockIndex)

  const assignments = new Map<number, string>()

  sortedBlocks.forEach(({ block, blockIndex, role }) => {
    const pinned = block.v2?.pinnedSlotId

    if (pinned && activeSlots.some((slot) => slot.id === pinned)) {
      assignments.set(blockIndex, pinned)
      usage.set(pinned, (usage.get(pinned) ?? 0) + 1)
      return
    }

    const best = activeSlots
      .map((slot) => {
        const used = usage.get(slot.id) ?? 0
        const roleAffinity = slotRoleAffinity(slot, role)
        const widthBonus = role === 'body' || role === 'lede' ? slot.width / Math.max(1, width) : slot.height / Math.max(1, height)
        return {
          slot,
          score: slot.score * 0.55 + roleAffinity * 0.3 + widthBonus * 0.2 - used * 0.18,
        }
      })
      .sort((left, right) => right.score - left.score)[0]?.slot

    if (best) {
      assignments.set(blockIndex, best.id)
      usage.set(best.id, (usage.get(best.id) ?? 0) + 1)
    }
  })

  const blocks = scene.blocks.map((block, blockIndex) => {
    const slotId = assignments.get(blockIndex)

    if (!slotId) {
      return block
    }

    return {
      ...block,
      region: slotId,
      regionOrder: 'center-out' as const,
    }
  })

  return { blocks, regions }
}

const buildProtectionRects = (cells: CellStats[]): PixelRect[] => {
  return cells
    .filter((cell) => cell.protected)
    .map((cell) => ({ x: cell.x, y: cell.y, width: cell.width, height: cell.height }))
}

export const resolveV2PanelColor = (slot: PlannedV2Slot, scene: ImageEngineSceneConfig): string => {
  const tint = scene.v2?.backdrop?.tint ?? slot.accentColor
  return withOpacity(tint, clamp(numberOr(scene.v2?.backdrop?.panelOpacity, 0.18), 0.06, 0.4))
}

export const resolveV2BlockBackdrop = (slot: PlannedV2Slot, block: TextBlockConfig, scene: ImageEngineSceneConfig): Exclude<V2BackdropMode, 'auto'> => {
  const requested = block.v2?.backdrop ?? scene.v2?.backdrop?.mode ?? 'auto'
  return requested === 'auto' ? slot.recommendedBackdrop : requested
}

export const buildV2Plan = (input: BuildV2PlanInput): V2Plan | null => {
  const { scene, width, height } = input

  if (!scene.v2?.enabled) {
    return null
  }

  const cells = buildGrid(input)
  const subjectZones = applyManualSubjectZones(cells, scene.v2.subjectZones ?? [], width, height)
  applyProtectionPadding(cells, width, height, Math.max(0, Math.round(numberOr(scene.v2.layout?.subjectPadding, 18))))

  const preferWiderSlots = scene.v2.layout?.preferWiderSlots ?? true
  const discoveredRects = collectSafeComponents(cells, scene)
  const slots: PlannedV2Slot[] = discoveredRects
    .map((rect, index) => {
      const stats = averageStatsForRect(rect, cells)
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
        averageTexture: stats.averageTexture,
      }
    })
    .filter((slot) => slot.width >= Math.max(48, numberOr(scene.layout?.minSlotWidth, 96)) && slot.height >= 24)

  upsertManualSlots(slots, cells, scene, width, height)
  const activeSlots = activateSlots(slots, scene, width)
  const assignment = assignBlocksToSlots(scene, activeSlots, width, height)

  const debugRects: V2DebugRect[] = []
  activeSlots.forEach((slot) => {
    debugRects.push({
      id: slot.id,
      kind: scene.v2?.slots?.some((manual) => manual.id === slot.id) ? 'manual-slot' : 'slot',
      x: slot.x,
      y: slot.y,
      width: slot.width,
      height: slot.height,
      label: `${slot.id}${scene.v2?.debug?.showSlotScores ? ` · ${slot.score.toFixed(2)}` : ''}`,
      score: slot.score,
      active: slot.active,
    })
  })

  subjectZones.forEach((rect, index) => {
    debugRects.push({
      id: `subject-zone-${index + 1}`,
      kind: 'subject-zone',
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      label: 'subject protection',
      active: true,
    })
  })

  const activeCount = activeSlots.filter((slot) => slot.active).length
  const statusText = activeCount
    ? `V2 auto layout active · ${activeCount} slot${activeCount === 1 ? '' : 's'} planned`
    : 'V2 auto layout could not find a safe slot'

  return {
    blocks: assignment.blocks,
    regions: assignment.regions,
    slots: activeSlots,
    debugRects,
    protectionRects: buildProtectionRects(cells),
    statusText,
  }
}
