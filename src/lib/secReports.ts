import recordsJson from '../data/sec/SEC_Sample_Data.json'
import {
  SOURCE_COLUMNS,
  type ColumnKey,
  type FilterState,
  type GroupField,
  type GroupNode,
  type GroupPreset,
  type SecRecord,
  type SortSpec,
} from '../data/sec/types'

export const SEC_RECORDS = recordsJson as SecRecord[]

export const DEFAULT_COLUMNS: ColumnKey[] = [
  'questionnaire_name',
  'checktitle',
  'owners',
  'city',
  'textresponse',
  'section_name',
]

export const OPTIONAL_COLUMNS: ColumnKey[] = [
  'reporting_date',
  'subarea',
  'responsetype',
  'priority',
  'status',
  'checkresponse',
]

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  checktitle: 'Question',
  textresponse: 'Response',
  city: 'City',
  stadium: 'Venue',
  owners: 'Owner',
  reporting_date: 'Reporting date',
  questionnaire_name: 'Questionnaire',
  section_name: 'Section / sub-area',
  subarea: 'SEC subarea',
  responsetype: 'Response type',
  priority: 'Priority',
  status: 'Report status',
  checkresponse: 'Question completion',
}

export const GROUPABLE_COLUMNS: ColumnKey[] = [
  'checktitle',
  'city',
  'stadium',
  'owners',
  'reporting_date',
  'questionnaire_name',
  'section_name',
  'subarea',
]

export function emptyFilters(records: SecRecord[] = SEC_RECORDS): FilterState {
  const dates = uniqueSorted(records.map((row) => row.reporting_date))
  const today = dates[dates.length - 1] ?? ''
  return {
    questionnaires: [],
    fas: ['SEC'],
    sections: [],
    subareas: [],
    cities: [],
    venues: [],
    owners: [],
    responseTypes: [],
    priorities: [],
    statuses: [],
    completions: [],
    dateFrom: today,
    dateTo: today,
    dateScope: 'latest',
  }
}

export function identityKey(row: SecRecord) {
  return `${row.question_id}|${row.stadiumcode}|${row.questionnaire_version}`
}

export function venueLabel(row: SecRecord) {
  return `${row.city} / ${row.stadium}`
}

export function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

function inRange(date: string, from: string, to: string) {
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

function includesFilter(selected: string[], value: string) {
  return selected.length === 0 || selected.includes(value)
}

export function recordField(row: SecRecord, key: ColumnKey): string {
  return String(row[key] ?? '')
}

export function applyLatest(rows: SecRecord[]) {
  const latest = new Map<string, SecRecord>()
  for (const row of rows) {
    const key = identityKey(row)
    const current = latest.get(key)
    if (!current || row.reporting_date > current.reporting_date) latest.set(key, row)
  }
  return [...latest.values()]
}

function matchesColumnSearches(row: SecRecord, searches: Partial<Record<ColumnKey, string>>) {
  return (Object.entries(searches) as [ColumnKey, string][]).every(([key, query]) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return recordField(row, key).toLowerCase().includes(q)
  })
}

function matchesGlobalSearch(row: SecRecord, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    row.checktitle,
    row.textresponse,
    row.owners,
    row.questionnaire_name,
    row.section_name,
    row.city,
    row.stadium,
    row.subarea,
    row.jobtitle,
    row.checklisttitle,
  ]
    .join('\n')
    .toLowerCase()
  return haystack.includes(q)
}

export function filterRecords(
  rows: SecRecord[],
  filters: FilterState,
  options: {
    search?: string
    columnSearches?: Partial<Record<ColumnKey, string>>
    starredIds?: Set<number>
    starredOnly?: boolean
    skipLatest?: boolean
  } = {},
) {
  const ranged = rows.filter((row) => inRange(row.reporting_date, filters.dateFrom, filters.dateTo))
  const scoped =
    filters.dateScope === 'latest' && !options.skipLatest ? applyLatest(ranged) : ranged
  return scoped.filter((row) => {
    if (options.starredOnly && options.starredIds && !options.starredIds.has(row.checklistitemid)) {
      return false
    }
    if (!includesFilter(filters.questionnaires, row.questionnaire_name)) return false
    if (!includesFilter(filters.fas, row.fa)) return false
    if (!includesFilter(filters.sections, row.section_name)) return false
    if (!includesFilter(filters.subareas, row.subarea)) return false
    if (!includesFilter(filters.cities, row.city)) return false
    if (!includesFilter(filters.venues, row.stadium)) return false
    if (!includesFilter(filters.owners, row.owners)) return false
    if (!includesFilter(filters.responseTypes, row.responsetype)) return false
    if (!includesFilter(filters.priorities, row.priority)) return false
    if (!includesFilter(filters.statuses, row.status)) return false
    if (!includesFilter(filters.completions, row.checkresponse)) return false
    if (!matchesColumnSearches(row, options.columnSearches ?? {})) return false
    if (!matchesGlobalSearch(row, options.search ?? '')) return false
    return true
  })
}

function numericValue(value: string) {
  const n = Number(value.replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : null
}

export function compareRows(a: SecRecord, b: SecRecord, sort: SortSpec | null) {
  if (!sort) {
    const section = a.section_order - b.section_order
    if (section) return section
    const question = a.question_order - b.question_order
    if (question) return question
    return a.reporting_date.localeCompare(b.reporting_date)
  }
  const av = recordField(a, sort.key)
  const bv = recordField(b, sort.key)
  if (sort.key === 'textresponse' && /numeric/i.test(a.responsetype)) {
    const an = numericValue(av)
    const bn = numericValue(bv)
    if (an != null && bn != null) return sort.dir === 'asc' ? an - bn : bn - an
  }
  if (sort.key === 'reporting_date' || sort.key === 'section_name') {
    const order =
      sort.key === 'section_name'
        ? a.section_order - b.section_order
        : av.localeCompare(bv)
    return sort.dir === 'asc' ? order : -order
  }
  const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' })
  return sort.dir === 'asc' ? cmp : -cmp
}

export function sortRows(rows: SecRecord[], sort: SortSpec | null) {
  return [...rows].sort((a, b) => compareRows(a, b, sort))
}

export function reportCount(rows: SecRecord[]) {
  return new Set(rows.map((row) => row.jobid)).size
}

function groupMeta(row: SecRecord, field: GroupField): { key: string; label: string; order: number } {
  switch (field) {
    case 'question_id':
      return { key: row.question_id, label: row.checktitle, order: row.question_order }
    case 'city':
      return { key: row.city, label: row.city, order: 0 }
    case 'stadium':
      return { key: row.stadiumcode, label: row.stadium, order: 0 }
    case 'venue':
      return { key: row.stadiumcode, label: venueLabel(row), order: 0 }
    case 'owners':
      return { key: row.owners, label: row.owners, order: 0 }
    case 'jobid':
      return { key: String(row.jobid), label: row.jobtitle, order: 0 }
    case 'questionnaire_id':
      return { key: row.questionnaire_id, label: row.questionnaire_name, order: 0 }
    case 'section_id':
      return { key: row.section_id, label: row.section_name, order: row.section_order }
    case 'reporting_date':
      return { key: row.reporting_date, label: row.reporting_date, order: 0 }
    case 'subarea':
      return { key: row.subarea, label: row.subarea, order: 0 }
  }
}

export function groupRecords(
  rows: SecRecord[],
  fields: GroupField[],
  sort: SortSpec | null,
  parentId = 'root',
): GroupNode[] {
  if (fields.length === 0) return []
  const [field, ...rest] = fields
  const buckets = new Map<string, { meta: ReturnType<typeof groupMeta>; rows: SecRecord[] }>()
  for (const row of rows) {
    const meta = groupMeta(row, field)
    const bucket = buckets.get(meta.key)
    if (bucket) bucket.rows.push(row)
    else buckets.set(meta.key, { meta, rows: [row] })
  }
  return [...buckets.values()]
    .sort((a, b) => a.meta.order - b.meta.order || a.meta.label.localeCompare(b.meta.label))
    .map((bucket) => {
      const id = `${parentId}/${field}:${bucket.meta.key}`
      const leafRows = rest.length === 0 ? sortRows(bucket.rows, sort) : bucket.rows
      return {
        id,
        field,
        key: bucket.meta.key,
        label: bucket.meta.label,
        order: bucket.meta.order,
        rows: leafRows,
        children: rest.length ? groupRecords(bucket.rows, rest, sort, id) : undefined,
        responseCount: bucket.rows.length,
        reportCount: reportCount(bucket.rows),
      }
    })
}

export function presetFields(preset: GroupPreset): GroupField[] {
  switch (preset) {
    case 'question':
      return ['question_id', 'venue']
    case 'cityVenue':
      return ['city', 'stadium']
    case 'owner':
      return ['owners', 'jobid']
    case 'questionnaire':
      return ['questionnaire_id', 'section_id']
    default:
      return []
  }
}

export function columnToGroupField(key: ColumnKey): GroupField | null {
  switch (key) {
    case 'checktitle':
      return 'question_id'
    case 'city':
      return 'city'
    case 'stadium':
      return 'stadium'
    case 'owners':
      return 'owners'
    case 'reporting_date':
      return 'reporting_date'
    case 'questionnaire_name':
      return 'questionnaire_id'
    case 'section_name':
      return 'section_id'
    case 'subarea':
      return 'subarea'
    default:
      return null
  }
}

export function csvEscape(value: string | number) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function recordsToCsv(rows: SecRecord[]) {
  const header = SOURCE_COLUMNS.join(',')
  const body = rows
    .map((row) => SOURCE_COLUMNS.map((column) => csvEscape(row[column])).join(','))
    .join('\r\n')
  return `${header}\r\n${body}`
}

export function recordsToJson(rows: SecRecord[]) {
  return JSON.stringify(rows, null, 2)
}

export function snippet(text: string, query: string, radius = 42) {
  const q = query.trim()
  if (!q) return text.slice(0, radius * 2)
  const index = text.toLowerCase().indexOf(q.toLowerCase())
  if (index < 0) return text.slice(0, radius * 2)
  const start = Math.max(0, index - radius)
  const end = Math.min(text.length, index + q.length + radius)
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
}

export function highlightParts(text: string, query: string) {
  const q = query.trim()
  if (!q) return [{ text, match: false }]
  const parts: { text: string; match: boolean }[] = []
  const lower = text.toLowerCase()
  const needle = q.toLowerCase()
  let cursor = 0
  let index = lower.indexOf(needle, cursor)
  while (index >= 0) {
    if (index > cursor) parts.push({ text: text.slice(cursor, index), match: false })
    parts.push({ text: text.slice(index, index + q.length), match: true })
    cursor = index + q.length
    index = lower.indexOf(needle, cursor)
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })
  return parts
}

export function historyFor(row: SecRecord, all: SecRecord[] = SEC_RECORDS) {
  return all
    .filter(
      (item) =>
        item.question_id === row.question_id &&
        item.stadiumcode === row.stadiumcode &&
        item.questionnaire_version === row.questionnaire_version,
    )
    .sort((a, b) => b.reporting_date.localeCompare(a.reporting_date))
}

export function latestFor(row: SecRecord, all: SecRecord[] = SEC_RECORDS) {
  return applyLatest(
    all.filter(
      (item) =>
        item.question_id === row.question_id &&
        item.stadiumcode === row.stadiumcode &&
        item.questionnaire_version === row.questionnaire_version,
    ),
  )[0]
}

export function facetValues(rows: SecRecord[]) {
  return {
    questionnaires: uniqueSorted(rows.map((row) => row.questionnaire_name)),
    fas: uniqueSorted(rows.map((row) => row.fa)),
    sections: uniqueSorted(rows.map((row) => row.section_name)),
    subareas: uniqueSorted(rows.map((row) => row.subarea)),
    cities: uniqueSorted(rows.map((row) => row.city)),
    venues: uniqueSorted(rows.map((row) => row.stadium)),
    owners: uniqueSorted(rows.map((row) => row.owners)),
    responseTypes: uniqueSorted(rows.map((row) => row.responsetype)),
    priorities: uniqueSorted(rows.map((row) => row.priority)),
    statuses: uniqueSorted(rows.map((row) => row.status)),
    completions: uniqueSorted(rows.map((row) => row.checkresponse)),
    dates: uniqueSorted(rows.map((row) => row.reporting_date)),
    questions: uniqueSorted(rows.map((row) => row.checktitle)),
  }
}
