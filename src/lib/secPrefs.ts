import { emptyFilters } from './secReports'
import type { SavedView } from '../data/sec/types'

const STORAGE_KEY = 'cockpit.secReports.v1'

export type SecPrefs = {
  version: 1
  stars: number[]
  views: SavedView[]
}

function fallbackPrefs(): SecPrefs {
  return { version: 1, stars: [], views: [] }
}

export function loadSecPrefs(): SecPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallbackPrefs()
    const parsed = JSON.parse(raw) as Partial<SecPrefs>
    if (parsed.version !== 1 || !Array.isArray(parsed.stars) || !Array.isArray(parsed.views)) {
      return fallbackPrefs()
    }
    return { version: 1, stars: parsed.stars, views: parsed.views }
  } catch {
    return fallbackPrefs()
  }
}

export function saveSecPrefs(prefs: SecPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    return true
  } catch {
    return false
  }
}

export function defaultSavedView(partial?: Partial<SavedView>): SavedView {
  return {
    id: `view-${Date.now()}`,
    name: 'Untitled view',
    filters: emptyFilters(),
    search: '',
    columnSearches: {},
    columnFilters: {},
    grouping: 'flat',
    groupFields: [],
    sort: null,
    columns: [
      'questionnaire_name',
      'checktitle',
      'owners',
      'city',
      'textresponse',
      'section_name',
    ],
    density: 'comfortable',
    acrossQuestionId: '',
    ...partial,
  }
}
