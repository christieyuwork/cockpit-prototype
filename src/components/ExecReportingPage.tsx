import { Fragment, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import {
  DEMO_ATTACHMENT_POOL,
  FA_OPTIONS,
  TAG_CATALOG,
  UPSTREAM_ORGS,
  avatarColor,
  cloneTopics,
  cloneUpstream,
  emptyIntakeDraft,
  faDisplay,
  intakeFromUpstream,
  intakeToTopic,
  knowWindowLabel,
  knowWindowSortRank,
  urgencyClass,
  type ExecAttachment,
  type ExecFa,
  type ExecTopic,
  type IntakeDraft,
  type KnowWindow,
  type SavedIntakeDraft,
  type Urgency,
  type UpstreamCandidate,
} from '../data/execReporting'
import './ExecReportingPage.css'

type PageTab = 'active' | 'triage' | 'archive'

type CategoryFilter =
  | { kind: 'tag'; value: string }
  | { kind: 'owner'; value: string }
  | { kind: 'fa'; value: string; fa: ExecFa }
  | { kind: 'upstream'; value: string }

type SearchFilter = 'all' | 'people' | 'topics' | 'tags' | 'areas' | 'upstream' | 'files'

const SEARCH_FILTERS: { id: SearchFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'people', label: 'People' },
  { id: 'topics', label: 'Topics' },
  { id: 'tags', label: 'Tags' },
  { id: 'areas', label: 'Areas' },
  { id: 'upstream', label: 'Upstream' },
  { id: 'files', label: 'Files' },
]

function formatCommentAt(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function categoryTitle(filter: CategoryFilter) {
  if (filter.kind === 'tag') return `#${filter.value}`
  if (filter.kind === 'owner') return filter.value
  if (filter.kind === 'fa') return faDisplay(filter.fa)
  return filter.value
}

function categoryEyebrow(filter: CategoryFilter) {
  if (filter.kind === 'tag') return 'Tag'
  if (filter.kind === 'owner') return 'Owner'
  if (filter.kind === 'fa') return 'Functional area'
  return 'Upstreamed by'
}

function topicMatchesCategory(topic: ExecTopic, filter: CategoryFilter) {
  if (filter.kind === 'tag') {
    return topic.tags.some((tag) => tag.toLowerCase() === filter.value.toLowerCase())
  }
  if (filter.kind === 'owner') return topic.owner === filter.value
  if (filter.kind === 'fa') {
    return topic.fa.code === filter.fa.code && topic.fa.label === filter.fa.label
  }
  return topic.upstreamOrg === filter.value
}

function upstreamMatchesCategory(item: UpstreamCandidate, filter: CategoryFilter): boolean {
  if (filter.kind === 'tag') {
    return (item.tags ?? []).some((tag) => tag.toLowerCase() === filter.value.toLowerCase())
  }
  if (filter.kind === 'owner') return item.owner === filter.value
  if (filter.kind === 'fa') {
    return item.fa.code === filter.fa.code && item.fa.label === filter.fa.label
  }
  return item.upstreamOrg === filter.value
}

type ActiveSortKey = 'know' | 'urgency'
type SortDir = 'asc' | 'desc'

function knowWindowSectionLabel(window: KnowWindow): string {
  if (window === 'today') return 'Know today'
  if (window === 'tomorrow') return 'Know tomorrow'
  if (window === 'week') return 'Know this week'
  return 'Beyond this week'
}

function sortActiveTopics(
  list: ExecTopic[],
  sortKey: ActiveSortKey = 'know',
  sortDir: SortDir = 'asc',
) {
  const dir = sortDir === 'asc' ? 1 : -1
  return [...list].sort((a, b) => {
    if (sortKey === 'urgency') {
      if (a.urgency !== b.urgency) return (a.urgency - b.urgency) * dir
      const rank = knowWindowSortRank(a.knowWindow) - knowWindowSortRank(b.knowWindow)
      if (rank !== 0) return rank
      return a.sortDate.localeCompare(b.sortDate)
    }
    const rank = (knowWindowSortRank(a.knowWindow) - knowWindowSortRank(b.knowWindow)) * dir
    if (rank !== 0) return rank
    if (b.urgency !== a.urgency) return b.urgency - a.urgency
    return a.sortDate.localeCompare(b.sortDate)
  })
}

function groupTopicsByKnow(list: ExecTopic[]) {
  const order: KnowWindow[] = ['today', 'tomorrow', 'week', null]
  return order
    .map((window) => ({
      window,
      label: knowWindowSectionLabel(window),
      items: list.filter((topic) => topic.knowWindow === window),
    }))
    .filter((group) => group.items.length > 0)
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`exec-avatar${size === 'sm' ? ' exec-avatar--sm' : ''}`}
      style={{ backgroundColor: avatarColor(name) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}

function UrgencyCell({ level }: { level: Urgency }) {
  return <span className={`exec-urgency ${urgencyClass(level)}`}>{level}</span>
}

function AttachmentPreviewModal({
  file,
  onClose,
}: {
  file: ExecAttachment
  onClose: () => void
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="exec-modal__scrim"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="exec-modal exec-modal--preview acrylic-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exec-attach-title"
      >
        <header className="exec-modal__head">
          <div>
            <p className="exec-modal__eyebrow">Attachment preview</p>
            <h2 id="exec-attach-title">{file.name}</h2>
          </div>
          <button type="button" className="exec-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="exec-attach-preview">
          <span className="exec-attach-preview__kind">{file.kind}</span>
          <div className="exec-attach-preview__placeholder" aria-hidden>
            <p>File preview placeholder</p>
            <span>{file.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TopicDetailModal({
  topic,
  onClose,
  onChange,
  onPreviewAttachment,
  onOpenCategory,
}: {
  topic: ExecTopic
  onClose: () => void
  onChange: (next: ExecTopic) => void
  onPreviewAttachment: (file: ExecAttachment) => void
  onOpenCategory: (filter: CategoryFilter) => void
}) {
  const [tagDraft, setTagDraft] = useState('')
  const [commentDraft, setCommentDraft] = useState('')

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function addTag() {
    const value = tagDraft.trim()
    if (!value) return
    if (topic.tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setTagDraft('')
      return
    }
    onChange({ ...topic, tags: [...topic.tags, value] })
    setTagDraft('')
  }

  function removeTag(tag: string) {
    onChange({ ...topic, tags: topic.tags.filter((item) => item !== tag) })
  }

  function addAttachment() {
    const next = DEMO_ATTACHMENT_POOL[topic.attachments.length % DEMO_ATTACHMENT_POOL.length]
    onChange({
      ...topic,
      attachments: [
        ...topic.attachments,
        { ...next, id: `att-${Date.now()}-${topic.attachments.length}` },
      ],
    })
  }

  function addComment() {
    const text = commentDraft.trim()
    if (!text) return
    onChange({
      ...topic,
      comments: [
        ...topic.comments,
        {
          id: `c-${Date.now()}`,
          author: 'You',
          text,
          at: new Date().toISOString(),
        },
      ],
    })
    setCommentDraft('')
  }

  return (
    <div
      className="exec-modal__scrim"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="exec-modal acrylic-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exec-modal-title"
      >
        <header className="exec-modal__head">
          <div>
            <p className="exec-modal__eyebrow">Topic detail</p>
            <h2 id="exec-modal-title">{topic.title}</h2>
          </div>
          <button type="button" className="exec-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="exec-modal__body scroll-area">
          <p className="exec-modal__desc">{topic.description}</p>

          <div className="exec-modal__meta">
            <label>
              <span>Owner</span>
              <input
                value={topic.owner}
                onChange={(event) => onChange({ ...topic, owner: event.target.value })}
              />
            </label>
            <label>
              <span>Functional area</span>
              <select
                value={`${topic.fa.code}|${topic.fa.label}`}
                onChange={(event) => {
                  const match = FA_OPTIONS.find(
                    (item) => `${item.code}|${item.label}` === event.target.value,
                  )
                  if (match) onChange({ ...topic, fa: { ...match } })
                }}
              >
                {FA_OPTIONS.map((item) => (
                  <option key={`${item.code}-${item.label}`} value={`${item.code}|${item.label}`}>
                    {faDisplay(item)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select
                value={topic.status}
                onChange={(event) =>
                  onChange({ ...topic, status: event.target.value as ExecTopic['status'] })
                }
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              <span>Know window</span>
              <select
                value={topic.knowWindow ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  onChange({
                    ...topic,
                    knowWindow: (value === '' ? null : value) as KnowWindow,
                  })
                }}
              >
                <option value="today">Know today</option>
                <option value="tomorrow">Know tomorrow</option>
                <option value="week">Know this week</option>
                <option value="">Beyond this week</option>
              </select>
            </label>
            <label>
              <span>Urgency</span>
              <select
                value={topic.urgency}
                onChange={(event) =>
                  onChange({ ...topic, urgency: Number(event.target.value) as Urgency })
                }
              >
                {[5, 4, 3, 2, 1].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="exec-modal__chips">
            <CategoryChip
              kind="owner"
              label={topic.owner}
              onClick={() => onOpenCategory({ kind: 'owner', value: topic.owner })}
            />
            <CategoryChip
              kind="fa"
              fa={topic.fa}
              onClick={() =>
                onOpenCategory({ kind: 'fa', value: faDisplay(topic.fa), fa: topic.fa })
              }
            />
            <CategoryChip
              kind="upstream"
              label={topic.upstreamOrg}
              onClick={() => onOpenCategory({ kind: 'upstream', value: topic.upstreamOrg })}
            />
          </div>

          {topic.source ? (
            <div className="exec-modal__source">
              <strong>Upstream detail</strong>
              <p>
                By {topic.source.upstreamedBy}
                {topic.source.cockpitLabel ? ` · ${topic.source.cockpitLabel}` : ''}:{' '}
                {topic.source.reason}
              </p>
            </div>
          ) : null}

          <label className="exec-modal__block">
            <span>Latest developments</span>
            <textarea
              rows={3}
              value={topic.latestDevelopments}
              onChange={(event) => onChange({ ...topic, latestDevelopments: event.target.value })}
            />
          </label>
          <label className="exec-modal__block">
            <span>Actions taken</span>
            <textarea
              rows={3}
              value={topic.actionsTaken}
              onChange={(event) => onChange({ ...topic, actionsTaken: event.target.value })}
            />
          </label>
          <label className="exec-modal__block">
            <span>Next steps</span>
            <textarea
              rows={3}
              value={topic.nextSteps}
              onChange={(event) => onChange({ ...topic, nextSteps: event.target.value })}
            />
          </label>

          <section className="exec-modal__section">
            <h3>Tags</h3>
            <div className="exec-modal__tags">
              {topic.tags.map((tag) => (
                <CategoryChip
                  key={tag}
                  kind="tag"
                  label={tag}
                  removable
                  onRemove={() => removeTag(tag)}
                  onClick={() => onOpenCategory({ kind: 'tag', value: tag })}
                />
              ))}
            </div>
            <div className="exec-modal__tag-add">
              <input
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add a tag"
              />
              <button type="button" className="exec-btn" onClick={addTag}>
                Add tag
              </button>
            </div>
          </section>

          <section className="exec-modal__section">
            <div className="exec-modal__section-head">
              <h3>Attachments</h3>
              <button type="button" className="exec-btn" onClick={addAttachment}>
                Add attachment
              </button>
            </div>
            {topic.attachments.length === 0 ? (
              <p className="exec-empty">No reference files yet.</p>
            ) : (
              <ul className="exec-attach-list">
                {topic.attachments.map((file) => (
                  <li key={file.id}>
                    <span className="exec-attach-list__kind">{file.kind}</span>
                    <button
                      type="button"
                      className="exec-attach-link"
                      onClick={() => onPreviewAttachment(file)}
                    >
                      {file.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="exec-modal__section">
            <h3>Comments</h3>
            <div className="exec-comments">
              {topic.comments.length === 0 ? (
                <p className="exec-empty">No comments yet.</p>
              ) : (
                topic.comments.map((comment) => (
                  <article key={comment.id} className="exec-comment">
                    <header>
                      <strong>{comment.author}</strong>
                      <time dateTime={comment.at}>{formatCommentAt(comment.at)}</time>
                    </header>
                    <p>{comment.text}</p>
                  </article>
                ))
              )}
            </div>
            <div className="exec-modal__comment-add">
              <textarea
                rows={2}
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Add a comment"
              />
              <button type="button" className="exec-btn exec-btn--accent" onClick={addComment}>
                Post comment
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function TagSearchPicker({
  selected,
  onAdd,
}: {
  selected: string[]
  onAdd: (tag: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const options = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TAG_CATALOG.filter((tag) => {
      if (selected.some((item) => item.toLowerCase() === tag.toLowerCase())) return false
      if (!q) return true
      return tag.toLowerCase().includes(q)
    }).slice(0, 12)
  }, [query, selected])

  const canCreate =
    query.trim().length > 0 &&
    !selected.some((item) => item.toLowerCase() === query.trim().toLowerCase()) &&
    !TAG_CATALOG.some((tag) => tag.toLowerCase() === query.trim().toLowerCase())

  return (
    <div className="exec-tag-picker" ref={rootRef}>
      <button
        type="button"
        className="exec-tag-chip exec-tag-chip--add"
        onClick={() => setOpen((value) => !value)}
      >
        + Add tag
      </button>
      {open ? (
        <div className="exec-tag-picker__panel acrylic-card">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tags"
            aria-label="Search tags"
          />
          <div className="exec-tag-picker__list scroll-area">
            {options.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  onAdd(tag)
                  setQuery('')
                  setOpen(false)
                }}
              >
                #{tag}
              </button>
            ))}
            {canCreate ? (
              <button
                type="button"
                onClick={() => {
                  onAdd(query.trim())
                  setQuery('')
                  setOpen(false)
                }}
              >
                Create #{query.trim()}
              </button>
            ) : null}
            {options.length === 0 && !canCreate ? (
              <p className="exec-empty">No matching tags.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PromoteIntakeModal({
  initialDraft,
  onClose,
  onConfirm,
  onSaveDraft,
}: {
  initialDraft: IntakeDraft
  onClose: () => void
  onConfirm: (draft: IntakeDraft) => void
  onSaveDraft: (draft: IntakeDraft) => void
}) {
  const [draft, setDraft] = useState<IntakeDraft>(() => ({
    ...initialDraft,
    fa: { ...initialDraft.fa },
    tags: [...initialDraft.tags],
    suggestedTags: [...(initialDraft.suggestedTags ?? [])],
    attachments: initialDraft.attachments.map((file) => ({ ...file })),
    source: initialDraft.source ? { ...initialDraft.source } : undefined,
  }))

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function update<K extends keyof IntakeDraft>(key: K, value: IntakeDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function addTag(tag: string) {
    const value = tag.trim()
    if (!value) return
    if (draft.tags.some((item) => item.toLowerCase() === value.toLowerCase())) return
    update('tags', [...draft.tags, value])
  }

  function removeTag(tag: string) {
    update(
      'tags',
      draft.tags.filter((item) => item !== tag),
    )
  }

  function addAttachment() {
    const next = DEMO_ATTACHMENT_POOL[draft.attachments.length % DEMO_ATTACHMENT_POOL.length]
    update('attachments', [
      ...draft.attachments,
      { ...next, id: `intake-att-${Date.now()}-${draft.attachments.length}` },
    ])
  }

  function removeAttachment(id: string) {
    update(
      'attachments',
      draft.attachments.filter((file) => file.id !== id),
    )
  }

  const suggestedVisible = draft.suggestedTags.filter(
    (tag) => !draft.tags.some((item) => item.toLowerCase() === tag.toLowerCase()),
  )

  return (
    <div
      className="exec-modal__scrim"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="exec-modal exec-modal--intake acrylic-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exec-intake-title"
      >
        <header className="exec-modal__head">
          <div>
            <p className="exec-modal__eyebrow">Add to tracker</p>
            <h2 id="exec-intake-title">
              {draft.fromUpstreamId ? 'Promote triage item' : 'Add issue manually'}
            </h2>
          </div>
          <button type="button" className="exec-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="exec-modal__body scroll-area">
          <section className="exec-intake-card">
            <h3>Executive intake</h3>
            <p className="exec-intake-card__hint">
              Complete this section before adding the item to the executive tracker.
            </p>

            <div className="exec-modal__meta">
              <label>
                <span>Need to know when</span>
                <select
                  value={draft.knowWindow ?? ''}
                  onChange={(event) => {
                    const value = event.target.value
                    update('knowWindow', (value === '' ? null : value) as KnowWindow)
                  }}
                >
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This week</option>
                  <option value="">Beyond this week</option>
                </select>
              </label>
              <label>
                <span>Upstreamed by</span>
                <select
                  value={draft.upstreamOrg}
                  onChange={(event) => update('upstreamOrg', event.target.value)}
                >
                  {UPSTREAM_ORGS.map((org) => (
                    <option key={org} value={org}>
                      {org}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="exec-modal__section">
              <h3>Suggested tags</h3>
              {suggestedVisible.length === 0 ? (
                <p className="exec-empty">No remaining suggestions.</p>
              ) : (
                <div className="exec-modal__tags">
                  {suggestedVisible.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="exec-tag-chip"
                      title={`#${tag}`}
                      onClick={() => addTag(tag)}
                    >
                      <span className="exec-chip-text">#{tag}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="exec-modal__tags exec-modal__tags--selected">
                {draft.tags.map((tag) => (
                  <span key={tag} className="exec-chip-wrap">
                    <span className="exec-tag-chip exec-tag-chip--static" title={`#${tag}`}>
                      <span className="exec-chip-text">#{tag}</span>
                    </span>
                    <button
                      type="button"
                      className="exec-chip-remove"
                      aria-label={`Remove ${tag}`}
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <TagSearchPicker selected={draft.tags} onAdd={addTag} />
              </div>
            </div>

            <div className="exec-modal__section">
              <div className="exec-modal__section-head">
                <h3>Relevant attachments</h3>
                <button type="button" className="exec-btn" onClick={addAttachment}>
                  Add attachment
                </button>
              </div>
              {draft.attachments.length === 0 ? (
                <p className="exec-empty">No attachments yet.</p>
              ) : (
                <ul className="exec-attach-list">
                  {draft.attachments.map((file) => (
                    <li key={file.id}>
                      <span className="exec-attach-list__kind">{file.kind}</span>
                      <span className="exec-attach-link">{file.name}</span>
                      <button
                        type="button"
                        className="exec-chip-remove"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => removeAttachment(file.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="exec-intake-details">
            <h3>Issue details</h3>
            <label className="exec-modal__block">
              <span>Title</span>
              <input value={draft.title} onChange={(event) => update('title', event.target.value)} />
            </label>
            <label className="exec-modal__block">
              <span>Description</span>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(event) => update('description', event.target.value)}
              />
            </label>
            <div className="exec-modal__meta">
              <label>
                <span>Owner</span>
                <input
                  value={draft.owner}
                  onChange={(event) => update('owner', event.target.value)}
                />
              </label>
              <label>
                <span>Functional area</span>
                <select
                  value={`${draft.fa.code}|${draft.fa.label}`}
                  onChange={(event) => {
                    const match = FA_OPTIONS.find(
                      (item) => `${item.code}|${item.label}` === event.target.value,
                    )
                    if (match) update('fa', { ...match })
                  }}
                >
                  {FA_OPTIONS.map((item) => (
                    <option key={`${item.code}-${item.label}`} value={`${item.code}|${item.label}`}>
                      {faDisplay(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Urgency</span>
                <select
                  value={draft.urgency}
                  onChange={(event) => update('urgency', Number(event.target.value) as Urgency)}
                >
                  {[5, 4, 3, 2, 1].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="exec-modal__block">
              <span>Latest developments</span>
              <textarea
                rows={3}
                value={draft.latestDevelopments}
                onChange={(event) => update('latestDevelopments', event.target.value)}
              />
            </label>
            <label className="exec-modal__block">
              <span>Actions taken</span>
              <textarea
                rows={3}
                value={draft.actionsTaken}
                onChange={(event) => update('actionsTaken', event.target.value)}
              />
            </label>
            <label className="exec-modal__block">
              <span>Next steps</span>
              <textarea
                rows={3}
                value={draft.nextSteps}
                onChange={(event) => update('nextSteps', event.target.value)}
              />
            </label>
            <label className="exec-modal__block">
              <span>Reason</span>
              <textarea
                rows={2}
                value={draft.reason}
                onChange={(event) => update('reason', event.target.value)}
              />
            </label>
          </section>
        </div>

        <footer className="exec-modal__footer">
          <button type="button" className="exec-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="exec-btn" onClick={() => onSaveDraft(draft)}>
            Save as draft
          </button>
          <button
            type="button"
            className="exec-btn exec-btn--accent"
            onClick={() => onConfirm(draft)}
          >
            Add to executive tracker
          </button>
        </footer>
      </div>
    </div>
  )
}

function CategoryChip({
  kind,
  label,
  fa,
  onClick,
  removable,
  onRemove,
}: {
  kind: 'tag' | 'owner' | 'fa' | 'upstream'
  label?: string
  fa?: ExecFa
  onClick: () => void
  removable?: boolean
  onRemove?: () => void
}) {
  function handleClick(event: MouseEvent) {
    event.stopPropagation()
    onClick()
  }

  if (kind === 'fa' && fa) {
    const full = faDisplay(fa)
    return (
      <button
        type="button"
        className="exec-fa-chip"
        onClick={handleClick}
        title={full}
      >
        <em>{fa.code}</em>
        <span className="exec-chip-text">{fa.label}</span>
      </button>
    )
  }

  if (kind === 'tag') {
    const full = `#${label}`
    return (
      <span className="exec-chip-wrap">
        <button
          type="button"
          className="exec-tag-chip"
          onClick={handleClick}
          title={full}
        >
          <span className="exec-chip-text">{full}</span>
        </button>
        {removable ? (
          <button
            type="button"
            className="exec-chip-remove"
            aria-label={`Remove ${label}`}
            onClick={(event) => {
              event.stopPropagation()
              onRemove?.()
            }}
          >
            ×
          </button>
        ) : null}
      </span>
    )
  }

  return (
    <button
      type="button"
      className={`exec-meta-chip is-${kind}`}
      onClick={handleClick}
      title={label}
    >
      {kind === 'owner' ? <Avatar name={label ?? ''} size="sm" /> : null}
      <span className="exec-chip-text">{label}</span>
    </button>
  )
}

function SmartSearch({
  topics,
  upstream,
  onOpenTopic,
  onOpenCategory,
  onOpenTriage,
}: {
  topics: ExecTopic[]
  upstream: UpstreamCandidate[]
  onOpenTopic: (id: string) => void
  onOpenCategory: (filter: CategoryFilter) => void
  onOpenTriage: () => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<SearchFilter>('all')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const q = query.trim().toLowerCase()

  const people = useMemo(() => {
    if (!q) return [] as string[]
    const names = new Set<string>()
    for (const topic of topics) {
      if (topic.owner.toLowerCase().includes(q)) names.add(topic.owner)
      if (topic.source?.upstreamedBy.toLowerCase().includes(q)) names.add(topic.source.upstreamedBy)
    }
    for (const item of upstream) {
      if (item.owner.toLowerCase().includes(q)) names.add(item.owner)
      if (item.upstreamedBy.toLowerCase().includes(q)) names.add(item.upstreamedBy)
    }
    return [...names].sort()
  }, [q, topics, upstream])

  const tags = useMemo(() => {
    if (!q) return [] as string[]
    const found = new Set<string>()
    for (const topic of topics) {
      for (const tag of topic.tags) {
        if (tag.toLowerCase().includes(q)) found.add(tag)
      }
    }
    for (const item of upstream) {
      for (const tag of item.tags ?? []) {
        if (tag.toLowerCase().includes(q)) found.add(tag)
      }
    }
    return [...found].sort()
  }, [q, topics, upstream])

  const areas = useMemo(() => {
    if (!q) return [] as ExecFa[]
    const map = new Map<string, ExecFa>()
    for (const topic of topics) {
      if (
        topic.fa.label.toLowerCase().includes(q) ||
        topic.fa.code.toLowerCase().includes(q) ||
        faDisplay(topic.fa).toLowerCase().includes(q)
      ) {
        map.set(`${topic.fa.code}|${topic.fa.label}`, topic.fa)
      }
    }
    for (const item of upstream) {
      if (
        item.fa.label.toLowerCase().includes(q) ||
        item.fa.code.toLowerCase().includes(q) ||
        faDisplay(item.fa).toLowerCase().includes(q)
      ) {
        map.set(`${item.fa.code}|${item.fa.label}`, item.fa)
      }
    }
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label))
  }, [q, topics, upstream])

  const upstreamOrgs = useMemo(() => {
    if (!q) return [] as string[]
    const found = new Set<string>()
    for (const topic of topics) {
      if (topic.upstreamOrg.toLowerCase().includes(q)) found.add(topic.upstreamOrg)
    }
    for (const item of upstream) {
      if (item.upstreamOrg.toLowerCase().includes(q)) found.add(item.upstreamOrg)
    }
    return [...found].sort()
  }, [q, topics, upstream])

  const topicHits = useMemo(() => {
    if (!q) return [] as ExecTopic[]
    return topics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(q) || topic.description.toLowerCase().includes(q),
    )
  }, [q, topics])

  const fileHits = useMemo(() => {
    if (!q) return [] as { topic: ExecTopic; file: ExecAttachment }[]
    const hits: { topic: ExecTopic; file: ExecAttachment }[] = []
    for (const topic of topics) {
      for (const file of topic.attachments) {
        if (file.name.toLowerCase().includes(q)) hits.push({ topic, file })
      }
    }
    for (const item of upstream) {
      for (const file of item.attachments) {
        if (file.name.toLowerCase().includes(q)) {
          hits.push({
            topic: {
              id: item.id,
              title: item.title,
              description: item.description,
              owner: item.owner,
              fa: item.fa,
              tags: item.tags ?? [],
              status: 'active',
              knowWindow: item.knowWindow ?? null,
              urgency: item.urgency,
              sortDate: '',
              upstreamOrg: item.upstreamOrg,
              latestDevelopments: '',
              actionsTaken: '',
              nextSteps: '',
              attachments: item.attachments,
              comments: [],
            },
            file,
          })
        }
      }
    }
    return hits
  }, [q, topics, upstream])

  const showPeople = filter === 'all' || filter === 'people'
  const showTopics = filter === 'all' || filter === 'topics'
  const showTags = filter === 'all' || filter === 'tags'
  const showAreas = filter === 'all' || filter === 'areas'
  const showUpstream = filter === 'all' || filter === 'upstream'
  const showFiles = filter === 'all' || filter === 'files'

  const hasQuery = q.length > 0
  const hasResults =
    (showPeople && people.length > 0) ||
    (showTags && tags.length > 0) ||
    (showAreas && areas.length > 0) ||
    (showUpstream && upstreamOrgs.length > 0) ||
    (showTopics && topicHits.length > 0) ||
    (showFiles && fileHits.length > 0)

  return (
    <div className={`exec-smart${open ? ' is-open' : ''}`} ref={rootRef}>
      <label className="exec-smart__field">
        <img src="/assets/icons/search.svg" alt="" width={16} height={16} />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search people, topics, tags…"
        />
      </label>

      {open ? (
        <div className="exec-smart__panel acrylic-card" role="listbox" aria-label="Search results">
          <div className="exec-smart__filters">
            {SEARCH_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`exec-smart__filter${filter === item.id ? ' is-active' : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {!hasQuery ? (
            <p className="exec-smart__hint">
              Try “transport”, an owner name, a tag, or an upstream team.
            </p>
          ) : !hasResults ? (
            <p className="exec-smart__hint">No matches for “{query.trim()}”.</p>
          ) : (
            <div className="exec-smart__body scroll-area">
              {showPeople && people.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>People</h3>
                  <div className="exec-smart__people">
                    {people.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className="exec-smart__person"
                        onClick={() => {
                          onOpenCategory({ kind: 'owner', value: name })
                          setOpen(false)
                        }}
                      >
                        <Avatar name={name} />
                        <span>{name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {showAreas && areas.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Functional areas</h3>
                  <div className="exec-smart__list">
                    {areas.map((area) => (
                      <button
                        key={`${area.code}-${area.label}`}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          onOpenCategory({
                            kind: 'fa',
                            value: faDisplay(area),
                            fa: area,
                          })
                          setOpen(false)
                        }}
                      >
                        <span className="exec-fa-chip exec-fa-chip--static">
                          <em>{area.code}</em>
                          <span className="exec-chip-text">{area.label}</span>
                        </span>
                        <span className="exec-smart__sub">Functional area</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {showTags && tags.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Tags</h3>
                  <div className="exec-smart__list">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          onOpenCategory({ kind: 'tag', value: tag })
                          setOpen(false)
                        }}
                      >
                        <span className="exec-smart__icon is-tag">#</span>
                        <span>
                          <strong>#{tag}</strong>
                          <span className="exec-smart__sub">Tag</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {showUpstream && upstreamOrgs.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Upstreamed by</h3>
                  <div className="exec-smart__list">
                    {upstreamOrgs.map((org) => (
                      <button
                        key={org}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          onOpenCategory({ kind: 'upstream', value: org })
                          setOpen(false)
                        }}
                      >
                        <span className="exec-smart__icon is-up">↑</span>
                        <span>
                          <strong>{org}</strong>
                          <span className="exec-smart__sub">Upstream category</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {showTopics && topicHits.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Topics</h3>
                  <div className="exec-smart__list">
                    {topicHits.slice(0, 8).map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          onOpenTopic(topic.id)
                          setOpen(false)
                        }}
                      >
                        <span className="exec-smart__icon is-topic">
                          <img src="/assets/icons/document.svg" alt="" width={14} height={14} />
                        </span>
                        <span>
                          <strong>{topic.title}</strong>
                          <span className="exec-smart__sub">
                            {topic.status === 'archived' ? 'Archive' : 'Active'} · {topic.owner}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {showFiles && fileHits.length > 0 ? (
                <section className="exec-smart__section">
                  <h3>Files</h3>
                  <div className="exec-smart__list">
                    {fileHits.slice(0, 8).map(({ topic, file }) => (
                      <button
                        key={`${topic.id}-${file.id}`}
                        type="button"
                        className="exec-smart__row"
                        onClick={() => {
                          if (topic.id.startsWith('up-')) {
                            onOpenTriage()
                          } else {
                            onOpenTopic(topic.id)
                          }
                          setOpen(false)
                        }}
                      >
                        <span className="exec-smart__icon is-file">
                          <img src="/assets/icons/document.svg" alt="" width={14} height={14} />
                        </span>
                        <span>
                          <strong>{file.name}</strong>
                          <span className="exec-smart__sub">In {topic.title}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {q.includes('transport') || topicHits.length || upstream.length ? (
                <button
                  type="button"
                  className="exec-smart__footer"
                  onClick={() => {
                    onOpenTriage()
                    setOpen(false)
                  }}
                >
                  Open Triage
                </button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function TopicTable({
  topics,
  showKnow,
  emptyLabel,
  onOpen,
  onPreviewAttachment,
  onOpenCategory,
  sortKey = 'know',
  sortDir = 'asc',
  onSortChange,
}: {
  topics: ExecTopic[]
  showKnow: boolean
  emptyLabel: string
  onOpen: (id: string) => void
  onPreviewAttachment: (file: ExecAttachment) => void
  onOpenCategory: (filter: CategoryFilter) => void
  sortKey?: ActiveSortKey
  sortDir?: SortDir
  onSortChange?: (key: ActiveSortKey) => void
}) {
  const colSpan = showKnow ? 8 : 7
  const useKnowGroups = showKnow && sortKey === 'know'
  const groups = useKnowGroups ? groupTopicsByKnow(topics) : null

  function renderSortHeader(key: ActiveSortKey, label: string) {
    if (!onSortChange) return label
    const active = sortKey === key
    return (
      <button
        type="button"
        className={`exec-th-sort${active ? ' is-active' : ''}`}
        onClick={() => onSortChange(key)}
      >
        {label}
        <span className="exec-th-sort__arrow" aria-hidden>
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '◇'}
        </span>
      </button>
    )
  }

  function renderRow(topic: ExecTopic) {
    return (
      <tr
        key={topic.id}
        className={`exec-table__row${
          topic.knowWindow && showKnow ? ` is-know-${topic.knowWindow}` : ''
        }`}
        onClick={() => onOpen(topic.id)}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpen(topic.id)
          }
        }}
      >
        <td className="exec-table__urgency-col">
          <UrgencyCell level={topic.urgency} />
        </td>
        <td className="exec-table__title-col">
          <strong>{topic.title}</strong>
          <span className="exec-table__sub">{topic.description}</span>
        </td>
        <td>
          <CategoryChip
            kind="owner"
            label={topic.owner}
            onClick={() => onOpenCategory({ kind: 'owner', value: topic.owner })}
          />
        </td>
        <td>
          <CategoryChip
            kind="fa"
            fa={topic.fa}
            onClick={() =>
              onOpenCategory({ kind: 'fa', value: faDisplay(topic.fa), fa: topic.fa })
            }
          />
        </td>
        <td>
          <div className="exec-table__tags">
            {topic.tags.map((tag) => (
              <CategoryChip
                key={tag}
                kind="tag"
                label={tag}
                onClick={() => onOpenCategory({ kind: 'tag', value: tag })}
              />
            ))}
          </div>
        </td>
        {showKnow ? (
          <td>
            {topic.knowWindow ? (
              <span className={`exec-know-pill is-${topic.knowWindow}`}>
                {knowWindowLabel(topic.knowWindow)}
              </span>
            ) : (
              <span className="exec-know-pill is-none">—</span>
            )}
          </td>
        ) : null}
        <td>
          <CategoryChip
            kind="upstream"
            label={topic.upstreamOrg}
            onClick={() => onOpenCategory({ kind: 'upstream', value: topic.upstreamOrg })}
          />
        </td>
        <td className="exec-table__attach-col">
          {topic.attachments.length === 0 ? (
            <span className="exec-empty">None</span>
          ) : (
            <div className="exec-table__attach-list">
              {topic.attachments.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className="exec-attach-link"
                  onClick={(event) => {
                    event.stopPropagation()
                    onPreviewAttachment(file)
                  }}
                >
                  {file.name}
                </button>
              ))}
            </div>
          )}
        </td>
      </tr>
    )
  }

  return (
    <table className="exec-table">
      <thead>
        <tr>
          <th className="exec-table__urgency-col">
            {renderSortHeader('urgency', 'Urgency')}
          </th>
          <th className="exec-table__title-col">Title</th>
          <th>Owner</th>
          <th>Functional area</th>
          <th>Tags</th>
          {showKnow ? <th>{renderSortHeader('know', 'Know')}</th> : null}
          <th>Upstreamed by</th>
          <th className="exec-table__attach-col">Attachments</th>
        </tr>
      </thead>
      <tbody>
        {useKnowGroups
          ? groups!.map((group) => (
              <Fragment key={`group-${group.label}`}>
                <tr className="exec-table__know-divider">
                  <td colSpan={colSpan}>
                    <strong>
                      {group.window ? (
                        <span className={`exec-know-pill is-${group.window}`}>
                          {group.label}
                        </span>
                      ) : (
                        group.label
                      )}
                      <span>({group.items.length})</span>
                    </strong>
                  </td>
                </tr>
                {group.items.map((topic) => renderRow(topic))}
              </Fragment>
            ))
          : topics.map((topic) => renderRow(topic))}
        {topics.length === 0 ? (
          <tr>
            <td colSpan={colSpan} className="exec-empty-cell">
              {emptyLabel}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  )
}

function TriageTable({
  items,
  emptyLabel,
  actionMode = 'triage',
  onPromote,
  onDismiss,
  onRestore,
  onOpenCategory,
  onPreviewAttachment,
}: {
  items: UpstreamCandidate[]
  emptyLabel: string
  actionMode?: 'triage' | 'dismissed'
  onPromote?: (item: UpstreamCandidate) => void
  onDismiss?: (item: UpstreamCandidate) => void
  onRestore?: (item: UpstreamCandidate) => void
  onOpenCategory: (filter: CategoryFilter) => void
  onPreviewAttachment: (file: ExecAttachment) => void
}) {
  return (
    <table className="exec-table">
      <thead>
        <tr>
          <th className="exec-table__urgency-col">Urgency</th>
          <th className="exec-table__title-col">Title</th>
          <th>Upstreamed by</th>
          <th>Why</th>
          <th>Owner</th>
          <th>Functional area</th>
          <th>Tags</th>
          <th className="exec-table__attach-col">Attachments</th>
          <th className="exec-table__action-col">Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            key={item.id}
            className={`exec-table__row exec-table__row--static${
              item.knowWindow ? ` is-know-${item.knowWindow}` : ''
            }`}
          >
            <td className="exec-table__urgency-col">
              <UrgencyCell level={item.urgency} />
            </td>
            <td className="exec-table__title-col">
              <strong>{item.title}</strong>
              <span className="exec-table__sub">{item.description}</span>
            </td>
            <td>
              <CategoryChip
                kind="upstream"
                label={item.upstreamOrg}
                onClick={() => onOpenCategory({ kind: 'upstream', value: item.upstreamOrg })}
              />
            </td>
            <td>
              <span className="exec-table__sub exec-table__sub--plain">{item.reason}</span>
            </td>
            <td>
              <CategoryChip
                kind="owner"
                label={item.owner}
                onClick={() => onOpenCategory({ kind: 'owner', value: item.owner })}
              />
            </td>
            <td>
              <CategoryChip
                kind="fa"
                fa={item.fa}
                onClick={() =>
                  onOpenCategory({ kind: 'fa', value: faDisplay(item.fa), fa: item.fa })
                }
              />
            </td>
            <td>
              <div className="exec-table__tags">
                {(item.tags ?? []).map((tag) => (
                  <CategoryChip
                    key={tag}
                    kind="tag"
                    label={tag}
                    onClick={() => onOpenCategory({ kind: 'tag', value: tag })}
                  />
                ))}
              </div>
            </td>
            <td className="exec-table__attach-col">
              {item.attachments.length === 0 ? (
                <span className="exec-empty">None</span>
              ) : (
                <div className="exec-table__attach-list">
                  {item.attachments.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      className="exec-attach-link"
                      onClick={() => onPreviewAttachment(file)}
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
              )}
            </td>
            <td className="exec-table__action-col">
              {actionMode === 'triage' ? (
                <div className="exec-action-stack">
                  <button
                    type="button"
                    className="exec-btn exec-btn--accent exec-btn--compact"
                    onClick={() => onPromote?.(item)}
                  >
                    Add to executive tracker
                  </button>
                  <button
                    type="button"
                    className="exec-btn exec-btn--compact"
                    onClick={() => onDismiss?.(item)}
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="exec-btn exec-btn--compact"
                  onClick={() => onRestore?.(item)}
                >
                  Return item to triage
                </button>
              )}
            </td>
          </tr>
        ))}
        {items.length === 0 ? (
          <tr>
            <td colSpan={9} className="exec-empty-cell">
              {emptyLabel}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  )
}

export function ExecReportingPage() {
  const [tab, setTab] = useState<PageTab>('active')
  const [topics, setTopics] = useState(() => cloneTopics())
  const [upstream, setUpstream] = useState(() => cloneUpstream())
  const [dismissed, setDismissed] = useState<UpstreamCandidate[]>([])
  const [savedDrafts, setSavedDrafts] = useState<SavedIntakeDraft[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<ExecAttachment | null>(null)
  const [category, setCategory] = useState<CategoryFilter | null>(null)
  const [intakeDraft, setIntakeDraft] = useState<IntakeDraft | null>(null)
  const [activeSortKey, setActiveSortKey] = useState<ActiveSortKey>('know')
  const [activeSortDir, setActiveSortDir] = useState<SortDir>('asc')

  const activeTopics = useMemo(
    () =>
      sortActiveTopics(
        topics.filter((topic) => topic.status === 'active'),
        activeSortKey,
        activeSortDir,
      ),
    [topics, activeSortKey, activeSortDir],
  )

  const archivedTopics = useMemo(
    () =>
      [...topics.filter((topic) => topic.status === 'archived')].sort((a, b) =>
        b.sortDate.localeCompare(a.sortDate),
      ),
    [topics],
  )

  const categoryActive = useMemo(() => {
    if (!category) return [] as ExecTopic[]
    return sortActiveTopics(
      topics.filter((topic) => topic.status === 'active' && topicMatchesCategory(topic, category)),
      activeSortKey,
      activeSortDir,
    )
  }, [category, topics, activeSortKey, activeSortDir])

  const categoryArchive = useMemo(() => {
    if (!category) return [] as ExecTopic[]
    return topics
      .filter((topic) => topic.status === 'archived' && topicMatchesCategory(topic, category))
      .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
  }, [category, topics])

  const categoryTriage = useMemo(() => {
    if (!category) return [] as UpstreamCandidate[]
    return upstream.filter((item) => upstreamMatchesCategory(item, category))
  }, [category, upstream])

  const selectedTopic = topics.find((topic) => topic.id === selectedId) ?? null

  function updateTopic(next: ExecTopic) {
    setTopics((current) => current.map((topic) => (topic.id === next.id ? next : topic)))
  }

  function openCategory(filter: CategoryFilter) {
    setSelectedId(null)
    setCategory(filter)
  }

  function openTopic(id: string) {
    const topic = topics.find((item) => item.id === id)
    if (!topic) return
    setCategory(null)
    setTab(topic.status === 'archived' ? 'archive' : 'active')
    setSelectedId(id)
  }

  function toggleActiveSort(key: ActiveSortKey) {
    if (activeSortKey === key) {
      setActiveSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setActiveSortKey(key)
    setActiveSortDir(key === 'urgency' ? 'desc' : 'asc')
  }

  function confirmIntake(draft: IntakeDraft) {
    const topic = intakeToTopic(draft)
    setTopics((current) => [topic, ...current])
    if (draft.fromUpstreamId) {
      setUpstream((current) => current.filter((item) => item.id !== draft.fromUpstreamId))
      setDismissed((current) => current.filter((item) => item.id !== draft.fromUpstreamId))
    }
    if (draft.draftId) {
      setSavedDrafts((current) => current.filter((item) => item.id !== draft.draftId))
    }
    setIntakeDraft(null)
    setCategory(null)
    setTab('active')
    setSelectedId(topic.id)
  }

  function saveIntakeDraft(draft: IntakeDraft) {
    const stamp = new Date().toISOString()
    const id = draft.draftId ?? `draft-${Date.now()}`
    const saved: SavedIntakeDraft = {
      ...draft,
      fa: { ...draft.fa },
      tags: [...draft.tags],
      suggestedTags: [...draft.suggestedTags],
      attachments: draft.attachments.map((file) => ({ ...file })),
      source: draft.source ? { ...draft.source } : undefined,
      id,
      draftId: id,
      savedAt: stamp,
      title: draft.title.trim() || 'Untitled draft',
    }
    setSavedDrafts((current) => {
      const without = current.filter((item) => item.id !== id)
      return [saved, ...without]
    })
    setIntakeDraft(null)
    setTab('active')
  }

  function continueDraft(draft: SavedIntakeDraft) {
    setIntakeDraft({
      ...draft,
      fa: { ...draft.fa },
      tags: [...draft.tags],
      suggestedTags: [...draft.suggestedTags],
      attachments: draft.attachments.map((file) => ({ ...file })),
      source: draft.source ? { ...draft.source } : undefined,
      draftId: draft.id,
    })
  }

  function deleteDraft(id: string) {
    setSavedDrafts((current) => current.filter((item) => item.id !== id))
  }

  function dismissItem(item: UpstreamCandidate) {
    setUpstream((current) => current.filter((entry) => entry.id !== item.id))
    setDismissed((current) =>
      current.some((entry) => entry.id === item.id) ? current : [...current, item],
    )
  }

  function restoreItem(item: UpstreamCandidate) {
    setDismissed((current) => current.filter((entry) => entry.id !== item.id))
    setUpstream((current) =>
      current.some((entry) => entry.id === item.id) ? current : [...current, item],
    )
  }

  const pageTitle = category ? categoryTitle(category) : 'Executive Reporting'

  return (
    <div className="exec-page">
      <div className="exec-main">
        <div className="canvas__head">
          <div className="canvas__head-left">
            {category ? (
              <>
                <button type="button" className="exec-back" onClick={() => setCategory(null)}>
                  <img src="/assets/icons/arrow-left.svg" alt="" width={16} height={16} />
                  Back
                </button>
                <div>
                  <p className="exec-page__eyebrow">{categoryEyebrow(category)}</p>
                  <h1 className="canvas__title">{pageTitle}</h1>
                </div>
              </>
            ) : (
              <h1 className="canvas__title">{pageTitle}</h1>
            )}
          </div>

          <div className="exec-page__head-right">
            <SmartSearch
              topics={topics}
              upstream={[...upstream, ...dismissed]}
              onOpenTopic={openTopic}
              onOpenCategory={openCategory}
              onOpenTriage={() => {
                setCategory(null)
                setTab('triage')
              }}
            />
          </div>
        </div>

        {!category ? (
          <div className="exec-page__tabs tab-bar" role="tablist" aria-label="Reporting sections">
            <button
              type="button"
              role="tab"
              className={`tab${tab === 'active' ? ' active' : ''}`}
              aria-selected={tab === 'active'}
              onClick={() => setTab('active')}
            >
              Active
              <em className="exec-page__badge">{activeTopics.length}</em>
            </button>
            <button
              type="button"
              role="tab"
              className={`tab${tab === 'triage' ? ' active' : ''}`}
              aria-selected={tab === 'triage'}
              onClick={() => setTab('triage')}
            >
              Triage
              <em className="exec-page__badge">{upstream.length}</em>
            </button>
            <button
              type="button"
              role="tab"
              className={`tab${tab === 'archive' ? ' active' : ''}`}
              aria-selected={tab === 'archive'}
              onClick={() => setTab('archive')}
            >
              Archive
            </button>
          </div>
        ) : null}

        {category ? (
          <div className="exec-category-stack">
            <section className="exec-page__panel acrylic-card">
              <h2 className="exec-section-title">Active</h2>
              <div className="exec-table-wrap scroll-area">
                <TopicTable
                  topics={categoryActive}
                  showKnow
                  emptyLabel={`No active items for ${pageTitle}.`}
                  onOpen={setSelectedId}
                  onPreviewAttachment={setPreviewFile}
                  onOpenCategory={openCategory}
                  sortKey={activeSortKey}
                  sortDir={activeSortDir}
                  onSortChange={toggleActiveSort}
                />
              </div>
            </section>
            <section className="exec-page__panel acrylic-card">
              <h2 className="exec-section-title">Triage</h2>
              <div className="exec-table-wrap scroll-area">
                <TriageTable
                  items={categoryTriage}
                  emptyLabel={`No triage items for ${pageTitle}.`}
                  onPromote={(item) => setIntakeDraft(intakeFromUpstream(item))}
                  onDismiss={dismissItem}
                  onOpenCategory={openCategory}
                  onPreviewAttachment={setPreviewFile}
                />
              </div>
            </section>
            <section className="exec-page__panel acrylic-card">
              <h2 className="exec-section-title">Archive</h2>
              <div className="exec-table-wrap scroll-area">
                <TopicTable
                  topics={categoryArchive}
                  showKnow={false}
                  emptyLabel={`No archived items for ${pageTitle}.`}
                  onOpen={setSelectedId}
                  onPreviewAttachment={setPreviewFile}
                  onOpenCategory={openCategory}
                />
              </div>
            </section>
          </div>
        ) : null}

        {!category && tab === 'active' ? (
          <div className="exec-page__panel acrylic-card">
            {savedDrafts.length > 0 ? (
              <div className="exec-drafts">
                <h2 className="exec-section-title">Drafts</h2>
                <div className="exec-drafts__list">
                  {savedDrafts.map((draft) => (
                    <article key={draft.id} className="exec-draft-card">
                      <div className="exec-draft-card__copy">
                        <strong>{draft.title || 'Untitled draft'}</strong>
                        <span>
                          Saved {new Date(draft.savedAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {draft.fromUpstreamId ? ' · From triage' : ' · Manual entry'}
                        </span>
                      </div>
                      <div className="exec-draft-card__actions">
                        <button
                          type="button"
                          className="exec-btn exec-btn--accent exec-btn--compact"
                          onClick={() => continueDraft(draft)}
                        >
                          Continue
                        </button>
                        <button
                          type="button"
                          className="exec-btn exec-btn--compact"
                          onClick={() => deleteDraft(draft.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="exec-table-wrap scroll-area">
              <TopicTable
                topics={activeTopics}
                showKnow
                emptyLabel="No active topics."
                onOpen={setSelectedId}
                onPreviewAttachment={setPreviewFile}
                onOpenCategory={openCategory}
                sortKey={activeSortKey}
                sortDir={activeSortDir}
                onSortChange={toggleActiveSort}
              />
            </div>
          </div>
        ) : null}

        {!category && tab === 'archive' ? (
          <div className="exec-page__panel acrylic-card">
            <div className="exec-upstream__toolbar">
              <p>Archived executive topics kept for historical reference and search.</p>
            </div>
            <div className="exec-table-wrap scroll-area">
              <TopicTable
                topics={archivedTopics}
                showKnow={false}
                emptyLabel="Archive is empty."
                onOpen={setSelectedId}
                onPreviewAttachment={setPreviewFile}
                onOpenCategory={openCategory}
              />
            </div>
          </div>
        ) : null}

        {!category && tab === 'triage' ? (
          <div className="exec-triage-stack">
            <div className="exec-page__panel acrylic-card">
              <div className="exec-upstream__toolbar">
                <p>
                  Items upstreamed from cockpits and teams. Review each item and add it to the
                  executive tracker when ready.
                </p>
                <button
                  type="button"
                  className="exec-btn exec-btn--accent"
                  onClick={() => setIntakeDraft(emptyIntakeDraft())}
                >
                  Add issue manually
                </button>
              </div>
              <div className="exec-table-wrap scroll-area">
                <TriageTable
                  items={upstream}
                  emptyLabel="Triage queue is empty."
                  onPromote={(item) => setIntakeDraft(intakeFromUpstream(item))}
                  onDismiss={dismissItem}
                  onOpenCategory={openCategory}
                  onPreviewAttachment={setPreviewFile}
                />
              </div>
            </div>

            <div className="exec-page__panel acrylic-card">
              <h2 className="exec-section-title">Dismissed</h2>
              <p className="exec-dismissed__copy">
                Dismissed items are held here through the end of the week, then removed
                automatically. Return an item to triage if it still needs executive attention.
              </p>
              <div className="exec-table-wrap scroll-area">
                <TriageTable
                  items={dismissed}
                  actionMode="dismissed"
                  emptyLabel="No dismissed items."
                  onRestore={restoreItem}
                  onOpenCategory={openCategory}
                  onPreviewAttachment={setPreviewFile}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {selectedTopic ? (
        <TopicDetailModal
          topic={selectedTopic}
          onClose={() => setSelectedId(null)}
          onChange={updateTopic}
          onPreviewAttachment={setPreviewFile}
          onOpenCategory={(filter) => {
            setSelectedId(null)
            openCategory(filter)
          }}
        />
      ) : null}

      {intakeDraft ? (
        <PromoteIntakeModal
          initialDraft={intakeDraft}
          onClose={() => setIntakeDraft(null)}
          onConfirm={confirmIntake}
          onSaveDraft={saveIntakeDraft}
        />
      ) : null}

      {previewFile ? (
        <AttachmentPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      ) : null}
    </div>
  )
}
