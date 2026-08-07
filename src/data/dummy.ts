export const BRIEF_DATES = ['14 Jun', '15 Jun', '16 Jun'] as const

export const SUMMARY_CONTENT: Record<string, string[]> = {
  General: [
    'Overall tournament readiness sits at 87% with Miami and LA carrying the highest residual risk.',
    'Cross-venue transport corridors remain green; last-mile shuttle densification is underway for Matchday -2.',
    'TOM actions from 14 Jun are 11 closed / 4 open — pitch remediation and access control are the blockers.',
    'Broadcast compound power redundancy validated overnight in SEA, PHL, and MTY.',
    'Volunteer show-rate averaged 92% host-city wide; workforce shortfall flagged only in DAL.',
  ],
  Security: [
    'Perimeter hardening complete at 14/16 stadiums; temporary barriers arriving MIA tomorrow 06:00.',
    'Demonstrations expected near LA fan fest — local LE coordinating a soft-closure plan from 16:00.',
    'Credential spoofing attempt blocked overnight; 3 accounts disabled, no operational impact.',
    'Airspace TFRs confirmed for SEA M37 and MIA M38 with ATC brief scheduled 10:30 EST.',
    'K9 and screening lanes at MIA Gate C elevated to Phase 2 following this morning’s access fault.',
  ],
  Guests: [
    'VVIP manifests locked for SEA M37 — 214 expected, 12 late additions pending protocol clearance.',
    'Hospitality lounge turnover improved to 18 min average after seating reconfiguration in PHL.',
    'Delegation arrivals: USA complete, BEL delayed 40 min, EGY on time into SEA.',
    'Guest transport SLAs met for 96% of yesterday’s movements; two VIP vans rerouted due to roadworks.',
    'Protocol notes for Head of State visit in MIA circulated to TOM and Host City Ops.',
  ],
}

export const REGION_CONTENT: Record<string, string[]> = {
  Canada: [
    'TOR and VAN venues report stable IT readiness; VAN broadcast fiber splice completed overnight.',
    'Cold-weather contingency kits staged for VAN evening kickoffs.',
    'Border processing for team charters averaging 22 minutes — within SLA.',
    'Fan fest in TOR expecting 35k; additional screening lanes opening at 14:00.',
  ],
  Mexico: [
    'MTY pitch moisture readings improved after overnight watering adjustment.',
    'CDMX metro surge plan activated for Matchday; liaison posted at four hubs.',
    'GDL workforce check-in delayed by badge printer fault — temporary paper credentials issued.',
    'Customs clearance for hospitality goods cleared for MTY and GDL.',
  ],
  USA: [
    'MIA access system fault escalated to Priority 1; failover lane online, root cause under review.',
    'LA demonstration watch window 15:00–21:00; fan fest may soft-close west plaza.',
    'SEA Matchday ops brief complete — kickoff 18:00 local, weather clear.',
    'PHL media check-in backlog cleared; compound occupancy at 79%.',
  ],
}

export const REPORT_CONTENT: Record<string, { title: string; body: string }> = {
  Stadium: {
    title: 'Stadium summary',
    body: 'Access and ticketing readiness remains the top cross-venue risk. Miami reported a critical access system failure requiring immediate escalation. IT readiness is still uneven across multiple venues, increasing last-mile pressure. Late layout and policy changes continue to elevate crowd-flow risk.',
  },
  'Host city': {
    title: 'Host city summary',
    body: 'Host cities report stable hotel occupancy above 88%. SEA and MIA transit agencies confirmed surge staffing for Matchday. LA road closures around Exposition Park begin at 12:00. TOR and VAN border wait times remain within target. City command posts will open two hours earlier tomorrow.',
  },
  'Fan fest': {
    title: 'Fan fest summary',
    body: 'Fan fest sites are tracking on plan for capacity and screening. LA west plaza may soft-close if demonstrations intensify. PHL beverage logistics delayed 45 minutes — contingency stock already on site. SEA fan fest Wi-Fi densification completed overnight. Medical posts staffed to peak profile from 15:00.',
  },
}

export const CITY_FILTERS = ['All cities', 'MIA', 'LA', 'SEA', 'PHL', 'TOR'] as const

export const ISSUES = [
  {
    id: 'iss-1',
    title: 'Pitch Installation in Miami Stadium',
    city: 'MIA',
    severity: 'High',
    detail:
      'Turf seams failing acceptance tests on sectors 3–4. Remediation crew on site; retest scheduled 22:00. Impacts M38 walkthrough if not cleared.',
  },
  {
    id: 'iss-2',
    title: 'Los Angeles Demonstrations',
    city: 'LA',
    severity: 'High',
    detail:
      'Organizers notifying 2–4k participants near fan fest. Soft-closure plan prepared with local LE. Monitor window 15:00–21:00.',
  },
  {
    id: 'iss-3',
    title: 'MIA Access Control Failover',
    city: 'MIA',
    severity: 'High',
    detail:
      'Primary access controllers faulted at 07:12. Failover lane online. Vendor RCA due by 16:00. Credential queues elevated at Gate C.',
  },
  {
    id: 'iss-4',
    title: 'PHL Media Compound Congestion',
    city: 'PHL',
    severity: 'Mid',
    detail:
      'Check-in backlog cleared after adding two desks. Occupancy 79%. Watch for Matchday surge if accreditation spikes.',
  },
  {
    id: 'iss-5',
    title: 'SEA Broadcast Power Redundancy',
    city: 'SEA',
    severity: 'Low',
    detail:
      'Overnight validation passed. One UPS bank running warm — maintenance ticket opened, no Matchday impact expected.',
  },
  {
    id: 'iss-6',
    title: 'DAL Volunteer Shortfall',
    city: 'DAL',
    severity: 'Mid',
    detail:
      'Show-rate 84% vs 92% network average. Recruitment push underway; 60 standby volunteers confirmed for tomorrow.',
  },
]

export const CALENDAR_BY_CITY: Record<string, { title: string; city: string }[]> = {
  'All cities': [
    { title: 'VIP Gala Dinner', city: 'MIA' },
    { title: 'VIP Gala Dinner', city: 'LA' },
    { title: 'Team Arrival — BEL', city: 'SEA' },
    { title: 'TOM Working Session', city: 'PHL' },
  ],
  MIA: [
    { title: 'VIP Gala Dinner', city: 'MIA' },
    { title: 'Pitch Retest Window', city: 'MIA' },
    { title: 'Access System RCA', city: 'MIA' },
  ],
  LA: [
    { title: 'VIP Gala Dinner', city: 'LA' },
    { title: 'Demonstration Liaison Brief', city: 'LA' },
    { title: 'Fan Fest Soft-Close Drill', city: 'LA' },
  ],
  SEA: [
    { title: 'Team Arrival — BEL', city: 'SEA' },
    { title: 'Matchday Ops Brief', city: 'SEA' },
    { title: 'Broadcast Compound Walk', city: 'SEA' },
  ],
  PHL: [
    { title: 'TOM Working Session', city: 'PHL' },
    { title: 'Media Desk Surge Test', city: 'PHL' },
  ],
  TOR: [
    { title: 'Fan Fest Screening Open', city: 'TOR' },
    { title: 'Border Ops Sync', city: 'TOR' },
  ],
}

export const CALENDAR_STATS = [
  { label: 'Matches', count: 4 },
  { label: 'Team Flights', count: 4 },
  { label: 'Referee Flights', count: 3 },
  { label: 'VIP Flights', count: 5 },
  { label: 'Press Conferences', count: 6 },
  { label: 'Team Arrivals', count: 4 },
  { label: 'Other', count: 2 },
]

export type MatchCard = {
  id: string
  city: string
  date: string
  home: string
  away: string
  group: string
  matchId: string
  time: string
  score?: [string, string]
  mode: 'attendance' | 'ticketing'
}

export const MATCHES_BY_DAY: Record<string, MatchCard[]> = {
  Yesterday: [
    {
      id: 'm35',
      city: 'PHL',
      date: '14 Jun',
      home: 'URU',
      away: 'CPV',
      group: 'Group (G)',
      matchId: 'M35',
      time: 'FT',
      score: ['2', '1'],
      mode: 'attendance',
    },
    {
      id: 'm36',
      city: 'TOR',
      date: '14 Jun',
      home: 'CAN',
      away: 'QAT',
      group: 'Group (B)',
      matchId: 'M36',
      time: 'FT',
      score: ['1', '1'],
      mode: 'attendance',
    },
    {
      id: 'm35b',
      city: 'PHL',
      date: '14 Jun',
      home: 'URU',
      away: 'CPV',
      group: 'Group (G)',
      matchId: 'M35',
      time: 'FT',
      score: ['2', '1'],
      mode: 'ticketing',
    },
    {
      id: 'm36b',
      city: 'TOR',
      date: '14 Jun',
      home: 'CAN',
      away: 'QAT',
      group: 'Group (B)',
      matchId: 'M36',
      time: 'FT',
      score: ['1', '1'],
      mode: 'ticketing',
    },
  ],
  Today: [
    {
      id: 'm37',
      city: 'SEA',
      date: '15 Jun',
      home: 'BEL',
      away: 'EGY',
      group: 'Group (H)',
      matchId: 'M37',
      time: '18:00',
      mode: 'attendance',
    },
    {
      id: 'm38',
      city: 'MIA',
      date: '15 Jun',
      home: 'USA',
      away: 'PAR',
      group: 'Group (D)',
      matchId: 'M38',
      time: '21:00',
      mode: 'attendance',
    },
    {
      id: 'm37b',
      city: 'SEA',
      date: '15 Jun',
      home: 'BEL',
      away: 'EGY',
      group: 'Group (H)',
      matchId: 'M37',
      time: '02:11:31',
      mode: 'ticketing',
    },
    {
      id: 'm38b',
      city: 'MIA',
      date: '15 Jun',
      home: 'USA',
      away: 'PAR',
      group: 'Group (D)',
      matchId: 'M38',
      time: '05:11:31',
      mode: 'ticketing',
    },
  ],
  Tomorrow: [
    {
      id: 'm39',
      city: 'LA',
      date: '16 Jun',
      home: 'MEX',
      away: 'KOR',
      group: 'Group (A)',
      matchId: 'M39',
      time: '16:00',
      mode: 'attendance',
    },
    {
      id: 'm40',
      city: 'DAL',
      date: '16 Jun',
      home: 'BRA',
      away: 'MAR',
      group: 'Group (C)',
      matchId: 'M40',
      time: '19:00',
      mode: 'attendance',
    },
    {
      id: 'm39b',
      city: 'LA',
      date: '16 Jun',
      home: 'MEX',
      away: 'KOR',
      group: 'Group (A)',
      matchId: 'M39',
      time: '16:00',
      mode: 'ticketing',
    },
    {
      id: 'm40b',
      city: 'DAL',
      date: '16 Jun',
      home: 'BRA',
      away: 'MAR',
      group: 'Group (C)',
      matchId: 'M40',
      time: '19:00',
      mode: 'ticketing',
    },
  ],
}

export const ATTENDANCE_ROWS = [
  ['Official attendance', '62,118', '95%'],
  ['VVIP guests', '214', '88%'],
  ['VIP guests', '1,842', '91%'],
  ['Media (checked in)', '486', '79%'],
  ['Workforce (checked in)', '3,210', '84%'],
  ['Volunteers (checked in)', '1,104', '76%'],
]

export const TICKETING_ROWS = [
  ['Tickets allocated', '68,400', '100%'],
  ['General public', '54,220', '79%'],
  ['Complimentary', '2,140', '3%'],
  ['Hospitality', '6,880', '10%'],
  ['VVIP guests', '320', '0.5%'],
  ['VIP guests', '4,840', '7%'],
]

export const SOCIAL_POSTS = [
  {
    handle: '@FIFAcom',
    views: '2.1M views',
    body: 'Morocco rise to all-time high of eighth. Senegal break new ground after AFCON triumph, climbing to 12th.\n\nThe January 2026 edition of the FIFA/Coca-Cola Men’s World Ranking is here:',
    expanded:
      'Full rankings drop emphasizes CONCACAF form heading into the tournament window. Morocco’s climb reflects consecutive knockout performances; Senegal’s AFCON title push lifts them into the top 12 for the first time.',
  },
  {
    handle: '@FIFAcom',
    views: '980K views',
    body: 'Matchday in Seattle: BEL v. EGY kicks off at 18:00 local. Follow live ops updates from host-city command.',
    expanded:
      'Gates open three hours before kickoff. Fan fest activation begins at 14:00 on the waterfront plaza. Weather clear, light NW wind.',
  },
]
