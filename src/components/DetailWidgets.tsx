import type { ReactNode } from 'react'
import { buildIssueDetail, type IssueDetail } from './IssueWidget'
import { WidgetMeta } from './WidgetMeta'
import './DetailWidgets.css'

function Shell({
  label,
  timestamp,
  location,
  children,
}: {
  label: string
  timestamp: string
  location?: string
  children: ReactNode
}) {
  return (
    <article className="detail-widget">
      <WidgetMeta category={label} timestamp={timestamp} location={location} />
      {children}
    </article>
  )
}

function KvBlock({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: string }[]
}) {
  return (
    <div className="detail-widget__kv">
      <div className="detail-widget__kv-label">{title}</div>
      {rows.map((row) => (
        <div key={row.label} className="detail-widget__kv-row">
          <span>{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ——— Issue ——— */

export function IssueDetailWidget({ issue }: { issue: IssueDetail }) {
  return (
    <Shell label="Issue" timestamp={issue.lastUpdated} location={issue.city}>
      <div className="detail-widget__row">
        <span className={`detail-widget__sev is-${Math.min(issue.severity, 5)}`}>{issue.severity}</span>
        <span className="detail-widget__open">{issue.status}</span>
      </div>
      <h3 className="detail-widget__title">{issue.title}</h3>
      <p className="detail-widget__desc">{issue.body}</p>
      <div className="detail-widget__row">
        <span className="detail-widget__author">
          <span aria-hidden>👤</span>
          {issue.author}
        </span>
        <span className="detail-widget__chip is-ok">
          <em>LAST UPDATED</em> {issue.lastUpdated}
        </span>
        <span className="detail-widget__chip is-ok">
          <em>OPENED</em> {issue.opened}
        </span>
      </div>
      <div className="detail-widget__kv">
        <div className="detail-widget__kv-label">Tags</div>
        <div className="detail-widget__tags">
          {issue.tags.map((tag) => (
            <span key={`${tag.code}-${tag.label}`} className="detail-widget__tag">
              <em>{tag.code}</em> {tag.label}
            </span>
          ))}
        </div>
      </div>
    </Shell>
  )
}

/* ——— Match ——— */

export type MatchDetail = {
  city: string
  matchup: string
  matchId: string
  scoreL: string
  scoreR: string
  group: string
  kickoff: string
  venue: string
  weather: string
  readiness: string
  body: string
  when: string
}

export function MatchDetailWidget({ match }: { match: MatchDetail }) {
  return (
    <Shell label="Match" timestamp={match.when} location={match.city}>
      <div className="detail-widget__row">
        <span className="detail-widget__scoreline">
          <span>{match.scoreL}</span>
          <img className="flag" src="/assets/flag-uy.svg" alt="" />
          <strong>{match.matchup}</strong>
          <img className="flag" src="/assets/flag-cv.svg" alt="" />
          <span>{match.scoreR}</span>
        </span>
        <a className="match-id" href={`#match/${match.matchId}`} onClick={(e) => e.preventDefault()}>
          {match.matchId}
          <span className="icon-box">
            <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
          </span>
        </a>
      </div>
      <p className="detail-widget__desc">{match.body}</p>
      <div className="detail-widget__row">
        <span className="detail-widget__chip">
          <em>KICKOFF</em> {match.kickoff}
        </span>
        <span className="detail-widget__chip is-ok">
          <em>UPDATED</em> {match.when}
        </span>
        <span className="detail-widget__status-ok">{match.readiness}</span>
      </div>
      <KvBlock
        title="Ops snapshot"
        rows={[
          { label: 'Group', value: match.group },
          { label: 'Venue', value: match.venue },
          { label: 'Weather', value: match.weather },
        ]}
      />
    </Shell>
  )
}

export function buildMatchDetail(input: {
  city: string
  matchup?: string
  matchId?: string
  scoreL?: string
  scoreR?: string
  detail?: string
  when?: string
}): MatchDetail {
  const city = input.city
  return {
    city,
    matchup: input.matchup ?? 'BEL v. EGY',
    matchId: input.matchId ?? 'M37',
    scoreL: input.scoreL ?? '2',
    scoreR: input.scoreR ?? '1',
    group: city === 'MIA' ? 'Group (H)' : 'Group (G)',
    kickoff: '18:00 local',
    venue: city === 'SEA' ? 'Lumen Field' : city === 'MIA' ? 'Hard Rock Stadium' : `${city} Stadium`,
    weather: '27/21° · clear',
    readiness: 'READINESS GREEN',
    body:
      input.detail ??
      'Kickoff ops tracking green. Broadcast power redundancy validated; watch last-mile densification through T-90.',
    when: input.when ?? 'Just now',
  }
}

/* ——— Report / document ——— */

export type ReportDetail = {
  title: string
  city?: string
  body: string
  author: string
  published: string
  source: string
  actions: string[]
}

export function ReportDetailWidget({ report }: { report: ReportDetail }) {
  return (
    <Shell label="Report" timestamp={report.published} location={report.city}>
      <div className="detail-widget__row">
        <span className="detail-widget__chip is-ok">
          <em>PUBLISHED</em> {report.published}
        </span>
      </div>
      <h3 className="detail-widget__title">{report.title}</h3>
      <p className="detail-widget__desc">{report.body}</p>
      <div className="detail-widget__row">
        <span className="detail-widget__author">
          <span aria-hidden>👤</span>
          {report.author}
        </span>
        <a className="detail-widget__source" href="#source/report" onClick={(e) => e.preventDefault()}>
          ↗ {report.source}
        </a>
      </div>
      <KvBlock
        title="Open actions"
        rows={report.actions.map((action, i) => ({
          label: `Action ${i + 1}`,
          value: action,
        }))}
      />
    </Shell>
  )
}

export function buildReportDetail(input: {
  title: string
  city?: string
  detail?: string
  when?: string
}): ReportDetail {
  return {
    title: input.title,
    city: input.city,
    body:
      input.detail ??
      'Operational summary covering access control, pitch remediation, and gate staffing levels.',
    author: 'TOM Secretariat',
    published: input.when ?? '11 Jul 20:10',
    source: 'Daily Ops Report',
    actions: [
      'MIA access RCA due 16:00',
      'Pitch retest window 22:00',
      'Confirm SEA Matchday posture',
    ],
  }
}

/* ——— Arrival / travel ——— */

export type ArrivalDetail = {
  title: string
  team: string
  city: string
  status: 'On time' | 'Delayed'
  delay?: string
  flight: string
  from: string
  to: string
  address: string
  arrivalTime: string
  hotel: string
  transfer: string
  body: string
  when: string
}

export function ArrivalDetailWidget({ arrival }: { arrival: ArrivalDetail }) {
  const delayed = arrival.status === 'Delayed'
  return (
    <Shell label="Arrival" timestamp={arrival.when} location={arrival.city}>
      <div className="detail-widget__row">
        <span className={delayed ? 'detail-widget__status-alert' : 'detail-widget__status-ok'}>
          {arrival.status.toUpperCase()}
        </span>
        {arrival.delay ? (
          <span className="detail-widget__chip is-alert">
            <em>DELAY</em> {arrival.delay}
          </span>
        ) : null}
        <span className="detail-widget__chip is-ok">
          <em>UPDATED</em> {arrival.when}
        </span>
      </div>
      <h3 className="detail-widget__title">{arrival.title}</h3>
      <p className="detail-widget__desc">{arrival.body}</p>
      <div className="detail-widget__row">
        <span className="detail-widget__chip">
          <em>ARRIVE</em> {arrival.arrivalTime}
        </span>
        <span className="detail-widget__chip">
          <em>FLIGHT</em> {arrival.flight}
        </span>
      </div>
      <KvBlock
        title="Travel & lodging"
        rows={[
          { label: 'From', value: arrival.from },
          { label: 'To', value: arrival.to },
          { label: 'Current address', value: arrival.address },
          { label: 'Hotel', value: arrival.hotel },
          { label: 'Transfer', value: arrival.transfer },
        ]}
      />
    </Shell>
  )
}

export function buildArrivalDetail(input: {
  title: string
  detail?: string
  when?: string
}): ArrivalDetail {
  const delayed = /delay/i.test(input.title) || /delay/i.test(input.detail ?? '')
  const isBel = /BEL/i.test(input.title)
  const city = isBel ? 'SEA' : 'MIA'
  return {
    title: input.title,
    team: isBel ? 'BEL' : 'USA',
    city,
    status: delayed ? 'Delayed' : 'On time',
    delay: delayed ? '40 min · +62s ground buffer' : undefined,
    flight: isBel ? 'BA 248 · charter' : 'AA 1902 · charter',
    from: 'Los Angeles, CA (LAX)',
    to: isBel ? 'Seattle, WA (SEA)' : 'Miami, FL (MIA)',
    address: isBel
      ? '1780 Westlake Ave N, Seattle, WA 98109'
      : '1601 Collins Ave, Miami Beach, FL 33139',
    arrivalTime: delayed ? '18:31 local' : '10:42 local',
    hotel: isBel ? 'Four Seasons Seattle' : 'Fontainebleau Miami Beach',
    transfer: delayed ? 'Slots slid · motorcade ready' : 'Motorcade cleared · check-in complete',
    body:
      input.detail ??
      'Team movement confirmed. Hotel transfer and training window remain on the board.',
    when: input.when ?? 'Just now',
  }
}

/* ——— Press ——— */

export type PressDetail = {
  title: string
  city: string
  body: string
  location: string
  window: string
  when: string
}

export function PressDetailWidget({ press }: { press: PressDetail }) {
  return (
    <Shell label="Press" timestamp={press.when} location={press.city}>
      <div className="detail-widget__row">
        <span className="detail-widget__chip is-ok">
          <em>UPDATED</em> {press.when}
        </span>
      </div>
      <h3 className="detail-widget__title">{press.title}</h3>
      <p className="detail-widget__desc">{press.body}</p>
      <KvBlock
        title="Media ops"
        rows={[
          { label: 'Location', value: press.location },
          { label: 'Window', value: press.window },
        ]}
      />
    </Shell>
  )
}

export function buildPressDetail(input: {
  title: string
  city: string
  detail?: string
  when?: string
}): PressDetail {
  return {
    title: input.title,
    city: input.city,
    body:
      input.detail ??
      'Media compound ops on plan. Overflow desks available; shuttle cadence every 10 minutes.',
    location: input.city === 'PHL' ? 'Media compound Desk B' : `${input.city} Media Center`,
    window: 'T-30 through T+30',
    when: input.when ?? 'Just now',
  }
}

/** Convenience builders used by Recent / Starred accordions */
export function issueFromSparse(input: {
  id: string
  title: string
  city: string
  detail?: string
  when?: string
  severity?: number
}) {
  return buildIssueDetail(input)
}
