import { useMemo, useState } from 'react'
import { FilterChip } from './FilterChip'
import {
  IssuesSeverityChart,
  IssuesSeverityLegend,
  IssuesTrendChart,
} from './IssuesCharts'
import { ISSUES } from '../data/dummy'
import './Dashboard.css'
import './IssuesPage.css'

const CITY_FILTERS = ['All cities', 'BRS', 'SAO', 'RIO', 'MIA', 'LA', 'SEA', 'PHL'] as const

type BoardIssue = {
  id: string
  title: string
  detail: string
  city: string
  severity: 1 | 2 | 3 | 4 | 5
  owner: string
  faCode: string
  faLabel: string
  starred?: boolean
}

const OPEN_ISSUES: BoardIssue[] = [
  {
    id: 'open-1',
    title: 'Pitch Installation in Miami Stadium',
    detail: 'Turf seams failing acceptance tests on sectors 3–4. Remediation crew on site.',
    city: 'MIA',
    severity: 5,
    owner: 'John Smith',
    faCode: 'TXT',
    faLabel: 'Ticketing',
    starred: true,
  },
  {
    id: 'open-2',
    title: 'Broadcast compound power redundancy',
    detail: 'UPS bank running warm overnight. Maintenance ticket opened with vendor.',
    city: 'BRS',
    severity: 4,
    owner: 'John Smith',
    faCode: 'TXT',
    faLabel: 'Ticketing',
  },
  {
    id: 'open-3',
    title: 'Fan fest soft-closure rehearsal',
    detail: 'Local LE requesting updated soft-closure window for 15:00–21:00.',
    city: 'SAO',
    severity: 3,
    owner: 'John Smith',
    faCode: 'SEC',
    faLabel: 'Security',
  },
  {
    id: 'open-4',
    title: 'Volunteer show-rate shortfall',
    detail: 'Show-rate 84% vs 92% network average. Standby recruitment in progress.',
    city: 'RIO',
    severity: 2,
    owner: 'John Smith',
    faCode: 'OPS',
    faLabel: 'Operations',
  },
  {
    id: 'open-5',
    title: 'Media compound congestion',
    detail: 'Check-in backlog cleared after adding two desks. Watch Matchday surge.',
    city: 'MIA',
    severity: 1,
    owner: 'John Smith',
    faCode: 'COM',
    faLabel: 'Comms',
  },
]

const CLOSED_ISSUES: BoardIssue[] = [
  {
    id: 'closed-1',
    title: 'Access control failover complete',
    detail: 'Primary controllers restored. Credential queues normalized at Gate C.',
    city: 'BRS',
    severity: 5,
    owner: 'John Smith',
    faCode: 'TXT',
    faLabel: 'Ticketing',
  },
  {
    id: 'closed-2',
    title: 'Lightning risk window cleared',
    detail: 'WBGT and lightning alerts cleared for evening kickoff window.',
    city: 'SAO',
    severity: 3,
    owner: 'John Smith',
    faCode: 'OPS',
    faLabel: 'Operations',
  },
  {
    id: 'closed-3',
    title: 'Team arrival coach delay resolved',
    detail: 'Escort corridor reopened; BEL arrival completed with 12-minute delay.',
    city: 'RIO',
    severity: 2,
    owner: 'John Smith',
    faCode: 'LOG',
    faLabel: 'Logistics',
  },
]

function severityClass(level: number) {
  if (level <= 2) return 'is-low'
  if (level === 3) return 'is-mid'
  return 'is-high'
}

function IssueRow({ issue }: { issue: BoardIssue }) {
  return (
    <article className="issues-page__row">
      <button type="button" className="issues-page__star" aria-label="Star issue">
        <img
          src={issue.starred ? '/assets/icons/starred.svg' : '/assets/icons/star.svg'}
          alt=""
          width={16}
          height={16}
        />
      </button>
      <span className={`issues-page__sev ${severityClass(issue.severity)}`}>{issue.severity}</span>
      <span className={`city-pill ${issue.city.toLowerCase()}`}>{issue.city}</span>
      <span className="issues-page__owner">
        <img src="/assets/icons/person.svg" alt="" width={18} height={18} />
        {issue.owner}
      </span>
      <div className="issues-page__copy">
        <strong>{issue.title}</strong>
        <p>{issue.detail}</p>
      </div>
      <span className="issues-page__fa">
        <em>{issue.faCode}</em>
        {issue.faLabel}
      </span>
    </article>
  )
}

function IssueSection({
  title,
  issues,
  city,
}: {
  title: string
  issues: BoardIssue[]
  city: string
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return issues.filter((issue) => {
      if (city !== 'All cities' && issue.city !== city) return false
      if (!q) return true
      return (
        issue.title.toLowerCase().includes(q) ||
        issue.detail.toLowerCase().includes(q) ||
        issue.city.toLowerCase().includes(q)
      )
    })
  }, [city, issues, query])

  return (
    <section className="issues-page__section acrylic-card">
      <header className="issues-page__section-head">
        <h2>{title}</h2>
        <label className="issues-page__search">
          <span className="sr-only">Search {title}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
          />
          <img src="/assets/icons/search.svg" alt="" width={16} height={16} />
        </label>
      </header>
      <div className="issues-page__rows scroll-area">
        {filtered.map((issue) => (
          <IssueRow key={issue.id} issue={issue} />
        ))}
        {filtered.length === 0 ? <p className="issues-page__empty">No matching issues.</p> : null}
      </div>
    </section>
  )
}

export function IssuesPage({
  date,
  onDateChange,
  dates,
}: {
  date: string
  onDateChange: (value: string) => void
  dates: string[]
}) {
  const [city, setCity] = useState<(typeof CITY_FILTERS)[number]>('All cities')
  const [dateOpen, setDateOpen] = useState(false)
  const moduleCount = ISSUES.length

  return (
    <div className="issues-page">
      <div className="canvas__head">
        <div className="canvas__head-left">
          <h1 className="canvas__title">Issues</h1>
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
                {dates.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={option === date ? 'is-active' : undefined}
                    onClick={() => {
                      onDateChange(option)
                      setDateOpen(false)
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <FilterChip
            value={city}
            options={CITY_FILTERS}
            onChange={(next) => setCity(next as (typeof CITY_FILTERS)[number])}
            align="start"
          />
        </div>
      </div>

      <div className="issues-page__layout">
        <div className="issues-page__main">
          <IssueSection title="Open issues" issues={OPEN_ISSUES} city={city} />
          <IssueSection title="Closed issues (Last 24 hours)" issues={CLOSED_ISSUES} city={city} />
        </div>

        <aside className="issues-page__aside">
          <section className="issues-page__widget acrylic-card">
            <h3 className="section-title">Issue severity</h3>
            <div className="issues__severity">
              <IssuesSeverityLegend />
              <div className="issues__donut">
                <IssuesSeverityChart />
              </div>
            </div>
          </section>

          <section className="issues-page__widget acrylic-card">
            <h3 className="section-title">Issue count</h3>
            <div className="issues__trend-chart">
              <IssuesTrendChart height={72} />
            </div>
            <div className="issues-page__count">
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
            <p className="issues-page__hint">{moduleCount} tracked in module feed</p>
          </section>

          <section className="issues-page__widget acrylic-card issues-page__map">
            <h3 className="section-title">Map</h3>
            <div className="issues-page__map-stage">
              <img src="/assets/module-map.png" alt="Issue locations map" />
              <span className="issues-page__dot is-high" style={{ left: '28%', top: '42%' }} />
              <span className="issues-page__dot is-mid" style={{ left: '48%', top: '55%' }} />
              <span className="issues-page__dot is-low" style={{ left: '62%', top: '38%' }} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
