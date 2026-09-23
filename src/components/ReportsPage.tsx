import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type {
  ColumnKey,
  FilterState,
  GroupField,
  GroupNode,
  GroupPreset,
  SecRecord,
  SortSpec,
} from '../data/sec/types'
import { defaultSavedView, loadSecPrefs, saveSecPrefs } from '../lib/secPrefs'
import {
  COLUMN_LABELS,
  DEFAULT_COLUMNS,
  GROUPABLE_COLUMNS,
  OPTIONAL_COLUMNS,
  SEC_RECORDS,
  columnToGroupField,
  emptyFilters,
  facetValues,
  filterRecords,
  groupRecords,
  highlightParts,
  historyFor,
  presetFields,
  recordField,
  reportCount,
  snippet,
  sortRows,
  venueLabel,
} from '../lib/secReports'
import './ReportsPage.css'
import './ExecReportingPage.css'

type SmartFilter = 'all' | 'questions' | 'answers' | 'owners' | 'venues' | 'questionnaires' | 'reports'

const SMART_FILTERS: { id: SmartFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'questions', label: 'Questions' },
  { id: 'answers', label: 'Answers' },
  { id: 'owners', label: 'Owners' },
  { id: 'venues', label: 'Venues' },
  { id: 'questionnaires', label: 'Questionnaires' },
  { id: 'reports', label: 'Reports' },
]

/** Relative column widths so the table always fits its container (no horizontal scroll). */
const COLUMN_WEIGHTS: Record<ColumnKey, number> = {
  checktitle: 26,
  textresponse: 32,
  city: 8,
  stadium: 13,
  owners: 13,
  reporting_date: 10,
  questionnaire_name: 15,
  section_name: 13,
  subarea: 11,
  responsetype: 11,
  priority: 9,
  status: 10,
  checkresponse: 11,
}

/**
 * Popovers inside the sticky table header get clipped by the scroll container and
 * trapped in its stacking context, so they render in a portal anchored to their button.
 */
function AnchoredPanel({
  anchorRef,
  onClose,
  className,
  align = 'right',
  role,
  label,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement>
  onClose: () => void
  className: string
  align?: 'left' | 'right'
  role?: string
  label?: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const [rect, setRect] = useState<DOMRect | null>(null)

  useLayoutEffect(() => {
    function update() {
      const next = anchorRef.current?.getBoundingClientRect()
      if (next) setRect(next)
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [anchorRef])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return
      closeRef.current()
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeRef.current()
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [anchorRef])

  if (!rect) return null

  const style =
    align === 'right'
      ? { top: rect.bottom + 6, right: Math.max(12, window.innerWidth - rect.right) }
      : { top: rect.bottom + 6, left: Math.max(12, rect.left) }

  return createPortal(
    <div ref={panelRef} className={className} style={style} role={role} aria-label={label}>
      {children}
    </div>,
    document.body,
  )
}

/** Every column except the free-text answer, which has no enumerable option list. */
const FILTERABLE_COLUMNS = [...DEFAULT_COLUMNS, ...OPTIONAL_COLUMNS].filter(
  (key) => key !== 'textresponse',
) as ColumnKey[]

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "2026-06-15" -> "15 June", the phrasing used across the header. */
function formatDayLabel(value: string) {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${Number(day)} ${MONTH_NAMES[Number(month) - 1] ?? month}`
}

function DateSelect({
  value,
  dates,
  todayDate,
  onChange,
}: {
  value: string
  dates: string[]
  todayDate: string
  onChange: (next: string) => void
}) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const label =
    value === 'today'
      ? 'Today'
      : value === 'all'
        ? 'All dates'
        : value === 'custom'
          ? 'Custom range'
          : formatDayLabel(value)

  const pickerValue = value === 'today' ? todayDate : /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''

  return (
    <div className="reports-datepicker">
      <button
        ref={buttonRef}
        type="button"
        className="chip reports-chip"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        {label}
        <span className="icon-box">
          <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
        </span>
      </button>
      {open ? (
        <AnchoredPanel
          anchorRef={buttonRef}
          onClose={() => setOpen(false)}
          className="reports-datepicker__panel"
          role="dialog"
          label="Choose reporting date"
        >
          <button
            type="button"
            className={value === 'today' ? 'is-active' : undefined}
            onClick={() => {
              onChange('today')
              setOpen(false)
            }}
          >
            Today · {formatDayLabel(todayDate)}
          </button>
          <button
            type="button"
            className={value === 'all' ? 'is-active' : undefined}
            onClick={() => {
              onChange('all')
              setOpen(false)
            }}
          >
            All dates
          </button>
          <label className="reports-datepicker__field">
            <span>Pick a day</span>
            <input
              type="date"
              value={pickerValue}
              min={dates[0]}
              max={dates[dates.length - 1]}
              onChange={(event) => {
                if (!event.target.value) return
                onChange(event.target.value)
                setOpen(false)
              }}
            />
          </label>
        </AnchoredPanel>
      ) : null}
    </div>
  )
}

function formatDate(value: string) {
  if (!value) return ''
  const [y, m, d] = value.split('-')
  if (!y || !m || !d) return value
  return `${y}-${m}-${d}`
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  return (
    <>
      {highlightParts(text, query).map((part, index) =>
        part.match ? <mark key={index}>{part.text}</mark> : <span key={index}>{part.text}</span>,
      )}
    </>
  )
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const summary = selected.length === 0 ? `All ${label.toLowerCase()}` : `${label} (${selected.length})`

  return (
    <div className={`filter-menu${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="chip reports-chip"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {summary}
        <span className="icon-box">
          <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
        </span>
      </button>
      {open ? (
        <div className="filter-menu__list reports-multiselect scroll-area" role="listbox">
          <button
            type="button"
            role="option"
            aria-selected={selected.length === 0}
            className={selected.length === 0 ? 'is-active' : undefined}
            onClick={() => {
              onChange([])
              setOpen(false)
            }}
          >
            <span className="reports-check" aria-hidden>{selected.length === 0 ? '✓' : ''}</span>
            <span>All {label.toLowerCase()}</span>
          </button>
          {options.map((option) => {
            const on = selected.includes(option)
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={on}
                className={on ? 'is-active' : undefined}
                onClick={() =>
                  onChange(on ? selected.filter((item) => item !== option) : [...selected, option])
                }
              >
                <span className="reports-check" aria-hidden>{on ? '✓' : ''}</span>
                <span>{option}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function ColumnFilterMenu({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className={`reports-column-filter${open ? ' is-open' : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className={selected.length ? 'is-active' : undefined}
        aria-label={`Filter ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <img src="/assets/icons/filter.svg" alt="" />
      </button>
      {open ? (
        <AnchoredPanel
          anchorRef={buttonRef}
          onClose={() => setOpen(false)}
          className="reports-column-filter__menu scroll-area"
          role="listbox"
          label={`${label} filters`}
        >
          <button
            type="button"
            role="option"
            aria-selected={selected.length === 0}
            className={selected.length === 0 ? 'is-active' : undefined}
            onClick={() => onChange([])}
          >
            <span className="reports-check" aria-hidden>{selected.length === 0 ? '✓' : ''}</span>
            <span>All</span>
          </button>
          {options.map((option) => {
            const on = selected.includes(option)
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={on}
                className={on ? 'is-active' : undefined}
                onClick={() =>
                  onChange(on ? selected.filter((item) => item !== option) : [...selected, option])
                }
              >
                <span className="reports-check" aria-hidden>{on ? '✓' : ''}</span>
                <span>{option || 'Blank'}</span>
              </button>
            )
          })}
        </AnchoredPanel>
      ) : null}
    </div>
  )
}

function FaSelect({
  fas,
  subareas,
  selectedFas,
  selectedSubareas,
  onFasChange,
  onSubareasChange,
}: {
  fas: string[]
  subareas: string[]
  selectedFas: string[]
  selectedSubareas: string[]
  onFasChange: (next: string[]) => void
  onSubareasChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const secOn = selectedFas.includes('SEC')

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  const summary =
    selectedSubareas.length > 0 ? `SEC (${selectedSubareas.length})` : secOn ? 'SEC' : 'All FAs'

  return (
    <div className={`filter-menu filter-menu--start${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="chip reports-chip"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {summary}
        <span className="icon-box">
          <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
        </span>
      </button>
      {open ? (
        <div className="filter-menu__list reports-multiselect reports-fa-tree scroll-area" role="listbox">
          {fas.map((fa) => {
            const on = selectedFas.includes(fa)
            return (
              <div key={fa} className="reports-fa-tree__group">
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  className={on ? 'is-active' : undefined}
                  onClick={() => {
                    onFasChange(on ? [] : [fa])
                    if (on) onSubareasChange([])
                  }}
                >
                  <span className="reports-check" aria-hidden>{on ? '✓' : ''}</span>
                  <strong>{fa}</strong>
                </button>
                {on
                  ? subareas.map((subarea) => {
                      const childOn = selectedSubareas.includes(subarea)
                      return (
                        <button
                          key={subarea}
                          type="button"
                          role="option"
                          aria-selected={childOn}
                          className={`reports-fa-tree__child${childOn ? ' is-active' : ''}`}
                          onClick={() =>
                            onSubareasChange(
                              childOn
                                ? selectedSubareas.filter((item) => item !== subarea)
                                : [...selectedSubareas, subarea],
                            )
                          }
                        >
                          <span className="reports-check" aria-hidden>{childOn ? '✓' : ''}</span>
                          <span>{subarea}</span>
                        </button>
                      )
                    })
                  : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function ReportsSmartSearch({
  records,
  query,
  onQueryChange,
  onOpenRecord,
  onApplyOwner,
  onApplyVenue,
  onApplyQuestionnaire,
}: {
  records: SecRecord[]
  query: string
  onQueryChange: (value: string) => void
  onOpenRecord: (row: SecRecord) => void
  onApplyOwner: (value: string) => void
  onApplyVenue: (value: string) => void
  onApplyQuestionnaire: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<SmartFilter>('all')
  const rootRef = useRef<HTMLDivElement>(null)
  const q = query.trim().toLowerCase()

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const owners = useMemo(() => {
    if (!q) return [] as string[]
    return [...new Set(records.filter((row) => row.owners.toLowerCase().includes(q)).map((row) => row.owners))]
  }, [q, records])

  const venues = useMemo(() => {
    if (!q) return [] as { label: string; stadium: string }[]
    const map = new Map<string, { label: string; stadium: string }>()
    for (const row of records) {
      const label = venueLabel(row)
      if (row.city.toLowerCase().includes(q) || row.stadium.toLowerCase().includes(q)) {
        map.set(row.stadiumcode, { label, stadium: row.stadium })
      }
    }
    return [...map.values()]
  }, [q, records])

  const questionnaires = useMemo(() => {
    if (!q) return [] as string[]
    return [
      ...new Set(
        records
          .filter((row) => row.questionnaire_name.toLowerCase().includes(q))
          .map((row) => row.questionnaire_name),
      ),
    ]
  }, [q, records])

  const questions = useMemo(() => {
    if (!q) return [] as SecRecord[]
    const seen = new Set<string>()
    const hits: SecRecord[] = []
    for (const row of records) {
      if (!row.checktitle.toLowerCase().includes(q) || seen.has(row.question_id)) continue
      seen.add(row.question_id)
      hits.push(row)
      if (hits.length >= 8) break
    }
    return hits
  }, [q, records])

  const answers = useMemo(() => {
    if (!q) return [] as SecRecord[]
    return records.filter((row) => row.textresponse.toLowerCase().includes(q)).slice(0, 8)
  }, [q, records])

  const reports = useMemo(() => {
    if (!q) return [] as SecRecord[]
    const seen = new Set<number>()
    const hits: SecRecord[] = []
    for (const row of records) {
      if (seen.has(row.jobid)) continue
      if (row.jobtitle.toLowerCase().includes(q) || String(row.jobid).includes(q)) {
        seen.add(row.jobid)
        hits.push(row)
      }
      if (hits.length >= 8) break
    }
    return hits
  }, [q, records])

  const show = (kind: SmartFilter) => filter === 'all' || filter === kind
  const hasResults =
    (show('owners') && owners.length > 0) ||
    (show('venues') && venues.length > 0) ||
    (show('questionnaires') && questionnaires.length > 0) ||
    (show('questions') && questions.length > 0) ||
    (show('answers') && answers.length > 0) ||
    (show('reports') && reports.length > 0)

  return (
    <div className={`exec-smart reports-smart${open ? ' is-open' : ''}`} ref={rootRef}>
      <label className="exec-smart__field">
        <img src="/assets/icons/search.svg" alt="" width={16} height={16} />
        <input
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search questions, answers, owners, venues…"
        />
      </label>
      {open ? (
        <div className="exec-smart__panel acrylic-card" role="listbox" aria-label="Search results">
          <div className="exec-smart__filters">
            {SMART_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`exec-smart__filter${filter === item.id ? ' is-active' : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {!q ? (
            <p className="exec-smart__hint">
              Try a question, a city, an owner, or part of an answer. Matches stay highlighted in the table.
            </p>
          ) : !hasResults ? (
            <p className="exec-smart__hint">No matches for “{query.trim()}”.</p>
          ) : (
            <div className="exec-smart__body scroll-area">
              {show('owners') && owners.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Owners</h3>
                  <div className="exec-smart__list">
                    {owners.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          onApplyOwner(name)
                          setOpen(false)
                        }}
                      >
                        <span className="exec-smart__icon">P</span>
                        <span>
                          <strong>
                            <Highlight text={name} query={query} />
                          </strong>
                          <span className="exec-smart__sub">Filter table to this owner</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {show('venues') && venues.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Venues</h3>
                  <div className="exec-smart__list">
                    {venues.map((item) => (
                      <button
                        key={item.stadium}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          onApplyVenue(item.stadium)
                          setOpen(false)
                        }}
                      >
                        <span className="exec-smart__icon">V</span>
                        <span>
                          <strong>
                            <Highlight text={item.label} query={query} />
                          </strong>
                          <span className="exec-smart__sub">Filter table to this venue</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {show('questionnaires') && questionnaires.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Questionnaires</h3>
                  <div className="exec-smart__list">
                    {questionnaires.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          onApplyQuestionnaire(name)
                          setOpen(false)
                        }}
                      >
                        <span className="exec-smart__icon is-topic">Q</span>
                        <span>
                          <strong>
                            <Highlight text={name} query={query} />
                          </strong>
                          <span className="exec-smart__sub">Filter table to this family</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {show('questions') && questions.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Questions</h3>
                  <div className="exec-smart__list">
                    {questions.map((row) => (
                      <button
                        key={row.question_id}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          onOpenRecord(row)
                          setOpen(false)
                        }}
                      >
                        <span className="exec-smart__icon is-topic">?</span>
                        <span>
                          <strong>
                            <Highlight text={snippet(row.checktitle, query)} query={query} />
                          </strong>
                          <span className="exec-smart__sub">{row.questionnaire_name}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {show('answers') && answers.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Answers</h3>
                  <div className="exec-smart__list">
                    {answers.map((row) => (
                      <button
                        key={row.checklistitemid}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          onOpenRecord(row)
                          setOpen(false)
                        }}
                      >
                        <span className="exec-smart__icon is-file">A</span>
                        <span>
                          <strong>
                            <Highlight text={snippet(row.textresponse, query)} query={query} />
                          </strong>
                          <span className="exec-smart__sub">
                            {venueLabel(row)} · {row.reporting_date}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              {show('reports') && reports.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Reports</h3>
                  <div className="exec-smart__list">
                    {reports.map((row) => (
                      <button
                        key={row.jobid}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          onOpenRecord(row)
                          setOpen(false)
                        }}
                      >
                        <span className="exec-smart__icon">R</span>
                        <span>
                          <strong>
                            <Highlight text={row.jobtitle} query={query} />
                          </strong>
                          <span className="exec-smart__sub">Report {row.jobid}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function ReportsPage() {
  const facets = useMemo(() => facetValues(SEC_RECORDS), [])
  const firstDate = facets.dates[0] ?? ''
  const todayDate = facets.dates[facets.dates.length - 1] ?? ''
  const [prefs, setPrefs] = useState(loadSecPrefs)
  const [storageOk, setStorageOk] = useState(true)
  const [filters, setFilters] = useState<FilterState>(() => emptyFilters(SEC_RECORDS))
  const [search, setSearch] = useState('')
  const [columnSearches, setColumnSearches] = useState<Partial<Record<ColumnKey, string>>>({})
  const [columnFilters, setColumnFilters] = useState<Partial<Record<ColumnKey, string[]>>>({})
  const [grouping, setGrouping] = useState<GroupPreset>('flat')
  const [groupFields, setGroupFields] = useState<GroupField[]>([])
  const [sort, setSort] = useState<SortSpec | null>(null)
  const [columns, setColumns] = useState<ColumnKey[]>(DEFAULT_COLUMNS)
  const [starredOnly, setStarredOnly] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [viewsOpen, setViewsOpen] = useState(false)
  const [viewName, setViewName] = useState('')
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [acrossQuestionId, setAcrossQuestionId] = useState('')
  const tableRef = useRef<HTMLDivElement>(null)
  const savedViewsRef = useRef<HTMLButtonElement>(null)
  const [draggedColumn, setDraggedColumn] = useState<ColumnKey | null>(null)

  const starredIds = useMemo(() => new Set(prefs.stars), [prefs.stars])

  useEffect(() => {
    setStorageOk(saveSecPrefs(prefs))
  }, [prefs])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (moreOpen) setMoreOpen(false)
      else setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [moreOpen])

  const baseFiltered = useMemo(
    () =>
      filterRecords(SEC_RECORDS, filters, {
        search,
        columnSearches,
        starredIds,
        starredOnly: starredOnly || grouping === 'starred',
        // Starred keeps historical answers visible instead of collapsing to the latest.
        skipLatest: starredOnly || grouping === 'starred' || grouping === 'acrossTime',
      }),
    [columnSearches, filters, grouping, search, starredIds, starredOnly],
  )

  const filtered = useMemo(
    () =>
      baseFiltered.filter((row) =>
        (Object.entries(columnFilters) as [ColumnKey, string[]][]).every(
          ([key, values]) => values.length === 0 || values.includes(recordField(row, key)),
        ),
      ),
    [baseFiltered, columnFilters],
  )

  const columnFilterOptions = useMemo(
    () =>
      Object.fromEntries(
        ([...DEFAULT_COLUMNS, ...OPTIONAL_COLUMNS] as ColumnKey[]).map((key) => [
          key,
          [...new Set(SEC_RECORDS.map((row) => recordField(row, key)))].sort((a, b) => a.localeCompare(b)),
        ]),
      ) as Record<ColumnKey, string[]>,
    [],
  )

  const sorted = useMemo(() => sortRows(filtered, groupFields.length ? null : sort), [filtered, groupFields.length, sort])
  const groups = useMemo(
    () => (groupFields.length ? groupRecords(filtered, groupFields, sort) : []),
    [filtered, groupFields, sort],
  )

  // Changing the grouping opens the first group and condenses the rest.
  const groupSignature = groupFields.join('|')
  const lastGroupSignature = useRef<string | null>(null)
  useEffect(() => {
    if (lastGroupSignature.current === groupSignature) return
    lastGroupSignature.current = groupSignature
    setCollapsed(new Set(groups.slice(1).map((node) => node.id)))
  }, [groupSignature, groups])

  const selected = filtered.find((row) => row.checklistitemid === selectedId) ?? null
  const history = selected ? historyFor(selected) : []
  const questions = useMemo(() => {
    const map = new Map<string, string>()
    for (const row of SEC_RECORDS) map.set(row.question_id, row.checktitle)
    return [...map.entries()].map(([id, title]) => ({ id, title }))
  }, [])

  const acrossQuestion = acrossQuestionId || questions[0]?.id || ''
  const acrossDates = facets.dates.filter((date) => {
    if (filters.dateFrom && date < filters.dateFrom) return false
    if (filters.dateTo && date > filters.dateTo) return false
    return true
  })
  const acrossRows = useMemo(() => {
    const rows = filterRecords(SEC_RECORDS, filters, {
      search,
      columnSearches,
      skipLatest: true,
    }).filter((row) => row.question_id === acrossQuestion)
    const venues = new Map<string, { venue: string; city: string; byDate: Record<string, SecRecord> }>()
    for (const row of rows) {
      const bucket = venues.get(row.stadiumcode) ?? {
        venue: row.stadium,
        city: row.city,
        byDate: {},
      }
      bucket.byDate[row.reporting_date] = row
      venues.set(row.stadiumcode, bucket)
    }
    return [...venues.values()].sort((a, b) => a.city.localeCompare(b.city) || a.venue.localeCompare(b.venue))
  }, [acrossQuestion, columnSearches, filters, search])

  const chips = useMemo(() => {
    const items: { key: string; label: string; clear: () => void }[] = []
    const add = (key: keyof FilterState, title: string) => {
      const values = filters[key]
      if (!Array.isArray(values) || values.length === 0) return
      values.forEach((value) =>
        items.push({
          key: `${key}-${value}`,
          label: `${title}: ${value}`,
          clear: () =>
            setFilters((current) => ({
              ...current,
              [key]: (current[key] as string[]).filter((item) => item !== value),
            })),
        }),
      )
    }
    add('questionnaires', 'Questionnaire')
    add('fas', 'FA')
    add('sections', 'Section')
    add('subareas', 'Subarea')
    add('cities', 'City')
    add('venues', 'Venue')
    add('owners', 'Owner')
    add('responseTypes', 'Type')
    add('priorities', 'Priority')
    add('statuses', 'Report')
    add('completions', 'Completion')
    if (search.trim()) {
      items.push({ key: 'search', label: `Search: ${search.trim()}`, clear: () => setSearch('') })
    }
    ;(Object.entries(columnFilters) as [ColumnKey, string[]][]).forEach(([key, values]) => {
      values.forEach((value) =>
        items.push({
          key: `column-${key}-${value}`,
          label: `${COLUMN_LABELS[key]}: ${value || 'Blank'}`,
          clear: () =>
            setColumnFilters((current) => ({
              ...current,
              [key]: (current[key] ?? []).filter((item) => item !== value),
            })),
        }),
      )
    })
    return items
  }, [columnFilters, filters, search])

  function persist(next: typeof prefs) {
    setPrefs(next)
  }

  function toggleStar(id: number) {
    persist({
      ...prefs,
      stars: starredIds.has(id) ? prefs.stars.filter((item) => item !== id) : [...prefs.stars, id],
    })
  }

  function applyPreset(preset: GroupPreset) {
    setGrouping(preset)
    setGroupFields(presetFields(preset))
    setCollapsed(new Set())
    if (preset === 'starred') setStarredOnly(true)
  }

  function toggleSort(key: ColumnKey) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: 'asc' }
      if (current.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  function toggleGroupColumn(key: ColumnKey) {
    const field = columnToGroupField(key)
    if (!field) return
    if (groupFields.length === 1 && groupFields[0] === field) {
      applyPreset('flat')
      return
    }
    setGrouping('flat')
    setGroupFields([field])
    setCollapsed(new Set())
  }

  function toggleCollapsed(id: string) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setAllCollapsed(value: boolean) {
    if (!value) {
      setCollapsed(new Set())
      return
    }
    const ids = new Set<string>()
    function walk(nodes: GroupNode[]) {
      for (const node of nodes) {
        ids.add(node.id)
        if (node.children) walk(node.children)
      }
    }
    walk(groups)
    setCollapsed(ids)
  }

  function resetAll() {
    setFilters(emptyFilters(SEC_RECORDS))
    setSearch('')
    setColumnSearches({})
    setColumnFilters({})
    applyPreset('flat')
    setSort(null)
    setColumns(DEFAULT_COLUMNS)
    setStarredOnly(false)
    setSelectedId(null)
    setActiveViewId(null)
  }

  function setReportDay(value: string) {
    if (value === 'all') {
      setFilters((current) => ({ ...current, dateFrom: firstDate, dateTo: todayDate }))
      return
    }
    const date = value === 'today' ? todayDate : value
    setFilters((current) => ({ ...current, dateFrom: date, dateTo: date }))
  }

  const reportDay =
    filters.dateFrom === firstDate && filters.dateTo === todayDate
      ? 'all'
      : filters.dateFrom === todayDate && filters.dateTo === todayDate
        ? 'today'
        : filters.dateFrom === filters.dateTo
          ? filters.dateFrom
          : 'custom'

  function moveColumn(target: ColumnKey) {
    if (!draggedColumn || draggedColumn === target) return
    setColumns((current) => {
      const next = current.filter((key) => key !== draggedColumn)
      const targetIndex = next.indexOf(target)
      next.splice(targetIndex, 0, draggedColumn)
      return next
    })
    setDraggedColumn(null)
  }

  function snapshotView(name: string) {
    return defaultSavedView({
      name,
      filters,
      search,
      columnSearches,
      columnFilters,
      grouping,
      groupFields,
      sort,
      columns,
      density: 'comfortable',
      acrossQuestionId: acrossQuestion,
    })
  }

  function restoreView(view: ReturnType<typeof defaultSavedView>) {
    setFilters(view.filters)
    setSearch(view.search)
    setColumnSearches(view.columnSearches)
    setColumnFilters(view.columnFilters ?? {})
    setGrouping(view.grouping)
    setGroupFields(view.groupFields)
    setSort(view.sort)
    setColumns(view.columns)
    setAcrossQuestionId(view.acrossQuestionId)
    setActiveViewId(view.id)
  }

  function openRow(row: SecRecord) {
    setSelectedId(row.checklistitemid)
  }

  /** Filters that live behind More filters, shown as a count on the button. */
  const advancedCount =
    filters.subareas.length +
    Object.values(columnFilters).reduce((sum, values) => sum + (values?.length ?? 0), 0) +
    (columns.join('|') === DEFAULT_COLUMNS.join('|') ? 0 : 1)

  const showingStarredOnly = starredOnly || grouping === 'starred'

  const shownColumns = columns.length ? columns : (['textresponse'] as ColumnKey[])

  const columnWidths = useMemo(() => {
    const total = shownColumns.reduce((sum, key) => sum + COLUMN_WEIGHTS[key], 0) || 1
    return Object.fromEntries(
      shownColumns.map((key) => [key, (COLUMN_WEIGHTS[key] / total) * 100]),
    ) as Record<ColumnKey, number>
  }, [shownColumns])

  const highlightQuery = search

  function renderCell(row: SecRecord, key: ColumnKey) {
    const value = recordField(row, key)
    const extraQuery = columnSearches[key] ?? ''
    const query = extraQuery.trim() || highlightQuery
    if (key === 'city') {
      return <span className={`reports-city-pill is-${row.citycode.toLowerCase()}`}>{row.citycode}</span>
    }
    if (key === 'owners') {
      return (
        <span className="reports-person-pill">
          <img src="/assets/icons/person.svg" alt="" />
          <Highlight text={value} query={query} />
        </span>
      )
    }
    if (key === 'section_name') {
      return (
        <span className="reports-section-cell">
          <Highlight text={row.section_name} query={query} />
          {row.subarea && row.subarea !== row.section_name ? <small>{row.subarea}</small> : null}
        </span>
      )
    }
    if (key === 'textresponse') {
      return (
        <p className="reports-preview">
          <Highlight text={value} query={query} />
        </p>
      )
    }
    return <Highlight text={value} query={query} />
  }

  function renderRows(rows: SecRecord[]) {
    return rows.map((row) => (
      <tr
        key={row.checklistitemid}
        className={selectedId === row.checklistitemid ? 'is-selected' : undefined}
        onClick={() => openRow(row)}
      >
        <td className="reports-star">
          <button
            type="button"
            aria-pressed={starredIds.has(row.checklistitemid)}
            aria-label={starredIds.has(row.checklistitemid) ? 'Unstar response' : 'Star response'}
            onClick={(event) => {
              event.stopPropagation()
              toggleStar(row.checklistitemid)
            }}
          >
            <img
              src={starredIds.has(row.checklistitemid) ? '/assets/icons/starred.svg' : '/assets/icons/star.svg'}
              alt=""
            />
          </button>
        </td>
        {shownColumns.map((key) => (
          <td key={key} className={key === 'textresponse' ? 'is-response' : undefined}>
            {renderCell(row, key)}
          </td>
        ))}
      </tr>
    ))
  }

  function renderGroups(nodes: GroupNode[], depth = 0): ReactNode[] {
    const rows: ReactNode[] = []
    for (const node of nodes) {
      const closed = collapsed.has(node.id)
      rows.push(
        <tr key={node.id} className={`reports-group is-depth-${Math.min(depth, 2)}${depth === 0 ? ' is-head' : ''}`}>
          <td colSpan={shownColumns.length + 1}>
            <button type="button" onClick={() => toggleCollapsed(node.id)}>
              <img src="/assets/icons/arrow-down.svg" alt="" className={closed ? 'is-closed' : undefined} />
              <strong>{node.label}</strong>
              <span>
                {node.responseCount} responses · {node.reportCount} reports
              </span>
            </button>
          </td>
        </tr>,
      )
      if (closed) continue
      if (node.children?.length) rows.push(...renderGroups(node.children, depth + 1))
      else rows.push(...renderRows(node.rows))
    }
    return rows
  }

  /** Each top-level group is its own bordered block, so they read as separate cards. */
  function renderGroupBlocks(nodes: GroupNode[]) {
    return nodes.map((node) => (
      <tbody key={node.id} className="reports-group-block">
        {renderGroups([node])}
      </tbody>
    ))
  }

  function renderSavedViews() {
    return (
      <div className="reports-views">
        <button
          ref={savedViewsRef}
          type="button"
          className="chip reports-chip"
          onClick={() => setViewsOpen((open) => !open)}
        >
          Saved views
        </button>
        {viewsOpen ? (
          <AnchoredPanel
            anchorRef={savedViewsRef}
            onClose={() => setViewsOpen(false)}
            className="reports-views__panel scroll-area"
            role="dialog"
            label="Saved views"
          >
            <p>Saved on this browser only. Sharing a view would not grant data access.</p>
            <div className="reports-views__save">
              <input
                value={viewName}
                onChange={(event) => setViewName(event.target.value)}
                placeholder="Name this view"
              />
              <button
                type="button"
                onClick={() => {
                  const name = viewName.trim() || 'Untitled view'
                  const view = snapshotView(name)
                  persist({ ...prefs, views: [...prefs.views, view] })
                  setActiveViewId(view.id)
                  setViewName('')
                }}
              >
                Save
              </button>
            </div>
            {prefs.views.length === 0 ? <p>No saved views yet.</p> : null}
            {prefs.views.map((view) => (
              <div key={view.id} className={`reports-views__item${view.id === activeViewId ? ' is-active' : ''}`}>
                <button type="button" onClick={() => restoreView(view)}>
                  {view.name}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = window.prompt('Rename view', view.name)
                    if (!name) return
                    persist({
                      ...prefs,
                      views: prefs.views.map((item) => (item.id === view.id ? { ...item, name } : item)),
                    })
                  }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => persist({ ...prefs, views: prefs.views.filter((item) => item.id !== view.id) })}
                >
                  Delete
                </button>
              </div>
            ))}
          </AnchoredPanel>
        ) : null}
      </div>
    )
  }

  const nestedGroupTable = grouping !== 'acrossTime' && groupFields.length > 0

  return (
    <div className={`reports-page${selected ? ' has-detail' : ''}`}>
      <header className="canvas__head reports-head">
        <div className="canvas__head-left reports-head__identity">
          <div className="reports-head__title">
            <h1 className="canvas__title">Reports</h1>
            <span className="reports-eyebrow">SEC · fictional sample</span>
          </div>
        </div>
        <div className="canvas__head-right reports-head__tools">
          <ReportsSmartSearch
            records={SEC_RECORDS}
            query={search}
            onQueryChange={setSearch}
            onOpenRecord={openRow}
            onApplyOwner={(value) => setFilters((current) => ({ ...current, owners: [value] }))}
            onApplyVenue={(value) => setFilters((current) => ({ ...current, venues: [value] }))}
            onApplyQuestionnaire={(value) =>
              setFilters((current) => ({ ...current, questionnaires: [value] }))
            }
          />
        </div>
      </header>

      <div className="reports-body">
        <div className="reports-table-wrap acrylic-card scroll-area" ref={tableRef}>
          {grouping === 'acrossTime' ? (
            <div className="reports-across">
              <table className="reports-table">
                <colgroup>
                  <col style={{ width: '22%' }} />
                  {acrossDates.map((date) => (
                    <col key={date} style={{ width: `${78 / Math.max(acrossDates.length, 1)}%` }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th>City / venue</th>
                    {acrossDates.map((date) => (
                      <th key={date}>{formatDate(date)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {acrossRows.map((row) => (
                    <tr key={row.venue}>
                      <td>
                        {row.city} / {row.venue}
                      </td>
                      {acrossDates.map((date) => {
                        const cell = row.byDate[date]
                        return (
                          <td key={date}>
                            {cell ? (
                              <button type="button" className="reports-across__cell" onClick={() => openRow(cell)}>
                                <Highlight text={snippet(cell.textresponse, search, 28)} query={search} />
                              </button>
                            ) : (
                              <span className="reports-muted">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="reports-table">
              <colgroup>
                <col style={{ width: '44px' }} />
                {shownColumns.map((key) => (
                  <col key={key} style={{ width: `calc((100% - 44px) * ${columnWidths[key] / 100})` }} />
                ))}
              </colgroup>
              <thead>
                <tr className="reports-table__summary">
                  <th colSpan={shownColumns.length + 1}>
                    <div className="reports-table-tools">
                      <div className="reports-table-tools__left">
                        <div className="reports-table-tools__summary">
                          <span>
                            {filtered.length} responses · {reportCount(filtered)} reports
                            {groups.length ? ` · ${groups.length} groups` : ''}
                            {reportDay === 'all'
                              ? ' · all reporting dates'
                              : reportDay === 'custom'
                                ? ' · custom date range'
                                : reportDay === 'today'
                                  ? ` · reports for today ${formatDayLabel(todayDate)}`
                                  : ` · reports for ${formatDayLabel(filters.dateFrom)}`}
                            {!storageOk ? ' · browser storage unavailable' : ''}
                          </span>
                          <div className="reports-table-tools__chips">
                            {chips.map((chip) => (
                              <button
                                key={chip.key}
                                type="button"
                                className="reports-chip-filter"
                                onClick={chip.clear}
                              >
                                {chip.label}
                                <span aria-hidden>×</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="reports-table-tools__links">
                          <button
                            type="button"
                            disabled={!nestedGroupTable}
                            title={nestedGroupTable ? undefined : 'Group the table to expand groups'}
                            onClick={() => setAllCollapsed(false)}
                          >
                            Expand all
                          </button>
                          <span aria-hidden>·</span>
                          <button
                            type="button"
                            disabled={!nestedGroupTable}
                            title={nestedGroupTable ? undefined : 'Group the table to collapse groups'}
                            onClick={() => setAllCollapsed(true)}
                          >
                            Collapse all
                          </button>
                        </div>
                      </div>
                      <div className="reports-table-tools__right">
                        <DateSelect
                          value={reportDay}
                          dates={facets.dates}
                          todayDate={todayDate}
                          onChange={setReportDay}
                        />
                        <button type="button" className="chip reports-chip" onClick={() => setMoreOpen(true)}>
                          More filters
                          {advancedCount > 0 ? <em>{advancedCount}</em> : null}
                        </button>
                        {renderSavedViews()}
                      </div>
                    </div>
                  </th>
                </tr>
                <tr className="reports-table__columns">
                  <th className="reports-star">
                    <button
                      type="button"
                      className={`reports-star__filter${showingStarredOnly ? ' is-active' : ''}`}
                      aria-pressed={showingStarredOnly}
                      title={showingStarredOnly ? 'Showing starred only' : 'Show starred only'}
                      onClick={() => {
                        if (grouping === 'starred') applyPreset('flat')
                        setStarredOnly(!showingStarredOnly)
                      }}
                    >
                      <span className="sr-only">
                        {showingStarredOnly ? 'Show all responses' : 'Show starred responses only'}
                      </span>
                      <img
                        src={showingStarredOnly ? '/assets/icons/starred.svg' : '/assets/icons/star.svg'}
                        alt=""
                      />
                    </button>
                  </th>
                  {shownColumns.map((key) => {
                    const groupField = columnToGroupField(key)
                    const grouped = groupField != null && groupFields.length === 1 && groupFields[0] === groupField
                    const sortedCol = sort?.key === key
                    return (
                      <th key={key}>
                        <div className="reports-th">
                          <button
                            type="button"
                            className={`reports-th__sort${sortedCol ? ' is-active' : ''}`}
                            aria-label={`Sort by ${COLUMN_LABELS[key]}`}
                            onClick={() => toggleSort(key)}
                          >
                            <img
                              src={
                                sortedCol && sort?.dir === 'desc'
                                  ? '/assets/icons/arrow-down.svg'
                                  : '/assets/icons/arrow-up.svg'
                              }
                              alt=""
                            />
                          </button>
                          <span>{COLUMN_LABELS[key]}</span>
                          <ColumnFilterMenu
                            label={COLUMN_LABELS[key]}
                            options={columnFilterOptions[key]}
                            selected={columnFilters[key] ?? []}
                            onChange={(values) =>
                              setColumnFilters((current) => ({ ...current, [key]: values }))
                            }
                          />
                          {GROUPABLE_COLUMNS.includes(key) ? (
                            <button
                              type="button"
                              className={`reports-th__group${grouped ? ' is-active' : ''}`}
                              aria-pressed={grouped}
                              aria-label={`Group by ${COLUMN_LABELS[key]}`}
                              onClick={() => toggleGroupColumn(key)}
                            >
                              <img src="/assets/icons/group.svg" alt="" />
                            </button>
                          ) : (
                            <span className="reports-th__spacer" />
                          )}
                        </div>
                        <label className="reports-th__search">
                          <span className="sr-only">Search {COLUMN_LABELS[key]}</span>
                          <input
                            value={columnSearches[key] ?? ''}
                            onChange={(event) =>
                              setColumnSearches((current) => ({ ...current, [key]: event.target.value }))
                            }
                            placeholder="Search"
                          />
                        </label>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              {filtered.length === 0 ? (
                <tbody>
                  <tr className="reports-empty-row">
                    <td colSpan={shownColumns.length + 1}>
                      <div className="reports-empty">
                        <p>
                          {showingStarredOnly
                            ? 'No starred responses match the current filters.'
                            : 'No responses match the current filters.'}
                        </p>
                        <button type="button" className="chip reports-chip" onClick={resetAll}>
                          Reset filters
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : nestedGroupTable ? (
                renderGroupBlocks(groups)
              ) : (
                <tbody>{renderRows(sorted)}</tbody>
              )}
            </table>
          )}
        </div>

        {selected ? (
          <aside className="reports-detail acrylic-card" aria-label="Response detail">
            <header>
              <div className="reports-detail__heading">
                <p>{selected.section_name}{selected.subarea ? ` / ${selected.subarea}` : ''}</p>
                <h2>{selected.questionnaire_name}</h2>
              </div>
              <div className="reports-detail__actions">
                <button
                  type="button"
                  className={`reports-detail__star${starredIds.has(selected.checklistitemid) ? ' is-active' : ''}`}
                  aria-label={starredIds.has(selected.checklistitemid) ? 'Unstar response' : 'Star response'}
                  aria-pressed={starredIds.has(selected.checklistitemid)}
                  onClick={() => toggleStar(selected.checklistitemid)}
                >
                  <img
                    src={starredIds.has(selected.checklistitemid) ? '/assets/icons/starred.svg' : '/assets/icons/star.svg'}
                    alt=""
                  />
                </button>
                <button type="button" className="reports-close" onClick={() => setSelectedId(null)} aria-label="Close">
                  <img src="/assets/icons/close.svg" alt="" />
                </button>
              </div>
            </header>
            <div className="reports-detail__body scroll-area">
              <div className="reports-detail__field">
                <span className="reports-detail__label">Question</span>
                <p className="reports-detail__question">{selected.checktitle}</p>
              </div>

              <section className="reports-response-card">
                <span className="reports-detail__label">Answer</span>
                <div className="reports-response-card__context">
                  <span className="reports-person-pill">
                    <img src="/assets/icons/person.svg" alt="" />
                    {selected.owners}
                  </span>
                  <span className="reports-response-card__venue">{selected.stadium}</span>
                  <span className={`reports-city-pill is-${selected.citycode.toLowerCase()}`}>
                    {selected.citycode}
                  </span>
                </div>
                <p>{selected.textresponse || 'No response provided.'}</p>
              </section>

              <dl className="reports-detail__metadata">
                <div>
                  <dt>Reporting date</dt>
                  <dd>{selected.reporting_date}</dd>
                </div>
                <div>
                  <dt>Priority</dt>
                  <dd>{selected.priority || 'Not set'}</dd>
                </div>
              </dl>

              <details className="reports-previous">
                <summary>
                  Previous responses
                  <img src="/assets/icons/arrow-down.svg" alt="" />
                </summary>
                <div className="reports-previous__list">
                  {history
                    .filter((item) => item.checklistitemid !== selected.checklistitemid)
                    .slice(0, 3)
                    .map((item) => (
                      <article key={item.checklistitemid}>
                        <button type="button" onClick={() => openRow(item)}>
                          <strong>{item.reporting_date}</strong>
                          <span>{item.textresponse || 'No response provided.'}</span>
                        </button>
                      </article>
                    ))}
                  {history.filter((item) => item.checklistitemid !== selected.checklistitemid).length === 0 ? (
                    <p className="reports-muted">No previous responses.</p>
                  ) : null}
                </div>
              </details>
            </div>
          </aside>
        ) : null}
      </div>

      {moreOpen
        ? createPortal(
        <div
          className="reports-modal__scrim"
          role="dialog"
          aria-modal="true"
          aria-label="More filters"
          onClick={() => setMoreOpen(false)}
        >
          <div className="reports-modal acrylic-card" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>More filters</h2>
              <button type="button" className="reports-close" onClick={() => setMoreOpen(false)} aria-label="Close">
                <img src="/assets/icons/close.svg" alt="" />
              </button>
            </header>
            <div className="reports-modal__body scroll-area">
              <section>
                <h3>Reporting dates</h3>
                <div className="reports-modal__grid">
                  <div className="reports-field">
                    <span>Day</span>
                    <DateSelect
                      value={reportDay}
                      dates={facets.dates}
                      todayDate={todayDate}
                      onChange={setReportDay}
                    />
                  </div>
                  <label className="reports-field">
                    <span>Answers</span>
                    <select
                      value={filters.dateScope}
                      onChange={(event) =>
                        setFilters((current) => ({
                          ...current,
                          dateScope: event.target.value as FilterState['dateScope'],
                        }))
                      }
                    >
                      <option value="latest">Latest answers in range</option>
                      <option value="all">All responses in range</option>
                    </select>
                  </label>
                </div>
              </section>

              <section>
                <h3>Focus area</h3>
                <div className="reports-modal__grid">
                  <FaSelect
                    fas={facets.fas}
                    subareas={facets.subareas}
                    selectedFas={filters.fas}
                    selectedSubareas={filters.subareas}
                    onFasChange={(fas) => setFilters((current) => ({ ...current, fas }))}
                    onSubareasChange={(subareas) => setFilters((current) => ({ ...current, subareas }))}
                  />
                </div>
              </section>

              <section>
                <h3>Column filters</h3>
                <p className="reports-columns__hint">
                  The same filters as the funnel icons in the table header.
                </p>
                <div className="reports-modal__grid">
                  {FILTERABLE_COLUMNS.map((key) => (
                    <MultiSelect
                      key={key}
                      label={COLUMN_LABELS[key]}
                      options={columnFilterOptions[key]}
                      selected={columnFilters[key] ?? []}
                      onChange={(values) => setColumnFilters((current) => ({ ...current, [key]: values }))}
                    />
                  ))}
                </div>
              </section>

              <section>
                <h3>Visible columns</h3>
                <p className="reports-columns__hint">Drag selected columns to change their table order.</p>
                <div className="reports-columns reports-columns--ordered">
                  {columns.map((key) => (
                    <label
                      key={key}
                      draggable
                      className={draggedColumn === key ? 'is-dragging' : undefined}
                      onDragStart={() => setDraggedColumn(key)}
                      onDragEnd={() => setDraggedColumn(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => moveColumn(key)}
                    >
                      <img src="/assets/icons/drag.svg" alt="" className="reports-column-drag" />
                      <input
                        type="checkbox"
                        checked
                        onChange={() => setColumns((current) => current.filter((item) => item !== key))}
                      />
                      <span>{COLUMN_LABELS[key]}</span>
                    </label>
                  ))}
                  {[...DEFAULT_COLUMNS, ...OPTIONAL_COLUMNS].filter((key) => !columns.includes(key)).map((key) => {
                    const on = columns.includes(key)
                    return (
                      <label key={key}>
                        <span className="reports-column-drag" aria-hidden />
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() =>
                            setColumns((current) =>
                              on ? current.filter((item) => item !== key) : [...current, key],
                            )
                          }
                        />
                        <span>{COLUMN_LABELS[key]}</span>
                      </label>
                    )
                  })}
                </div>
              </section>
            </div>
            <footer>
              <button type="button" className="reports-modal__button is-secondary" onClick={resetAll}>
                Reset all
              </button>
              <button type="button" className="reports-modal__button is-primary" onClick={() => setMoreOpen(false)}>
                Done
              </button>
            </footer>
          </div>
        </div>,
            document.body,
          )
        : null}
    </div>
  )
}
