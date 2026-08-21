import type { FlightCard, IssueRow, SourceLink } from './query'

export type GroundContact = {
  id: string
  name: string
  dept: 'Travel' | 'Team Services' | 'Accommodations'
  role: string
  phone: string
  location: string
  status: string
}

export type HotelCard = {
  id: string
  name: string
  address: string
  rooms: number
  occupants: number
  bookingStatus: 'Confirmed' | 'Partial' | 'Pending'
  checkIn: string
  checkOut: string
  notes: string
  source: SourceLink
}

export type TeamCalendarEvent = {
  id: string
  date: string
  time: string
  title: string
  kind: 'Training' | 'Press' | 'Meet & greet' | 'Match' | 'Travel' | 'Medical'
  location: string
  status: string
}

export type PerimeterStats = {
  outer: string
  inner: string
  variance: string
  forecastGap: string
  note: string
}

export type ImpactedOpsRow = {
  id: string
  kind: 'Match' | 'Training' | 'Travel'
  label: string
  city: string
  window: string
  risk: string
}

export type ChecklistItem = {
  id: string
  title: string
  owner: string
  due: string
  priority: 'Now' | 'Next' | 'Watch'
}

export type AgendaItem = {
  id: string
  order: number
  title: string
  owner: string
  minutes: string
}

export type DeltaItem = {
  id: string
  label: string
  change: string
  tone: 'new' | 'worse' | 'stable'
}

export type SopStep = {
  id: string
  step: number
  title: string
  detail: string
}

export const CURACAO_FLIGHTS: FlightCard[] = [
  {
    id: 'flt-cuw-main',
    label: 'CUW Team',
    kind: 'team',
    statusTone: 'ok',
    from: {
      code: 'CUR',
      city: 'Willemstad, Curaçao',
      date: '15 Jun',
      status: 'Depart',
      time: '10:15',
    },
    to: {
      code: 'TPA',
      city: 'Tampa Bay, FL, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '14:05',
    },
    source: {
      label: 'Team Charter Board · CUW',
      href: '#source/team-charter-cuw',
      meta: 'Team Services · on time',
    },
  },
  {
    id: 'flt-cuw-staff',
    label: 'CUW Staff',
    kind: 'referees',
    statusTone: 'alert',
    from: {
      code: 'CUR',
      city: 'Willemstad, Curaçao',
      date: '15 Jun',
      status: 'Depart',
      time: '11:40',
    },
    to: {
      code: 'TPA',
      city: 'Tampa Bay, FL, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '15:35',
    },
    source: {
      label: 'Staff Charter · CUW',
      href: '#source/staff-charter-cuw',
      meta: 'Team Services · delay watch +25m',
    },
  },
  {
    id: 'flt-cuw-equip',
    label: 'CUW Equipment',
    kind: 'team',
    statusTone: 'ok',
    from: {
      code: 'MIA',
      city: 'Miami, FL, USA',
      date: '15 Jun',
      status: 'Depart',
      time: '09:20',
    },
    to: {
      code: 'TPA',
      city: 'Tampa Bay, FL, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '10:25',
    },
    source: {
      label: 'Equipment Freight · CUW',
      href: '#source/equip-cuw',
      meta: 'Logistics · on time',
    },
  },
]

export const CURACAO_MAP_ROUTES = [
  { id: 'r1', from: 'CUR', to: 'TPA', label: 'CUW Team', tone: 'ok' as const },
  { id: 'r2', from: 'CUR', to: 'TPA', label: 'CUW Staff', tone: 'alert' as const },
  { id: 'r3', from: 'MIA', to: 'TPA', label: 'Equipment', tone: 'ok' as const },
]

/** Approximate map positions (viewBox 0 0 400 220) */
export const MAP_AIRPORTS: Record<string, { x: number; y: number; city: string }> = {
  CUR: { x: 268, y: 168, city: 'Curaçao' },
  MIA: { x: 248, y: 128, city: 'Miami' },
  TPA: { x: 232, y: 108, city: 'Tampa' },
}

export const CURACAO_GROUND_CONTACTS: GroundContact[] = [
  {
    id: 'c1',
    name: 'Elena Vargas',
    dept: 'Travel',
    role: 'Receiving lead · TPA',
    phone: '+1 813 ···· 4412',
    location: 'TPA FBO · Gate 2',
    status: 'On station from 13:30',
  },
  {
    id: 'c2',
    name: 'Marcus Webb',
    dept: 'Team Services',
    role: 'Team liaison',
    phone: '+1 813 ···· 8821',
    location: 'Grand Bay lobby desk',
    status: 'Confirming coach transfer',
  },
  {
    id: 'c3',
    name: 'Sofia Almeida',
    dept: 'Accommodations',
    role: 'Hotel block manager',
    phone: '+1 813 ···· 2204',
    location: 'Grand Bay Tampa',
    status: 'Rooming list locked',
  },
]

export const CURACAO_HOTELS: HotelCard[] = [
  {
    id: 'h1',
    name: 'Grand Bay Tampa',
    address: '300 S Ashley Dr, Tampa, FL 33602',
    rooms: 48,
    occupants: 62,
    bookingStatus: 'Confirmed',
    checkIn: '15 Jun · from 15:00',
    checkOut: '19 Jun · 11:00',
    notes: 'Team floors 8–10 · quiet hours 22:00 · meeting room Bay 2 reserved',
    source: {
      label: 'Accommodation Manifest · CUW',
      href: '#source/hotel-cuw',
      meta: 'Team Services · locked',
    },
  },
  {
    id: 'h2',
    name: 'Harbor Suites Tampa',
    address: '400 N Ashley Dr, Tampa, FL 33602',
    rooms: 12,
    occupants: 14,
    bookingStatus: 'Partial',
    checkIn: '15 Jun · from 16:00',
    checkOut: '18 Jun · 10:00',
    notes: 'Federation / VIP overflow · 2 suites pending key packets',
    source: {
      label: 'VIP Hotel Hold · CUW',
      href: '#source/hotel-cuw-vip',
      meta: 'Accommodations · partial',
    },
  },
]

export const CURACAO_CALENDAR: TeamCalendarEvent[] = [
  {
    id: 'e1',
    date: '15 Jun',
    time: '16:30',
    title: 'Hotel arrival & kit drop',
    kind: 'Travel',
    location: 'Grand Bay Tampa',
    status: 'Scheduled',
  },
  {
    id: 'e2',
    date: '15 Jun',
    time: '18:00',
    title: 'Medical screening window',
    kind: 'Medical',
    location: 'Team hotel · Bay 2',
    status: 'Confirmed',
  },
  {
    id: 'e3',
    date: '16 Jun',
    time: '10:30',
    title: 'Official training',
    kind: 'Training',
    location: 'Tampa Bay training site A',
    status: 'Confirmed',
  },
  {
    id: 'e4',
    date: '16 Jun',
    time: '12:15',
    title: 'Press conference',
    kind: 'Press',
    location: 'Media centre · TPA',
    status: 'Confirmed',
  },
  {
    id: 'e5',
    date: '16 Jun',
    time: '17:00',
    title: 'Host city meet & greet',
    kind: 'Meet & greet',
    location: 'Fan fest annex',
    status: 'Optional · FA lead',
  },
  {
    id: 'e6',
    date: '17 Jun',
    time: '19:00',
    title: 'Match · CUW v. Group opponent',
    kind: 'Match',
    location: 'Hard Rock / network TBD',
    status: 'Fixture locked',
  },
]

export const SEA_WEATHER = {
  city: 'SEA',
  condition: 'Overcast · light precip risk',
  temp: '18° / 12°',
  wind: 'SW 18 km/h',
  impact: 'Secondary factor — slows outdoor queues, not a stoppage threshold',
}

export const SEA_PERIMETER: PerimeterStats = {
  outer: '41,200',
  inner: '36,480',
  variance: '−11.5% inner vs outer',
  forecastGap: '−9% vs H-2 forecast',
  note: 'Outer holding; inner lag aligns with Occidental Ave pinch (#4811).',
}

export const WEATHER_IMPACTED: ImpactedOpsRow[] = [
  {
    id: 'w1',
    kind: 'Match',
    label: 'M37 BEL v. EGY',
    city: 'SEA',
    window: 'Kickoff 18:00',
    risk: 'Light precip · scan pace soft',
  },
  {
    id: 'w2',
    kind: 'Training',
    label: 'Outdoor training block',
    city: 'MIA',
    window: '15:00–17:00',
    risk: 'Heat / WBGT watch',
  },
  {
    id: 'w3',
    kind: 'Travel',
    label: 'CUW staff charter',
    city: 'TPA',
    window: 'Arrive 15:35',
    risk: 'Delay watch +25m',
  },
  {
    id: 'w4',
    kind: 'Match',
    label: 'Evening kickoff window',
    city: 'LA',
    window: 'After 19:00',
    risk: 'Lightning radius watch',
  },
]

export const WEATHER_MITIGATIONS = [
  'Shorten outdoor warm-ups if WBGT stays elevated',
  'Hold pitch walks if lightning enters venue radius',
  'Keep covered queue messaging through H-1 at SEA',
  'Confirm staff charter slot before ground transfer',
]

export const VENUE_STATUS_SUMMARY = {
  overall: 'Yellow',
  venue: 'Hard Rock Stadium · MIA',
  drivers: ['Gate C queues', 'Pitch sectors 3–4', 'Workforce show-rate soft'],
  green: ['Broadcast', 'Hospitality', 'Pitch irrigation'],
}

export const VENUE_NEXT_HOUR: ChecklistItem[] = [
  {
    id: 'n1',
    title: 'Gate C queue length check-in',
    owner: 'Access Lead',
    due: 'Next 20 min',
    priority: 'Now',
  },
  {
    id: 'n2',
    title: 'Confirm standby volunteers on site',
    owner: 'Workforce desk',
    due: 'Next 40 min',
    priority: 'Now',
  },
  {
    id: 'n3',
    title: 'Pitch crew status toward 22:00 retest',
    owner: 'Venue Ops',
    due: 'This hour',
    priority: 'Next',
  },
  {
    id: 'n4',
    title: 'Monitor hospitality badge backlog',
    owner: 'Ticketing',
    due: 'Watch',
    priority: 'Watch',
  },
]

export const TOM_AGENDA: AgendaItem[] = [
  { id: 'a1', order: 1, title: 'Miami access & pitch P1s', owner: 'Venue Access / Pitch', minutes: '10' },
  { id: 'a2', order: 2, title: 'LA demonstration window', owner: 'Host City Security', minutes: '8' },
  { id: 'a3', order: 3, title: 'SEA attendance & densification', owner: 'Matchday Ops', minutes: '8' },
  { id: 'a4', order: 4, title: 'Open actions roll-call', owner: 'TOC Manager', minutes: '10' },
  { id: 'a5', order: 5, title: 'AOB / decisions', owner: 'CTO', minutes: '5' },
]

export const TOM_DELTA: DeltaItem[] = [
  { id: 'd1', label: 'Gate C failover', change: 'Opened 07:12 today', tone: 'new' },
  { id: 'd2', label: 'Pitch sectors 3–4', change: 'Failed acceptance · retest 22:00', tone: 'worse' },
  { id: 'd3', label: 'SEA densification', change: 'Still incomplete vs yesterday', tone: 'stable' },
  { id: 'd4', label: 'LA demo watch', change: 'Volume unchanged (2–4k)', tone: 'stable' },
]

export const ARGENTINA_FLIGHTS: FlightCard[] = [
  {
    id: 'flt-arg-main',
    label: 'ARG Team',
    kind: 'team',
    statusTone: 'ok',
    from: {
      code: 'EZE',
      city: 'Buenos Aires, ARG',
      date: '14 Jun',
      status: 'Depart',
      time: '22:10',
    },
    to: {
      code: 'MIA',
      city: 'Miami, FL, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '06:40',
    },
    source: {
      label: 'Team Charter Board · ARG',
      href: '#source/team-charter-arg',
      meta: 'Team Services · on time',
    },
  },
  {
    id: 'flt-arg-staff',
    label: 'ARG Staff',
    kind: 'referees',
    statusTone: 'ok',
    from: {
      code: 'EZE',
      city: 'Buenos Aires, ARG',
      date: '14 Jun',
      status: 'Depart',
      time: '23:05',
    },
    to: {
      code: 'MIA',
      city: 'Miami, FL, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '07:30',
    },
    source: {
      label: 'Staff Charter · ARG',
      href: '#source/staff-charter-arg',
      meta: 'Team Services · on time',
    },
  },
]

export const ARGENTINA_OWNERS: IssueRow[] = [
  {
    id: 'arg-o1',
    severity: 3,
    city: 'MIA',
    category: 'Transport',
    title: 'Ground transfer buffer after late arrival',
    summary: 'Owner: Transport Lead · Team Services. Buffer held at 45 min.',
    source: {
      label: 'ARG Ops Owner Map',
      href: '#source/arg-owners',
      meta: 'FA Ops · live',
    },
  },
  {
    id: 'arg-o2',
    severity: 2,
    city: 'MIA',
    category: 'Venue',
    title: 'Training site accreditation',
    summary: 'Owner: Team Liaison · Accommodations desk confirming hotel–site loop.',
    source: {
      label: 'ARG Training Slot',
      href: '#source/arg-training',
      meta: 'Team Services',
    },
  },
]

export const VIP_SOP_STEPS: SopStep[] = [
  {
    id: 's1',
    step: 1,
    title: 'Secure the VIP party',
    detail: 'On-scene lead freezes further movement and accounts for all travellers.',
  },
  {
    id: 's2',
    step: 2,
    title: 'Notify TOC',
    detail: 'Call Transport Desk → TOC channel. Do not wait for local resolution.',
  },
  {
    id: 's3',
    step: 3,
    title: 'Await escalation approval',
    detail: 'TOC Manager approves escalation; duty CTO is backup if unreachable.',
  },
  {
    id: 's4',
    step: 4,
    title: 'Log in WeTrack',
    detail: 'Category Transport · VIP. Attach timeline and contacts before shift handoff.',
  },
]

export const EXTERNAL_LA_ITEMS = [
  {
    id: 'x1',
    title: 'West plaza demonstration',
    detail: '2–4k expected · soft-closure 15:00–21:00',
    source: {
      label: 'Host City Security Brief · LA',
      href: '#source/security-brief-la',
      meta: 'Security · 15 Jun 09:05',
    } satisfies SourceLink,
  },
  {
    id: 'x2',
    title: 'No city shut-down notice',
    detail: 'LE posture unchanged · hospitality access plan remains green if plaza holds',
    source: {
      label: 'City Desk Digest · LA',
      href: '#source/city-desk-la',
      meta: 'Host City · 15 Jun 10:00',
    } satisfies SourceLink,
  },
]
