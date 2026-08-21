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
  access: CockpitAccess
  roles: string
  defaultBackgroundImage: string
  logoImage: string
  timezone: string
  language: string
  hostCities: string
  teams: string
  matches: string
  description: string
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
    visibility: 'Anyone at FIFA',
    adminRights: 'Project admins',
    advanced: { ...defaultAdvanced('general.svg'), showWeather: false },
  },
  {
    id: 'custom-views',
    name: 'Custom views',
    visibility: 'Anyone at FIFA',
    adminRights: 'All admins',
    advanced: defaultAdvanced('custom-cockpit.svg'),
  },
  {
    id: 'exec-brief',
    name: 'Executive brief',
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
    visibility: 'Anyone at FIFA',
    adminRights: 'Project admins',
    advanced: defaultAdvanced('general.svg'),
  },
  {
    id: 'tom',
    name: 'Tournament Ops Meeting',
    visibility: 'Anyone at FIFA',
    adminRights: 'Project admins',
    advanced: defaultAdvanced('general.svg'),
  },
  {
    id: 'host-cities',
    name: 'Host cities',
    visibility: 'Anyone at FIFA',
    adminRights: 'All admins',
    advanced: { ...defaultAdvanced('general.svg'), showDate: false, pageFilters: 'City' },
  },
  {
    id: 'stadiums',
    name: 'Stadiums',
    visibility: 'Anyone at FIFA',
    adminRights: 'All admins',
    advanced: { ...defaultAdvanced('general.svg'), showDate: false, pageFilters: 'Stadium' },
  },
  {
    id: 'matches',
    name: 'Matches',
    visibility: 'Anyone at FIFA',
    adminRights: 'Project admins',
    advanced: { ...defaultAdvanced('general.svg'), pageFilters: 'Match day, Group' },
  },
]

export const DEFAULT_SIDEBAR_ITEMS: SidebarItemSetting[] = [
  {
    id: 'issues',
    label: 'Issues',
    icon: '/assets/icons/issues.svg',
    visible: true,
    advanced: { backgroundImage: '', defaultFilter: 'All cities', notes: '' },
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

export function defaultGeneralSettings(name: string): CockpitGeneralSettings {
  return {
    name,
    access: 'Anyone at FIFA',
    roles: 'ADM, TEC, OPS',
    defaultBackgroundImage: DEFAULT_COCKPIT_BACKGROUND,
    logoImage: DEFAULT_COCKPIT_LOGO,
    timezone: 'Time in EST',
    language: 'English',
    hostCities: 'MIA, LA, SEA, PHL, TOR, DAL',
    teams: 'USA, MEX, CAN, BRA, ARG, FRA, GER, ESP',
    matches: 'M01–M104',
    description: '',
  }
}

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
  topBarPages: TopBarPageSetting[]
  sidebarItems: SidebarItemSetting[]
}

/** Full seeded settings for existing tournament cockpits (page backgrounds unchanged). */
export function defaultCockpitSettings(name = 'World Cup 2026'): CockpitAdminSettings {
  return {
    general: {
      ...defaultGeneralSettings(name),
      // Existing cockpits keep legacy page assets; general default is still the trophy for new pages.
      defaultBackgroundImage: DEFAULT_COCKPIT_BACKGROUND,
    },
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
    general: defaultGeneralSettings(name),
    topBarPages: [
      {
        id: 'home',
        name: 'Home',
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
      defaultBackgroundImage: pattern,
      hostCities: 'BRS, SAO, RIO, BEL, FOR, REC',
      teams: 'BRA, USA, GER, ESP, FRA, ENG, JPN, CAN',
      matches: 'M01–M064',
    },
    topBarPages: [
      ...base.topBarPages.map((page) => ({
        ...page,
        advanced: { ...page.advanced, backgroundImage: pattern },
      })),
      {
        id: 'issues',
        name: 'Issues',
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

export function seedAllCockpitSettings(): Record<CockpitId, CockpitAdminSettings> {
  return {
    wc26: defaultCockpitSettings('World Cup 2026'),
    wwc: wwcCockpitSettings(),
    youth: defaultCockpitSettings('Youth Tournament 2026'),
    corporate: defaultCockpitSettings('FIFA Corporate'),
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
