import { useMemo, useState } from 'react'
import { MODULES_BY_KIND, type PlacedModule } from '../data/customViews'
import {
  MATCH_CITIES,
  MATCH_DATE_MODES,
  MATCH_DAYS,
  MATCH_TEAMS,
  REPORT_SECTIONS,
  mergeModuleConfig,
  type MatchDateMode,
  type MatchDay,
  type ModuleConfig,
  type ReportSection,
  type StatRowConfig,
} from '../data/moduleConfig'
import { ModuleBody } from './ModuleBody'
import './ModuleConfigureModal.css'

function CheckboxList({
  label,
  options,
  values,
  onChange,
}: {
  label: string
  options: readonly string[]
  values: string[]
  onChange: (next: string[]) => void
}) {
  function toggle(option: string) {
    onChange(
      values.includes(option) ? values.filter((item) => item !== option) : [...values, option],
    )
  }

  return (
    <fieldset className="mod-config__group">
      <legend className="mod-config__legend">{label}</legend>
      <div className="mod-config__checks">
        {options.map((option) => (
          <label key={option} className="mod-config__check">
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => toggle(option)}
            />
            <span className="mod-config__box" aria-hidden />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function CheckboxDropdown({
  label,
  options,
  values,
  onChange,
}: {
  label: string
  options: readonly string[]
  values: string[]
  onChange: (next: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const summary =
    values.length === 0
      ? 'None'
      : values.length === options.length
        ? `All ${label.toLowerCase()}`
        : `${values.length} selected`

  function toggle(option: string) {
    onChange(
      values.includes(option) ? values.filter((item) => item !== option) : [...values, option],
    )
  }

  return (
    <fieldset className="mod-config__group">
      <legend className="mod-config__legend">{label}</legend>
      <div className="mod-config__dropdown">
        <button
          type="button"
          className="chip mod-config__dropdown-trigger"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {summary}
          <span className="icon-box">
            <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
          </span>
        </button>
        {open ? (
          <div className="mod-config__dropdown-menu" role="listbox">
            <button
              type="button"
              className="mod-config__dropdown-all"
              onClick={() =>
                onChange(values.length === options.length ? [] : [...options])
              }
            >
              {values.length === options.length ? 'Clear all' : 'Select all'}
            </button>
            {options.map((option) => (
              <label key={option} className="mod-config__check">
                <input
                  type="checkbox"
                  checked={values.includes(option)}
                  onChange={() => toggle(option)}
                />
                <span className="mod-config__box" aria-hidden />
                {option}
              </label>
            ))}
          </div>
        ) : null}
      </div>
    </fieldset>
  )
}

function ReorderStatList({
  label,
  rows,
  onChange,
}: {
  label: string
  rows: StatRowConfig[]
  onChange: (next: StatRowConfig[]) => void
}) {
  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    onChange(next)
  }

  function toggle(index: number) {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, visible: !row.visible } : row,
      ),
    )
  }

  return (
    <fieldset className="mod-config__group">
      <legend className="mod-config__legend">{label}</legend>
      <div className="mod-config__reorder">
        {rows.map((row, index) => (
          <div key={row.id} className={`mod-config__reorder-row${row.visible ? '' : ' is-hidden'}`}>
            <label className="mod-config__check">
              <input
                type="checkbox"
                checked={row.visible}
                onChange={() => toggle(index)}
              />
              <span className="mod-config__box" aria-hidden />
              {row.id}
            </label>
            <div className="mod-config__reorder-actions">
              <button
                type="button"
                aria-label={`Move ${row.id} up`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <img src="/assets/icons/arrow-up.svg" alt="" width={12} height={12} />
              </button>
              <button
                type="button"
                aria-label={`Move ${row.id} down`}
                disabled={index === rows.length - 1}
                onClick={() => move(index, 1)}
              >
                <img src="/assets/icons/arrow-down.svg" alt="" width={12} height={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

function ReportsOptions({
  config,
  onChange,
}: {
  config: ModuleConfig
  onChange: (next: ModuleConfig) => void
}) {
  return (
    <CheckboxList
      label="Show sections"
      options={REPORT_SECTIONS}
      values={config.reportSections ?? [...REPORT_SECTIONS]}
      onChange={(reportSections) =>
        onChange({ ...config, reportSections: reportSections as ReportSection[] })
      }
    />
  )
}

function MatchesOptions({
  config,
  onChange,
}: {
  config: ModuleConfig
  onChange: (next: ModuleConfig) => void
}) {
  const dateMode = config.matchDateMode ?? 'relative'

  return (
    <>
      <fieldset className="mod-config__group">
        <legend className="mod-config__legend">Filter by date</legend>
        <div className="mod-config__radios">
          {MATCH_DATE_MODES.map((mode) => (
            <label key={mode} className="mod-config__check">
              <input
                type="radio"
                name="match-date-mode"
                checked={dateMode === mode}
                onChange={() => onChange({ ...config, matchDateMode: mode as MatchDateMode })}
              />
              <span className="mod-config__radio" aria-hidden />
              {mode === 'relative'
                ? 'Yesterday / Today / Tomorrow'
                : mode === 'specific'
                  ? 'Specific date'
                  : 'Upcoming'}
            </label>
          ))}
        </div>
        {dateMode === 'relative' ? (
          <div className="mod-config__checks mod-config__checks--inset">
            {MATCH_DAYS.map((day) => {
              const values = config.matchRelativeDays ?? [...MATCH_DAYS]
              return (
                <label key={day} className="mod-config__check">
                  <input
                    type="checkbox"
                    checked={values.includes(day)}
                    onChange={() => {
                      const next = values.includes(day)
                        ? values.filter((item) => item !== day)
                        : [...values, day]
                      onChange({ ...config, matchRelativeDays: next as MatchDay[] })
                    }}
                  />
                  <span className="mod-config__box" aria-hidden />
                  {day}
                </label>
              )
            })}
          </div>
        ) : null}
        {dateMode === 'specific' ? (
          <label className="mod-config__field">
            <span>Date</span>
            <input
              type="text"
              value={config.matchSpecificDate ?? '15 Jun 2026'}
              onChange={(event) =>
                onChange({ ...config, matchSpecificDate: event.target.value })
              }
              placeholder="15 Jun 2026"
            />
          </label>
        ) : null}
        {dateMode === 'upcoming' ? (
          <p className="mod-config__hint">Shows upcoming matches regardless of the selected date.</p>
        ) : null}
      </fieldset>

      <CheckboxDropdown
        label="Host cities"
        options={MATCH_CITIES}
        values={config.matchCities ?? [...MATCH_CITIES]}
        onChange={(matchCities) => onChange({ ...config, matchCities })}
      />
      <CheckboxDropdown
        label="Teams"
        options={MATCH_TEAMS}
        values={config.matchTeams ?? [...MATCH_TEAMS]}
        onChange={(matchTeams) => onChange({ ...config, matchTeams })}
      />
      <ReorderStatList
        label="Attendance stats"
        rows={config.attendanceStats ?? []}
        onChange={(attendanceStats) => onChange({ ...config, attendanceStats })}
      />
      <ReorderStatList
        label="Ticketing stats"
        rows={config.ticketingStats ?? []}
        onChange={(ticketingStats) => onChange({ ...config, ticketingStats })}
      />
    </>
  )
}

function LiveFeedOptions({
  config,
  onChange,
}: {
  config: ModuleConfig
  onChange: (next: ModuleConfig) => void
}) {
  const sources = ['Helicopter', 'Tactical', 'Security', 'Broadcast']
  return (
    <CheckboxList
      label="Show sources"
      options={sources}
      values={config.feedSources ?? sources}
      onChange={(feedSources) => onChange({ ...config, feedSources })}
    />
  )
}

function SummaryOptions({
  config,
  onChange,
}: {
  config: ModuleConfig
  onChange: (next: ModuleConfig) => void
}) {
  const sections = ['General', 'Security', 'Guests']
  return (
    <CheckboxList
      label="Show sections"
      options={sections}
      values={config.summarySections ?? sections}
      onChange={(summarySections) => onChange({ ...config, summarySections })}
    />
  )
}

function OptionsPanel({
  kind,
  config,
  onChange,
}: {
  kind: PlacedModule['kind']
  config: ModuleConfig
  onChange: (next: ModuleConfig) => void
}) {
  switch (kind) {
    case 'reports':
      return <ReportsOptions config={config} onChange={onChange} />
    case 'matches':
      return <MatchesOptions config={config} onChange={onChange} />
    case 'liveFeed':
      return <LiveFeedOptions config={config} onChange={onChange} />
    case 'summary':
      return <SummaryOptions config={config} onChange={onChange} />
    default:
      return (
        <p className="mod-config__empty">
          No extra options for this module yet. You can still save to keep the current layout.
        </p>
      )
  }
}

export function ModuleConfigureModal({
  module,
  onCancel,
  onSave,
}: {
  module: PlacedModule
  onCancel: () => void
  onSave: (next: { config: ModuleConfig; title: string }) => void
}) {
  const def = MODULES_BY_KIND[module.kind]
  const [config, setConfig] = useState(() => mergeModuleConfig(module.kind, module.config))
  const [title, setTitle] = useState(module.title ?? def.title)

  const previewTab = useMemo(() => {
    if (module.kind === 'matches') {
      if (config.matchDateMode === 'specific') return config.matchSpecificDate ?? '15 Jun 2026'
      if (config.matchDateMode === 'upcoming') return 'Upcoming'
      const days = config.matchRelativeDays?.length ? config.matchRelativeDays : MATCH_DAYS
      return days.includes((module.tab as MatchDay) ?? 'Today')
        ? (module.tab ?? 'Today')
        : days[0]
    }
    if (module.kind === 'liveFeed') {
      const sources = config.feedSources?.length
        ? config.feedSources
        : ['Helicopter', 'Tactical', 'Security', 'Broadcast']
      return sources.includes(module.tab ?? '') ? module.tab : sources[0]
    }
    return module.tab ?? def.tabs?.[0]
  }, [config, def.tabs, module.kind, module.tab])

  const displayTitle = title.trim() || def.title

  return (
    <div className="mod-config__scrim" role="presentation" onClick={onCancel}>
      <div
        className="mod-config acrylic-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mod-config-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mod-config__head">
          <h2 id="mod-config-title" className="mod-config__title">
            Configure {displayTitle}
          </h2>
          <button type="button" className="mod-config__close" aria-label="Close" onClick={onCancel}>
            <img src="/assets/icons/close.svg" alt="" width={16} height={16} />
          </button>
        </header>

        <div className="mod-config__body">
          <div className="mod-config__preview acrylic-card">
            <header className="mod-config__preview-head">
              <span className="section-title">
                {displayTitle}
                <span className="icon-box">
                  <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
                </span>
              </span>
            </header>
            <div className="mod-config__preview-body">
              <ModuleBody
                kind={module.kind}
                tabs={def.tabs}
                tab={previewTab}
                w={1}
                h={3}
                config={config}
                preview
                hideFilters
              />
            </div>
          </div>

          <div className="mod-config__options scroll-area">
            <label className="mod-config__field">
              <span>Module name</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={def.title}
              />
            </label>
            <OptionsPanel kind={module.kind} config={config} onChange={setConfig} />
          </div>
        </div>

        <footer className="mod-config__actions">
          <button type="button" className="mod-config__cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onSave({ config, title: displayTitle })}
          >
            Save
            <img src="/assets/icons/go.svg" alt="" width={14} height={14} />
          </button>
        </footer>
      </div>
    </div>
  )
}
