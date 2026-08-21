import type { ModuleKind } from './customViews'
import { ATTENDANCE_ROWS, CITY_FILTERS, MATCHES_BY_DAY, TICKETING_ROWS } from './dummy'

export const REPORT_SECTIONS = ['Stadium', 'Host city', 'Fan fest'] as const
export const MATCH_DAYS = ['Yesterday', 'Today', 'Tomorrow'] as const
export const MATCH_DATE_MODES = ['relative', 'specific', 'upcoming'] as const

export type ReportSection = (typeof REPORT_SECTIONS)[number]
export type MatchDay = (typeof MATCH_DAYS)[number]
export type MatchDateMode = (typeof MATCH_DATE_MODES)[number]

export type StatRowConfig = {
  id: string
  visible: boolean
}

/** Per-instance display options set in Configure module. */
export type ModuleConfig = {
  reportSections?: ReportSection[]
  matchDateMode?: MatchDateMode
  matchRelativeDays?: MatchDay[]
  matchSpecificDate?: string
  matchCities?: string[]
  matchTeams?: string[]
  attendanceStats?: StatRowConfig[]
  ticketingStats?: StatRowConfig[]
  feedSources?: string[]
  summarySections?: string[]
}

export const MATCH_CITIES = CITY_FILTERS.filter((city) => city !== 'All cities')

export const MATCH_TEAMS = Array.from(
  new Set(
    Object.values(MATCHES_BY_DAY).flatMap((matches) =>
      matches.flatMap((match) => [match.home, match.away]),
    ),
  ),
).sort()

export function defaultStatRows(rows: string[][]): StatRowConfig[] {
  return rows.map(([label]) => ({ id: label, visible: true }))
}

export function defaultModuleConfig(kind: ModuleKind): ModuleConfig {
  switch (kind) {
    case 'reports':
      return { reportSections: [...REPORT_SECTIONS] }
    case 'matches':
      return {
        matchDateMode: 'relative',
        matchRelativeDays: [...MATCH_DAYS],
        matchSpecificDate: '15 Jun 2026',
        matchCities: [...MATCH_CITIES],
        matchTeams: [...MATCH_TEAMS],
        attendanceStats: defaultStatRows(ATTENDANCE_ROWS),
        ticketingStats: defaultStatRows(TICKETING_ROWS),
      }
    case 'liveFeed':
      return { feedSources: ['Helicopter', 'Tactical', 'Security', 'Broadcast'] }
    case 'summary':
      return { summarySections: ['General', 'Security', 'Guests'] }
    default:
      return {}
  }
}

export function mergeModuleConfig(kind: ModuleKind, config?: ModuleConfig): ModuleConfig {
  const defaults = defaultModuleConfig(kind)
  if (!config) return defaults
  return {
    ...defaults,
    ...config,
    attendanceStats: config.attendanceStats ?? defaults.attendanceStats,
    ticketingStats: config.ticketingStats ?? defaults.ticketingStats,
    matchRelativeDays: config.matchRelativeDays ?? defaults.matchRelativeDays,
    matchCities: config.matchCities ?? defaults.matchCities,
    matchTeams: config.matchTeams ?? defaults.matchTeams,
  }
}

export function applyStatRows(
  rows: string[][],
  order?: StatRowConfig[],
): string[][] {
  if (!order?.length) return rows
  const byLabel = new Map(rows.map((row) => [row[0], row]))
  return order
    .filter((item) => item.visible)
    .map((item) => byLabel.get(item.id))
    .filter((row): row is string[] => Boolean(row))
}
