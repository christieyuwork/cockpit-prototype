export const SOURCE_COLUMNS = [
  'checklisttitle',
  'jobcategories',
  'startdate',
  'sitename',
  'textresponse',
  'jobtype',
  'fdh_runtime_identifier',
  'checklistitemid',
  'otherdepartments',
  'fdh_fullrecordhash',
  'owners',
  'reportjobs',
  'headlinestatus',
  'priority',
  'status',
  'jobtitle',
  'longitude',
  'latitude',
  'checktitle',
  'checklistitemdescription',
  'privacystatus',
  'fdh_inserttimestamp',
  'jobid',
  'responsetype',
  'primarydepartment',
  'fdh_updatetimestamp',
  'duedate',
  'abbreviation',
  'checkresponse',
  'zones',
  'stadium',
  'stadiumcode',
  'city',
  'citycode',
  'areas',
  'fa',
  'event',
] as const

export type SourceColumn = (typeof SOURCE_COLUMNS)[number]

export type SecRecord = {
  checklisttitle: string
  jobcategories: string
  startdate: string
  sitename: string
  textresponse: string
  jobtype: string
  fdh_runtime_identifier: string
  checklistitemid: number
  otherdepartments: string
  fdh_fullrecordhash: string
  owners: string
  reportjobs: string
  headlinestatus: string
  priority: string
  status: string
  jobtitle: string
  longitude: number
  latitude: number
  checktitle: string
  checklistitemdescription: string
  privacystatus: string
  fdh_inserttimestamp: string
  jobid: number
  responsetype: string
  primarydepartment: string
  fdh_updatetimestamp: string
  duedate: string
  abbreviation: string
  checkresponse: string
  zones: string
  stadium: string
  stadiumcode: string
  city: string
  citycode: string
  areas: string
  fa: string
  event: string
  questionnaire_id: string
  questionnaire_name: string
  questionnaire_version: number
  section_id: string
  section_name: string
  section_order: number
  question_id: string
  question_order: number
  subarea: string
  reporting_date: string
  reporting_cadence: string
}

export type DateScope = 'latest' | 'all'

export type GroupPreset =
  | 'flat'
  | 'question'
  | 'cityVenue'
  | 'owner'
  | 'questionnaire'
  | 'starred'
  | 'acrossTime'

export type ColumnKey =
  | 'checktitle'
  | 'textresponse'
  | 'city'
  | 'stadium'
  | 'owners'
  | 'reporting_date'
  | 'questionnaire_name'
  | 'section_name'
  | 'subarea'
  | 'responsetype'
  | 'priority'
  | 'status'
  | 'checkresponse'

export type SortDir = 'asc' | 'desc'

export type SortSpec = { key: ColumnKey; dir: SortDir }

export type GroupField =
  | 'question_id'
  | 'city'
  | 'stadium'
  | 'venue'
  | 'owners'
  | 'jobid'
  | 'questionnaire_id'
  | 'section_id'
  | 'reporting_date'
  | 'subarea'

export type FilterState = {
  questionnaires: string[]
  fas: string[]
  sections: string[]
  subareas: string[]
  cities: string[]
  venues: string[]
  owners: string[]
  responseTypes: string[]
  priorities: string[]
  statuses: string[]
  completions: string[]
  dateFrom: string
  dateTo: string
  dateScope: DateScope
}

export type SavedView = {
  id: string
  name: string
  filters: FilterState
  search: string
  columnSearches: Partial<Record<ColumnKey, string>>
  columnFilters?: Partial<Record<ColumnKey, string[]>>
  grouping: GroupPreset
  groupFields: GroupField[]
  sort: SortSpec | null
  columns: ColumnKey[]
  density: 'comfortable' | 'compact'
  acrossQuestionId: string
}

export type GroupNode = {
  id: string
  field: GroupField
  key: string
  label: string
  order: number
  rows: SecRecord[]
  children?: GroupNode[]
  responseCount: number
  reportCount: number
}
