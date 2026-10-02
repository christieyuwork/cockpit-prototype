export type CockpitStatus = 'completed' | 'active' | 'archived'
export type CockpitId = string

export const DEFAULT_COCKPIT_BACKGROUND = '/backgrounds/default-cockpit.png'
export const DEFAULT_COCKPIT_LOGO = '/assets/logo-wc26.png'

export type CockpitProfile = {
  id: CockpitId
  title: string
  role: string
  status: CockpitStatus
  image?: string
  overlay?: number
  visible: boolean
  order: number
  hasAdmin: boolean
  /** Permanent cockpits stay active; status cannot be changed. */
  permanent?: boolean
}

export type PageVisibility = 'Anyone at FIFA' | 'Specific roles' | 'Classified' | 'Only me'
export type AdminRights = 'All admins' | 'Project admins' | 'Owner only'
export type CockpitAccess = 'Anyone at FIFA' | 'Specific roles' | 'Invite only'

export type HostCity = {
  id: string
  name: string
  trigram: string
  latitude: string
  longitude: string
  backgroundImage: string
  pillText: string
  pillBg: string
  /** 0–100 */
  pillBgOpacity: number
}

export type TournamentPhase = {
  id: string
  title: string
  startDate: string
}

export const DEFAULT_PILL_TEXT = '#ffffff'
export const DEFAULT_PILL_BG = '#000000'
export const DEFAULT_PILL_BG_OPACITY = 35

export const DEFAULT_PHASES: TournamentPhase[] = [
  { id: 'phase-planning', title: 'Planning', startDate: '' },
  { id: 'phase-pre', title: 'Pre-tournament', startDate: '' },
  { id: 'phase-group', title: 'Group stage', startDate: '' },
  { id: 'phase-knockout', title: 'Knockout stage', startDate: '' },
]

export function defaultPhases(): TournamentPhase[] {
  return DEFAULT_PHASES.map((phase) => ({ ...phase }))
}

export type Stadium = {
  id: string
  name: string
  trigram: string
  /** Empty string means the stadium is not linked to a host city. */
  hostCityId: string
  latitude: string
  longitude: string
  maps3d: boolean
  map3dUrl: string
  map2dPdf: string
}

export type TournamentAdmin = {
  id: string
  label: string
}

export const DEFAULT_TIMEZONE = 'Zurich, UTC+1'
export const DEFAULT_FONT = 'FWC26'
export const DEFAULT_LANGUAGE = 'English'
export const DEFAULT_ROLES = 'ADM, TEC, OPS'
export const DEFAULT_TEAMS = 'USA, MEX, CAN, BRA, ARG, FRA, GER, ESP'
export const DEFAULT_MATCHES = 'M01–M104'
export const MIAMI_3D_MAP_URL =
  'https://imaps.fifa.com/?navmapId=3d3869e-4242-45cd-b20c-cecaa24a2bf4&autoload=y'

export type LabeledOption = { value: string; label: string }

export const TIMEZONE_OPTIONS: LabeledOption[] = Array.from({ length: 21 }, (_, index) => {
  const offset = index - 8
  if (offset === 1) {
    return { value: DEFAULT_TIMEZONE, label: 'Zurich, UTC+1 (Default)' }
  }
  const label =
    offset === 0 ? 'UTC+0' : offset > 0 ? `UTC+${offset}` : `UTC−${Math.abs(offset)}`
  return { value: label, label }
})

export const FONT_OPTIONS: LabeledOption[] = [
  { value: DEFAULT_FONT, label: 'FWC26 (Default)' },
  { value: 'FIFA Sans', label: 'FIFA Sans' },
  { value: 'FWWC2027BrasilRC', label: 'FWWC2027 Brasil' },
]

export const LANGUAGE_OPTIONS: LabeledOption[] = [
  { value: DEFAULT_LANGUAGE, label: 'English (Default)' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
]

/** Top bar page backgrounds are stored as bare file names under /backgrounds. */
export function backgroundSrc(value: string): string {
  if (!value) return ''
  return value.startsWith('/') || value.startsWith('http') ? value : `/backgrounds/${value}`
}

export const BUILT_IN_TOP_BAR_PAGE_IDS = [
  'home',
  'custom-views',
  'exec-brief',
  'daily-brief',
  'tom',
  'host-cities',
  'stadiums',
  'matches',
]

export const BACKGROUND_OPTIONS: LabeledOption[] = [
  { value: DEFAULT_COCKPIT_BACKGROUND, label: 'Trophy background (Default)' },
  { value: '/backgrounds/general.svg', label: 'General' },
  { value: '/backgrounds/custom-cockpit.svg', label: 'Custom cockpit' },
]

export type TopBarPageAdvanced = {
  showTitle: boolean
  showDate: boolean
  showWeather: boolean
  customLinkLabel: string
  customLinkUrl: string
  backgroundImage: string
  pageFilters: string
}

export type TopBarPageSetting = {
  id: string
  name: string
  visible: boolean
  visibility: PageVisibility
  adminRights: AdminRights
  advanced: TopBarPageAdvanced
}

export type SidebarItemAdvanced = {
  backgroundImage: string
  defaultFilter: string
  notes: string
}

export type SidebarItemSetting = {
  id: string
  label: string
  icon: string
  visible: boolean
  advanced: SidebarItemAdvanced
}

export type CockpitGeneralSettings = {
  name: string
  abbreviation: string
  competitionId: string
  description: string
  access: CockpitAccess
  roles: string
  admins: TournamentAdmin[]
  defaultBackgroundImage: string
  logoImage: string
  font: string
  winningTeamPhoto: string
  timezone: string
  crossTimezones: string[]
  language: string
  kickoff: string
  finalTime: string
  phases: TournamentPhase[]
  reportSwitchDate: string
  teams: string
  matches: string
}

function defaultAdvanced(backgroundImage: string): TopBarPageAdvanced {
  return {
    showTitle: true,
    showDate: true,
    showWeather: false,
    customLinkLabel: '',
    customLinkUrl: '',
    backgroundImage,
    pageFilters: 'None',
  }
}

/** Existing tournament cockpits keep their current page backgrounds. */
export const DEFAULT_TOP_BAR_PAGES: TopBarPageSetting[] = [
  {
    id: 'home',
    name: 'Home',
    visible: true,
    visibility: 'Anyone at FIFA',
    adminRights: 'Project admins',
    advanced: { ...defaultAdvanced('general.svg'), showWeather: false },
  },
  {
    id: 'custom-views',
    name: 'Custom views',
    visible: true,
    visibility: 'Anyone at FIFA',
    adminRights: 'All admins',
    advanced: defaultAdvanced('custom-cockpit.svg'),
  },
  {
    id: 'exec-brief',
    name: 'Executive brief',
    visible: true,
    visibility: 'Classified',
    adminRights: 'Owner only',
    advanced: {
      ...defaultAdvanced('general.svg'),
      showWeather: true,
      customLinkLabel: 'TOM Agenda',
      customLinkUrl: '#tom-agenda',
      pageFilters: 'Host city, Match day',
    },
  },
  {
    id: 'daily-brief',
    name: 'Daily brief',
    visible: true,
    visibility: 'Anyone at FIFA',
    adminRights: 'Project admins',
    advanced: defaultAdvanced('general.svg'),
  },
  {
    id: 'tom',
    name: 'Tournament Ops Meeting',
    visible: true,
    visibility: 'Anyone at FIFA',
    adminRights: 'Project admins',
    advanced: defaultAdvanced('general.svg'),
  },
  {
    id: 'host-cities',
    name: 'Host cities',
    visible: true,
    visibility: 'Anyone at FIFA',
    adminRights: 'All admins',
    advanced: { ...defaultAdvanced('general.svg'), showDate: false, pageFilters: 'City' },
  },
  {
    id: 'stadiums',
    name: 'Stadiums',
    visible: true,
    visibility: 'Anyone at FIFA',
    adminRights: 'All admins',
    advanced: { ...defaultAdvanced('general.svg'), showDate: false, pageFilters: 'Stadium' },
  },
  {
    id: 'matches',
    name: 'Matches',
    visible: true,
    visibility: 'Anyone at FIFA',
    adminRights: 'Project admins',
    advanced: { ...defaultAdvanced('general.svg'), pageFilters: 'Match day, Group' },
  },
]

export const DEFAULT_SIDEBAR_ITEMS: SidebarItemSetting[] = [
  {
    id: 'issues',
    label: 'Issues',
    icon: '/assets/icons/issues.png',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: 'All cities', notes: '' },
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '/assets/icons/reports.png',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: '', notes: '' },
  },
  {
    id: 'statistics',
    label: 'Statistics',
    icon: '/assets/icons/statistics.svg',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: '', notes: '' },
  },
  {
    id: 'data-store',
    label: 'Data Store',
    icon: '/assets/icons/data-store.svg',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: '', notes: '' },
  },
  {
    id: 'maps',
    label: 'Maps',
    icon: '/assets/icons/maps.svg',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: '', notes: '' },
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: '/assets/icons/calendar.svg',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: '', notes: '' },
  },
  {
    id: 'weather',
    label: 'Weather',
    icon: '/assets/icons/weather.svg',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: '', notes: '' },
  },
  {
    id: 'live-feed',
    label: 'Live Feed',
    icon: '/assets/icons/live-stream.svg',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: '', notes: '' },
  },
  {
    id: 'social-media',
    label: 'Social Media',
    icon: '/assets/icons/social-media.svg',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: '', notes: '' },
  },
  {
    id: 'bracket',
    label: 'Bracket',
    icon: '/assets/icons/bracket.svg',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: '', notes: '' },
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: '/assets/icons/contacts.svg',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: '', notes: '' },
  },
]

export function createCompetitionId(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function createHostCity(): HostCity {
  return {
    id: createId('city'),
    name: '',
    trigram: '',
    latitude: '',
    longitude: '',
    backgroundImage: '',
    pillText: DEFAULT_PILL_TEXT,
    pillBg: DEFAULT_PILL_BG,
    pillBgOpacity: DEFAULT_PILL_BG_OPACITY,
  }
}

const SEEDED_PILL_TEXT: Record<string, string> = {
  MIA: '#f06292',
  LA: '#f4ff81',
  SEA: '#1ee9b6',
  PHL: '#82b1ff',
  TOR: '#ffab91',
  DAL: '#b388ff',
  BRS: '#ffcc00',
  SAO: '#7cfc00',
  RIO: '#00bcd4',
  BEL: '#ff8a65',
  FOR: '#ea80fc',
  REC: '#80d8ff',
}

export function defaultPillFor(trigram: string): Pick<HostCity, 'pillText' | 'pillBg' | 'pillBgOpacity'> {
  return {
    pillText: SEEDED_PILL_TEXT[trigram.toUpperCase()] ?? DEFAULT_PILL_TEXT,
    pillBg: DEFAULT_PILL_BG,
    pillBgOpacity: DEFAULT_PILL_BG_OPACITY,
  }
}

function seedCity(id: string, name: string, trigram: string, latitude: string, longitude: string): HostCity {
  return { id, name, trigram, latitude, longitude, backgroundImage: '', ...defaultPillFor(trigram) }
}

export function createStadium(): Stadium {
  return {
    id: createId('stadium'),
    name: '',
    trigram: '',
    hostCityId: '',
    latitude: '',
    longitude: '',
    maps3d: false,
    map3dUrl: '',
    map2dPdf: '',
  }
}

export function createTournamentAdmin(): TournamentAdmin {
  return { id: createId('admin'), label: '' }
}

export function defaultGeneralSettings(
  name: string,
  competitionId = '',
): CockpitGeneralSettings {
  return {
    name,
    abbreviation: '',
    competitionId,
    description: '',
    access: 'Anyone at FIFA',
    roles: DEFAULT_ROLES,
    admins: [],
    defaultBackgroundImage: DEFAULT_COCKPIT_BACKGROUND,
    logoImage: DEFAULT_COCKPIT_LOGO,
    font: DEFAULT_FONT,
    winningTeamPhoto: '',
    timezone: DEFAULT_TIMEZONE,
    crossTimezones: [],
    language: DEFAULT_LANGUAGE,
    kickoff: '',
    finalTime: '',
    phases: defaultPhases(),
    reportSwitchDate: '',
    teams: DEFAULT_TEAMS,
    matches: DEFAULT_MATCHES,
  }
}

export const WC26_HOST_CITIES: HostCity[] = [
  seedCity('mia', 'Miami', 'MIA', '25.7617', '-80.1918'),
  seedCity('la', 'Los Angeles', 'LA', '34.0522', '-118.2437'),
  seedCity('sea', 'Seattle', 'SEA', '47.6062', '-122.3321'),
  seedCity('phl', 'Philadelphia', 'PHL', '39.9526', '-75.1652'),
  seedCity('tor', 'Toronto', 'TOR', '43.6532', '-79.3832'),
  seedCity('dal', 'Dallas', 'DAL', '32.7767', '-96.7970'),
]

export const WWC_HOST_CITIES: HostCity[] = [
  seedCity('brs', 'Brasilia', 'BRS', '-15.7975', '-47.8919'),
  seedCity('sao', 'Sao Paulo', 'SAO', '-23.5505', '-46.6333'),
  seedCity('rio', 'Rio de Janeiro', 'RIO', '-22.9068', '-43.1729'),
  seedCity('bel', 'Belem', 'BEL', '-1.4558', '-48.4902'),
  seedCity('for', 'Fortaleza', 'FOR', '-3.7172', '-38.5433'),
  seedCity('rec', 'Recife', 'REC', '-8.0476', '-34.8770'),
]

export const WC26_STADIUMS: Stadium[] = [
  {
    id: 'mias',
    name: 'Miami Stadium',
    trigram: 'MIAS',
    hostCityId: 'mia',
    latitude: '25.9580',
    longitude: '-80.2389',
    maps3d: true,
    map3dUrl: MIAMI_3D_MAP_URL,
    map2dPdf: '',
  },
]

export const DEFAULT_COCKPITS: CockpitProfile[] = [
  {
    id: 'wc26',
    title: 'World Cup 2026',
    role: 'Project Administrator',
    status: 'completed',
    image: '/assets/profile/wc26.png',
    overlay: 0.5,
    visible: true,
    order: 0,
    hasAdmin: true,
  },
  {
    id: 'wwc',
    title: 'Women\u2019s World Cup 2027',
    role: 'Project Administrator',
    status: 'active',
    image: '/assets/profile/wwc.png',
    overlay: 0.7,
    visible: true,
    order: 1,
    hasAdmin: true,
  },
  {
    id: 'youth',
    title: 'Youth Tournament 2026',
    role: 'Transport & Logistics Coordinator',
    status: 'archived',
    image: '/assets/profile/youth.png',
    overlay: 0.5,
    visible: false,
    order: 2,
    hasAdmin: false,
  },
  {
    id: 'corporate',
    title: 'FIFA Corporate',
    role: 'Logistics Coordinator',
    status: 'active',
    visible: true,
    order: 3,
    hasAdmin: false,
    permanent: true,
  },
]

export type CockpitAdminSettings = {
  general: CockpitGeneralSettings
  hostCities: HostCity[]
  stadiums: Stadium[]
  topBarPages: TopBarPageSetting[]
  sidebarItems: SidebarItemSetting[]
}

function copyCities(cities: HostCity[]): HostCity[] {
  return cities.map((city) => ({ ...city }))
}

function copyStadiums(stadiums: Stadium[]): Stadium[] {
  return stadiums.map((stadium) => ({ ...stadium }))
}

/** Full seeded settings for existing tournament cockpits (page backgrounds unchanged). */
export function defaultCockpitSettings(name = 'World Cup 2026'): CockpitAdminSettings {
  return {
    general: {
      ...defaultGeneralSettings(name, '285023'),
      abbreviation: 'FWC2026',
      kickoff: '2026-06-11T15:00',
      finalTime: '2026-07-19T15:00',
      phases: defaultPhases().map((phase) =>
        phase.id === 'phase-group'
          ? { ...phase, startDate: '2026-06-11' }
          : phase.id === 'phase-knockout'
            ? { ...phase, startDate: '2026-06-28' }
            : phase,
      ),
      reportSwitchDate: '2026-05-19',
      defaultBackgroundImage: DEFAULT_COCKPIT_BACKGROUND,
    },
    hostCities: copyCities(WC26_HOST_CITIES),
    stadiums: copyStadiums(WC26_STADIUMS),
    topBarPages: DEFAULT_TOP_BAR_PAGES.map((page) => ({
      ...page,
      advanced: { ...page.advanced },
    })),
    sidebarItems: DEFAULT_SIDEBAR_ITEMS.map((item) => ({
      ...item,
      advanced: { ...item.advanced },
    })),
  }
}

/** Settings for a newly created cockpit: Home only, trophy default bg, all sidebar shown. */
export function newCockpitSettings(name: string): CockpitAdminSettings {
  return {
    general: defaultGeneralSettings(name, createCompetitionId()),
    hostCities: [],
    stadiums: [],
    topBarPages: [
      {
        id: 'home',
        name: 'Home',
        visible: true,
        visibility: 'Anyone at FIFA',
        adminRights: 'Project admins',
        advanced: defaultAdvanced(DEFAULT_COCKPIT_BACKGROUND),
      },
    ],
    sidebarItems: DEFAULT_SIDEBAR_ITEMS.map((item) => ({
      ...item,
      visible: true,
      advanced: { ...item.advanced },
    })),
  }
}

export function createTopBarPage(
  name: string,
  backgroundImage = DEFAULT_COCKPIT_BACKGROUND,
): TopBarPageSetting {
  return {
    id: `page-${Date.now()}`,
    name,
    visible: true,
    visibility: 'Anyone at FIFA',
    adminRights: 'Project admins',
    advanced: defaultAdvanced(backgroundImage),
  }
}

/** Women's World Cup: Brasil pattern background + Issues top-bar page. */
export function wwcCockpitSettings(): CockpitAdminSettings {
  const base = defaultCockpitSettings('Women\u2019s World Cup 2027')
  const pattern = '/backgrounds/wwc-pattern.png'
  return {
    ...base,
    general: {
      ...base.general,
      name: 'Women\u2019s World Cup 2027',
      abbreviation: 'WWC2027',
      competitionId: '285127',
      kickoff: '',
      finalTime: '',
      phases: defaultPhases(),
      reportSwitchDate: '',
      defaultBackgroundImage: pattern,
      teams: 'BRA, USA, GER, ESP, FRA, ENG, JPN, CAN',
      matches: 'M01–M064',
    },
    hostCities: copyCities(WWC_HOST_CITIES),
    stadiums: [],
    topBarPages: [
      ...base.topBarPages.map((page) => ({
        ...page,
        advanced: { ...page.advanced, backgroundImage: pattern },
      })),
      {
        id: 'issues',
        name: 'Issues',
        visible: true,
        visibility: 'Anyone at FIFA',
        adminRights: 'Project admins',
        advanced: {
          ...defaultAdvanced(pattern),
          showDate: true,
          pageFilters: 'City, Severity',
        },
      },
    ],
  }
}

/** FIFA Corporate: Executive Reporting only, no sidebar. */
export function corporateCockpitSettings(): CockpitAdminSettings {
  return {
    general: {
      ...defaultGeneralSettings('FIFA Corporate', '100001'),
      abbreviation: 'CORP',
      defaultBackgroundImage: '',
      teams: '',
      matches: '',
      description: 'Cross-tournament executive reporting and upstream triage.',
    },
    hostCities: [],
    stadiums: [],
    topBarPages: [
      {
        id: 'exec-reporting',
        name: 'Executive Reporting',
        visible: true,
        visibility: 'Classified',
        adminRights: 'Owner only',
        advanced: {
          ...defaultAdvanced(''),
          showWeather: false,
          pageFilters: 'Owner, Topic',
        },
      },
    ],
    sidebarItems: [],
  }
}

export function youthCockpitSettings(): CockpitAdminSettings {
  const base = defaultCockpitSettings('Youth Tournament 2026')
  return {
    ...base,
    general: {
      ...base.general,
      name: 'Youth Tournament 2026',
      abbreviation: 'YTH2026',
      competitionId: '285226',
      kickoff: '',
      finalTime: '',
      phases: defaultPhases(),
      reportSwitchDate: '',
    },
    hostCities: copyCities(WC26_HOST_CITIES).map((city) => ({
      ...city,
      id: `youth-${city.id}`,
    })),
    stadiums: [],
  }
}

export function seedAllCockpitSettings(): Record<CockpitId, CockpitAdminSettings> {
  return {
    wc26: defaultCockpitSettings('World Cup 2026'),
    wwc: wwcCockpitSettings(),
    youth: youthCockpitSettings(),
    corporate: corporateCockpitSettings(),
  }
}

export const VISIBILITY_OPTIONS: PageVisibility[] = [
  'Anyone at FIFA',
  'Specific roles',
  'Classified',
  'Only me',
]

export const ADMIN_RIGHTS_OPTIONS: AdminRights[] = [
  'All admins',
  'Project admins',
  'Owner only',
]

export const ACCESS_OPTIONS: CockpitAccess[] = [
  'Anyone at FIFA',
  'Specific roles',
  'Invite only',
]

export const COCKPIT_STATUS_OPTIONS: CockpitStatus[] = ['completed', 'active', 'archived']
