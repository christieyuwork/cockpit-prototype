import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  BACKGROUND_OPTIONS,
  BUILT_IN_TOP_BAR_PAGE_IDS,
  COCKPIT_STATUS_OPTIONS,
  DEFAULT_COCKPIT_BACKGROUND,
  DEFAULT_COCKPIT_LOGO,
  DEFAULT_FONT,
  DEFAULT_LANGUAGE,
  DEFAULT_MATCHES,
  DEFAULT_TEAMS,
  DEFAULT_TIMEZONE,
  FONT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  backgroundSrc,
  createHostCity,
  createStadium,
  createTopBarPage,
  defaultPhases,
  defaultPillFor,
  type CockpitAdminSettings,
  type CockpitGeneralSettings,
  type CockpitId,
  type CockpitProfile,
  type CockpitStatus,
  type HostCity,
  type LabeledOption,
  type SidebarItemSetting,
  type Stadium,
  type TopBarPageAdvanced,
  type TopBarPageSetting,
  type TournamentPhase,
} from '../data/adminCenter'
import './AdminCenter.css'
import './TopBar.css'

export type AdminSection =
  | 'cockpits'
  | 'metadata'
  | 'cities'
  | 'stadiums'
  | 'topbar'
  | 'sidebar'
  | 'access'

type ViewMode = 'grid' | 'list'

type ConfirmRequest = {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
}

const REVERT_MESSAGE =
  'Are you sure you want to restore this setting to default? Your current selection will not be saved anywhere.'

const ConfirmContext = createContext<(request: ConfirmRequest) => void>((request) =>
  request.onConfirm(),
)

function useConfirm() {
  return useContext(ConfirmContext)
}

export function AdminCenter({
  cockpits,
  settingsByCockpit,
  activeCockpitId,
  section,
  onSectionChange,
  onActiveCockpitChange,
  onCockpitsChange,
  onSettingsChange,
  onCreateCockpit,
  onReturn,
}: {
  cockpits: CockpitProfile[]
  settingsByCockpit: Record<CockpitId, CockpitAdminSettings>
  activeCockpitId: CockpitId
  section: AdminSection
  onSectionChange: (section: AdminSection) => void
  onActiveCockpitChange: (id: CockpitId) => void
  onCockpitsChange: (cockpits: CockpitProfile[]) => void
  onSettingsChange: (cockpitId: CockpitId, settings: CockpitAdminSettings) => void
  onCreateCockpit: () => void
  onReturn: () => void
}) {
  const [advancedPageId, setAdvancedPageId] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null)
  const activeCockpit = cockpits.find((item) => item.id === activeCockpitId) ?? cockpits[0]
  const settings = settingsByCockpit[activeCockpitId]
  const orderedCockpits = useMemo(
    () => [...cockpits].sort((a, b) => a.order - b.order),
    [cockpits],
  )

  function updateCockpit(id: CockpitId, patch: Partial<CockpitProfile>) {
    onCockpitsChange(
      cockpits.map((item) => {
        if (item.id !== id) return item
        if (item.permanent && patch.status !== undefined) {
          const { status: _status, ...rest } = patch
          return { ...item, ...rest, status: 'active' }
        }
        return { ...item, ...patch }
      }),
    )
  }

  function moveCockpit(id: CockpitId, delta: number) {
    const target = cockpits.find((item) => item.id === id)
    if (!target) return
    const archived = !target.permanent && target.status === 'archived'
    const group = orderedCockpits.filter(
      (item) => (!item.permanent && item.status === 'archived') === archived,
    )
    const others = orderedCockpits.filter(
      (item) => (!item.permanent && item.status === 'archived') !== archived,
    )
    const index = group.findIndex((item) => item.id === id)
    const nextIndex = index + delta
    if (index < 0 || nextIndex < 0 || nextIndex >= group.length) return
    const nextGroup = [...group]
    const [item] = nextGroup.splice(index, 1)
    nextGroup.splice(nextIndex, 0, item)
    const merged = archived ? [...others, ...nextGroup] : [...nextGroup, ...others]
    onCockpitsChange(merged.map((cockpit, order) => ({ ...cockpit, order })))
  }

  function updateGeneral(patch: Partial<CockpitGeneralSettings>) {
    const nextGeneral = { ...settings.general, ...patch }
    onSettingsChange(activeCockpitId, { ...settings, general: nextGeneral })
    if (patch.name !== undefined) {
      updateCockpit(activeCockpitId, { title: patch.name })
    }
  }

  function updateHostCities(hostCities: HostCity[]) {
    onSettingsChange(activeCockpitId, { ...settings, hostCities })
  }

  function updateStadiums(stadiums: Stadium[]) {
    onSettingsChange(activeCockpitId, { ...settings, stadiums })
  }

  function removeHostCity(cityId: string) {
    onSettingsChange(activeCockpitId, {
      ...settings,
      hostCities: settings.hostCities.filter((city) => city.id !== cityId),
      stadiums: settings.stadiums.map((stadium) =>
        stadium.hostCityId === cityId ? { ...stadium, hostCityId: '' } : stadium,
      ),
    })
  }

  function updateTopBarPage(pageId: string, patch: Partial<TopBarPageSetting>) {
    onSettingsChange(activeCockpitId, {
      ...settings,
      topBarPages: settings.topBarPages.map((page) =>
        page.id === pageId ? { ...page, ...patch } : page,
      ),
    })
  }

  function updateTopBarAdvanced(pageId: string, patch: Partial<TopBarPageAdvanced>) {
    onSettingsChange(activeCockpitId, {
      ...settings,
      topBarPages: settings.topBarPages.map((page) =>
        page.id === pageId ? { ...page, advanced: { ...page.advanced, ...patch } } : page,
      ),
    })
  }

  function moveTopBarPage(pageId: string, delta: number) {
    const pages = [...settings.topBarPages]
    const index = pages.findIndex((page) => page.id === pageId)
    const target = index + delta
    if (index < 0 || target < 0 || target >= pages.length) return
    const [item] = pages.splice(index, 1)
    pages.splice(target, 0, item)
    onSettingsChange(activeCockpitId, { ...settings, topBarPages: pages })
  }

  function addTopBarPage() {
    const page = createTopBarPage(
      'New page',
      settings.general.defaultBackgroundImage || DEFAULT_COCKPIT_BACKGROUND,
    )
    onSettingsChange(activeCockpitId, {
      ...settings,
      topBarPages: [...settings.topBarPages, page],
    })
  }

  function deleteTopBarPage(pageId: string) {
    onSettingsChange(activeCockpitId, {
      ...settings,
      topBarPages: settings.topBarPages.filter((page) => page.id !== pageId),
    })
  }

  function updateSidebarItem(itemId: string, patch: Partial<SidebarItemSetting>) {
    onSettingsChange(activeCockpitId, {
      ...settings,
      sidebarItems: settings.sidebarItems.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    })
  }

  const advancedTopBar = advancedPageId
    ? settings.topBarPages.find((page) => page.id === advancedPageId)
    : undefined

  const navItems: { id: AdminSection; label: string }[] = [
    { id: 'metadata', label: 'Tournament metadata' },
    { id: 'cities', label: 'Host cities' },
    { id: 'stadiums', label: 'Stadiums' },
    { id: 'topbar', label: 'Topbar' },
    { id: 'sidebar', label: 'Sidebar' },
    { id: 'access', label: 'Access' },
  ]

  function goTo(next: AdminSection) {
    setAdvancedPageId(null)
    onSectionChange(next)
  }

  function selectCockpit(id: CockpitId) {
    setAdvancedPageId(null)
    onActiveCockpitChange(id)
    if (section === 'cockpits') onSectionChange('metadata')
  }

  return (
    <ConfirmContext.Provider value={setConfirm}>
      <div className="admin">
        <header className="admin__topbar">
          <div className="admin__brand">
            <img
              className="admin__logo"
              src={settings?.general.logoImage || DEFAULT_COCKPIT_LOGO}
              alt=""
            />
            <span className="admin__divider" aria-hidden />
            <div className="admin__lenovo">
              <img src="/assets/logo-lenovo.svg" alt="" />
              <img className="admin__lenovo-mark" src="/assets/logo-lenovo-mark.svg" alt="Lenovo" />
            </div>
          </div>
          <button type="button" className="admin__return" onClick={onReturn}>
            Return to {activeCockpit?.title ?? 'World Cup 2026'} Cockpit
            <span className="icon-box">
              <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
            </span>
          </button>
        </header>

        <div className="admin__body">
          <aside className="admin__nav" aria-label="Admin sections">
            <button
              type="button"
              className={`admin__nav-item${section === 'cockpits' ? ' is-active' : ''}`}
              onClick={() => goTo('cockpits')}
            >
              All cockpits
            </button>
            <div className="admin__nav-divider" aria-hidden />
            <label className="admin__nav-switch">
              <span>Cockpit settings</span>
              <select
                value={activeCockpitId}
                aria-label="Cockpit settings"
                onChange={(event) => selectCockpit(event.target.value)}
              >
                {orderedCockpits.map((cockpit) => (
                  <option key={cockpit.id} value={cockpit.id}>
                    {cockpit.title}
                  </option>
                ))}
              </select>
            </label>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin__nav-item${section === item.id ? ' is-active' : ''}`}
                onClick={() => goTo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </aside>

          <main className="admin__main scroll-area">
            {advancedTopBar ? (
              <TopBarAdvancedPanel
                page={advancedTopBar}
                onBack={() => setAdvancedPageId(null)}
                onChange={(patch) => updateTopBarAdvanced(advancedTopBar.id, patch)}
              />
            ) : section === 'cockpits' ? (
              <CockpitsPanel
                cockpits={orderedCockpits}
                activeCockpitId={activeCockpitId}
                onSelect={(id) => {
                  onActiveCockpitChange(id)
                  onSectionChange('metadata')
                }}
                onToggleVisible={(id, visible) => {
                  const target = cockpits.find((item) => item.id === id)
                  if (target && !target.permanent && target.status === 'archived') return
                  updateCockpit(id, { visible })
                }}
                onStatusChange={(id, status) =>
                  updateCockpit(id, {
                    status,
                    ...(status === 'archived' ? { visible: false } : {}),
                  })
                }
                onMove={moveCockpit}
                onCreate={onCreateCockpit}
              />
            ) : section === 'metadata' ? (
              <MetadataPanel general={settings.general} onChange={updateGeneral} />
            ) : section === 'cities' ? (
              <HostCitiesPanel
                cities={settings.hostCities}
                tournamentBackground={settings.general.defaultBackgroundImage}
                onChange={updateHostCities}
                onRemove={removeHostCity}
              />
            ) : section === 'stadiums' ? (
              <StadiumsPanel
                stadiums={settings.stadiums}
                cities={settings.hostCities}
                tournamentBackground={settings.general.defaultBackgroundImage}
                onChange={updateStadiums}
              />
            ) : section === 'topbar' ? (
              <TopBarItemsPanel
                cockpitTitle={settings.general.name || activeCockpit?.title || 'Cockpit'}
                pages={settings.topBarPages}
                defaultBackground={settings.general.defaultBackgroundImage}
                onPatch={updateTopBarPage}
                onBackgroundChange={(id, backgroundImage) =>
                  updateTopBarAdvanced(id, { backgroundImage })
                }
                onMove={moveTopBarPage}
                onAdd={addTopBarPage}
                onDelete={deleteTopBarPage}
                onOpenAdvanced={setAdvancedPageId}
              />
            ) : section === 'sidebar' ? (
              <SidebarItemsPanel
                cockpitTitle={settings.general.name || activeCockpit?.title || 'Cockpit'}
                items={settings.sidebarItems}
                onToggleVisible={(id, visible) => updateSidebarItem(id, { visible })}
                onBackgroundChange={(id, backgroundImage) => {
                  const item = settings.sidebarItems.find((entry) => entry.id === id)
                  if (!item) return
                  updateSidebarItem(id, { advanced: { ...item.advanced, backgroundImage } })
                }}
              />
            ) : (
              <AccessPanel />
            )}
          </main>
        </div>

        {confirm ? (
          <ConfirmModal
            request={confirm}
            onCancel={() => setConfirm(null)}
            onConfirm={() => {
              confirm.onConfirm()
              setConfirm(null)
            }}
          />
        ) : null}
      </div>
    </ConfirmContext.Provider>
  )
}

function ConfirmModal({
  request,
  onCancel,
  onConfirm,
}: {
  request: ConfirmRequest
  onCancel: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="admin-modal" role="presentation" onMouseDown={onCancel}>
      <div
        className="admin-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="admin-modal-title" className="admin-modal__title">
          {request.title}
        </h2>
        <p className="admin-modal__message">{request.message}</p>
        <div className="admin-modal__actions">
          <button type="button" className="admin-modal__cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="admin-modal__confirm" onClick={onConfirm} autoFocus>
            {request.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="admin-view-toggle" role="group" aria-label="View">
      {(['grid', 'list'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          className={value === mode ? 'is-active' : undefined}
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
        >
          {mode === 'grid' ? 'Grid' : 'List'}
        </button>
      ))}
    </div>
  )
}

function useScrollToCard(view: ViewMode) {
  const [focusId, setFocusId] = useState<string | null>(null)
  useEffect(() => {
    if (!focusId || view !== 'grid') return
    document
      .getElementById(`admin-card-${focusId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFocusId(null)
  }, [focusId, view])
  return setFocusId
}

function CockpitsPanel({
  cockpits,
  activeCockpitId,
  onSelect,
  onToggleVisible,
  onStatusChange,
  onMove,
  onCreate,
}: {
  cockpits: CockpitProfile[]
  activeCockpitId: CockpitId
  onSelect: (id: CockpitId) => void
  onToggleVisible: (id: CockpitId, visible: boolean) => void
  onStatusChange: (id: CockpitId, status: CockpitStatus) => void
  onMove: (id: CockpitId, delta: number) => void
  onCreate: () => void
}) {
  const [view, setView] = useState<ViewMode>('grid')
  const active = cockpits.filter((profile) => profile.permanent || profile.status !== 'archived')
  const archived = cockpits.filter((profile) => !profile.permanent && profile.status === 'archived')

  function statusLabel(profile: CockpitProfile) {
    if (profile.permanent) return 'Active'
    return profile.status.charAt(0).toUpperCase() + profile.status.slice(1)
  }

  function renderStatusSelect(profile: CockpitProfile) {
    return (
      <select
        value={profile.status}
        onChange={(event) => onStatusChange(profile.id, event.target.value as CockpitStatus)}
      >
        {COCKPIT_STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>
    )
  }

  function renderOrder(profile: CockpitProfile, index: number, group: CockpitProfile[], className: string) {
    return (
      <div className={className}>
        <button
          type="button"
          aria-label={`Move ${profile.title} up`}
          disabled={index === 0}
          onClick={() => onMove(profile.id, -1)}
        >
          <img src="/assets/icons/arrow-up.svg" alt="" width={12} height={12} />
        </button>
        <button
          type="button"
          aria-label={`Move ${profile.title} down`}
          disabled={index === group.length - 1}
          onClick={() => onMove(profile.id, 1)}
        >
          <img src="/assets/icons/arrow-down.svg" alt="" width={12} height={12} />
        </button>
      </div>
    )
  }

  function renderCard(profile: CockpitProfile, index: number, group: CockpitProfile[]) {
    return (
      <div
        key={profile.id}
        className={`profile-card admin-cockpit${profile.id === activeCockpitId ? ' is-selected' : ''}${
          profile.image ? '' : ' profile-card--solid'
        }${!profile.visible ? ' is-hidden-card' : ''}`}
      >
        {profile.image ? (
          <>
            <img className="profile-card__bg" src={profile.image} alt="" />
            <span
              className="profile-card__scrim"
              style={{ opacity: profile.overlay }}
              aria-hidden
            />
          </>
        ) : null}
        <button
          type="button"
          className="profile-card__main"
          onClick={() => onSelect(profile.id)}
        >
          <span
            className={`profile-card__badge${
              profile.permanent || profile.status === 'active' ? ' is-active' : ''
            }${profile.status === 'archived' && !profile.permanent ? ' is-archived' : ''}`}
          >
            {profile.permanent || profile.status !== 'archived' ? (
              <span className="icon-box">
                <img
                  className="icon"
                  src={
                    !profile.permanent && profile.status === 'completed'
                      ? '/assets/icons/status-check.svg'
                      : '/assets/icons/status-dot.svg'
                  }
                  alt=""
                />
              </span>
            ) : null}
            {statusLabel(profile)}
          </span>
          <span className="profile-card__copy">
            <span className="profile-card__title">{profile.title}</span>
            <span className="profile-card__role">{profile.role}</span>
          </span>
        </button>
        <div className="admin-cockpit__controls">
          {profile.status === 'archived' && !profile.permanent ? null : (
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={profile.visible}
                onChange={(event) => onToggleVisible(profile.id, event.target.checked)}
              />
              <span>Show in profile list</span>
            </label>
          )}
          {profile.permanent ? null : (
            <label className="admin-field">
              <span>Status</span>
              {renderStatusSelect(profile)}
            </label>
          )}
          {renderOrder(profile, index, group, 'admin-cockpit__order')}
          <button
            type="button"
            className="profile-menu__btn"
            onClick={() => onSelect(profile.id)}
          >
            <span className="icon-box">
              <img className="icon" src="/assets/icons/tune.svg" alt="" />
            </span>
            Open settings
          </button>
        </div>
      </div>
    )
  }

  function renderTable(group: CockpitProfile[]) {
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Cockpit</th>
              <th>Role</th>
              <th>Status</th>
              <th>Profile list</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {group.map((profile, index) => (
              <tr
                key={profile.id}
                className={`${profile.id === activeCockpitId ? 'is-selected' : ''}${
                  !profile.visible ? ' is-muted' : ''
                }`}
              >
                <td>{renderOrder(profile, index, group, 'admin-table__order')}</td>
                <td className="admin-table__name">{profile.title}</td>
                <td>{profile.role}</td>
                <td>
                  {profile.permanent ? (
                    <span className="admin-table__muted">Active (permanent)</span>
                  ) : (
                    renderStatusSelect(profile)
                  )}
                </td>
                <td>
                  {profile.status === 'archived' && !profile.permanent ? (
                    <span className="admin-table__muted">Hidden</span>
                  ) : (
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={profile.visible}
                        onChange={(event) => onToggleVisible(profile.id, event.target.checked)}
                      />
                      <span>{profile.visible ? 'Shown' : 'Hidden'}</span>
                    </label>
                  )}
                </td>
                <td>
                  <button type="button" className="admin-link" onClick={() => onSelect(profile.id)}>
                    Open settings
                    <span className="icon-box">
                      <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <header className="admin-panel__head admin-panel__head--row">
        <div>
          <h1 className="admin-panel__title">All cockpits</h1>
          <p className="admin-panel__sub">
            Manage visibility, status, and order in the Switch profile list.
          </p>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </header>
      {view === 'grid' ? (
        <div className="admin-cockpits">
          <p className="admin-section-label">Active</p>
          {active.map((profile, index) => renderCard(profile, index, active))}
          <button type="button" className="admin-create-card" onClick={onCreate}>
            <span className="admin-create-card__icon" aria-hidden>
              +
            </span>
            <span className="admin-create-card__title">Create a new cockpit</span>
            <span className="admin-create-card__sub">
              Start with Home, full sidebar, and the default trophy background.
            </span>
          </button>
          {archived.length > 0 ? (
            <>
              <p className="admin-section-label">Archived</p>
              {archived.map((profile, index) => renderCard(profile, index, archived))}
            </>
          ) : null}
        </div>
      ) : (
        <div className="admin-list">
          <p className="admin-section-label">Active</p>
          {renderTable(active)}
          <button type="button" className="admin-add-row admin-add-row--block" onClick={onCreate}>
            <span aria-hidden>+</span> Create a new cockpit
          </button>
          {archived.length > 0 ? (
            <>
              <p className="admin-section-label">Archived</p>
              {renderTable(archived)}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

function RevertIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
      <path
        d="M4 10h9a5 5 0 1 1 0 10H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6 4 10l4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RevertButton({ label, onClick }: { label: string; onClick: () => void }) {
  const confirm = useConfirm()
  return (
    <button
      type="button"
      className="admin-revert"
      aria-label={`Revert ${label} to default`}
      data-tooltip="Revert to default"
      onClick={() =>
        confirm({
          title: 'Restore default?',
          message: REVERT_MESSAGE,
          confirmLabel: 'Restore default',
          onConfirm: onClick,
        })
      }
    >
      <RevertIcon />
    </button>
  )
}

function Field({
  label,
  required,
  hint,
  onRevert,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  onRevert?: () => void
  children: ReactNode
}) {
  return (
    <div className="admin-field">
      <span className="admin-field__head">
        <span>
          {label}
          {required ? <span className="admin-field__meta"> Required</span> : null}
        </span>
        {onRevert ? <RevertButton label={label} onClick={onRevert} /> : null}
      </span>
      {children}
      {hint ? <span className="admin-field__hint">{hint}</span> : null}
    </div>
  )
}

function optionsWithCurrent(options: LabeledOption[], value: string): LabeledOption[] {
  if (options.some((option) => option.value === value)) return options
  return [{ value, label: value ? 'Current' : 'None' }, ...options]
}

function uniqueOptions(options: LabeledOption[]): LabeledOption[] {
  const seen = new Set<string>()
  return options.filter((option) => {
    if (!option.value || seen.has(option.value)) return false
    seen.add(option.value)
    return true
  })
}

/** "UTC+9, UTC+10" → "UTC+9, +10"; named zones keep their full name. */
export function formatSelectedZones(values: string[]): string {
  const ordered = TIMEZONE_OPTIONS.map((option) => option.value).filter((value) =>
    values.includes(value),
  )
  return ordered
    .map((value, index) => {
      if (index === 0 || !value.startsWith('UTC')) return value
      return value.slice(3)
    })
    .join(', ')
}

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean
  const value = Number.parseInt(full, 16)
  if (Number.isNaN(value)) return `rgba(0, 0, 0, ${opacity / 100})`
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
}

function CityPill({ city }: { city: Pick<HostCity, 'trigram' | 'pillText' | 'pillBg' | 'pillBgOpacity'> }) {
  return (
    <span
      className="city-pill admin-city-pill"
      style={{ color: city.pillText, background: hexToRgba(city.pillBg, city.pillBgOpacity) }}
    >
      {city.trigram.toUpperCase() || '---'}
    </span>
  )
}

function Preview({ src }: { src: string }) {
  if (!src) return <div className="admin-preview admin-preview--wide admin-preview--empty">No image</div>
  return (
    <div className="admin-preview admin-preview--wide">
      <img src={src} alt="" />
    </div>
  )
}

function MetadataPanel({
  general,
  onChange,
}: {
  general: CockpitGeneralSettings
  onChange: (patch: Partial<CockpitGeneralSettings>) => void
}) {
  const backgrounds = optionsWithCurrent(BACKGROUND_OPTIONS, general.defaultBackgroundImage)
  const fonts = optionsWithCurrent(FONT_OPTIONS, general.font)
  const languages = optionsWithCurrent(LANGUAGE_OPTIONS, general.language)
  const timezones = optionsWithCurrent(TIMEZONE_OPTIONS, general.timezone)
  const crossSelected = general.crossTimezones.filter((zone) => zone !== general.timezone)

  function toggleCrossZone(value: string) {
    const next = general.crossTimezones.includes(value)
      ? general.crossTimezones.filter((zone) => zone !== value)
      : [...general.crossTimezones, value]
    onChange({ crossTimezones: next })
  }

  function setDefaultZone(value: string) {
    onChange({
      timezone: value,
      crossTimezones: general.crossTimezones.filter((zone) => zone !== value),
    })
  }

  function patchPhase(phaseId: string, patch: Partial<TournamentPhase>) {
    onChange({
      phases: general.phases.map((phase) => (phase.id === phaseId ? { ...phase, ...patch } : phase)),
    })
  }

  function addPhase() {
    onChange({
      phases: [
        ...general.phases,
        { id: `phase-${Date.now().toString(36)}`, title: '', startDate: '' },
      ],
    })
  }

  return (
    <div className="admin-panel">
      <header className="admin-panel__head">
        <h1 className="admin-panel__title">Tournament metadata</h1>
        <p className="admin-panel__sub">
          General metadata, schedule, phases, and the look of this tournament.
        </p>
      </header>

      <div className="admin-advanced">
        <section className="admin-advanced__card">
          <h2>General metadata</h2>
          <Field label="Cockpit name" required>
            <input
              type="text"
              value={general.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder="e.g. World Cup 2026"
            />
          </Field>
          <Field
            label="Abbreviation (fewer than 10 characters)"
            required
            hint={`${general.abbreviation.length}/9`}
          >
            <input
              type="text"
              maxLength={9}
              value={general.abbreviation}
              onChange={(event) => onChange({ abbreviation: event.target.value.slice(0, 9) })}
              placeholder="e.g. FWC2026"
            />
          </Field>
          <Field
            label="Competition ID"
            required
            hint="Assigned when the tournament is created."
          >
            <input type="text" value={general.competitionId} disabled readOnly />
          </Field>
          <Field label="Description" onRevert={() => onChange({ description: '' })}>
            <textarea
              rows={3}
              value={general.description}
              onChange={(event) => onChange({ description: event.target.value })}
              placeholder="e.g. Operations cockpit for the 2026 tournament"
            />
          </Field>
        </section>

        <section className="admin-advanced__card">
          <h2>Schedule</h2>
          <Field
            label="Default time zone"
            required
            onRevert={() => setDefaultZone(DEFAULT_TIMEZONE)}
          >
            <select value={general.timezone} onChange={(event) => setDefaultZone(event.target.value)}>
              {timezones.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Cross-zone time zones"
            hint={
              crossSelected.length > 0
                ? `Selected: ${formatSelectedZones(crossSelected)}`
                : `None selected (Default). Only ${general.timezone} is used.`
            }
            onRevert={() => onChange({ crossTimezones: [] })}
          >
            <div className="admin-checks">
              {TIMEZONE_OPTIONS.map((option) => {
                const isDefault = option.value === general.timezone
                return (
                  <label
                    key={option.value}
                    className={`admin-toggle${isDefault ? ' is-disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      disabled={isDefault}
                      checked={!isDefault && general.crossTimezones.includes(option.value)}
                      onChange={() => toggleCrossZone(option.value)}
                    />
                    <span>
                      {option.value}
                      {isDefault ? ' (default zone)' : ''}
                    </span>
                  </label>
                )
              })}
            </div>
          </Field>
          <Field label="Kickoff" required>
            <input
              type="datetime-local"
              value={general.kickoff}
              onChange={(event) => onChange({ kickoff: event.target.value })}
            />
          </Field>
          <Field label="Final" required>
            <input
              type="datetime-local"
              value={general.finalTime}
              onChange={(event) => onChange({ finalTime: event.target.value })}
            />
          </Field>
          <Field
            label="Weekly/daily report switch"
            hint="Empty means daily from the start date. A date means weekly until that date."
            onRevert={() => onChange({ reportSwitchDate: '' })}
          >
            <input
              type="date"
              value={general.reportSwitchDate}
              onChange={(event) => onChange({ reportSwitchDate: event.target.value })}
            />
          </Field>
        </section>

        <section className="admin-advanced__card">
          <header className="admin-card__head">
            <h2>
              Phases
              <span className="admin-count">
                {general.phases.length} {general.phases.length === 1 ? 'phase' : 'phases'}
              </span>
            </h2>
            <RevertButton label="Phases" onClick={() => onChange({ phases: defaultPhases() })} />
          </header>
          <div className="admin-phases">
            {general.phases.length === 0 ? (
              <p className="admin-field__hint">No phases yet.</p>
            ) : null}
            {general.phases.map((phase, index) => (
              <div key={phase.id} className="admin-phase">
                <span className="admin-phase__index">{index + 1}</span>
                <div className="admin-phase__fields">
                  <label className="admin-field">
                    <span>Title</span>
                    <input
                      type="text"
                      value={phase.title}
                      onChange={(event) => patchPhase(phase.id, { title: event.target.value })}
                      placeholder="e.g. Group stage"
                    />
                  </label>
                  <label className="admin-field">
                    <span>Start date</span>
                    <input
                      type="date"
                      value={phase.startDate}
                      onChange={(event) => patchPhase(phase.id, { startDate: event.target.value })}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="admin-card__remove"
                  aria-label={`Delete ${phase.title || 'phase'}`}
                  onClick={() =>
                    onChange({ phases: general.phases.filter((item) => item.id !== phase.id) })
                  }
                >
                  <img src="/assets/icons/close.svg" alt="" width={12} height={12} />
                </button>
              </div>
            ))}
            <button type="button" className="admin-add-row admin-add-row--block" onClick={addPhase}>
              <span aria-hidden>+</span> Add phase
            </button>
          </div>
        </section>

        <section className="admin-advanced__card">
          <h2>Look</h2>
          <Field
            label="Tournament background"
            onRevert={() => onChange({ defaultBackgroundImage: DEFAULT_COCKPIT_BACKGROUND })}
          >
            <select
              value={general.defaultBackgroundImage}
              onChange={(event) => onChange({ defaultBackgroundImage: event.target.value })}
            >
              {backgrounds.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Preview src={general.defaultBackgroundImage} />
          <Field
            label="Logo"
            hint="Empty uses the default logo."
            onRevert={() => onChange({ logoImage: DEFAULT_COCKPIT_LOGO })}
          >
            <input
              type="text"
              value={general.logoImage}
              onChange={(event) => onChange({ logoImage: event.target.value })}
              placeholder="e.g. /assets/logo-wc26.png"
            />
          </Field>
          <Field label="Font" onRevert={() => onChange({ font: DEFAULT_FONT })}>
            <select value={general.font} onChange={(event) => onChange({ font: event.target.value })}>
              {fonts.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Winning team photo"
            hint="Default: the final host city's background. If that city has no image, the tournament background is used."
            onRevert={() => onChange({ winningTeamPhoto: '' })}
          >
            <input
              type="text"
              value={general.winningTeamPhoto}
              onChange={(event) => onChange({ winningTeamPhoto: event.target.value })}
              placeholder="e.g. /assets/winners-2026.png"
            />
          </Field>
        </section>

        <section className="admin-advanced__card">
          <h2>Lists</h2>
          <Field label="Language" onRevert={() => onChange({ language: DEFAULT_LANGUAGE })}>
            <select
              value={general.language}
              onChange={(event) => onChange({ language: event.target.value })}
            >
              {languages.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Teams" onRevert={() => onChange({ teams: DEFAULT_TEAMS })}>
            <input
              type="text"
              value={general.teams}
              onChange={(event) => onChange({ teams: event.target.value })}
              placeholder="e.g. USA, MEX, CAN"
            />
          </Field>
          <Field label="Matches" onRevert={() => onChange({ matches: DEFAULT_MATCHES })}>
            <input
              type="text"
              value={general.matches}
              onChange={(event) => onChange({ matches: event.target.value })}
              placeholder="e.g. M01–M104"
            />
          </Field>
        </section>
      </div>
    </div>
  )
}

function CardHead({
  title,
  removeLabel,
  onRemove,
}: {
  title: ReactNode
  removeLabel: string
  onRemove: () => void
}) {
  return (
    <header className="admin-card__head">
      <h2>{title}</h2>
      <button type="button" className="admin-card__remove" aria-label={removeLabel} onClick={onRemove}>
        <img src="/assets/icons/close.svg" alt="" width={12} height={12} />
      </button>
    </header>
  )
}

function RowActions({
  label,
  onEdit,
  onDelete,
}: {
  label: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="admin-row-actions">
      <button type="button" className="admin-link" onClick={onEdit}>
        Edit
      </button>
      <button
        type="button"
        className="admin-card__remove"
        aria-label={`Delete ${label}`}
        onClick={onDelete}
      >
        <img src="/assets/icons/close.svg" alt="" width={12} height={12} />
      </button>
    </div>
  )
}

function HostCitiesPanel({
  cities,
  tournamentBackground,
  onChange,
  onRemove,
}: {
  cities: HostCity[]
  tournamentBackground: string
  onChange: (cities: HostCity[]) => void
  onRemove: (cityId: string) => void
}) {
  const [view, setView] = useState<ViewMode>('grid')
  const scrollTo = useScrollToCard(view)

  function patch(cityId: string, next: Partial<HostCity>) {
    onChange(cities.map((city) => (city.id === cityId ? { ...city, ...next } : city)))
  }

  function edit(cityId: string) {
    setView('grid')
    scrollTo(cityId)
  }

  return (
    <div className="admin-panel">
      <header className="admin-panel__head admin-panel__head--row">
        <div>
          <h1 className="admin-panel__title">Host cities</h1>
          <p className="admin-panel__sub">
            Add each host city with its trigram, coordinates, pill color, and optional background.
          </p>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </header>

      {view === 'grid' ? (
        <div className="admin-grid">
          {cities.map((city) => (
            <section key={city.id} id={`admin-card-${city.id}`} className="admin-advanced__card">
              <CardHead
                title={
                  <>
                    <CityPill city={city} />
                    <span>{city.name || 'New city'}</span>
                  </>
                }
                removeLabel={`Remove ${city.name || 'host city'}`}
                onRemove={() => onRemove(city.id)}
              />
              <div className="admin-field-row">
                <Field label="City name" required>
                  <input
                    type="text"
                    value={city.name}
                    onChange={(event) => patch(city.id, { name: event.target.value })}
                    placeholder="e.g. Miami"
                  />
                </Field>
                <Field label="Trigram" required>
                  <input
                    type="text"
                    value={city.trigram}
                    onChange={(event) => patch(city.id, { trigram: event.target.value.toUpperCase() })}
                    placeholder="e.g. MIA"
                  />
                </Field>
              </div>
              <div className="admin-field-row">
                <Field label="Latitude" required>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={city.latitude}
                    onChange={(event) => patch(city.id, { latitude: event.target.value })}
                    placeholder="e.g. 25.7617"
                  />
                </Field>
                <Field label="Longitude" required>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={city.longitude}
                    onChange={(event) => patch(city.id, { longitude: event.target.value })}
                    placeholder="e.g. -80.1918"
                  />
                </Field>
              </div>
              <Field
                label="City pill"
                onRevert={() => patch(city.id, defaultPillFor(city.trigram))}
              >
                <div className="admin-pill-editor">
                  <label className="admin-color">
                    <input
                      type="color"
                      value={city.pillText}
                      onChange={(event) => patch(city.id, { pillText: event.target.value })}
                    />
                    <span>Text</span>
                  </label>
                  <label className="admin-color">
                    <input
                      type="color"
                      value={city.pillBg}
                      onChange={(event) => patch(city.id, { pillBg: event.target.value })}
                    />
                    <span>Background</span>
                  </label>
                  <div className="admin-pill-preview">
                    <CityPill city={city} />
                  </div>
                </div>
                <label className="admin-range">
                  <span>Background opacity {city.pillBgOpacity}%</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={city.pillBgOpacity}
                    onChange={(event) =>
                      patch(city.id, { pillBgOpacity: Number(event.target.value) })
                    }
                  />
                </label>
              </Field>
              <Field
                label="Background image"
                hint="Empty uses the tournament default background."
                onRevert={() => patch(city.id, { backgroundImage: '' })}
              >
                <input
                  type="text"
                  value={city.backgroundImage}
                  onChange={(event) => patch(city.id, { backgroundImage: event.target.value })}
                  placeholder="e.g. /backgrounds/miami.png"
                />
              </Field>
              <Preview src={city.backgroundImage || tournamentBackground} />
            </section>
          ))}
          <button
            type="button"
            className="admin-add-card"
            onClick={() => onChange([...cities, createHostCity()])}
          >
            <span className="admin-create-card__icon" aria-hidden>
              +
            </span>
            Add host city
          </button>
        </div>
      ) : (
        <div className="admin-list">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pill</th>
                  <th>City</th>
                  <th>Trigram</th>
                  <th>Lat / Long</th>
                  <th>Background</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={city.id}>
                    <td>
                      <CityPill city={city} />
                    </td>
                    <td className="admin-table__name">{city.name || 'New city'}</td>
                    <td>{city.trigram}</td>
                    <td className="admin-table__muted">
                      {city.latitude || '—'}, {city.longitude || '—'}
                    </td>
                    <td>
                      <Thumb src={city.backgroundImage || tournamentBackground} />
                    </td>
                    <td>
                      <RowActions
                        label={city.name || 'host city'}
                        onEdit={() => edit(city.id)}
                        onDelete={() => onRemove(city.id)}
                      />
                    </td>
                  </tr>
                ))}
                {cities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-table__muted">
                      No host cities yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="admin-add-row admin-add-row--block"
            onClick={() => {
              const city = createHostCity()
              onChange([...cities, city])
              edit(city.id)
            }}
          >
            <span aria-hidden>+</span> Add host city
          </button>
        </div>
      )}
    </div>
  )
}

function Thumb({ src }: { src: string }) {
  return (
    <span className={`admin-thumb${src ? '' : ' is-empty'}`}>
      {src ? <img src={src} alt="" /> : null}
    </span>
  )
}

function StadiumsPanel({
  stadiums,
  cities,
  tournamentBackground,
  onChange,
}: {
  stadiums: Stadium[]
  cities: HostCity[]
  tournamentBackground: string
  onChange: (stadiums: Stadium[]) => void
}) {
  const [view, setView] = useState<ViewMode>('grid')
  const scrollTo = useScrollToCard(view)

  function patch(stadiumId: string, next: Partial<Stadium>) {
    onChange(
      stadiums.map((stadium) => (stadium.id === stadiumId ? { ...stadium, ...next } : stadium)),
    )
  }

  function remove(stadiumId: string) {
    onChange(stadiums.filter((item) => item.id !== stadiumId))
  }

  function edit(stadiumId: string) {
    setView('grid')
    scrollTo(stadiumId)
  }

  return (
    <div className="admin-panel">
      <header className="admin-panel__head admin-panel__head--row">
        <div>
          <h1 className="admin-panel__title">Stadiums</h1>
          <p className="admin-panel__sub">
            Add each stadium, link it to a host city, and choose a 3D link or a 2D PDF.
          </p>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </header>

      {view === 'grid' ? (
        <div className="admin-grid">
          {stadiums.map((stadium) => {
            const city = cities.find((item) => item.id === stadium.hostCityId)
            return (
              <section
                key={stadium.id}
                id={`admin-card-${stadium.id}`}
                className="admin-advanced__card"
              >
                <CardHead
                  title={
                    <>
                      {stadium.trigram || 'NEW'}
                      {stadium.name ? ` · ${stadium.name}` : ''}
                    </>
                  }
                  removeLabel={`Remove ${stadium.name || 'stadium'}`}
                  onRemove={() => remove(stadium.id)}
                />
                <div className="admin-field-row">
                  <Field label="Stadium name" required>
                    <input
                      type="text"
                      value={stadium.name}
                      onChange={(event) => patch(stadium.id, { name: event.target.value })}
                      placeholder="e.g. Miami Stadium"
                    />
                  </Field>
                  <Field label="Trigram" required>
                    <input
                      type="text"
                      value={stadium.trigram}
                      onChange={(event) =>
                        patch(stadium.id, { trigram: event.target.value.toUpperCase() })
                      }
                      placeholder="e.g. MIAS"
                    />
                  </Field>
                </div>
                <Field label="Host city" onRevert={() => patch(stadium.id, { hostCityId: '' })}>
                  <select
                    value={stadium.hostCityId}
                    onChange={(event) => patch(stadium.id, { hostCityId: event.target.value })}
                  >
                    <option value="">None (Default)</option>
                    {cities.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.trigram ? `${item.trigram} — ${item.name}` : item.name || 'Unnamed city'}
                      </option>
                    ))}
                  </select>
                </Field>
                {city ? (
                  <div className="admin-linked-city">
                    <span className="admin-field__hint">
                      Linked to <CityPill city={city} /> {city.name}
                    </span>
                    <Preview src={city.backgroundImage || tournamentBackground} />
                  </div>
                ) : null}
                <div className="admin-field-row">
                  <Field label="Latitude" required>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={stadium.latitude}
                      onChange={(event) => patch(stadium.id, { latitude: event.target.value })}
                      placeholder="e.g. 25.9580"
                    />
                  </Field>
                  <Field label="Longitude" required>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={stadium.longitude}
                      onChange={(event) => patch(stadium.id, { longitude: event.target.value })}
                      placeholder="e.g. -80.2389"
                    />
                  </Field>
                </div>
                <div className="admin-field">
                  <span className="admin-field__head">
                    <span>3D maps available?</span>
                    <RevertButton
                      label="3D maps available"
                      onClick={() => patch(stadium.id, { maps3d: false })}
                    />
                  </span>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={stadium.maps3d}
                      onChange={(event) => patch(stadium.id, { maps3d: event.target.checked })}
                    />
                    <span>
                      {stadium.maps3d ? 'Yes — use the 3D map link' : 'No (Default) — use a 2D PDF'}
                    </span>
                  </label>
                </div>
                {stadium.maps3d ? (
                  <Field label="3D map link" onRevert={() => patch(stadium.id, { map3dUrl: '' })}>
                    <input
                      type="text"
                      value={stadium.map3dUrl}
                      onChange={(event) => patch(stadium.id, { map3dUrl: event.target.value })}
                      placeholder="e.g. https://imaps.fifa.com/?navmapId=..."
                    />
                  </Field>
                ) : (
                  <Field label="2D map PDF" onRevert={() => patch(stadium.id, { map2dPdf: '' })}>
                    <input
                      type="text"
                      value={stadium.map2dPdf}
                      onChange={(event) => patch(stadium.id, { map2dPdf: event.target.value })}
                      placeholder="e.g. /maps/mias-2d.pdf"
                    />
                  </Field>
                )}
              </section>
            )
          })}
          <button
            type="button"
            className="admin-add-card"
            onClick={() => onChange([...stadiums, createStadium()])}
          >
            <span className="admin-create-card__icon" aria-hidden>
              +
            </span>
            Add stadium
          </button>
        </div>
      ) : (
        <div className="admin-list">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Stadium</th>
                  <th>Trigram</th>
                  <th>Host city</th>
                  <th>Lat / Long</th>
                  <th>Map</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {stadiums.map((stadium) => {
                  const city = cities.find((item) => item.id === stadium.hostCityId)
                  return (
                    <tr key={stadium.id}>
                      <td className="admin-table__name">{stadium.name || 'New stadium'}</td>
                      <td>{stadium.trigram}</td>
                      <td>
                        {city ? (
                          <span className="admin-table__control">
                            <CityPill city={city} />
                            {city.name}
                          </span>
                        ) : (
                          <span className="admin-table__muted">None</span>
                        )}
                      </td>
                      <td className="admin-table__muted">
                        {stadium.latitude || '—'}, {stadium.longitude || '—'}
                      </td>
                      <td>{stadium.maps3d ? '3D link' : '2D PDF'}</td>
                      <td>
                        <RowActions
                          label={stadium.name || 'stadium'}
                          onEdit={() => edit(stadium.id)}
                          onDelete={() => remove(stadium.id)}
                        />
                      </td>
                    </tr>
                  )
                })}
                {stadiums.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-table__muted">
                      No stadiums yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="admin-add-row admin-add-row--block"
            onClick={() => {
              const stadium = createStadium()
              onChange([...stadiums, stadium])
              edit(stadium.id)
            }}
          >
            <span aria-hidden>+</span> Add stadium
          </button>
        </div>
      )}
    </div>
  )
}

function TopBarItemsPanel({
  cockpitTitle,
  pages,
  defaultBackground,
  onPatch,
  onBackgroundChange,
  onMove,
  onAdd,
  onDelete,
  onOpenAdvanced,
}: {
  cockpitTitle: string
  pages: TopBarPageSetting[]
  defaultBackground: string
  onPatch: (id: string, patch: Partial<TopBarPageSetting>) => void
  onBackgroundChange: (id: string, backgroundImage: string) => void
  onMove: (id: string, delta: number) => void
  onAdd: () => void
  onDelete: (id: string) => void
  onOpenAdvanced: (id: string) => void
}) {
  const confirm = useConfirm()
  const baseOptions = uniqueOptions([
    { value: DEFAULT_COCKPIT_BACKGROUND, label: 'Trophy background (Default)' },
    { value: 'general.svg', label: 'General' },
    { value: 'custom-cockpit.svg', label: 'Custom cockpit' },
    { value: defaultBackground, label: 'Cockpit default' },
  ])

  return (
    <div className="admin-panel">
      <header className="admin-panel__head">
        <h1 className="admin-panel__title">Topbar</h1>
        <p className="admin-panel__sub">
          Pages shown in the {cockpitTitle} cockpit top bar. Rename, reorder, hide, and set
          backgrounds from this table.
        </p>
      </header>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Name</th>
              <th>Background</th>
              <th>Visible</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {pages.map((page, index) => {
              const builtIn = BUILT_IN_TOP_BAR_PAGE_IDS.includes(page.id)
              const bg = page.advanced.backgroundImage
              return (
                <tr key={page.id} className={page.visible ? undefined : 'is-muted'}>
                  <td>
                    <div className="admin-table__order">
                      <button
                        type="button"
                        aria-label={`Move ${page.name} up`}
                        disabled={index === 0}
                        onClick={() => onMove(page.id, -1)}
                      >
                        <img src="/assets/icons/arrow-up.svg" alt="" width={12} height={12} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${page.name} down`}
                        disabled={index === pages.length - 1}
                        onClick={() => onMove(page.id, 1)}
                      >
                        <img src="/assets/icons/arrow-down.svg" alt="" width={12} height={12} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="admin-table__name-cell">
                      <input
                        className="admin-table__name-input"
                        type="text"
                        value={page.name}
                        onChange={(event) => onPatch(page.id, { name: event.target.value })}
                        aria-label="Page name"
                      />
                      {page.visibility === 'Classified' ? (
                        <span className="admin-table__tag">Includes confidential content</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className="admin-table__control">
                      <Thumb src={backgroundSrc(bg)} />
                      <select
                        value={bg}
                        onChange={(event) => onBackgroundChange(page.id, event.target.value)}
                        aria-label={`${page.name} background`}
                      >
                        {optionsWithCurrent(baseOptions, bg).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={page.visible}
                        onChange={(event) => onPatch(page.id, { visible: event.target.checked })}
                      />
                      <span>{page.visible ? 'Shown' : 'Hidden'}</span>
                    </label>
                  </td>
                  <td>
                    <span
                      className="admin-tooltip-wrap"
                      data-tooltip={
                        builtIn ? 'Built-in pages can be hidden but not deleted.' : undefined
                      }
                    >
                      <button
                        type="button"
                        className="admin-delete"
                        disabled={builtIn}
                        aria-label={`Delete ${page.name}`}
                        onClick={() =>
                          confirm({
                            title: `Delete “${page.name}”?`,
                            message:
                              'This page and its layout will be removed from the top bar. This cannot be undone.',
                            confirmLabel: 'Delete',
                            onConfirm: () => onDelete(page.id),
                          })
                        }
                      >
                        <img src="/assets/icons/delete.svg" alt="" width={16} height={16} />
                      </button>
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-link"
                      onClick={() => onOpenAdvanced(page.id)}
                    >
                      Advanced options
                      <span className="icon-box">
                        <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
                      </span>
                    </button>
                  </td>
                </tr>
              )
            })}
            <tr className="admin-table__add-row">
              <td colSpan={6}>
                <button type="button" className="admin-add-row" onClick={onAdd}>
                  <span aria-hidden>+</span> Add top bar item
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SidebarItemsPanel({
  cockpitTitle,
  items,
  onToggleVisible,
  onBackgroundChange,
}: {
  cockpitTitle: string
  items: SidebarItemSetting[]
  onToggleVisible: (id: string, visible: boolean) => void
  onBackgroundChange: (id: string, backgroundImage: string) => void
}) {
  return (
    <div className="admin-panel">
      <header className="admin-panel__head">
        <h1 className="admin-panel__title">Sidebar</h1>
        <p className="admin-panel__sub">
          Show or hide tools in the {cockpitTitle} cockpit sidebar, and set their backgrounds.
        </p>
      </header>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Background</th>
              <th>Visible</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={item.visible ? undefined : 'is-muted'}>
                <td>
                  <span className="admin-table__item">
                    <span className="icon-box">
                      <img className="icon" src={item.icon} alt="" />
                    </span>
                    {item.label}
                  </span>
                </td>
                <td>
                  <div className="admin-table__control">
                    <Thumb src={backgroundSrc(item.advanced.backgroundImage)} />
                    <input
                      className="admin-table__name-input"
                      type="text"
                      value={item.advanced.backgroundImage}
                      onChange={(event) => onBackgroundChange(item.id, event.target.value)}
                      placeholder={`e.g. /backgrounds/${item.id}.png`}
                      aria-label={`${item.label} background`}
                    />
                  </div>
                </td>
                <td>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={item.visible}
                      onChange={(event) => onToggleVisible(item.id, event.target.checked)}
                    />
                    <span>{item.visible ? 'Shown' : 'Hidden'}</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AccessPanel() {
  return (
    <div className="admin-panel">
      <header className="admin-panel__head">
        <h1 className="admin-panel__title">Access</h1>
      </header>
      <div className="admin-placeholder">
        Content already exists in production environment - no prototype required.
      </div>
    </div>
  )
}

function TopBarAdvancedPanel({
  page,
  onBack,
  onChange,
}: {
  page: TopBarPageSetting
  onBack: () => void
  onChange: (patch: Partial<TopBarPageAdvanced>) => void
}) {
  const { advanced } = page
  return (
    <div className="admin-panel">
      <header className="admin-panel__head">
        <button type="button" className="admin-back" onClick={onBack}>
          <span className="icon-box">
            <img className="icon" src="/assets/icons/arrow-left.svg" alt="" />
          </span>
          Topbar
        </button>
        <h1 className="admin-panel__title">{page.name} · Advanced</h1>
        <p className="admin-panel__sub">Header contents and page-wide filters.</p>
      </header>

      <div className="admin-advanced">
        <section className="admin-advanced__card">
          <h2>Header bar contents</h2>
          <div className="admin-toggle-row">
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={advanced.showTitle}
                onChange={(event) => onChange({ showTitle: event.target.checked })}
              />
              <span>Page title</span>
            </label>
            <RevertButton label="Page title" onClick={() => onChange({ showTitle: true })} />
          </div>
          <div className="admin-toggle-row">
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={advanced.showDate}
                onChange={(event) => onChange({ showDate: event.target.checked })}
              />
              <span>Date selector</span>
            </label>
            <RevertButton label="Date selector" onClick={() => onChange({ showDate: true })} />
          </div>
          <div className="admin-toggle-row">
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={advanced.showWeather}
                onChange={(event) => onChange({ showWeather: event.target.checked })}
              />
              <span>Weather chip</span>
            </label>
            <RevertButton label="Weather chip" onClick={() => onChange({ showWeather: false })} />
          </div>
          <Field label="Custom link label" onRevert={() => onChange({ customLinkLabel: '' })}>
            <input
              type="text"
              value={advanced.customLinkLabel}
              onChange={(event) => onChange({ customLinkLabel: event.target.value })}
              placeholder="e.g. TOM Agenda"
            />
          </Field>
          <Field label="Custom link URL" onRevert={() => onChange({ customLinkUrl: '' })}>
            <input
              type="text"
              value={advanced.customLinkUrl}
              onChange={(event) => onChange({ customLinkUrl: event.target.value })}
              placeholder="e.g. #tom-agenda"
            />
          </Field>
        </section>

        <section className="admin-advanced__card">
          <h2>Page-wide filters</h2>
          <Field label="Default filters" onRevert={() => onChange({ pageFilters: 'None' })}>
            <input
              type="text"
              value={advanced.pageFilters}
              onChange={(event) => onChange({ pageFilters: event.target.value })}
              placeholder="e.g. Host city, Match day"
            />
          </Field>
        </section>
      </div>
    </div>
  )
}
