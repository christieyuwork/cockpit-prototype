import { MODULES_BY_KIND, type ModuleKind, type PlacedModule } from '../data/customViews'

/** The canvas viewport is a fixed 4 x 8 grid; modules snap to whole cells. */
export const GRID_COLS = 4
export const GRID_ROWS = 8

export type Slot = { col: number; row: number; w: number; h: number }

export function overlaps(a: Slot, b: Slot) {
  return a.col < b.col + b.w && a.col + a.w > b.col && a.row < b.row + b.h && a.row + a.h > b.row
}

export function isFree(slot: Slot, modules: PlacedModule[], ignoreId?: string) {
  return modules.every((module) => module.id === ignoreId || !overlaps(slot, module))
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

/** First module whose footprint intersects `slot`, excluding `ignoreId`. */
export function findOverlap(
  slot: Slot,
  modules: PlacedModule[],
  ignoreId?: string,
): PlacedModule | undefined {
  return modules.find((module) => module.id !== ignoreId && overlaps(slot, module))
}

/**
 * Preview a move of `id` to `target`.
 * - Free cell: relocate `id`
 * - Overlaps another module: swap positions (each keeps its own w/h; mover snaps to partner's col/row)
 * - Overlaps more than one, or either footprint would collide: return null
 */
export function previewMove(
  modules: PlacedModule[],
  id: string,
  target: Slot,
): PlacedModule[] | null {
  const moving = modules.find((module) => module.id === id)
  if (!moving) return null

  const others = modules.filter((module) => module.id !== id)
  const collisions = others.filter((module) => overlaps(target, module))

  if (collisions.length === 0) {
    return modules.map((module) =>
      module.id === id
        ? { ...module, col: target.col, row: target.row, w: target.w, h: target.h }
        : module,
    )
  }

  if (collisions.length !== 1) return null

  const partner = collisions[0]
  const movedSlot: Slot = {
    col: partner.col,
    row: partner.row,
    w: moving.w,
    h: moving.h,
  }
  const partnerSlot: Slot = {
    col: moving.col,
    row: moving.row,
    w: partner.w,
    h: partner.h,
  }

  const remaining = others.filter((module) => module.id !== partner.id)
  if (!isFree(movedSlot, remaining)) return null
  if (!isFree(partnerSlot, remaining)) return null
  if (overlaps(movedSlot, partnerSlot)) return null

  return modules.map((module) => {
    if (module.id === id) {
      return { ...module, col: movedSlot.col, row: movedSlot.row, w: movedSlot.w, h: movedSlot.h }
    }
    if (module.id === partner.id) {
      return { ...module, col: partnerSlot.col, row: partnerSlot.row }
    }
    return module
  })
}

/** Preview a resize of `id` to `target`. Rejects if the new footprint is occupied. */
export function previewResize(
  modules: PlacedModule[],
  id: string,
  target: Slot,
): PlacedModule[] | null {
  if (!isFree(target, modules, id)) return null
  return modules.map((module) =>
    module.id === id
      ? { ...module, col: target.col, row: target.row, w: target.w, h: target.h }
      : module,
  )
}

/** Scans top-left to bottom-right for the first slot that fits, growing downwards if needed. */
function findSlot(w: number, h: number, placed: PlacedModule[]): Slot {
  const width = Math.min(w, GRID_COLS)
  for (let row = 1; ; row += 1) {
    for (let col = 1; col <= GRID_COLS - width + 1; col += 1) {
      const slot = { col, row, w: width, h }
      if (isFree(slot, placed)) return slot
    }
  }
}

/** Turns picker counts into a packed layout, syncing each kind to the desired absolute count. */
export function packModules(
  counts: Partial<Record<ModuleKind, number>>,
  existing: PlacedModule[] = [],
): PlacedModule[] {
  let placed = [...existing]
  let sequence = existing.length

  for (const def of Object.values(MODULES_BY_KIND)) {
    const kind = def.kind
    const want = Math.max(0, counts[kind] ?? 0)
    const current = placed.filter((module) => module.kind === kind)

    if (current.length > want) {
      const keep = new Set(current.slice(0, want).map((module) => module.id))
      placed = placed.filter((module) => module.kind !== kind || keep.has(module.id))
    } else if (current.length < want) {
      for (let index = current.length; index < want; index += 1) {
        const slot = findSlot(def.defaultSize.w, def.defaultSize.h, placed)
        sequence += 1
        placed.push({
          id: `${kind}-${sequence}`,
          kind,
          tab: def.tabs?.[0],
          ...slot,
        })
      }
    }
  }

  return placed
}

/** Counts of each module kind currently on a canvas. */
export function countModulesByKind(modules: PlacedModule[]): Partial<Record<ModuleKind, number>> {
  const counts: Partial<Record<ModuleKind, number>> = {}
  for (const module of modules) {
    counts[module.kind] = (counts[module.kind] ?? 0) + 1
  }
  return counts
}
