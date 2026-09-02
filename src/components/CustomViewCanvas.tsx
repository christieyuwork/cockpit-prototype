import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BRIEF_DATES } from '../data/dummy'
import {
  MODULES_BY_KIND,
  type AppView,
  type PlacedModule,
} from '../data/customViews'
import { NewViewModal, type NewViewDraft } from './NewViewModal'
import {
  GRID_COLS,
  GRID_ROWS,
  clamp,
  previewMove,
  previewResize,
  type Slot,
} from '../lib/grid'
import { ModuleBody } from './ModuleBody'
import { ModuleConfigureModal } from './ModuleConfigureModal'
import { IssuesPage } from './IssuesPage'
import { ExecReportingPage } from './ExecReportingPage'
import { FilterChip } from './FilterChip'
import type { ModuleConfig } from '../data/moduleConfig'
import './CustomViewCanvas.css'

const GRID_GAP = 16

type DragState = {
  id: string
  mode: 'move' | 'resize'
  pointerId: number
  /** Pointer offset inside the card at grab time, so the card stays under the cursor. */
  grabX: number
  grabY: number
  /** Card top-left in grid content coordinates at grab time. */
  originLeft: number
  originTop: number
  /** Live floating position in grid content coordinates. */
  left: number
  top: number
  origin: PlacedModule
  dx: number
  dy: number
  target: Slot
  preview: PlacedModule[] | null
}

function footprintPx(slot: Pick<Slot, 'w' | 'h'>, cell: { w: number; h: number }) {
  return {
    width: slot.w * cell.w + (slot.w - 1) * GRID_GAP,
    height: slot.h * cell.h + (slot.h - 1) * GRID_GAP,
  }
}

function CanvasModule({
  module,
  configuring,
  menuFor,
  setMenuFor,
  onSetTab,
  onRemove,
  onConfigure,
  onModuleKeyDown,
  onStartDrag,
  dragging,
  style,
  className,
}: {
  module: PlacedModule
  configuring: boolean
  menuFor: string | null
  setMenuFor: (id: string | null | ((current: string | null) => string | null)) => void
  onSetTab: (id: string, tab: string) => void
  onRemove: (id: string) => void
  onConfigure: (id: string) => void
  onModuleKeyDown: (event: React.KeyboardEvent, module: PlacedModule) => void
  onStartDrag: (event: React.PointerEvent, module: PlacedModule, mode: 'move' | 'resize') => void
  dragging?: boolean
  style?: React.CSSProperties
  className?: string
}) {
  const [headerTarget, setHeaderTarget] = useState<HTMLDivElement | null>(null)
  const def = MODULES_BY_KIND[module.kind]
  const moduleTitle = module.title?.trim() || def.title
  const tabOptions =
    module.kind === 'matches'
      ? module.config?.matchDateMode === 'specific' ||
        module.config?.matchDateMode === 'upcoming'
        ? undefined
        : module.config?.matchRelativeDays?.length
          ? module.config.matchRelativeDays
          : def.tabs
      : module.kind === 'liveFeed' && module.config?.feedSources?.length
        ? module.config.feedSources
        : def.tabs

  return (
    <section
      className={`canvas__module acrylic-card${dragging ? ' is-dragging' : ''}${
        className ? ` ${className}` : ''
      }`}
      style={{
        gridColumn: `${module.col} / span ${module.w}`,
        gridRow: `${module.row} / span ${module.h}`,
        ...style,
      }}
      tabIndex={configuring ? 0 : -1}
      aria-label={
        configuring
          ? `${moduleTitle} module. Use arrow keys to move, shift and arrow keys to resize.`
          : `${moduleTitle} module`
      }
      onKeyDown={(event) => {
        if (configuring) onModuleKeyDown(event, module)
      }}
      onPointerDown={(event) => {
        if (!configuring || dragging) return
        const target = event.target as HTMLElement
        if (target.closest('button, select, a, input, textarea, .canvas__resize, .canvas__menu')) {
          return
        }
        onStartDrag(event, module, 'move')
      }}
    >
      <header className="canvas__module-head">
        {configuring ? (
          <span className="canvas__drag" role="presentation">
            <img src="/assets/icons/drag.svg" alt="" width={14} height={14} />
          </span>
        ) : null}
        <span className="section-title canvas__module-title">
          {moduleTitle}
          <span className="icon-box">
            <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
          </span>
        </span>
        <div className="canvas__module-actions">
          <div className="canvas__module-filters" ref={setHeaderTarget} />
          {tabOptions && tabOptions.length > 1 ? (
            <FilterChip
              value={
                tabOptions.includes(module.tab ?? '')
                  ? (module.tab as string)
                  : tabOptions[0]
              }
              options={tabOptions}
              onChange={(next) => onSetTab(module.id, next)}
            />
          ) : null}
          {configuring ? (
            <div className="canvas__menu">
              <button
                type="button"
                className="canvas__kebab"
                aria-label={`${moduleTitle} options`}
                aria-expanded={menuFor === module.id}
                onClick={() =>
                  setMenuFor((current) => (current === module.id ? null : module.id))
                }
              >
                <img src="/assets/icons/more.svg" alt="" width={16} height={16} />
              </button>
              {menuFor === module.id ? (
                <div className="canvas__menu-list">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuFor(null)
                      onConfigure(module.id)
                    }}
                  >
                    Configure module
                  </button>
                  <button type="button" onClick={() => onRemove(module.id)}>
                    Remove module
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <div className="canvas__module-body">
        <ModuleBody
          kind={module.kind}
          tabs={def.tabs}
          tab={module.tab ?? tabOptions?.[0] ?? def.tabs?.[0]}
          onTabChange={(tab) => onSetTab(module.id, tab)}
          w={module.w}
          h={module.h}
          headerTarget={headerTarget}
          config={module.config}
        />
      </div>

      {configuring ? (
        <span
          className="canvas__resize"
          role="presentation"
          onPointerDown={(event) => {
            event.stopPropagation()
            onStartDrag(event, module, 'resize')
          }}
        />
      ) : null}
    </section>
  )
}

export function CustomViewCanvas({
  view,
  onChange,
  onSaveSettings,
  onDeleteView,
  onAddModules,
  configuring,
  onConfiguringChange,
}: {
  view: AppView
  onChange: (modules: PlacedModule[]) => void
  onSaveSettings: (draft: NewViewDraft) => void
  onDeleteView?: () => void
  onAddModules: () => void
  configuring: boolean
  onConfiguringChange: (value: boolean) => void
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const cellRef = useRef({ w: 1, h: 1 })
  const [drag, setDrag] = useState<DragState | null>(null)
  const [date, setDate] = useState<(typeof BRIEF_DATES)[number]>('15 Jun')
  const [dateOpen, setDateOpen] = useState(false)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [configureId, setConfigureId] = useState<string | null>(null)

  /** Other modules use the live preview so swaps animate into place. */
  const restingModules = useMemo(() => {
    const layout = drag?.preview ?? view.modules
    return drag ? layout.filter((module) => module.id !== drag.id) : layout
  }, [drag, view.modules])

  const rows = Math.max(
    GRID_ROWS,
    ...view.modules.map((module) => module.row + module.h - 1),
    ...restingModules.map((module) => module.row + module.h - 1),
    ...(drag ? [drag.target.row + drag.target.h - 1] : []),
  )

  const ghostSlot = useMemo(() => {
    if (!drag) return null
    if (drag.preview) {
      const moved = drag.preview.find((module) => module.id === drag.id)
      if (moved) return { col: moved.col, row: moved.row, w: moved.w, h: moved.h }
    }
    return drag.target
  }, [drag])

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    function measure() {
      if (!grid) return
      const styles = getComputedStyle(grid)
      const gapX = parseFloat(styles.columnGap) || GRID_GAP
      const gapY = parseFloat(styles.rowGap) || GRID_GAP
      const rowH = parseFloat(styles.getPropertyValue('--grid-row-h')) || 100
      const width = grid.clientWidth
      cellRef.current = {
        w: (width - gapX * (GRID_COLS - 1)) / GRID_COLS,
        h: rowH,
      }
      // Keep extra vertical space when more than 8 rows so page scroll works.
      void gapY
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(grid)
    return () => observer.disconnect()
  }, [rows])

  const dragRef = useRef<DragState | null>(null)
  const modulesRef = useRef(view.modules)
  const commitRef = useRef(onChange)
  modulesRef.current = view.modules
  commitRef.current = onChange

  function buildPreview(
    mode: DragState['mode'],
    id: string,
    target: Slot,
    modules: PlacedModule[],
  ) {
    return mode === 'move' ? previewMove(modules, id, target) : previewResize(modules, id, target)
  }

  function startDrag(event: React.PointerEvent, module: PlacedModule, mode: DragState['mode']) {
    if (!configuring) return
    event.preventDefault()
    event.stopPropagation()
    setMenuFor(null)

    const grid = gridRef.current
    const card = (event.currentTarget as HTMLElement).closest('.canvas__module') as HTMLElement | null
    if (!grid || !card) return

    const gridRect = grid.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const originLeft = cardRect.left - gridRect.left + grid.scrollLeft
    const originTop = cardRect.top - gridRect.top + grid.scrollTop
    cellRef.current = {
      w: (cardRect.width - (module.w - 1) * GRID_GAP) / module.w,
      h: (cardRect.height - (module.h - 1) * GRID_GAP) / module.h,
    }

    const target: Slot = { col: module.col, row: module.row, w: module.w, h: module.h }
    const state: DragState = {
      id: module.id,
      mode,
      pointerId: event.pointerId,
      grabX: event.clientX - cardRect.left,
      grabY: event.clientY - cardRect.top,
      originLeft,
      originTop,
      left: originLeft,
      top: originTop,
      origin: module,
      dx: 0,
      dy: 0,
      target,
      preview: buildPreview(mode, module.id, target, modulesRef.current),
    }
    dragRef.current = state
    setDrag(state)

    function onMove(moveEvent: PointerEvent) {
      const current = dragRef.current
      if (!current || moveEvent.pointerId !== current.pointerId) return

      const liveGrid = gridRef.current
      if (!liveGrid) return
      const liveRect = liveGrid.getBoundingClientRect()
      const cell = cellRef.current
      const pointerX = moveEvent.clientX - liveRect.left + liveGrid.scrollLeft
      const pointerY = moveEvent.clientY - liveRect.top + liveGrid.scrollTop

      let { left, top } = current
      let dx: number
      let dy: number

      if (current.mode === 'move') {
        left = pointerX - current.grabX
        top = pointerY - current.grabY
        dx = left - current.originLeft
        dy = top - current.originTop
      } else {
        dx = pointerX - (current.originLeft + current.grabX)
        dy = pointerY - (current.originTop + current.grabY)
      }

      const stepX = Math.round(dx / (cell.w + GRID_GAP))
      const stepY = Math.round(dy / (cell.h + GRID_GAP))
      const { origin } = current

      const nextTarget: Slot =
        current.mode === 'move'
          ? {
              col: clamp(origin.col + stepX, 1, GRID_COLS - origin.w + 1),
              row: Math.max(1, origin.row + stepY),
              w: origin.w,
              h: origin.h,
            }
          : {
              col: origin.col,
              row: origin.row,
              w: clamp(origin.w + stepX, 1, GRID_COLS - origin.col + 1),
              h: Math.max(1, origin.h + stepY),
            }

      const preview = buildPreview(current.mode, current.id, nextTarget, modulesRef.current)
      const next = { ...current, left, top, dx, dy, target: nextTarget, preview }
      dragRef.current = next
      setDrag(next)
    }

    function onUp(upEvent: PointerEvent) {
      const current = dragRef.current
      if (!current || upEvent.pointerId !== current.pointerId) return

      if (current.preview) commitRef.current(current.preview)

      dragRef.current = null
      setDrag(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  function nudge(module: PlacedModule, dCol: number, dRow: number, resize: boolean) {
    const target = resize
      ? {
          col: module.col,
          row: module.row,
          w: clamp(module.w + dCol, 1, GRID_COLS - module.col + 1),
          h: Math.max(1, module.h + dRow),
        }
      : {
          col: clamp(module.col + dCol, 1, GRID_COLS - module.w + 1),
          row: Math.max(1, module.row + dRow),
          w: module.w,
          h: module.h,
        }

    const preview = buildPreview(resize ? 'resize' : 'move', module.id, target, view.modules)
    if (preview) onChange(preview)
  }

  function onModuleKeyDown(event: React.KeyboardEvent, module: PlacedModule) {
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }
    const delta = deltas[event.key]
    if (!delta) return
    event.preventDefault()
    nudge(module, delta[0], delta[1], event.shiftKey)
  }

  function removeModule(id: string) {
    onChange(view.modules.filter((module) => module.id !== id))
    setMenuFor(null)
  }

  function setTab(id: string, tab: string) {
    onChange(view.modules.map((module) => (module.id === id ? { ...module, tab } : module)))
  }

  function saveModuleConfig(id: string, next: { config: ModuleConfig; title: string }) {
    onChange(
      view.modules.map((module) =>
        module.id === id
          ? {
              ...module,
              config: next.config,
              title: next.title === MODULES_BY_KIND[module.kind].title ? undefined : next.title,
            }
          : module,
      ),
    )
    setConfigureId(null)
  }

  const configuringModule = configureId
    ? view.modules.find((module) => module.id === configureId)
    : undefined

  const floating =
    drag &&
    (() => {
      const cell = cellRef.current
      const size =
        drag.mode === 'resize'
          ? footprintPx(drag.target, cell)
          : footprintPx(drag.origin, cell)
      const origin = { left: drag.left, top: drag.top }
      const floatingModule = {
        ...drag.origin,
        ...(drag.mode === 'resize' ? { w: drag.target.w, h: drag.target.h } : {}),
      }
      return (
        <CanvasModule
          key={`${drag.id}-float`}
          module={floatingModule}
          configuring={configuring}
          menuFor={menuFor}
          setMenuFor={setMenuFor}
          onSetTab={setTab}
          onRemove={removeModule}
          onConfigure={setConfigureId}
          onModuleKeyDown={onModuleKeyDown}
          onStartDrag={startDrag}
          dragging
          className={drag.preview ? undefined : 'is-invalid'}
          style={{
            position: 'absolute',
            left: origin.left,
            top: origin.top,
            width: size.width,
            height: size.height,
            gridColumn: 'auto',
            gridRow: 'auto',
            zIndex: 20,
          }}
        />
      )
    })()

  if (view.layout === 'issues') {
    return (
      <div className={`canvas${configuring ? ' is-configuring' : ''}`}>
        <IssuesPage
          date={date}
          onDateChange={(value) => {
            if ((BRIEF_DATES as readonly string[]).includes(value)) {
              setDate(value as (typeof BRIEF_DATES)[number])
            }
          }}
          dates={[...BRIEF_DATES]}
        />
        {settingsOpen ? (
          <NewViewModal
            mode="edit"
            initial={{
              title: view.title,
              visibility: view.visibility,
              sharedWith: view.sharedWith,
            }}
            onCancel={() => setSettingsOpen(false)}
            onSubmit={(draft) => {
              onSaveSettings(draft)
              setSettingsOpen(false)
            }}
            onDelete={view.system ? undefined : onDeleteView}
          />
        ) : null}
      </div>
    )
  }

  if (view.layout === 'exec-report') {
    return (
      <div className={`canvas${configuring ? ' is-configuring' : ''}`}>
        <ExecReportingPage />
        {settingsOpen ? (
          <NewViewModal
            mode="edit"
            initial={{
              title: view.title,
              visibility: view.visibility,
              sharedWith: view.sharedWith,
            }}
            onCancel={() => setSettingsOpen(false)}
            onSubmit={(draft) => {
              onSaveSettings(draft)
              setSettingsOpen(false)
            }}
            onDelete={view.system ? undefined : onDeleteView}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className={`canvas${configuring ? ' is-configuring' : ''}`}>
      <div className="canvas__head">
        <div className="canvas__head-left">
          <h1 className="canvas__title">{view.title}</h1>
          <div className="canvas__date">
            <button
              type="button"
              className="chip"
              aria-expanded={dateOpen}
              onClick={() => setDateOpen((open) => !open)}
            >
              {date}
              <span className="icon-box">
                <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
              </span>
            </button>
            {dateOpen ? (
              <div className="canvas__date-list">
                {BRIEF_DATES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={option === date ? 'is-active' : undefined}
                    onClick={() => {
                      setDate(option)
                      setDateOpen(false)
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {view.leftAction === 'tomAgenda' ? (
            <button type="button" className="chip canvas__agenda">
              TOM AGENDA
              <span className="icon-box">
                <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
              </span>
            </button>
          ) : null}
        </div>
        <div className="canvas__head-right">
          {configuring ? (
            <button type="button" className="canvas__tool" onClick={onAddModules}>
              Add module
              <img src="/assets/icons/data-store.svg" alt="" width={14} height={14} />
            </button>
          ) : null}
          <button
            type="button"
            className={`canvas__tool canvas__tool--icon${configuring ? ' is-active' : ''}`}
            aria-label="Configure"
            aria-pressed={configuring}
            onClick={() => {
              onConfiguringChange(!configuring)
              setMenuFor(null)
            }}
          >
            <img src="/assets/icons/filters-adv.svg" alt="" width={24} height={24} />
          </button>
          <button
            type="button"
            className="canvas__tool canvas__tool--icon"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <img src="/assets/icons/settings.svg" alt="" width={24} height={24} />
          </button>
        </div>
      </div>

      <div
        className="canvas__grid"
        ref={gridRef}
        style={{ '--grid-cols': GRID_COLS, '--grid-rows': rows } as React.CSSProperties}
      >
        {ghostSlot ? (
          <div
            className={`canvas__ghost${drag?.preview ? '' : ' is-invalid'}`}
            style={{
              gridColumn: `${ghostSlot.col} / span ${ghostSlot.w}`,
              gridRow: `${ghostSlot.row} / span ${ghostSlot.h}`,
            }}
            aria-hidden
          />
        ) : null}

        {restingModules.map((module) => (
          <CanvasModule
            key={module.id}
            module={module}
            configuring={configuring}
            menuFor={menuFor}
            setMenuFor={setMenuFor}
            onSetTab={setTab}
            onRemove={removeModule}
            onConfigure={setConfigureId}
            onModuleKeyDown={onModuleKeyDown}
            onStartDrag={startDrag}
          />
        ))}
        {floating}

        {view.modules.length === 0 ? (
          <p className="canvas__empty">
            No modules yet.{' '}
            {configuring ? (
              <>
                Use <strong>Add module</strong> to build this view.
              </>
            ) : (
              <>
                Turn on <strong>Configure</strong> to add and arrange modules.
              </>
            )}
          </p>
        ) : null}
      </div>

      {settingsOpen ? (
        <NewViewModal
          mode="edit"
          initial={{
            title: view.title,
            visibility: view.visibility,
            sharedWith: view.sharedWith,
          }}
          onCancel={() => setSettingsOpen(false)}
          onSubmit={(draft) => {
            onSaveSettings(draft)
            setSettingsOpen(false)
          }}
          onDelete={view.system ? undefined : onDeleteView}
        />
      ) : null}

      {configuringModule ? (
        <ModuleConfigureModal
          module={configuringModule}
          onCancel={() => setConfigureId(null)}
          onSave={(next) => saveModuleConfig(configuringModule.id, next)}
        />
      ) : null}
    </div>
  )
}
