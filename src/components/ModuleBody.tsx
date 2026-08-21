import { ATTENDANCE_ROWS } from '../data/dummy'
import {
  LOG_ENTRIES,
  TICKETING_TREND,
  TOP_SELLING,
  WEATHER_HOURS,
  WEATHER_PRIMARY,
  WEATHER_RISKS,
  WEATHER_SECONDARY,
  WORKFORCE_ROWS,
} from '../data/moduleContent'
import {
  BriefCalendarBody,
  BriefSocialBody,
  IssuesBody,
  MatchesBody,
  ReportsBody,
  SummaryBody,
} from './BriefBodies'
import type { ModuleKind } from '../data/customViews'
import type { ModuleConfig } from '../data/moduleConfig'
import './ModuleBody.css'

function WeatherBody() {
  return (
    <div className="mod-weather">
      <div className="mod-weather__stats">
        <div className="mod-weather__stat-row">
          {WEATHER_PRIMARY.map((stat) => (
            <span key={stat.label} className={stat.lead ? 'is-lead' : undefined}>
              {stat.lead ? <em aria-hidden>☀</em> : null}
              {stat.label}
              {stat.value ? <b>{stat.value}</b> : null}
            </span>
          ))}
        </div>
        <div className="mod-weather__stat-row">
          {WEATHER_SECONDARY.map((stat) => (
            <span key={stat.label}>
              {stat.label}
              <b>{stat.value}</b>
            </span>
          ))}
        </div>
      </div>
      <div className="mod-weather__chart">
        <div className="mod-weather__hours">
          {WEATHER_HOURS.map((hour) => (
            <span key={hour}>{hour}</span>
          ))}
        </div>
        {WEATHER_RISKS.map((risk) => (
          <div key={risk.label} className="mod-weather__risk">
            <div className="mod-weather__risk-label">
              <span>{risk.label}</span>
              <em>{risk.threshold}</em>
            </div>
            <div className="mod-weather__bars">
              {risk.bars.map((fill, index) => (
                <div key={index} className="mod-weather__slot">
                  {fill > 0 ? (
                    <span className="mod-weather__bar" style={{ width: `${fill * 100}%` }} />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LiveFeedBody({ tabs, tab, onTabChange, config }: ModuleBodyProps) {
  const sources = config?.feedSources?.length
    ? config.feedSources
    : tabs ?? ['Helicopter', 'Tactical', 'Security', 'Broadcast']
  const active = sources.includes(tab ?? '') ? tab : sources[0]

  return (
    <div className="mod-feed">
      {sources.length > 1 ? (
        <div className="tab-bar mod-feed__tabs">
          {sources.map((name) => (
            <button
              key={name}
              type="button"
              className={`tab${name === active ? ' active' : ''}`}
              onClick={() => onTabChange?.(name)}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mod-feed__stage">
        <img src="/assets/module-livefeed.png" alt="Live camera feed" />
      </div>
    </div>
  )
}

function LogsBody() {
  return (
    <div className="mod-logs scroll-area">
      {LOG_ENTRIES.map((entry, index) => (
        <div key={index} className="mod-logs__row">
          <span className="mod-logs__time">{entry.time}</span>
          <div className="mod-logs__body">
            <span className={`mod-logs__kind is-${entry.kind.toLowerCase()}`}>{entry.kind}</span>
            <p>{entry.text}</p>
          </div>
          {entry.status ? <span className="mod-logs__status">{entry.status}</span> : null}
        </div>
      ))}
    </div>
  )
}

function Sparkline({ points }: { points: number[] }) {
  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100
      const y = 100 - value * 90 - 5
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg className="mod-spark" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <path d={path} fill="none" stroke="var(--color-blue-10)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function TicketingBody() {
  return (
    <div className="mod-ticketing">
      <div className="mod-ticketing__trend">
        <div className="mod-ticketing__trend-head">
          <span className="section-title">Last 7 days</span>
          <em>Updated 2 mins ago</em>
        </div>
        <Sparkline points={TICKETING_TREND} />
        <div className="mod-ticketing__totals">
          <span>
            Sold today <b>50,962</b> <em>(+16%)</em>
          </span>
          <span>
            Cumulative sold <b>543,570</b> <em>(76%)</em>
          </span>
        </div>
      </div>
      <div className="mod-ticketing__top">
        <span className="section-title">Top selling</span>
        <div className="mod-ticketing__rows scroll-area">
          {TOP_SELLING.map((row, index) => (
            <div key={index} className="mod-ticketing__row">
              <span className={`city-pill ${row.city.toLowerCase()}`}>{row.city}</span>
              <span className="mod-ticketing__match">{row.match}</span>
              <span className="mod-ticketing__value">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LiveLocationBody() {
  return (
    <div className="mod-map">
      <img src="/assets/module-map.png" alt="Live transport map" />
    </div>
  )
}

function CalendarBody({
  headerTarget,
  hideFilters,
}: {
  headerTarget?: HTMLElement | null
  hideFilters?: boolean
}) {
  return <BriefCalendarBody headerTarget={headerTarget} hideFilters={hideFilters} />
}

function MetricRows({ rows }: { rows: string[][] }) {
  return (
    <div className="mod-metrics scroll-area">
      {rows.map(([label, value, pct]) => (
        <div key={label} className="mod-metrics__row">
          <span>{label}</span>
          <span className="mod-metrics__value">
            {value} <em>{pct}</em>
          </span>
        </div>
      ))}
    </div>
  )
}

function SocialBody({
  headerTarget,
  hideFilters,
}: {
  headerTarget?: HTMLElement | null
  hideFilters?: boolean
}) {
  return <BriefSocialBody headerTarget={headerTarget} hideFilters={hideFilters} />
}

export type ModuleBodyProps = {
  kind: ModuleKind
  tabs?: string[]
  tab?: string
  onTabChange?: (tab: string) => void
  w?: number
  h?: number
  /** Portal target for filters/actions that belong in the card header row. */
  headerTarget?: HTMLElement | null
  config?: ModuleConfig
  /** Compact single-card preview (e.g. configure modal). */
  preview?: boolean
  /** Hide in-body filter chips (used on the add-module picker). */
  hideFilters?: boolean
}

export function ModuleBody(props: ModuleBodyProps) {
  switch (props.kind) {
    case 'weather':
      return <WeatherBody />
    case 'liveFeed':
      return <LiveFeedBody {...props} />
    case 'logs':
      return <LogsBody />
    case 'ticketing':
      return <TicketingBody />
    case 'liveLocation':
      return <LiveLocationBody />
    case 'calendar':
      return (
        <CalendarBody headerTarget={props.headerTarget} hideFilters={props.hideFilters} />
      )
    case 'attendance':
      return <MetricRows rows={ATTENDANCE_ROWS} />
    case 'workforce':
      return (
        <MetricRows rows={WORKFORCE_ROWS.map((row) => [row.label, row.value, row.pct])} />
      )
    case 'social':
      return <SocialBody headerTarget={props.headerTarget} hideFilters={props.hideFilters} />
    case 'summary':
      return <SummaryBody config={props.config} />
    case 'reports':
      return (
        <ReportsBody
          headerTarget={props.headerTarget}
          hideFilters={props.hideFilters}
          config={props.config}
        />
      )
    case 'issues':
      return (
        <IssuesBody headerTarget={props.headerTarget} hideFilters={props.hideFilters} />
      )
    case 'matches':
      return (
        <MatchesBody
          tab={props.tab}
          w={props.w}
          h={props.h}
          config={props.config}
          preview={props.preview}
        />
      )
    default:
      return null
  }
}
