import { useMemo, useState } from 'react'
import {
  ATTENDANCE_ROWS,
  BRIEF_DATES,
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
} from '../data/dummy'
import './Dashboard.css'

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
  const [open, setOpen] = useState(false)

  return (
    <div className="filter-menu">
      <button type="button" className="chip" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {value}
        <span className="icon-box">
          <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
        </span>
      </button>
      {open ? (
        <div className="filter-menu__list" role="listbox">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={option === value ? 'is-active' : undefined}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function MetricTable({
  title,
  rows,
  accent = 'green',
  action,
  onAction,
}: {
  title: string
  rows: string[][]
  accent?: 'green' | 'blue'
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="match-card__table">
      <div className="match-card__table-head">
        <span>{title}</span>
        {action ? (
          <button type="button" className="match-card__action" onClick={onAction}>
            {action}
          </button>
        ) : null}
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

export function Dashboard({ compact }: { compact?: boolean }) {
  const [summaryTab, setSummaryTab] = useState('General')
  const [regionTab, setRegionTab] = useState('Canada')
  const [reportTab, setReportTab] = useState('Stadium')
  const [matchDay, setMatchDay] = useState('Today')
  const [briefDate, setBriefDate] = useState<(typeof BRIEF_DATES)[number]>('15 Jun')
  const [dateOpen, setDateOpen] = useState(false)
  const [reportCity, setReportCity] = useState<(typeof CITY_FILTERS)[number]>('All cities')
  const [issueCity, setIssueCity] = useState<(typeof CITY_FILTERS)[number]>('All cities')
  const [calendarCity, setCalendarCity] = useState<(typeof CITY_FILTERS)[number]>('All cities')
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [socialIndex, setSocialIndex] = useState(0)
  const [socialExpanded, setSocialExpanded] = useState(false)

  const filteredIssues = useMemo(
    () => (issueCity === 'All cities' ? ISSUES : ISSUES.filter((i) => i.city === issueCity)),
    [issueCity],
  )

  const calendarEvents = CALENDAR_BY_CITY[calendarCity] ?? CALENDAR_BY_CITY['All cities']
  const matches = MATCHES_BY_DAY[matchDay] ?? MATCHES_BY_DAY.Today
  const report = REPORT_CONTENT[reportTab]
  const social = SOCIAL_POSTS[socialIndex]

  function flash(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className={`dashboard${compact ? ' is-compact' : ''}`}>
      {toast ? <div className="dashboard__toast">{toast}</div> : null}

      <div className="dashboard__title-row">
        <div className="dashboard__title">
          <h1>EXECUTIVE BRIEF</h1>
          <div className="filter-menu">
            <button type="button" className="chip" onClick={() => setDateOpen((v) => !v)}>
              {briefDate}
              <span className="icon-box">
                <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
              </span>
            </button>
            {dateOpen ? (
              <div className="filter-menu__list">
                {BRIEF_DATES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={d === briefDate ? 'is-active' : undefined}
                    onClick={() => {
                      setBriefDate(d)
                      setDateOpen(false)
                      flash(`Brief date set to ${d}`)
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className="chip dashboard__agenda"
          onClick={() => flash('TOM agenda opened (prototype)')}
        >
          TOM AGENDA
          <span className="icon-box">
            <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
          </span>
        </button>
      </div>

      <div className="dashboard__grid">
        <section className="acrylic-card panel panel--summary">
          <h2 className="section-title">
            EXECUTIVE SUMMARY
            <span className="icon-box">
              <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
            </span>
          </h2>
          <div className="panel__stack">
            <div className="panel__block">
              <TabBar tabs={['General', 'Security', 'Guests']} active={summaryTab} onChange={setSummaryTab} />
              <div className="panel__scroll scroll-area">
                <ul>
                  {SUMMARY_CONTENT[summaryTab].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="report-chip"
                  onClick={() => flash(`Operational Report ${briefDate} ready`)}
                >
                  <span className="report-chip__icon">
                    <img src="/assets/icons/document.svg" alt="" />
                  </span>
                  <span className="report-chip__label">Operational Report {briefDate}</span>
                  <span className="report-chip__actions">
                    <img src="/assets/icons/download.svg" alt="" />
                    <img src="/assets/icons/open-in.svg" alt="" />
                  </span>
                </button>
                <div className="video-card">
                  <p>tacticalcamerastream.mp4 · {summaryTab}</p>
                  <button
                    type="button"
                    className={`video-card__media${videoPlaying ? ' is-playing' : ''}`}
                    onClick={() => {
                      setVideoPlaying((v) => !v)
                      flash(videoPlaying ? 'Stream paused' : 'Live stream playing (prototype)')
                    }}
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
        </section>

        <section className="acrylic-card panel panel--reports">
          <div className="panel__head">
            <h2 className="section-title">
              DAILY REPORTS
              <span className="icon-box">
                <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
              </span>
            </h2>
            <FilterMenu value={reportCity} options={CITY_FILTERS} onChange={(v) => setReportCity(v as typeof reportCity)} />
          </div>
          <div className="panel__block">
            <TabBar tabs={['Stadium', 'Host city', 'Fan fest']} active={reportTab} onChange={setReportTab} />
            <div className="panel__scroll scroll-area">
              <div className="ai-label">
                <span className="ai-label__icon" aria-hidden />
                <span>{report.title}</span>
              </div>
              <p>
                {reportCity === 'All cities'
                  ? report.body
                  : `${reportCity}: ${report.body}`}
              </p>
            </div>
          </div>
        </section>

        <section className="acrylic-card panel panel--issues">
          <div className="panel__head">
            <h2 className="section-title">
              ISSUES
              <span className="icon-box">
                <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
              </span>
            </h2>
            <FilterMenu value={issueCity} options={CITY_FILTERS} onChange={(v) => setIssueCity(v as typeof issueCity)} />
          </div>
          <div className="issues__top">
            <div className="issues__severity">
              <div className="issues__sev-list">
                <div><strong className="is-red">13</strong> High (5)</div>
                <div><strong className="is-orange">41</strong> Mid (3-4)</div>
                <div><strong className="is-lime">12</strong> Low (1-2)</div>
              </div>
              <span className="icon-box issues__donut">
                <img className="icon" src="/assets/icons/data-circle.svg" alt="" />
              </span>
            </div>
            <div className="issues__trend">
              <img src="/assets/icons/upward.svg" alt="" />
              <div className="issues__totals">
                <div><span>Total</span><strong>{filteredIssues.length * 55}</strong></div>
                <div><span>Today</span><strong>{filteredIssues.length * 4} <em>+18%</em></strong></div>
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
        </section>

        <section className="acrylic-card panel panel--calendar">
          <div className="panel__head">
            <h2 className="section-title">
              CALENDAR
              <span className="icon-box">
                <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
              </span>
            </h2>
            <FilterMenu
              value={calendarCity}
              options={CITY_FILTERS}
              onChange={(v) => setCalendarCity(v as typeof calendarCity)}
            />
          </div>
          <div className="calendar__events">
            {calendarEvents.map((event) => (
              <button
                key={`${event.title}-${event.city}`}
                type="button"
                className="calendar__event"
                onClick={() => flash(`${event.title} · ${event.city}`)}
              >
                <span>{event.title}</span>
                <span className={`city-pill ${event.city.toLowerCase()}`}>{event.city}</span>
              </button>
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
        </section>

        <section className="acrylic-card panel panel--matches">
          <div className="matches__head">
            <h2 className="section-title">
              MATCHES
              <span className="icon-box">
                <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
              </span>
            </h2>
            <TabBar tabs={['Yesterday', 'Today', 'Tomorrow']} active={matchDay} onChange={setMatchDay} />
          </div>
          <div className="matches__grid">
            {matches.map((match) => (
              <article key={match.id} className="match-card">
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
                    <button
                      type="button"
                      className="match-id"
                      onClick={() => flash(`Opening ${match.matchId}`)}
                    >
                      {match.matchId}
                      <span className="icon-box">
                        <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
                      </span>
                    </button>
                    <p>{match.time}</p>
                  </div>
                </div>
                <MetricTable
                  title={match.mode === 'attendance' ? 'ATTENDANCE' : 'TICKETING'}
                  rows={match.mode === 'attendance' ? ATTENDANCE_ROWS : TICKETING_ROWS}
                  accent={match.mode === 'attendance' ? 'green' : 'blue'}
                  action={match.mode === 'ticketing' ? 'View map' : undefined}
                  onAction={() => flash(`Ticketing map · ${match.city}`)}
                />
              </article>
            ))}
          </div>
        </section>

        <section className="acrylic-card panel panel--social">
          <div className="panel__head">
            <h2 className="section-title">
              SOCIAL
              <span className="icon-box">
                <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
              </span>
            </h2>
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
          </div>
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
        </section>
      </div>
    </div>
  )
}
