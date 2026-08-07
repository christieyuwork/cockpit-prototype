export type QueryIntent = 'risk' | 'flights' | 'issues' | 'matchday' | 'general'

export type SourceLink = {
  label: string
  href: string
  meta?: string
}

export type RiskSnippet = {
  id: string
  title: string
  excerpt: string
  city?: string
  source: SourceLink
}

export type FlightLeg = {
  code: string
  city: string
  date: string
  status: 'Depart' | 'Arrive'
  time: string
}

export type FlightCard = {
  id: string
  label: string
  kind: 'referees' | 'team'
  statusTone: 'ok' | 'alert'
  from: FlightLeg
  to: FlightLeg
  source: SourceLink
}

export type IssueRow = {
  id: string
  severity: 5 | 4 | 3 | 2
  city: string
  category: string
  title: string
  summary: string
  source: SourceLink
}

export type MatchTicketingRow = {
  label: string
  value: string
  pct: string
}

export type MatchWidgetData = {
  city: string
  date: string
  home: string
  away: string
  group: string
  matchId: string
  time: string
  score?: [string, string]
  weather: string
  risks: { label: string; tone: 'risk' | 'neutral' | 'ok' }[]
  standings: {
    rank: number
    team: string
    badge?: 'Q' | 'E'
    w: number
    d: number
    l: number
    pts: number
    gd: string
  }[]
  related: {
    city: string
    matchup: string
    matchId: string
    when: string
    group: string
    weather: string
  }[]
  ticketing: MatchTicketingRow[]
  sources: SourceLink[]
}

export const QUERY_SUGGESTIONS = [
  'What are the top risks across host cities?',
  'Show me today’s team and referee flights',
  'List open High and Mid issues',
  'Give me the SEA Matchday brief',
]

export const RISK_SNIPPETS: RiskSnippet[] = [
  {
    id: 'risk-1',
    title: 'Access control failover — Gate C',
    city: 'MIA',
    excerpt:
      'Primary access controllers faulted at 07:12. Failover lane is online; credential queues elevated. Vendor RCA due by 16:00 EST. Keep M38 walkthrough contingent on clearance.',
    source: {
      label: 'Daily Stadium Report · MIA',
      href: '#source/daily-stadium-mia',
      meta: 'Ops Report · 15 Jun 08:40',
    },
  },
  {
    id: 'risk-2',
    title: 'Pitch remediation sectors 3–4',
    city: 'MIA',
    excerpt:
      'Turf seams failing acceptance on sectors 3–4. Remediation crew on site; retest window 22:00. If not cleared, M38 pitch walk slips to Matchday -1 morning.',
    source: {
      label: 'Pitch Acceptance Log',
      href: '#source/pitch-acceptance-mia',
      meta: 'Venue Ops · 15 Jun 11:15',
    },
  },
  {
    id: 'risk-3',
    title: 'Demonstration watch window — west plaza',
    city: 'LA',
    excerpt:
      'Organizers notifying 2–4k participants near fan fest. Soft-closure plan prepared with local LE for 15:00–21:00. Hospitality remains green if plaza stays open.',
    source: {
      label: 'Host City Security Brief · LA',
      href: '#source/security-brief-la',
      meta: 'Security · 15 Jun 09:05',
    },
  },
  {
    id: 'risk-4',
    title: 'Last-mile densification',
    city: 'SEA',
    excerpt:
      'Matchday shuttle densification underway for BEL v. EGY. Transit surge staffing confirmed; watch pedestrian pinch points at Occidental Ave from H-3.',
    source: {
      label: 'SEA Matchday Ops Brief',
      href: '#source/matchday-ops-sea',
      meta: 'TOM Pack · 15 Jun 07:30',
    },
  },
]

export const FLIGHT_CARDS: FlightCard[] = [
  {
    id: 'flt-ref',
    label: 'Referees',
    kind: 'referees',
    statusTone: 'ok',
    from: {
      code: 'LAX',
      city: 'Los Angeles, CA, USA',
      date: '15 Jun',
      status: 'Depart',
      time: '18:00',
    },
    to: {
      code: 'TPA',
      city: 'Tampa Bay, FL, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '22:00',
    },
    source: {
      label: 'Referee Travel Manifest',
      href: '#source/referee-travel',
      meta: 'Transport Desk · updated 14:22',
    },
  },
  {
    id: 'flt-kor',
    label: 'KOR',
    kind: 'team',
    statusTone: 'alert',
    from: {
      code: 'LAX',
      city: 'Los Angeles, CA, USA',
      date: '15 Jun',
      status: 'Depart',
      time: '18:00',
    },
    to: {
      code: 'TPA',
      city: 'Tampa Bay, FL, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '18:00',
    },
    source: {
      label: 'Team Charter Board · KOR',
      href: '#source/team-charter-kor',
      meta: 'Team Services · delay watch',
    },
  },
  {
    id: 'flt-bel',
    label: 'BEL',
    kind: 'team',
    statusTone: 'ok',
    from: {
      code: 'JFK',
      city: 'New York, NY, USA',
      date: '15 Jun',
      status: 'Depart',
      time: '09:40',
    },
    to: {
      code: 'SEA',
      city: 'Seattle, WA, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '13:05',
    },
    source: {
      label: 'Team Charter Board · BEL',
      href: '#source/team-charter-bel',
      meta: 'Team Services · on time',
    },
  },
]

export const ISSUE_ROWS: IssueRow[] = [
  {
    id: 'qi-1',
    severity: 5,
    city: 'MIA',
    category: 'Ticketing',
    title: 'Access system failover at Gate C',
    summary:
      'Primary controllers faulted at 07:12. Failover online; queues elevated. RCA due 16:00.',
    source: {
      label: 'Issue #4821 · Access Control',
      href: '#source/issue-4821',
      meta: 'Priority 1 · opened 07:18',
    },
  },
  {
    id: 'qi-2',
    severity: 5,
    city: 'MIA',
    category: 'Venue',
    title: 'Pitch installation remediation',
    summary:
      'Sectors 3–4 failed acceptance. Crew on site; retest scheduled 22:00 tonight.',
    source: {
      label: 'Issue #4790 · Pitch',
      href: '#source/issue-4790',
      meta: 'Priority 1 · updated 11:20',
    },
  },
  {
    id: 'qi-3',
    severity: 4,
    city: 'LA',
    category: 'Security',
    title: 'Demonstrations near fan fest',
    summary:
      '2–4k participants expected. Soft-closure plan ready for west plaza 15:00–21:00.',
    source: {
      label: 'Issue #4802 · Security',
      href: '#source/issue-4802',
      meta: 'Priority 2 · watch window',
    },
  },
  {
    id: 'qi-4',
    severity: 4,
    city: 'SEA',
    category: 'Transport',
    title: 'Last-mile pedestrian pinch points',
    summary:
      'Occidental Ave densification incomplete. Extra stewards requested from H-3.',
    source: {
      label: 'Issue #4811 · Transport',
      href: '#source/issue-4811',
      meta: 'Priority 2 · Matchday',
    },
  },
  {
    id: 'qi-5',
    severity: 2,
    city: 'DAL',
    category: 'Workforce',
    title: 'Volunteer show-rate shortfall',
    summary:
      'Show-rate 84% vs 92% network average. 60 standby volunteers confirmed.',
    source: {
      label: 'Issue #4775 · Workforce',
      href: '#source/issue-4775',
      meta: 'Priority 3 · monitoring',
    },
  },
  {
    id: 'qi-6',
    severity: 2,
    city: 'CDMX',
    category: 'Ticketing',
    title: 'Hospitality badge printer delay',
    summary:
      'Temporary paper credentials issued. Permanent badges expected by 17:00.',
    source: {
      label: 'Issue #4768 · Ticketing',
      href: '#source/issue-4768',
      meta: 'Priority 3 · local',
    },
  },
]

export const MATCHDAY_WIDGET: MatchWidgetData = {
  city: 'SEA',
  date: '15 Jun',
  home: 'BEL',
  away: 'EGY',
  group: 'Group (H)',
  matchId: 'M37',
  time: '18:00',
  score: ['2', '1'],
  weather: '27/21°',
  risks: [
    { label: 'Weather', tone: 'neutral' },
    { label: 'RISK', tone: 'risk' },
    { label: 'Sec Risk', tone: 'neutral' },
    { label: 'NO RISK', tone: 'ok' },
  ],
  standings: [
    { rank: 1, team: 'BEL', badge: 'Q', w: 3, d: 0, l: 0, pts: 9, gd: '+14' },
    { rank: 2, team: 'IRN', w: 2, d: 0, l: 1, pts: 6, gd: '-2' },
    { rank: 3, team: 'EGY', w: 1, d: 0, l: 2, pts: 3, gd: '+4' },
    { rank: 4, team: 'NZL', badge: 'E', w: 0, d: 0, l: 3, pts: 0, gd: '-5' },
  ],
  related: [
    {
      city: 'ATL',
      matchup: 'KOR v. UEFA A',
      matchId: 'M41',
      when: '11 Jul 22:30',
      group: 'Group (H)',
      weather: '27/21°',
    },
    {
      city: 'KC',
      matchup: 'KOR v. UEFA A',
      matchId: 'M42',
      when: '11 Jul 22:30',
      group: 'Group (H)',
      weather: '27/21°',
    },
    {
      city: 'NYNJ',
      matchup: 'KOR v. UEFA A',
      matchId: 'M43',
      when: '11 Jul 22:30',
      group: 'Group (H)',
      weather: '27/21°',
    },
  ],
  ticketing: [
    { label: 'Tickets allocated', value: '50,962', pct: '76%' },
    { label: 'General public', value: '50,536', pct: '94%' },
    { label: 'Complimentary', value: '352', pct: '94%' },
    { label: 'Hospitality', value: '423', pct: '94%' },
    { label: 'VVIP guests', value: '32', pct: '23%' },
    { label: 'VIP guests', value: '210', pct: '94%' },
  ],
  sources: [
    {
      label: 'SEA Matchday Ops Brief',
      href: '#source/matchday-ops-sea',
      meta: 'TOM Pack · 15 Jun 07:30',
    },
    {
      label: 'Ticketing Dashboard · M37',
      href: '#source/ticketing-m37',
      meta: 'Live feed · refreshed 2m ago',
    },
    {
      label: 'Group G Standings',
      href: '#source/standings-g',
      meta: 'Competition · official',
    },
  ],
}

export function detectQueryIntent(prompt: string): QueryIntent {
  const q = prompt.toLowerCase()

  if (
    q.includes('flight') ||
    q.includes('charter') ||
    q.includes('arrive') ||
    q.includes('depart') ||
    q.includes('referee travel') ||
    q.includes('team travel')
  ) {
    return 'flights'
  }

  if (
    q.includes('issue') ||
    q.includes('incident') ||
    q.includes('priority') ||
    q.includes('open high') ||
    q.includes('mid issue')
  ) {
    return 'issues'
  }

  if (
    q.includes('matchday') ||
    q.includes('match day') ||
    q.includes('m37') ||
    q.includes('kickoff') ||
    q.includes('ticketing') ||
    (q.includes('sea') && (q.includes('match') || q.includes('brief') || q.includes('ready')))
  ) {
    return 'matchday'
  }

  if (
    q.includes('risk') ||
    q.includes('threat') ||
    q.includes('escalat') ||
    q.includes('report snippet') ||
    q.includes('security brief')
  ) {
    return 'risk'
  }

  return 'general'
}

export function mockAssistantReply(prompt: string, intent: QueryIntent): string {
  switch (intent) {
    case 'risk':
      return 'Here are the highest-signal risk snippets from today’s reports. Each card links back to the source document so you can verify context before escalating.'
    case 'flights':
      return 'Pulled the active referee and team charter movements. Status colors reflect on-time vs delay watch — open the source manifests for full passenger and slot detail.'
    case 'issues':
      return 'Open issues ranked by severity. Tap a source link to jump to the issue record, comments, and ownership trail.'
    case 'matchday':
      return 'SEA Matchday board for BEL v. EGY (M37): scoreline, risk chips, group standings, related fixtures, and ticketing. Sources are listed under the widget.'
    default:
      return `Here’s a quick ops read on “${prompt.trim()}”: readiness is ~87% overall. Ask about risks, flights, issues, or Matchday to pull structured widgets with source links.`
  }
}
