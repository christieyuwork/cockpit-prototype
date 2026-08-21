import { useState } from 'react'
import type {
  ActionConfirm,
  ActionDraft,
  CitySnapshot,
  FlightCard,
  IssueRow,
  MatchWidgetData,
  QueryIntent,
  RiskSnippet,
  ScenarioWidgetLayout,
  SourceLink,
  SwitchableReport,
} from '../data/query'
import {
  FLIGHT_CARDS,
  ISSUE_ROWS,
  MATCHDAY_WIDGET,
  MIAMI_CITY_SNAPSHOT,
  MIAMI_OPEN_ACTIONS_SUGGESTION,
  MIAMI_REPORTS,
  RISK_SNIPPETS,
} from '../data/query'
import {
  ARGENTINA_FLIGHTS,
  ARGENTINA_OWNERS,
  CURACAO_CALENDAR,
  CURACAO_FLIGHTS,
  CURACAO_GROUND_CONTACTS,
  CURACAO_HOTELS,
  CURACAO_MAP_ROUTES,
  EXTERNAL_LA_ITEMS,
  MAP_AIRPORTS,
  SEA_PERIMETER,
  SEA_WEATHER,
  TOM_AGENDA,
  TOM_DELTA,
  VENUE_NEXT_HOUR,
  VENUE_STATUS_SUMMARY,
  VIP_SOP_STEPS,
  WEATHER_IMPACTED,
  WEATHER_MITIGATIONS,
} from '../data/scenarioEvidence'
import './QueryWidgets.css'

function SourceChip({ source }: { source: SourceLink; emphasize?: boolean }) {
  return (
    <a
      className="qw-source"
      href={source.href}
      onClick={(e) => e.preventDefault()}
      title={source.meta}
    >
      <span className="qw-source__icon" aria-hidden>
        <img src="/assets/icons/open-in.svg" alt="" width={12} height={12} />
      </span>
      <span className="qw-source__body">
        <strong>{source.label}</strong>
        {source.meta ? <em>{source.meta}</em> : null}
      </span>
    </a>
  )
}

function SourcesBlock({ sources, title = 'Sources' }: { sources: SourceLink[]; title?: string }) {
  return (
    <div className="qw-sources">
      <div className="qw-sources__label">{title}</div>
      <div className="qw-sources__list">
        {sources.map((source) => (
          <SourceChip key={source.href + source.label} source={source} emphasize />
        ))}
      </div>
    </div>
  )
}

function RiskWidgets({ items }: { items: RiskSnippet[] }) {
  return (
    <div className="qw-stack">
      {items.map((item) => (
        <article key={item.id} className="qw-risk">
          <div className="qw-risk__head">
            {item.city ? <span className={`city-pill ${item.city.toLowerCase()}`}>{item.city}</span> : null}
            <h4>{item.title}</h4>
          </div>
          <p>{item.excerpt}</p>
          <SourceChip source={item.source} emphasize />
        </article>
      ))}
      <SourcesBlock sources={items.map((i) => i.source)} title="Report sources" />
    </div>
  )
}

function FlightWidgets({ items }: { items: FlightCard[] }) {
  return (
    <div className="qw-stack">
      {items.map((flight) => (
        <article key={flight.id} className={`qw-flight qw-flight--${flight.statusTone}`}>
          <div className="qw-flight__tab">
            <span className="qw-flight__tab-icon" aria-hidden>
              <img
                src={flight.kind === 'referees' ? '/assets/icons/referee.svg' : '/assets/icons/flight.svg'}
                alt=""
                width={16}
                height={16}
              />
            </span>
            <span>{flight.label}</span>
          </div>
          <div className="qw-flight__body">
            {[flight.from, flight.to].map((leg) => (
              <div key={`${flight.id}-${leg.status}`} className="qw-flight__leg">
                <div className="qw-flight__left">
                  <span className="qw-flight__code">{leg.code}</span>
                  <div>
                    <strong>{leg.city}</strong>
                    <span>{leg.date}</span>
                  </div>
                </div>
                <div className={`qw-flight__status is-${flight.statusTone}`}>
                  <em>{leg.status}</em> {leg.time}
                </div>
              </div>
            ))}
            <div className="qw-flight__plane" aria-hidden>
              ✈
            </div>
          </div>
          <SourceChip source={flight.source} emphasize />
        </article>
      ))}
      <SourcesBlock sources={items.map((i) => i.source)} title="Travel sources" />
    </div>
  )
}

function severityClass(level: IssueRow['severity']) {
  if (level >= 5) return 'is-5'
  if (level >= 4) return 'is-4'
  if (level >= 3) return 'is-3'
  return 'is-2'
}

function IssuesWidget({ items }: { items: IssueRow[] }) {
  return (
    <div className="qw-stack">
      <div className="qw-issues">
        {items.map((issue) => (
          <article key={issue.id} className="qw-issue">
            <div className="qw-issue__tags">
              <span className={`qw-issue__sev ${severityClass(issue.severity)}`}>{issue.severity}</span>
              <span className={`city-pill ${issue.city.toLowerCase()}`}>{issue.city}</span>
              <span className="qw-issue__cat">
                <em>TXT</em> {issue.category}
              </span>
            </div>
            <h4>{issue.title}</h4>
            <p>{issue.summary}</p>
            <SourceChip source={issue.source} emphasize />
          </article>
        ))}
      </div>
      <SourcesBlock sources={items.map((i) => i.source)} title="Issue records" />
    </div>
  )
}

function MatchWidget({ data }: { data: MatchWidgetData }) {
  return (
    <div className="qw-stack">
      <article className="qw-match">
        <div className="qw-match__header">
          <div className="qw-match__top">
            <span className={`city-pill ${data.city.toLowerCase()}`}>{data.city}</span>
            <div className="qw-match__scoreline">
              <span>{data.score?.[0] ?? '--'}</span>
              <img className="flag" src="/assets/flag-uy.svg" alt="" />
              <strong>
                {data.home} v. {data.away}
              </strong>
              <img className="flag" src="/assets/flag-cv.svg" alt="" />
              <span>{data.score?.[1] ?? '--'}</span>
            </div>
            <a className="match-id" href={`#match/${data.matchId}`} onClick={(e) => e.preventDefault()}>
              {data.matchId}
              <span className="icon-box">
                <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
              </span>
            </a>
          </div>
          <div className="qw-match__meta">
            <span>{data.weather}</span>
            <span>{data.group}</span>
            <span>{data.time}</span>
            <span>{data.date}</span>
          </div>
          <div className="qw-match__risks">
            {data.risks.map((risk) => (
              <span key={risk.label} className={`qw-match__chip is-${risk.tone}`}>
                {risk.label}
                {risk.tone === 'neutral' ? ' ›' : ''}
              </span>
            ))}
          </div>
        </div>

        <div className="qw-match__standings">
          <div className="qw-match__section-title">
            GROUP (G) <span>›</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th />
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>Pts</th>
                <th>GD</th>
              </tr>
            </thead>
            <tbody>
              {data.standings.map((row) => (
                <tr key={row.team}>
                  <td>{row.rank}</td>
                  <td>
                    <span className="qw-match__team">
                      <img className="flag" src="/assets/flag-uy.svg" alt="" />
                      {row.team}
                    </span>
                  </td>
                  <td>
                    {row.badge ? (
                      <span className={`qw-match__badge is-${row.badge.toLowerCase()}`}>{row.badge}</span>
                    ) : null}
                  </td>
                  <td>{row.w}</td>
                  <td>{row.d}</td>
                  <td>{row.l}</td>
                  <td>{row.pts}</td>
                  <td>{row.gd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="qw-match__related">
          <div className="qw-match__section-title">
            RELATED MATCHES <span>›</span>
          </div>
          {data.related.map((row) => (
            <div key={row.matchId} className="qw-match__related-row">
              <span className={`city-pill ${row.city.toLowerCase()}`}>{row.city}</span>
              <span className="qw-match__related-main">
                <img className="flag" src="/assets/usa-flag.png" alt="" />
                {row.matchup}
              </span>
              <a className="match-id" href={`#match/${row.matchId}`} onClick={(e) => e.preventDefault()}>
                {row.matchId}
                <span className="icon-box">
                  <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
                </span>
              </a>
              <span className="qw-match__related-meta">
                {row.when} · {row.group} · {row.weather}
              </span>
            </div>
          ))}
        </div>

        <div className="qw-match__ticket">
          <div className="qw-match__ticket-head">
            <strong>TICKETING</strong>
            <a href="#source/ticketing-map-m37" onClick={(e) => e.preventDefault()}>
              View map
            </a>
          </div>
          {data.ticketing.map((row) => (
            <div key={row.label} className="qw-match__ticket-row">
              <span>{row.label}</span>
              <span>
                {row.value} <em>({row.pct})</em>
              </span>
            </div>
          ))}
        </div>
      </article>

      <SourcesBlock sources={data.sources} title="Matchday sources" />
    </div>
  )
}

function ActionDraftWidget({
  action,
  onActionComplete,
}: {
  action: ActionDraft
  onActionComplete?: (confirm: ActionConfirm) => void
}) {
  const [done, setDone] = useState(false)
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(action.fields.map((field) => [field.label, field.value])),
  )

  const requiredIncomplete = action.fields.some(
    (field) => field.required && field.options?.length && !values[field.label]?.trim(),
  )
  const canSubmit = !done && !requiredIncomplete

  return (
    <article className={`qw-action${done ? ' is-done' : ''}`}>
      <div className="qw-action__head">
        <h4>{action.title}</h4>
        {action.subtitle ? <p className="qw-action__subtitle">{action.subtitle}</p> : null}
      </div>
      <div className="qw-action__fields">
        {action.fields.map((field) => {
          const isSelect = Boolean(field.options?.length)
          const current = values[field.label] ?? ''
          const missing = Boolean(field.required && isSelect && !current.trim())

          return (
            <div
              key={field.label}
              className={`qw-action__row${missing ? ' is-required' : ''}${isSelect ? ' is-select' : ''}`}
            >
              <span>
                {field.label}
                {field.required && isSelect ? <em className="qw-action__req">Required</em> : null}
              </span>
              {isSelect ? (
                <select
                  className={`qw-action__select${missing ? ' is-missing' : ''}`}
                  value={current}
                  disabled={done}
                  aria-required={field.required}
                  aria-invalid={missing}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.label]: e.target.value }))
                  }
                >
                  <option value="">Select {field.label.toLowerCase()}…</option>
                  {field.options!.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <strong>{field.value}</strong>
              )}
            </div>
          )
        })}
      </div>
      {requiredIncomplete ? (
        <p className="qw-action__hint">Select Owner and Due before creating this item.</p>
      ) : null}
      {action.sources?.length ? <SourcesBlock sources={action.sources} title="Action sources" /> : null}
      <button
        type="button"
        className="qw-action__cta"
        disabled={!canSubmit}
        onClick={() => {
          if (!canSubmit) return
          setDone(true)
          if (action.confirm && onActionComplete) {
            const owner = values.Owner?.trim()
            const due = values.Due?.trim() || values['Due date']?.trim()
            const detail =
              owner || due
                ? ` Owner: ${owner || '—'}${due ? ` · Due: ${due}` : ''}.`
                : ''
            onActionComplete({
              ...action.confirm,
              text: `${action.confirm.text}${detail}`,
            })
          }
        }}
      >
        {done ? 'Done' : action.cta}
      </button>
    </article>
  )
}

function ActionResultWidget({ resultLink }: { resultLink: ActionConfirm }) {
  return (
    <article className="qw-panel qw-result">
      <div className="qw-panel__head">
        <h4>Confirmed</h4>
      </div>
      <p className="qw-result__text">{resultLink.text}</p>
      <a
        className="qw-result-link"
        href={resultLink.href}
        onClick={(e) => e.preventDefault()}
      >
        {resultLink.linkLabel}
      </a>
    </article>
  )
}

function MiamiCitySnapshotWidget({ data }: { data: CitySnapshot }) {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <span className={`city-pill ${data.city.toLowerCase()}`}>{data.city}</span>
        <h4>City snapshot</h4>
      </div>

      <div className="qw-snapshot">
        <section>
          <h5>Weather</h5>
          <div className="qw-snapshot__grid">
            <div>
              <em>Condition</em>
              <strong>{data.weather.condition}</strong>
            </div>
            <div>
              <em>Temp</em>
              <strong>{data.weather.temp}</strong>
            </div>
            <div>
              <em>WBGT</em>
              <strong>{data.weather.wbgt}</strong>
            </div>
            <div>
              <em>Wind</em>
              <strong>{data.weather.wind}</strong>
            </div>
          </div>
        </section>

        <section>
          <h5>Stadium</h5>
          <div className="qw-snapshot__grid">
            <div>
              <em>Venue</em>
              <strong>{data.stadium.name}</strong>
            </div>
            <div>
              <em>Status</em>
              <strong className="is-warn">{data.stadium.status}</strong>
            </div>
            <div>
              <em>Capacity</em>
              <strong>{data.stadium.capacity}</strong>
            </div>
            <div>
              <em>Next</em>
              <strong>{data.stadium.nextMatch}</strong>
            </div>
            <div className="is-wide">
              <em>Gates</em>
              <strong>{data.stadium.gates}</strong>
            </div>
          </div>
        </section>

        <section>
          <h5>Key contacts</h5>
          <ul className="qw-contacts">
            {data.contacts.map((contact) => (
              <li key={contact.role}>
                <div>
                  <strong>{contact.name}</strong>
                  <span>{contact.role}</span>
                </div>
                <em>{contact.detail}</em>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  )
}

function SimpleIssueListWidget({ items }: { items: IssueRow[] }) {
  const sorted = [...items].sort((a, b) => b.severity - a.severity)
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>Open issues</h4>
        <span className="qw-panel__meta">{sorted.length} Miami</span>
      </div>
      <ul className="qw-simple-list">
        {sorted.map((issue) => (
          <li key={issue.id}>
            <span className={`qw-issue__sev ${severityClass(issue.severity)}`}>{issue.severity}</span>
            <div>
              <strong>{issue.title}</strong>
              <em>
                {issue.category} · {issue.source.label}
              </em>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

function ReportSwitcherWidget({ reports }: { reports: SwitchableReport[] }) {
  const [activeId, setActiveId] = useState(reports[0]?.id ?? '')
  const active = reports.find((r) => r.id === activeId) ?? reports[0]
  if (!active) return null

  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>Latest reports</h4>
      </div>
      <div className="tab-bar qw-report-tabs" role="tablist" aria-label="Miami reports">
        {reports.map((report) => (
          <button
            key={report.id}
            type="button"
            role="tab"
            aria-selected={report.id === active.id}
            className={`tab${report.id === active.id ? ' active' : ''}`}
            onClick={() => setActiveId(report.id)}
          >
            {report.label}
          </button>
        ))}
      </div>
      <div className="qw-report">
        <div className="qw-report__meta">
          <strong>{active.title}</strong>
          <em>Updated {active.updated}</em>
        </div>
        <p>{active.excerpt}</p>
        <SourceChip source={active.source} emphasize />
      </div>
    </article>
  )
}

function MiamiOpenActionsWidget({
  items,
  suggestion,
}: {
  items: IssueRow[]
  suggestion: string
}) {
  const sorted = [...items].sort((a, b) => b.severity - a.severity)
  return (
    <div className="qw-stack">
      <article className="qw-panel">
        <div className="qw-panel__head">
          <h4>Open actions · Miami</h4>
          <span className="qw-panel__meta">By severity</span>
        </div>
        <ul className="qw-action-list">
          {sorted.map((issue, index) => (
            <li key={issue.id}>
              <div className="qw-action-list__rank">{index + 1}</div>
              <div className="qw-action-list__body">
                <div className="qw-action-list__tags">
                  <span className={`qw-issue__sev ${severityClass(issue.severity)}`}>{issue.severity}</span>
                  <span className="qw-issue__cat">
                    <em>TXT</em> {issue.category}
                  </span>
                </div>
                <strong>{issue.title}</strong>
                <p>{issue.summary}</p>
                <SourceChip source={issue.source} emphasize />
              </div>
            </li>
          ))}
        </ul>
      </article>
      <article className="qw-suggest">
        <span className="qw-suggest__label">Tackle now</span>
        <p>{suggestion}</p>
      </article>
    </div>
  )
}

function routePath(from: string, to: string, bend: number) {
  const a = MAP_AIRPORTS[from]
  const b = MAP_AIRPORTS[to]
  if (!a || !b) return ''
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const cx = mx + (-dy / len) * bend
  const cy = my + (dx / len) * bend
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
}

const ROUTE_BENDS = [48, -32, 18]

function CuracaoMapWidget() {
  return (
    <article className="qw-panel qw-map">
      <div className="qw-panel__head">
        <h4>Flight routes · Curaçao</h4>
        <span className="qw-panel__meta">TPA converge</span>
      </div>
      <svg className="qw-map__svg" viewBox="0 0 400 220" role="img" aria-label="Curacao flight routes to Tampa">
        <defs>
          <linearGradient id="qw-ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(40, 90, 140, 0.55)" />
            <stop offset="100%" stopColor="rgba(20, 50, 90, 0.35)" />
          </linearGradient>
        </defs>
        <rect width="400" height="220" rx="8" fill="url(#qw-ocean)" />
        <ellipse cx="200" cy="120" rx="150" ry="70" fill="rgba(50, 110, 160, 0.2)" />
        {CURACAO_MAP_ROUTES.map((route, index) => (
          <path
            key={route.id}
            className={`qw-map__route is-${route.tone}`}
            d={routePath(route.from, route.to, ROUTE_BENDS[index] ?? 24)}
            fill="none"
          />
        ))}
        {Object.entries(MAP_AIRPORTS).map(([code, spot]) => (
          <g key={code} className="qw-map__airport">
            <circle cx={spot.x} cy={spot.y} r="5" />
            <text x={spot.x + 8} y={spot.y - 6}>
              {code}
            </text>
            <text className="qw-map__city" x={spot.x + 8} y={spot.y + 8}>
              {spot.city}
            </text>
          </g>
        ))}
      </svg>
      <ul className="qw-map__legend">
        {CURACAO_MAP_ROUTES.map((route) => (
          <li key={route.id}>
            <span className={`qw-map__swatch is-${route.tone}`} />
            <strong>{route.label}</strong>
            <em>
              {route.from} → {route.to}
            </em>
          </li>
        ))}
      </ul>
    </article>
  )
}

function CuracaoContactsWidget() {
  return (
    <div className="qw-stack">
      {CURACAO_GROUND_CONTACTS.map((contact) => (
        <article key={contact.id} className="qw-panel qw-contact-card">
          <div className="qw-contact-card__head">
            <span className="qw-contact-card__dept">{contact.dept}</span>
            <span className="qw-contact-card__status">{contact.status}</span>
          </div>
          <strong className="qw-contact-card__name">{contact.name}</strong>
          <span className="qw-contact-card__role">{contact.role}</span>
          <div className="qw-contact-card__meta">
            <span>{contact.phone}</span>
            <span>{contact.location}</span>
          </div>
        </article>
      ))}
    </div>
  )
}

function CuracaoHotelsWidget() {
  return (
    <div className="qw-stack">
      {CURACAO_HOTELS.map((hotel) => (
        <article key={hotel.id} className="qw-panel qw-hotel">
          <div className="qw-panel__head">
            <h4>{hotel.name}</h4>
            <span className={`qw-hotel__status is-${hotel.bookingStatus.toLowerCase()}`}>
              {hotel.bookingStatus}
            </span>
          </div>
          <p className="qw-hotel__address">{hotel.address}</p>
          <div className="qw-hotel__grid">
            <div>
              <em>Rooms</em>
              <strong>{hotel.rooms}</strong>
            </div>
            <div>
              <em>Occupants</em>
              <strong>{hotel.occupants}</strong>
            </div>
            <div>
              <em>Check-in</em>
              <strong>{hotel.checkIn}</strong>
            </div>
            <div>
              <em>Check-out</em>
              <strong>{hotel.checkOut}</strong>
            </div>
          </div>
          <p className="qw-hotel__notes">{hotel.notes}</p>
          <SourceChip source={hotel.source} emphasize />
        </article>
      ))}
    </div>
  )
}

function CuracaoCalendarWidget() {
  const sorted = [...CURACAO_CALENDAR].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date)
    if (dateCmp !== 0) return dateCmp
    return a.time.localeCompare(b.time)
  })

  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>Team calendar · CUW</h4>
        <span className="qw-panel__meta">{sorted.length} events</span>
      </div>
      <ul className="qw-calendar">
        {sorted.map((event) => (
          <li key={event.id} className="qw-calendar__row">
            <div className="qw-calendar__when">
              <strong>{event.date}</strong>
              <em>{event.time}</em>
            </div>
            <div className="qw-calendar__body">
              <span className="qw-calendar__kind">{event.kind}</span>
              <strong>{event.title}</strong>
              <em>
                {event.location} · {event.status}
              </em>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

function SeaWeatherWidget() {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <span className={`city-pill ${SEA_WEATHER.city.toLowerCase()}`}>{SEA_WEATHER.city}</span>
        <h4>Matchday weather</h4>
      </div>
      <div className="qw-snapshot__grid">
        <div>
          <em>Condition</em>
          <strong>{SEA_WEATHER.condition}</strong>
        </div>
        <div>
          <em>Temp</em>
          <strong>{SEA_WEATHER.temp}</strong>
        </div>
        <div>
          <em>Wind</em>
          <strong>{SEA_WEATHER.wind}</strong>
        </div>
        <div className="is-wide">
          <em>Impact</em>
          <strong>{SEA_WEATHER.impact}</strong>
        </div>
      </div>
    </article>
  )
}

function PerimeterWidget() {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>Perimeter variance · SEA</h4>
        <span className="qw-panel__meta">H-2</span>
      </div>
      <div className="qw-snapshot__grid">
        <div>
          <em>Outer</em>
          <strong>{SEA_PERIMETER.outer}</strong>
        </div>
        <div>
          <em>Inner</em>
          <strong>{SEA_PERIMETER.inner}</strong>
        </div>
        <div>
          <em>Variance</em>
          <strong className="is-warn">{SEA_PERIMETER.variance}</strong>
        </div>
        <div>
          <em>Forecast gap</em>
          <strong className="is-warn">{SEA_PERIMETER.forecastGap}</strong>
        </div>
        <div className="is-wide">
          <em>Note</em>
          <strong>{SEA_PERIMETER.note}</strong>
        </div>
      </div>
    </article>
  )
}

function WeatherImpactedWidget() {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>Weather-impacted ops</h4>
        <span className="qw-panel__meta">{WEATHER_IMPACTED.length}</span>
      </div>
      <ul className="qw-impact-list">
        {WEATHER_IMPACTED.map((row) => (
          <li key={row.id}>
            <span className="qw-impact-list__kind">{row.kind}</span>
            <div>
              <strong>{row.label}</strong>
              <em>
                <span className={`city-pill ${row.city.toLowerCase()}`}>{row.city}</span>
                {row.window} · {row.risk}
              </em>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

function WeatherOpsImpactWidget() {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>Operational impact</h4>
      </div>
      <p className="qw-impact-note">
        Expect slower scans, shortened warm-ups, and possible pitch-walk holds — not cancellations yet.
      </p>
      <ul className="qw-mitigations">
        {WEATHER_MITIGATIONS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

function VenueSummaryWidget() {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>Stadium status</h4>
        <span className="qw-venue__overall is-yellow">{VENUE_STATUS_SUMMARY.overall}</span>
      </div>
      <p className="qw-venue__name">{VENUE_STATUS_SUMMARY.venue}</p>
      <div className="qw-venue__cols">
        <section>
          <h5>Amber drivers</h5>
          <ul>
            {VENUE_STATUS_SUMMARY.drivers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h5>Green</h5>
          <ul>
            {VENUE_STATUS_SUMMARY.green.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  )
}

function VenueFocusWidget() {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>Next hour focus</h4>
      </div>
      <ul className="qw-checklist">
        {VENUE_NEXT_HOUR.map((item) => (
          <li key={item.id}>
            <span className={`qw-checklist__priority is-${item.priority.toLowerCase()}`}>
              {item.priority}
            </span>
            <div>
              <strong>{item.title}</strong>
              <em>
                {item.owner} · {item.due}
              </em>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

function TomAgendaWidget() {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>TOM agenda</h4>
        <span className="qw-panel__meta">{TOM_AGENDA.length} items</span>
      </div>
      <ol className="qw-agenda">
        {TOM_AGENDA.map((item) => (
          <li key={item.id}>
            <span className="qw-agenda__num">{item.order}</span>
            <div>
              <strong>{item.title}</strong>
              <em>
                {item.owner} · {item.minutes} min
              </em>
            </div>
          </li>
        ))}
      </ol>
    </article>
  )
}

function TomDeltaWidget() {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>Since yesterday</h4>
      </div>
      <ul className="qw-delta">
        {TOM_DELTA.map((item) => (
          <li key={item.id}>
            <span className={`qw-delta__tone is-${item.tone}`}>{item.tone}</span>
            <div>
              <strong>{item.label}</strong>
              <em>{item.change}</em>
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

function SopStepsWidget() {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>VIP transport incident SOP</h4>
      </div>
      <ol className="qw-sop">
        {VIP_SOP_STEPS.map((step) => (
          <li key={step.id}>
            <span className="qw-sop__num">{step.step}</span>
            <div>
              <strong>{step.title}</strong>
              <em>{step.detail}</em>
            </div>
          </li>
        ))}
      </ol>
    </article>
  )
}

function SopEscalationWidget() {
  return (
    <div className="qw-stack">
      <article className="qw-panel qw-contact-card">
        <div className="qw-contact-card__head">
          <span className="qw-contact-card__dept">Primary</span>
          <span className="qw-contact-card__status">Approves escalation</span>
        </div>
        <strong className="qw-contact-card__name">TOC Manager</strong>
        <span className="qw-contact-card__role">Tournament Operations Centre</span>
        <div className="qw-contact-card__meta">
          <span>TOC channel · Transport Desk</span>
          <span>On duty · 24h</span>
        </div>
      </article>
      <article className="qw-panel qw-contact-card">
        <div className="qw-contact-card__head">
          <span className="qw-contact-card__dept">Backup</span>
          <span className="qw-contact-card__status">If TOC Manager unreachable</span>
        </div>
        <strong className="qw-contact-card__name">Duty CTO</strong>
        <span className="qw-contact-card__role">Chief Tournament Officer</span>
        <div className="qw-contact-card__meta">
          <span>Executive ops bridge</span>
          <span>Escalate via TOC duty log</span>
        </div>
      </article>
    </div>
  )
}

function ExternalLaWidget() {
  return (
    <div className="qw-stack">
      {EXTERNAL_LA_ITEMS.map((item) => (
        <article key={item.id} className="qw-panel qw-external">
          <strong>{item.title}</strong>
          <p>{item.detail}</p>
          <SourceChip source={item.source} emphasize />
        </article>
      ))}
    </div>
  )
}

function ExternalImpactWidget() {
  return (
    <article className="qw-panel">
      <div className="qw-panel__head">
        <h4>Impact assessment · LA</h4>
      </div>
      <div className="qw-impact-assess">
        <div>
          <em>Match ops</em>
          <strong className="is-ok">Green</strong>
        </div>
        <div>
          <em>Fan fest / last-mile</em>
          <strong className="is-warn">Exposed near west plaza</strong>
        </div>
        <div className="is-wide">
          <em>Escalation</em>
          <strong>Only if LE expands soft-closure footprint</strong>
        </div>
      </div>
    </article>
  )
}

function IntentEvidence({ intent }: { intent: QueryIntent }) {
  if (intent === 'risk') return <RiskWidgets items={RISK_SNIPPETS} />
  if (intent === 'flights') return <FlightWidgets items={FLIGHT_CARDS} />
  if (intent === 'issues') return <IssuesWidget items={ISSUE_ROWS} />
  if (intent === 'matchday') return <MatchWidget data={MATCHDAY_WIDGET} />
  return null
}

function MiamiDetailBundle() {
  const miamiIssues = ISSUE_ROWS.filter((row) => row.city === 'MIA')
  return (
    <div className="qw-stack">
      <MiamiCitySnapshotWidget data={MIAMI_CITY_SNAPSHOT} />
      <SimpleIssueListWidget items={miamiIssues} />
      <ReportSwitcherWidget reports={MIAMI_REPORTS} />
    </div>
  )
}

function ScenarioEvidence({ widgets }: { widgets: ScenarioWidgetLayout }) {
  switch (widgets) {
    case 'curacao-flights':
      return <FlightWidgets items={CURACAO_FLIGHTS} />
    case 'curacao-map':
      return <CuracaoMapWidget />
    case 'curacao-contacts':
      return <CuracaoContactsWidget />
    case 'curacao-hotels':
      return <CuracaoHotelsWidget />
    case 'curacao-calendar':
      return <CuracaoCalendarWidget />
    case 'attendance-matchday':
      return <MatchWidget data={MATCHDAY_WIDGET} />
    case 'attendance-weather':
      return <SeaWeatherWidget />
    case 'attendance-transport':
      return <IssuesWidget items={ISSUE_ROWS.filter((row) => row.city === 'SEA')} />
    case 'attendance-perimeter':
      return <PerimeterWidget />
    case 'weather-impacted':
      return <WeatherImpactedWidget />
    case 'weather-ops-impact':
      return <WeatherOpsImpactWidget />
    case 'venue-summary':
      return <VenueSummaryWidget />
    case 'venue-yellow':
      return <SimpleIssueListWidget items={ISSUE_ROWS.filter((row) => row.city === 'MIA')} />
    case 'venue-focus':
      return <VenueFocusWidget />
    case 'tom-agenda':
      return <TomAgendaWidget />
    case 'tom-actions':
      return <IssuesWidget items={[...ISSUE_ROWS].sort((a, b) => b.severity - a.severity)} />
    case 'tom-delta':
      return <TomDeltaWidget />
    case 'argentina-ops':
      return <FlightWidgets items={ARGENTINA_FLIGHTS} />
    case 'argentina-risks':
      return <RiskWidgets items={RISK_SNIPPETS.filter((r) => r.city === 'MIA')} />
    case 'argentina-owners':
      return <IssuesWidget items={ARGENTINA_OWNERS} />
    case 'sop-handle':
    case 'sop-full':
      return <SopStepsWidget />
    case 'sop-escalation':
      return <SopEscalationWidget />
    case 'external-la':
      return <ExternalLaWidget />
    case 'external-impact':
      return <ExternalImpactWidget />
    default:
      return null
  }
}

export function QueryWidgetBundle({
  intent,
  action,
  widgets = 'intent',
  resultLink,
  onActionComplete,
}: {
  intent: QueryIntent
  action?: ActionDraft
  widgets?: ScenarioWidgetLayout
  resultLink?: ActionConfirm
  onActionComplete?: (confirm: ActionConfirm) => void
}) {
  if (widgets === 'miami-detail') {
    return (
      <div className="qw-bundle">
        <MiamiDetailBundle />
      </div>
    )
  }

  if (widgets === 'miami-open-actions') {
    return (
      <div className="qw-bundle">
        <MiamiOpenActionsWidget
          items={ISSUE_ROWS.filter((row) => row.city === 'MIA')}
          suggestion={MIAMI_OPEN_ACTIONS_SUGGESTION}
        />
      </div>
    )
  }

  if (widgets === 'action-only') {
    if (!action) return null
    return (
      <div className="qw-bundle">
        <div className="qw-stack">
          <ActionDraftWidget action={action} onActionComplete={onActionComplete} />
        </div>
      </div>
    )
  }

  if (widgets === 'action-result') {
    if (!resultLink) return null
    return (
      <div className="qw-bundle">
        <div className="qw-stack">
          <ActionResultWidget resultLink={resultLink} />
        </div>
      </div>
    )
  }

  if (
    widgets !== 'intent' &&
    widgets !== 'miami-detail' &&
    widgets !== 'miami-open-actions' &&
    widgets !== 'action-only' &&
    widgets !== 'action-result'
  ) {
    return (
      <div className="qw-bundle">
        <ScenarioEvidence widgets={widgets} />
      </div>
    )
  }

  const evidence = intent !== 'general' ? <IntentEvidence intent={intent} /> : null
  if (!evidence && !action) return null

  return (
    <div className="qw-bundle">
      {evidence}
      {action ? (
        <div className="qw-stack">
          <ActionDraftWidget action={action} onActionComplete={onActionComplete} />
        </div>
      ) : null}
    </div>
  )
}
