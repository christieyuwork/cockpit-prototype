import type {
  FlightCard,
  IssueRow,
  MatchWidgetData,
  QueryIntent,
  RiskSnippet,
  SourceLink,
} from '../data/query'
import {
  FLIGHT_CARDS,
  ISSUE_ROWS,
  MATCHDAY_WIDGET,
  RISK_SNIPPETS,
} from '../data/query'
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
        ↗
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
              {flight.kind === 'referees' ? '▣' : '⚑'}
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
                <img className="icon" src="/assets/chevron-right.svg" alt="" />
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
                  <img className="icon" src="/assets/chevron-right.svg" alt="" />
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

export function QueryWidgetBundle({ intent }: { intent: QueryIntent }) {
  if (intent === 'risk') return <RiskWidgets items={RISK_SNIPPETS} />
  if (intent === 'flights') return <FlightWidgets items={FLIGHT_CARDS} />
  if (intent === 'issues') return <IssuesWidget items={ISSUE_ROWS} />
  if (intent === 'matchday') return <MatchWidget data={MATCHDAY_WIDGET} />
  return null
}
