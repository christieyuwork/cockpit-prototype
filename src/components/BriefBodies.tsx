import { useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  ATTENDANCE_ROWS,
  CALENDAR_BY_CITY,
  CALENDAR_STATS,
  CITY_FILTERS,
  ISSUES,
  MATCHES_BY_DAY,
  REGION_CONTENT,
  REPORT_CONTENT,
  SOCIAL_POSTS,
  SUMMARY_CONTENT,
  TICKETING_ROWS,
  type MatchCard,
} from '../data/dummy'
import { applyStatRows, type ModuleConfig } from '../data/moduleConfig'
import { FilterChip } from './FilterChip'
import {
  IssuesSeverityChart,
  IssuesSeverityLegend,
  IssuesTrendChart,
} from './IssuesCharts'
import './Dashboard.css'

/** Renders filter/actions in the card header when a portal target is provided. */
function HeaderAction({
  headerTarget,
  hide,
  children,
}: {
  headerTarget?: HTMLElement | null
  hide?: boolean
  children: ReactNode
}) {
  if (hide) return null
  // undefined = no portal (picker); null = portal pending; element = portal ready
  if (headerTarget === undefined) {
    return <div className="panel__head">{children}</div>
  }
  if (!headerTarget) return null
  return createPortal(children, headerTarget)
}

function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}) {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`tab${active === tab ? ' active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

function FilterMenu({
  value,
  options,
  onChange,
}: {
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  return <FilterChip value={value} options={options} onChange={onChange} />
}

function MetricTable({
  title,
  rows,
  accent = 'green',
  action,
  modes,
  mode,
  onModeChange,
}: {
  title?: string
  rows: string[][]
  accent?: 'green' | 'blue'
  action?: string
  modes?: Array<'attendance' | 'ticketing'>
  mode?: 'attendance' | 'ticketing'
  onModeChange?: (mode: 'attendance' | 'ticketing') => void
}) {
  return (
    <div className="match-card__table">
      <div className="match-card__table-head">
        {modes && modes.length > 1 && mode && onModeChange ? (
          <div className="match-card__switch" role="tablist" aria-label="Stats type">
            {modes.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={mode === option}
                className={mode === option ? 'is-active' : undefined}
                onClick={() => onModeChange(option)}
              >
                {option === 'attendance' ? 'Attendance' : 'Ticketing'}
              </button>
            ))}
          </div>
        ) : (
          <span>
            {title ??
              (mode === 'ticketing' ? 'Ticketing' : mode === 'attendance' ? 'Attendance' : title)}
          </span>
        )}
        {action ? <span className="match-card__action">{action}</span> : null}
      </div>
      <div className="match-card__rows">
        {rows.map(([label, value, pct]) => (
          <div key={label} className="match-card__row">
            <span>{label}</span>
            <span className={`match-card__value is-${accent}`}>
              {value} <em>{pct}</em>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MatchArticle({
  match,
  config,
}: {
  match: MatchCard
  config?: ModuleConfig
}) {
  const [mode, setMode] = useState<'attendance' | 'ticketing'>(match.mode)
  const attendanceRows = applyStatRows(
    ATTENDANCE_ROWS,
    config?.attendanceStats,
  )
  const ticketingRows = applyStatRows(TICKETING_ROWS, config?.ticketingStats)
  const modes = [
    ...(attendanceRows.length ? (['attendance'] as const) : []),
    ...(ticketingRows.length ? (['ticketing'] as const) : []),
  ]
  const effectiveMode = (modes as Array<'attendance' | 'ticketing'>).includes(mode)
    ? mode
    : (modes[0] ?? 'attendance')
  const rows = effectiveMode === 'attendance' ? attendanceRows : ticketingRows

  return (
    <article className="match-card">
      <div className="match-card__meta">
        <div>
          <span className={`city-pill ${match.city.toLowerCase()}`}>{match.city}</span>
          <p>{match.date}</p>
        </div>
        <div className="match-card__center">
          <div className="match-card__scoreline">
            <span>{match.score?.[0] ?? '--'}</span>
            <img className="flag" src="/assets/flag-uy.svg" alt="" />
            <strong>
              {match.home} v. {match.away}
            </strong>
            <img className="flag" src="/assets/flag-cv.svg" alt="" />
            <span>{match.score?.[1] ?? '--'}</span>
          </div>
          <p>{match.group}</p>
        </div>
        <div className="match-card__right">
          <span className="match-id">
            {match.matchId}
            <span className="icon-box">
              <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
            </span>
          </span>
          <p>{match.time}</p>
        </div>
      </div>
      {rows.length ? (
        <MetricTable
          modes={[...modes]}
          mode={effectiveMode}
          onModeChange={setMode}
          rows={rows}
          accent={effectiveMode === 'attendance' ? 'green' : 'blue'}
          action={effectiveMode === 'ticketing' ? 'View map' : undefined}
        />
      ) : null}
    </article>
  )
}

export function SummaryBody({
  config,
}: {
  config?: import('../data/moduleConfig').ModuleConfig
} = {}) {
  const sections = config?.summarySections?.length
    ? config.summarySections
    : ['General', 'Security', 'Guests']
  const [summaryTab, setSummaryTab] = useState(sections[0] ?? 'General')
  const [regionTab, setRegionTab] = useState('Canada')
  const [videoPlaying, setVideoPlaying] = useState(false)
  const activeTab = sections.includes(summaryTab) ? summaryTab : sections[0]

  return (
    <div className="panel__stack">
      <div className="panel__block">
        {sections.length > 1 ? (
          <TabBar tabs={sections} active={activeTab} onChange={setSummaryTab} />
        ) : null}
        <div className="panel__scroll scroll-area">
          <ul>
            {(SUMMARY_CONTENT[activeTab] ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="report-chip">
            <span className="report-chip__icon">
              <img src="/assets/icons/document.svg" alt="" />
            </span>
            <span className="report-chip__label">Operational Report 15 Jun</span>
            <span className="report-chip__actions">
              <img src="/assets/icons/download.svg" alt="" />
              <img src="/assets/icons/open-in.svg" alt="" />
            </span>
          </div>
          <div className="video-card">
            <p>tacticalcamerastream.mp4 · {activeTab}</p>
            <button
              type="button"
              className={`video-card__media${videoPlaying ? ' is-playing' : ''}`}
              onClick={() => setVideoPlaying((v) => !v)}
            >
              <img src="/assets/video-thumb.png" alt="Tactical camera stream" />
              <span className="video-card__play" aria-hidden>
                {videoPlaying ? '❚❚' : '▶'}
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="panel__block panel__block--short">
        <TabBar tabs={['Canada', 'Mexico', 'USA']} active={regionTab} onChange={setRegionTab} />
        <div className="panel__scroll scroll-area">
          <ul>
            {REGION_CONTENT[regionTab].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function ReportsBody({
  headerTarget,
  hideFilters,
  config,
}: {
  headerTarget?: HTMLElement | null
  hideFilters?: boolean
  config?: ModuleConfig
} = {}) {
  const sections = (config?.reportSections?.length
    ? config.reportSections
    : ['Stadium', 'Host city', 'Fan fest']) as string[]
  const [reportTab, setReportTab] = useState(sections[0] ?? 'Stadium')
  const [reportCity, setReportCity] = useState<(typeof CITY_FILTERS)[number]>('All cities')
  const activeTab = sections.includes(reportTab) ? reportTab : sections[0]
  const report = REPORT_CONTENT[activeTab] ?? REPORT_CONTENT.Stadium

  return (
    <div className="panel__stack">
      <HeaderAction headerTarget={headerTarget} hide={hideFilters}>
        <FilterMenu
          value={reportCity}
          options={CITY_FILTERS}
          onChange={(v) => setReportCity(v as typeof reportCity)}
        />
      </HeaderAction>
      <div className="panel__block">
        {sections.length > 1 ? (
          <TabBar tabs={sections} active={activeTab} onChange={setReportTab} />
        ) : null}
        <div className="panel__scroll scroll-area">
          <div className="ai-label">
            <span className="ai-label__icon" aria-hidden />
            <span>AI text</span>
          </div>
          <div className="report-heading">{report.title}</div>
          <p>
            {reportCity === 'All cities' ? report.body : `${reportCity}: ${report.body}`}
          </p>
        </div>
      </div>
    </div>
  )
}

export function IssuesBody({
  headerTarget,
  hideFilters,
}: {
  headerTarget?: HTMLElement | null
  hideFilters?: boolean
} = {}) {
  const [issueCity, setIssueCity] = useState<(typeof CITY_FILTERS)[number]>('All cities')
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const filteredIssues = useMemo(
    () => (issueCity === 'All cities' ? ISSUES : ISSUES.filter((i) => i.city === issueCity)),
    [issueCity],
  )

  return (
    <div className="panel__stack">
      <HeaderAction headerTarget={headerTarget} hide={hideFilters}>
        <FilterMenu
          value={issueCity}
          options={CITY_FILTERS}
          onChange={(v) => setIssueCity(v as typeof issueCity)}
        />
      </HeaderAction>
      <div className="issues__top">
        <div className="issues__severity">
          <IssuesSeverityLegend />
          <div className="issues__donut">
            <IssuesSeverityChart />
          </div>
        </div>
        <div className="issues__trend">
          <div className="issues__trend-chart">
            <IssuesTrendChart />
          </div>
          <div className="issues__totals">
            <div>
              <span>Total</span>
              <strong>332</strong>
            </div>
            <div>
              <span>Today</span>
              <strong>
                24 <em>+18%</em>
              </strong>
            </div>
          </div>
        </div>
      </div>
      <div className="issues__list">
        {filteredIssues.map((row, i) => (
          <div key={row.id}>
            <button
              type="button"
              className={`issues__row${i % 2 ? ' is-alt' : ''}${selectedIssue === row.id ? ' is-selected' : ''}`}
              onClick={() => setSelectedIssue((id) => (id === row.id ? null : row.id))}
            >
              <span>{row.title}</span>
              <span className="issues__row-end">
                <span className={`city-pill ${row.city.toLowerCase()}`}>{row.city}</span>
                <span className="icon-box">
                  <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
                </span>
              </span>
            </button>
            {selectedIssue === row.id ? (
              <div className="issues__detail">
                <strong>{row.severity}</strong>
                <p>{row.detail}</p>
              </div>
            ) : null}
          </div>
        ))}
        {filteredIssues.length === 0 ? <p className="issues__empty">No issues for {issueCity}.</p> : null}
      </div>
    </div>
  )
}

export function BriefCalendarBody({
  headerTarget,
  hideFilters,
}: {
  headerTarget?: HTMLElement | null
  hideFilters?: boolean
} = {}) {
  const [calendarCity, setCalendarCity] = useState<(typeof CITY_FILTERS)[number]>('All cities')
  const calendarEvents = CALENDAR_BY_CITY[calendarCity] ?? CALENDAR_BY_CITY['All cities']

  return (
    <div className="panel__stack">
      <HeaderAction headerTarget={headerTarget} hide={hideFilters}>
        <FilterMenu
          value={calendarCity}
          options={CITY_FILTERS}
          onChange={(v) => setCalendarCity(v as typeof calendarCity)}
        />
      </HeaderAction>
      <div className="calendar__events">
        {calendarEvents.map((event) => (
          <div key={`${event.title}-${event.city}`} className="calendar__event">
            <span>{event.title}</span>
            <span className={`city-pill ${event.city.toLowerCase()}`}>{event.city}</span>
          </div>
        ))}
      </div>
      <div className="calendar__stats">
        {CALENDAR_STATS.map((stat) => (
          <div key={stat.label} className="calendar__stat">
            <span className="calendar__badge">{stat.count}</span>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function matchCardCount(w = 2, h = 5) {
  if (w <= 1) return 1
  if (h < 4) return 2
  return 4
}

export function MatchesBody({
  tab,
  w = 2,
  h = 5,
  config,
  preview = false,
}: {
  tab?: string
  w?: number
  h?: number
  config?: ModuleConfig
  preview?: boolean
}) {
  const dateMode = config?.matchDateMode ?? 'relative'
  const relativeDays = config?.matchRelativeDays?.length
    ? config.matchRelativeDays
    : (['Yesterday', 'Today', 'Tomorrow'] as const)
  const cities = config?.matchCities
  const teams = config?.matchTeams
  const count = preview ? 1 : matchCardCount(w, h)

  const matches = useMemo(() => {
    let pool: MatchCard[] = []

    if (dateMode === 'upcoming') {
      pool = [...(MATCHES_BY_DAY.Today ?? []), ...(MATCHES_BY_DAY.Tomorrow ?? [])]
    } else if (dateMode === 'specific') {
      const needle = (config?.matchSpecificDate ?? '15 Jun').toLowerCase()
      pool = Object.values(MATCHES_BY_DAY)
        .flat()
        .filter((match) => match.date.toLowerCase().includes(needle.replace(/\s*2026$/, '').trim()))
    } else {
      const day =
        tab && relativeDays.includes(tab as (typeof relativeDays)[number])
          ? tab
          : relativeDays[0] ?? 'Today'
      pool = [...(MATCHES_BY_DAY[day] ?? MATCHES_BY_DAY.Today)]
    }

    const filtered = pool.filter((match) => {
      if (cities?.length && !cities.includes(match.city)) return false
      if (teams?.length && !teams.includes(match.home) && !teams.includes(match.away)) {
        return false
      }
      return true
    })

    // One card per match id; stats mode is switched inside the card.
    const unique: MatchCard[] = []
    const seen = new Set<string>()
    for (const match of filtered) {
      if (seen.has(match.matchId)) continue
      seen.add(match.matchId)
      unique.push(match)
    }

    return unique.slice(0, count)
  }, [cities, config?.matchSpecificDate, count, dateMode, relativeDays, tab, teams])

  return (
    <div className={`matches__grid${count === 1 ? ' is-one' : ''}`}>
      {matches.map((match) => (
        <MatchArticle key={match.matchId} match={match} config={config} />
      ))}
      {matches.length === 0 ? <p className="issues__empty">No matches for these filters.</p> : null}
    </div>
  )
}

export function BriefSocialBody({
  headerTarget,
  hideFilters,
}: {
  headerTarget?: HTMLElement | null
  hideFilters?: boolean
} = {}) {
  const [socialIndex, setSocialIndex] = useState(0)
  const [socialExpanded, setSocialExpanded] = useState(false)
  const social = SOCIAL_POSTS[socialIndex]

  return (
    <div className="panel__stack">
      <HeaderAction headerTarget={headerTarget} hide={hideFilters}>
        <button
          type="button"
          className="chip"
          onClick={() => {
            setSocialExpanded(false)
            setSocialIndex((i) => (i + 1) % SOCIAL_POSTS.length)
          }}
        >
          Next post
        </button>
      </HeaderAction>
      <article className="social-card">
        <div className="social-card__meta">
          <span>{social.handle}</span>
          <strong>{social.views}</strong>
        </div>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {social.body}
          {socialExpanded ? `\n\n${social.expanded}` : ''}
        </p>
        <div className="social-card__media">
          <img src="/assets/social-img.png" alt="Social post" />
          <button
            type="button"
            className="social-card__cta"
            onClick={() => setSocialExpanded((v) => !v)}
          >
            {socialExpanded ? 'SHOW LESS' : 'TAP TO READ'}
          </button>
        </div>
      </article>
    </div>
  )
}
