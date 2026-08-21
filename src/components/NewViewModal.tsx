import { useMemo, useState } from 'react'
import {
  DIRECTORY_TOTAL,
  DIRECTORY_USERS,
  VISIBILITY_OPTIONS,
  type Visibility,
} from '../data/customViews'
import './NewViewModal.css'

const MAX_VISIBLE_CHIPS = 7

export type NewViewDraft = {
  title: string
  visibility: Visibility
  sharedWith: string[]
}

export function NewViewModal({
  mode = 'create',
  initial,
  onCancel,
  onSubmit,
  onDelete,
}: {
  mode?: 'create' | 'edit'
  initial?: Partial<NewViewDraft>
  onCancel: () => void
  onSubmit: (draft: NewViewDraft) => void
  onDelete?: () => void
}) {
  const editing = mode === 'edit'
  const [title, setTitle] = useState(initial?.title ?? '')
  const [visibility, setVisibility] = useState<Visibility>(
    initial?.visibility ?? 'Share with specific people',
  )
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>(
    initial?.sharedWith?.length ? initial.sharedWith : editing ? [] : ['u1'],
  )

  const sharing = visibility === 'Share with specific people'

  const results = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return DIRECTORY_USERS
    return DIRECTORY_USERS.filter(
      (user) =>
        user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    )
  }, [search])

  const selectedUsers = DIRECTORY_USERS.filter((user) => selected.includes(user.id))
  const overflow = Math.max(0, selectedUsers.length - MAX_VISIBLE_CHIPS)

  function toggleUser(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <div
      className="new-view__scrim"
      role="dialog"
      aria-modal="true"
      aria-label={editing ? 'Edit view' : 'New view'}
      onClick={onCancel}
    >
      <div
        className="new-view acrylic-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="new-view__body">
          <h2 className="new-view__title">{editing ? 'Edit view' : 'New view'}</h2>

          <label className="new-view__field">
            <span className="icon-box new-view__field-icon">
              <img className="icon" src="/assets/icons/edit.svg" alt="" />
            </span>
            <input
              type="text"
              value={title}
              placeholder="Title"
              autoFocus={!editing}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <div className="new-view__section">
            <span className="section-title">Visibility</span>
            <div className="new-view__select">
              <button
                type="button"
                className="new-view__field new-view__field--button"
                aria-expanded={visibilityOpen}
                onClick={() => setVisibilityOpen((open) => !open)}
              >
                <span className="icon-box new-view__field-icon">
                  <img className="icon" src="/assets/icons/visibility.svg" alt="" />
                </span>
                <span className="new-view__select-value">{visibility}</span>
                <span className="icon-box">
                  <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
                </span>
              </button>
              {visibilityOpen ? (
                <div className="new-view__select-list" role="listbox">
                  {VISIBILITY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={option === visibility ? 'is-active' : undefined}
                      onClick={() => {
                        setVisibility(option)
                        setVisibilityOpen(false)
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {sharing ? (
              <div className="new-view__users">
                <span className="new-view__users-label">Select users</span>
                <div className="new-view__picker">
                  <label className="new-view__search">
                    <input
                      type="search"
                      value={search}
                      placeholder="Search"
                      onChange={(event) => setSearch(event.target.value)}
                    />
                    <span className="icon-box">
                      <img className="icon" src="/assets/icons/search.svg" alt="" />
                    </span>
                  </label>

                  <div className="new-view__results scroll-area">
                    {results.map((user) => (
                      <label key={user.id} className="new-view__user">
                        <input
                          type="checkbox"
                          checked={selected.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                        />
                        <span className="new-view__checkbox" aria-hidden />
                        <span className="new-view__user-text">
                          <b>{user.name}</b>
                          <em>
                            {user.email} ({user.roles})
                          </em>
                        </span>
                      </label>
                    ))}
                    {results.length === 0 ? (
                      <p className="new-view__empty">No users match “{search}”.</p>
                    ) : null}
                  </div>

                  <span className="new-view__count">
                    {search ? `${results.length} users found` : `${DIRECTORY_TOTAL} users found`}
                  </span>
                </div>

                <div className="new-view__chips">
                  {selectedUsers.slice(0, MAX_VISIBLE_CHIPS).map((user) => (
                    <span key={user.id} className="new-view__chip">
                      <span className="icon-box">
                        <img className="icon" src="/assets/icons/person.svg" alt="" />
                      </span>
                      {user.name}
                      <button
                        type="button"
                        aria-label={`Remove ${user.name}`}
                        onClick={() => toggleUser(user.id)}
                      >
                        <img src="/assets/icons/close.svg" alt="" width={12} height={12} />
                      </button>
                    </span>
                  ))}
                  {overflow > 0 ? <span className="new-view__chip">+{overflow}</span> : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className={`new-view__actions${editing && onDelete ? ' is-edit' : ''}`}>
          {editing && onDelete ? (
            <button type="button" className="new-view__delete" onClick={onDelete}>
              Delete view
              <img src="/assets/icons/delete.svg" alt="" width={14} height={16} />
            </button>
          ) : (
            <button type="button" className="new-view__cancel" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            type="button"
            className="btn-primary"
            disabled={!title.trim()}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                visibility,
                sharedWith: sharing ? selected : [],
              })
            }
          >
            {editing ? 'Save' : 'Let’s go!'}
            <img src="/assets/icons/go.svg" alt="" width={14} height={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
