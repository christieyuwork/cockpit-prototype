export const VISIBILITY_OPTIONS = [
  'Only me',
  'Anyone at FIFA',
  'Share with specific people',
] as const

export type Visibility = (typeof VISIBILITY_OPTIONS)[number]

export type DirectoryUser = {
  id: string
  name: string
  email: string
  roles: string
}

export const DIRECTORY_USERS: DirectoryUser[] = [
  { id: 'u1', name: 'Heimo Schurgi', email: 'heimo.s@fifa.org', roles: 'ADM' },
  { id: 'u2', name: 'Maria Rodriguez Ceborro', email: 'maria.rodriguez@fifa.org', roles: 'ADM, TEC' },
  { id: 'u3', name: 'Daniel Purro', email: 'daniel.p@fifa.org', roles: 'TEC' },
  { id: 'u4', name: 'Amelia Thomasson', email: 'amelia.t@fifa.org', roles: 'TEC' },
  { id: 'u5', name: 'Nadia Beltrán', email: 'nadia.b@fifa.org', roles: 'OPS' },
  { id: 'u6', name: 'Kwame Osei', email: 'kwame.o@fifa.org', roles: 'SEC' },
  { id: 'u7', name: 'Yuki Tanaka', email: 'yuki.t@fifa.org', roles: 'BRD' },
  { id: 'u8', name: 'Lucas Ferreira', email: 'lucas.f@fifa.org', roles: 'OPS, TEC' },
  { id: 'u9', name: 'Sofia Marchetti', email: 'sofia.m@fifa.org', roles: 'ADM' },
  { id: 'u10', name: 'Omar Haddad', email: 'omar.h@fifa.org', roles: 'SEC, OPS' },
  { id: 'u11', name: 'Grace Mwangi', email: 'grace.m@fifa.org', roles: 'WRK' },
  { id: 'u12', name: 'Jonas Vestergaard', email: 'jonas.v@fifa.org', roles: 'TEC' },
]

/** Total shown as "N users found" in the directory picker. */
export const DIRECTORY_TOTAL = 25

export const MODULE_TAGS = [
  'Competition data',
  'Maps',
  'Live feed',
  'Ticketing',
  'Attendance',
  'Social media',
  'Communication',
  'Workforce',
] as const

export type ModuleTag = (typeof MODULE_TAGS)[number]

export type ModuleKind =
  | 'weather'
  | 'liveFeed'
  | 'logs'
  | 'ticketing'
  | 'liveLocation'
  | 'calendar'
  | 'attendance'
  | 'workforce'
  | 'social'
  | 'summary'
  | 'reports'
  | 'issues'
  | 'matches'

export type ModuleDef = {
  kind: ModuleKind
  title: string
  tags: ModuleTag[]
  /** Tabs offered by the module, if any. */
  tabs?: string[]
  /** Default footprint on the 4 x 8 canvas grid. */
  defaultSize: { w: number; h: number }
  /** How many instances the module starts with in the picker. */
  initialCount: number
}

export const MODULE_CATALOG: ModuleDef[] = [
  {
    kind: 'weather',
    title: 'Weather',
    tags: ['Competition data'],
    defaultSize: { w: 2, h: 3 },
    initialCount: 0,
  },
  {
    kind: 'liveFeed',
    title: 'Live feed',
    tags: ['Live feed', 'Communication'],
    tabs: ['Helicopter', 'Tactical', 'Security', 'Broadcast'],
    defaultSize: { w: 2, h: 3 },
    initialCount: 2,
  },
  {
    kind: 'logs',
    title: 'Logs',
    tags: ['Competition data', 'Communication'],
    defaultSize: { w: 2, h: 3 },
    initialCount: 1,
  },
  {
    kind: 'ticketing',
    title: 'Ticketing',
    tags: ['Ticketing', 'Attendance'],
    defaultSize: { w: 2, h: 2 },
    initialCount: 0,
  },
  {
    kind: 'liveLocation',
    title: 'Live location',
    tags: ['Maps'],
    defaultSize: { w: 2, h: 3 },
    initialCount: 0,
  },
  {
    kind: 'calendar',
    title: 'Calendar',
    tags: ['Competition data'],
    defaultSize: { w: 2, h: 3 },
    initialCount: 0,
  },
  {
    kind: 'attendance',
    title: 'Attendance',
    tags: ['Attendance', 'Ticketing'],
    defaultSize: { w: 2, h: 2 },
    initialCount: 0,
  },
  {
    kind: 'workforce',
    title: 'Workforce',
    tags: ['Workforce'],
    defaultSize: { w: 2, h: 2 },
    initialCount: 0,
  },
  {
    kind: 'social',
    title: 'Social',
    tags: ['Social media'],
    defaultSize: { w: 1, h: 5 },
    initialCount: 0,
  },
  {
    kind: 'summary',
    title: 'Executive summary',
    tags: ['Competition data', 'Communication'],
    defaultSize: { w: 1, h: 8 },
    initialCount: 0,
  },
  {
    kind: 'reports',
    title: 'Daily reports',
    tags: ['Competition data'],
    defaultSize: { w: 1, h: 3 },
    initialCount: 0,
  },
  {
    kind: 'issues',
    title: 'Issues',
    tags: ['Competition data'],
    defaultSize: { w: 1, h: 3 },
    initialCount: 0,
  },
  {
    kind: 'matches',
    title: 'Matches',
    tags: ['Competition data', 'Attendance', 'Ticketing'],
    tabs: ['Yesterday', 'Today', 'Tomorrow'],
    defaultSize: { w: 2, h: 5 },
    initialCount: 0,
  },
]

export const MODULES_BY_KIND = Object.fromEntries(
  MODULE_CATALOG.map((module) => [module.kind, module]),
) as Record<ModuleKind, ModuleDef>

export type CustomView = {
  id: string
  title: string
  visibility: Visibility
  sharedWith: string[]
  modules: PlacedModule[]
}

/** Nav pages reuse the same canvas model as custom views. */
export type AppView = CustomView & {
  system?: boolean
  navLabel?: string
  leftAction?: 'tomAgenda'
  /** Full-page layouts that skip the module grid. */
  layout?: 'grid' | 'issues' | 'exec-report'
}

/** A module instance positioned on the canvas grid (1-indexed column/row). */
export type PlacedModule = {
  id: string
  kind: ModuleKind
  col: number
  row: number
  w: number
  h: number
  /** Optional display name override from Configure module. */
  title?: string
  tab?: string
  config?: import('./moduleConfig').ModuleConfig
}

export const ISSUES_PAGE_ID = 'page-issues'
export const EXEC_REPORT_PAGE_ID = 'page-exec-reporting'

function place(
  viewId: string,
  items: Array<{ kind: ModuleKind; col: number; row: number; w: number; h: number; tab?: string }>,
): PlacedModule[] {
  return items.map((item, index) => ({
    id: `${viewId}-${item.kind}-${index}`,
    kind: item.kind,
    col: item.col,
    row: item.row,
    w: item.w,
    h: item.h,
    tab: item.tab ?? MODULES_BY_KIND[item.kind].tabs?.[0],
  }))
}

/** Quadrant layout used to seed the saved views: four 2 x 3 modules, bottom two rows left open. */
const SEED_SLOTS = [
  { col: 1, row: 1 },
  { col: 3, row: 1 },
  { col: 1, row: 4 },
  { col: 3, row: 4 },
]

function seedModules(viewId: string, kinds: ModuleKind[]): PlacedModule[] {
  return kinds.slice(0, SEED_SLOTS.length).map((kind, index) => ({
    id: `${viewId}-${kind}-${index}`,
    kind,
    tab: MODULES_BY_KIND[kind].tabs?.[0],
    ...SEED_SLOTS[index],
    w: 2,
    h: 3,
  }))
}

export const SEED_VIEWS: CustomView[] = [
  {
    id: 'v1',
    title: 'Miami VIPs',
    visibility: 'Only me',
    sharedWith: [],
    modules: seedModules('v1', ['liveFeed', 'calendar', 'attendance', 'logs']),
  },
  {
    id: 'v2',
    title: 'Miami Attendance',
    visibility: 'Only me',
    sharedWith: [],
    modules: seedModules('v2', ['attendance', 'ticketing', 'logs', 'weather']),
  },
  {
    id: 'v3',
    title: 'team USA flights',
    visibility: 'Anyone at FIFA',
    sharedWith: [],
    modules: seedModules('v3', ['calendar', 'liveLocation', 'logs', 'weather']),
  },
  {
    id: 'v4',
    title: 'Boston Security',
    visibility: 'Only me',
    sharedWith: [],
    modules: seedModules('v4', ['liveFeed', 'liveLocation', 'logs', 'workforce']),
  },
  {
    id: 'v5',
    title: 'ESP v. CPV risks',
    visibility: 'Only me',
    sharedWith: [],
    modules: seedModules('v5', ['weather', 'logs', 'ticketing', 'social']),
  },
  {
    id: 'v6',
    title: 'GDL workforce tracking',
    visibility: 'Only me',
    sharedWith: [],
    modules: seedModules('v6', ['workforce', 'logs', 'calendar', 'attendance']),
  },
]

export const EXEC_BRIEF_ID = 'page-exec-brief'

const PAGE_META = {
  visibility: 'Anyone at FIFA' as Visibility,
  sharedWith: [] as string[],
  system: true as const,
}

export const SYSTEM_VIEWS: AppView[] = [
  {
    ...PAGE_META,
    id: 'page-home',
    title: 'Home',
    navLabel: 'Home',
    modules: place('page-home', [
      { kind: 'summary', col: 1, row: 1, w: 1, h: 8 },
      { kind: 'matches', col: 2, row: 1, w: 2, h: 5 },
      { kind: 'issues', col: 4, row: 1, w: 1, h: 3 },
      { kind: 'reports', col: 2, row: 6, w: 2, h: 3 },
      { kind: 'social', col: 4, row: 4, w: 1, h: 5 },
    ]),
  },
  {
    ...PAGE_META,
    id: EXEC_BRIEF_ID,
    title: 'Executive brief',
    navLabel: 'Executive brief',
    leftAction: 'tomAgenda',
    modules: place(EXEC_BRIEF_ID, [
      { kind: 'summary', col: 1, row: 1, w: 1, h: 8 },
      { kind: 'reports', col: 2, row: 1, w: 1, h: 3 },
      { kind: 'issues', col: 3, row: 1, w: 1, h: 3 },
      { kind: 'calendar', col: 4, row: 1, w: 1, h: 3 },
      { kind: 'matches', col: 2, row: 4, w: 2, h: 5 },
      { kind: 'social', col: 4, row: 4, w: 1, h: 5 },
    ]),
  },
  {
    ...PAGE_META,
    id: 'page-daily-brief',
    title: 'Daily brief',
    navLabel: 'Daily brief',
    modules: place('page-daily-brief', [
      { kind: 'reports', col: 1, row: 1, w: 2, h: 3 },
      { kind: 'issues', col: 3, row: 1, w: 2, h: 3 },
      { kind: 'calendar', col: 1, row: 4, w: 1, h: 5 },
      { kind: 'matches', col: 2, row: 4, w: 3, h: 5 },
    ]),
  },
  {
    ...PAGE_META,
    id: 'page-tom',
    title: 'Tournament Ops Meeting',
    navLabel: 'Tournament Ops Meeting',
    modules: place('page-tom', [
      { kind: 'summary', col: 1, row: 1, w: 1, h: 8 },
      { kind: 'calendar', col: 2, row: 1, w: 2, h: 3 },
      { kind: 'issues', col: 4, row: 1, w: 1, h: 3 },
      { kind: 'matches', col: 2, row: 4, w: 3, h: 5 },
    ]),
  },
  {
    ...PAGE_META,
    id: 'page-host-cities',
    title: 'Host cities',
    navLabel: 'Host cities',
    modules: place('page-host-cities', [
      { kind: 'issues', col: 1, row: 1, w: 2, h: 4 },
      { kind: 'calendar', col: 3, row: 1, w: 2, h: 4 },
      { kind: 'reports', col: 1, row: 5, w: 2, h: 4 },
      { kind: 'social', col: 3, row: 5, w: 2, h: 4 },
    ]),
  },
  {
    ...PAGE_META,
    id: 'page-stadiums',
    title: 'Stadiums',
    navLabel: 'Stadiums',
    modules: place('page-stadiums', [
      { kind: 'reports', col: 1, row: 1, w: 2, h: 3 },
      { kind: 'liveLocation', col: 3, row: 1, w: 2, h: 5 },
      { kind: 'attendance', col: 1, row: 4, w: 1, h: 5 },
      { kind: 'ticketing', col: 2, row: 4, w: 1, h: 5 },
    ]),
  },
  {
    ...PAGE_META,
    id: 'page-matches',
    title: 'Matches',
    navLabel: 'Matches',
    modules: place('page-matches', [
      { kind: 'matches', col: 1, row: 1, w: 4, h: 5 },
      { kind: 'ticketing', col: 1, row: 6, w: 2, h: 3 },
      { kind: 'attendance', col: 3, row: 6, w: 2, h: 3 },
    ]),
  },
]

/** Women's World Cup system pages (includes dedicated Issues board). */
export const WWC_SYSTEM_VIEWS: AppView[] = [
  ...SYSTEM_VIEWS,
  {
    ...PAGE_META,
    id: ISSUES_PAGE_ID,
    title: 'Issues',
    navLabel: 'Issues',
    layout: 'issues',
    modules: [],
  },
]

/** FIFA Corporate: Executive Reporting full-page app only. */
export const CORPORATE_SYSTEM_VIEWS: AppView[] = [
  {
    ...PAGE_META,
    id: EXEC_REPORT_PAGE_ID,
    title: 'Executive Reporting',
    navLabel: 'Executive Reporting',
    layout: 'exec-report',
    modules: [],
  },
]
