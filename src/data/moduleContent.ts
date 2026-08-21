export const WEATHER_PRIMARY = [
  { label: '27/21°', value: '', lead: true },
  { label: 'FEELS LIKE', value: '24°' },
  { label: 'WBGT', value: '28°' },
]

export const WEATHER_SECONDARY = [
  { label: 'PRECIP', value: '55%' },
  { label: 'WIND', value: '10 mph' },
  { label: 'VIS', value: '10 km' },
]

export const WEATHER_HOURS = ['6:30 PM', '7:30 PM', '8:30 PM']

/** Each risk row holds one bar per hour; `fill` is the 0–1 share of the slot that is at risk. */
export const WEATHER_RISKS = [
  { label: 'Lightning', threshold: '> 20%', bars: [0.55, 0.4, 0] },
  { label: 'WGBT', threshold: '> 28°', bars: [0.3, 0.25, 0.9] },
  { label: 'Wind', threshold: '> 15mph', bars: [0.45, 0, 0] },
]

export const LOG_ENTRIES = [
  { time: '16:44', kind: 'ISSUE', text: 'Medical at ceremonies compound required', status: 'Resolved' },
  { time: '34’', kind: 'CARD', text: 'NETO (7) receives a yellow card' },
  {
    time: '16:44',
    kind: 'ATTENDANCE',
    text: 'Attendance checkpoint: KO + 45 mins. Target: 95% / Actual: 97.3% (+2.3%)',
  },
  { time: '34’', kind: 'GOAL', text: 'DAVID (10) scored a goal, assisted by JOHNSON (20)' },
  { time: '16:44', kind: 'PHASE', text: 'START OF SECOND HALF' },
  { time: '16:44', kind: 'SOC', text: 'SOC Opens' },
  { time: '16:44', kind: 'SOC', text: 'SOC Opens' },
]

/** Normalised 0–1 sparkline values for the ticketing trend. */
export const TICKETING_TREND = [0.22, 0.34, 0.28, 0.52, 0.44, 0.71, 0.95]

export const TOP_SELLING = [
  { city: 'VAN', match: 'NZL v. BEL', value: '50,962' },
  { city: 'SEA', match: 'EGY v. IRN', value: '50,962' },
  { city: 'SEA', match: '1G v. 3AEHIJ', value: '50,962' },
  { city: 'DAL', match: 'EGY v. IRN', value: '50,962' },
  { city: 'VAN', match: 'NZL v. BEL', value: '50,962' },
]

export const CALENDAR_SECTIONS = [
  {
    title: 'Side events',
    rows: [
      { label: 'VIP Gala Dinner', meta: 'MIA · 19:30' },
      { label: 'Sponsor Activation', meta: 'LA · 15:00' },
    ],
  },
  {
    title: 'Summary',
    rows: [
      { label: 'Press Conferences', meta: '6' },
      { label: 'Team Arrivals', meta: '4' },
      { label: 'Referee Flights', meta: '3' },
    ],
  },
]

export const WORKFORCE_ROWS = [
  { label: 'Volunteers checked in', value: '1,104', pct: '76%' },
  { label: 'Stewards on shift', value: '842', pct: '94%' },
  { label: 'Medical staff', value: '96', pct: '100%' },
  { label: 'No-shows', value: '38', pct: '4%' },
]
