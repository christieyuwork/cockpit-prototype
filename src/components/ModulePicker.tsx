import { useMemo, useState } from 'react'
import {
  MODULE_CATALOG,
  MODULE_TAGS,
  type ModuleKind,
  type ModuleTag,
} from '../data/customViews'
import { ModuleBody } from './ModuleBody'
import './ModulePicker.css'

export type ModuleCounts = Partial<Record<ModuleKind, number>>

export function ModulePicker({
  viewTitle,
  existingCounts = {},
  seedDefaults = true,
  onBack,
  onConfirm,
}: {
  viewTitle: string
  existingCounts?: ModuleCounts
  seedDefaults?: boolean
  onBack: () => void
  onConfirm: (counts: ModuleCounts) => void
}) {
  const [tags, setTags] = useState<ModuleTag[]>([...MODULE_TAGS])
  const [railOpen, setRailOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [counts, setCounts] = useState<ModuleCounts>(() =>
    Object.fromEntries(
      MODULE_CATALOG.map((module) => [
        module.kind,
        existingCounts[module.kind] ?? (seedDefaults ? module.initialCount : 0),
      ]),
    ),
  )
  const [tabs, setTabs] = useState<Partial<Record<ModuleKind, string>>>({})

  const allSelected = tags.length === MODULE_TAGS.length

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return MODULE_CATALOG.filter((module) => {
      if (!module.tags.some((tag) => tags.includes(tag))) return false
      if (!needle) return true
      return module.title.toLowerCase().includes(needle)
    })
  }, [query, tags])

  const toAdd = MODULE_CATALOG.reduce((sum, module) => {
    const want = counts[module.kind] ?? 0
    const have = existingCounts[module.kind] ?? 0
    return sum + Math.max(0, want - have)
  }, 0)

  const hasChanges = MODULE_CATALOG.some(
    (module) => (counts[module.kind] ?? 0) !== (existingCounts[module.kind] ?? 0),
  )

  function toggleTag(tag: ModuleTag) {
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    )
  }

  function toggleSelectAll() {
    setTags(allSelected ? [] : [...MODULE_TAGS])
  }

  function step(kind: ModuleKind, delta: number) {
    setCounts((current) => ({
      ...current,
      [kind]: Math.max(0, Math.min(4, (current[kind] ?? 0) + delta)),
    }))
  }

  return (
    <div className="picker">
      <aside className={`picker__rail${railOpen ? '' : ' is-collapsed'}`}>
        <div className="picker__rail-head">
          {railOpen ? <span className="picker__rail-title">Tags</span> : null}
          <button
            type="button"
            className="picker__rail-toggle"
            aria-label={railOpen ? 'Collapse tags' : 'Expand tags'}
            aria-expanded={railOpen}
            onClick={() => setRailOpen((open) => !open)}
          >
            <img src="/assets/icons/minimize.svg" alt="" width={18} height={18} />
          </button>
        </div>
        {railOpen ? (
          <>
            <div className="picker__search">
              <span className="icon-box">
                <img className="icon" src="/assets/icons/search.svg" alt="" />
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search modules"
                aria-label="Search modules"
              />
            </div>
            <div className="picker__tags">
              <label className="picker__tag picker__tag--all">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                <span className="picker__checkbox" aria-hidden />
                Select all
              </label>
              {MODULE_TAGS.map((tag) => (
                <label key={tag} className="picker__tag">
                  <input
                    type="checkbox"
                    checked={tags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                  />
                  <span className="picker__checkbox" aria-hidden />
                  {tag}
                </label>
              ))}
            </div>
          </>
        ) : null}
      </aside>

      <div className="picker__main">
        <div className="picker__head">
          <span className="picker__title">Select modules: {viewTitle}</span>
          <div className="picker__head-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={!hasChanges}
              onClick={() => onConfirm(counts)}
            >
              {toAdd > 0 ? `Add modules (${toAdd})` : 'Update modules'}
              <img src="/assets/icons/go.svg" alt="" width={14} height={14} />
            </button>
            <button type="button" className="picker__cancel" onClick={onBack}>
              Cancel
            </button>
          </div>
        </div>

        <div className="picker__grid scroll-area">
          {visible.map((module) => {
            const count = counts[module.kind] ?? 0
            return (
              <section
                key={module.kind}
                className={`picker__card acrylic-card${count > 0 ? ' is-selected' : ''}`}
              >
                <header className="picker__card-head">
                  <span className="section-title picker__card-title">
                    {module.title}
                    <span className="icon-box">
                      <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
                    </span>
                  </span>
                  <div className="picker__stepper">
                    <button
                      type="button"
                      aria-label={`Remove one ${module.title} module`}
                      disabled={count === 0}
                      onClick={() => step(module.kind, -1)}
                    >
                      <img src="/assets/icons/minus.svg" alt="" width={12} height={12} />
                    </button>
                    <span className="picker__count">{count}</span>
                    <button
                      type="button"
                      aria-label={`Add one ${module.title} module`}
                      onClick={() => step(module.kind, 1)}
                    >
                      <img src="/assets/icons/plus.svg" alt="" width={12} height={12} />
                    </button>
                  </div>
                </header>
                <div className="picker__card-tags">
                  {module.tags.map((tag) => (
                    <span key={tag} className="picker__card-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="picker__card-body">
                  <ModuleBody
                    kind={module.kind}
                    tabs={module.tabs}
                    tab={tabs[module.kind] ?? module.tabs?.[0]}
                    onTabChange={(tab) => setTabs((current) => ({ ...current, [module.kind]: tab }))}
                    w={module.defaultSize.w}
                    h={module.defaultSize.h}
                    preview={module.kind === 'matches'}
                    hideFilters
                  />
                </div>
              </section>
            )
          })}
          {visible.length === 0 ? (
            <p className="picker__empty">
              {query.trim()
                ? 'No modules match your search.'
                : 'Select at least one tag to see available modules.'}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
