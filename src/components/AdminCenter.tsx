import { useMemo, useState } from 'react'
import {
  ACCESS_OPTIONS,
  ADMIN_RIGHTS_OPTIONS,
  COCKPIT_STATUS_OPTIONS,
  DEFAULT_COCKPIT_BACKGROUND,
  DEFAULT_COCKPIT_LOGO,
  VISIBILITY_OPTIONS,
  createTopBarPage,
  defaultGeneralSettings,
  type AdminRights,
  type CockpitAdminSettings,
  type CockpitGeneralSettings,
  type CockpitId,
  type CockpitProfile,
  type CockpitStatus,
  type PageVisibility,
  type SidebarItemSetting,
  type TopBarPageAdvanced,
  type TopBarPageSetting,
} from '../data/adminCenter'
import './AdminCenter.css'
import './TopBar.css'

export type AdminSection = 'cockpits' | 'general' | 'topbar' | 'sidebar'

type AdvancedTarget =
  | { kind: 'topbar'; pageId: string }
  | { kind: 'sidebar'; itemId: string }
  | null

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
  const [advanced, setAdvanced] = useState<AdvancedTarget>(null)
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

  function resetGeneral() {
    onSettingsChange(activeCockpitId, {
      ...settings,
      general: defaultGeneralSettings(settings.general.name || 'New cockpit'),
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
        page.id === pageId
          ? { ...page, advanced: { ...page.advanced, ...patch } }
          : page,
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

  function updateSidebarItem(itemId: string, patch: Partial<SidebarItemSetting>) {
    onSettingsChange(activeCockpitId, {
      ...settings,
      sidebarItems: settings.sidebarItems.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    })
  }

  const advancedTopBar =
    advanced?.kind === 'topbar'
      ? settings.topBarPages.find((page) => page.id === advanced.pageId)
      : undefined
  const advancedSidebar =
    advanced?.kind === 'sidebar'
      ? settings.sidebarItems.find((item) => item.id === advanced.itemId)
      : undefined

  return (
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
            onClick={() => {
              setAdvanced(null)
              onSectionChange('cockpits')
            }}
          >
            All cockpits
          </button>
          <div className="admin__nav-divider" aria-hidden />
          <p className="admin__nav-cockpit">{activeCockpit?.title ?? 'Cockpit'} settings</p>
          <button
            type="button"
            className={`admin__nav-item${section === 'general' ? ' is-active' : ''}`}
            onClick={() => {
              setAdvanced(null)
              onSectionChange('general')
            }}
          >
            General settings
          </button>
          <button
            type="button"
            className={`admin__nav-item${section === 'topbar' ? ' is-active' : ''}`}
            onClick={() => {
              setAdvanced(null)
              onSectionChange('topbar')
            }}
          >
            Top bar items
          </button>
          <button
            type="button"
            className={`admin__nav-item${section === 'sidebar' ? ' is-active' : ''}`}
            onClick={() => {
              setAdvanced(null)
              onSectionChange('sidebar')
            }}
          >
            Sidebar items
          </button>
        </aside>

        <main className="admin__main scroll-area">
          {advancedTopBar ? (
            <TopBarAdvancedPanel
              page={advancedTopBar}
              defaultBackground={settings.general.defaultBackgroundImage}
              onBack={() => setAdvanced(null)}
              onChange={(patch) => updateTopBarAdvanced(advancedTopBar.id, patch)}
            />
          ) : advancedSidebar ? (
            <SidebarAdvancedPanel
              item={advancedSidebar}
              onBack={() => setAdvanced(null)}
              onChange={(patch) =>
                updateSidebarItem(advancedSidebar.id, {
                  advanced: { ...advancedSidebar.advanced, ...patch },
                })
              }
            />
          ) : section === 'cockpits' ? (
            <CockpitsPanel
              cockpits={orderedCockpits}
              activeCockpitId={activeCockpitId}
              onSelect={(id) => {
                onActiveCockpitChange(id)
                onSectionChange('general')
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
          ) : section === 'general' ? (
            <GeneralSettingsPanel
              general={settings.general}
              onChange={updateGeneral}
              onReset={resetGeneral}
            />
          ) : section === 'topbar' ? (
            <TopBarItemsPanel
              cockpitTitle={settings.general.name || activeCockpit?.title || 'Cockpit'}
              pages={settings.topBarPages}
              onRename={(id, name) => updateTopBarPage(id, { name })}
              onVisibilityChange={(id, visibility) => updateTopBarPage(id, { visibility })}
              onAdminRightsChange={(id, adminRights) => updateTopBarPage(id, { adminRights })}
              onMove={moveTopBarPage}
              onAdd={addTopBarPage}
              onOpenAdvanced={(pageId) => setAdvanced({ kind: 'topbar', pageId })}
            />
          ) : (
            <SidebarItemsPanel
              cockpitTitle={settings.general.name || activeCockpit?.title || 'Cockpit'}
              items={settings.sidebarItems}
              onToggleVisible={(id, visible) => updateSidebarItem(id, { visible })}
              onOpenAdvanced={(itemId) => setAdvanced({ kind: 'sidebar', itemId })}
            />
          )}
        </main>
      </div>
    </div>
  )
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
  const active = cockpits.filter((profile) => profile.permanent || profile.status !== 'archived')
  const archived = cockpits.filter((profile) => !profile.permanent && profile.status === 'archived')

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
            {profile.permanent
              ? 'Active'
              : profile.status === 'completed'
                ? 'Completed'
                : profile.status === 'active'
                  ? 'Active'
                  : 'Archived'}
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
              <select
                value={profile.status}
                onChange={(event) =>
                  onStatusChange(profile.id, event.target.value as CockpitStatus)
                }
              >
                {COCKPIT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="admin-cockpit__order">
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

  return (
    <div className="admin-panel">
      <header className="admin-panel__head">
        <h1 className="admin-panel__title">All cockpits</h1>
        <p className="admin-panel__sub">
          Manage visibility, status, and order in the Switch profile list.
        </p>
      </header>
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
    </div>
  )
}

function GeneralSettingsPanel({
  general,
  onChange,
  onReset,
}: {
  general: CockpitGeneralSettings
  onChange: (patch: Partial<CockpitGeneralSettings>) => void
  onReset: () => void
}) {
  return (
    <div className="admin-panel">
      <header className="admin-panel__head admin-panel__head--row">
        <div>
          <h1 className="admin-panel__title">General settings</h1>
          <p className="admin-panel__sub">
            Cockpit identity, access, branding, and competition lists.
          </p>
        </div>
        <button type="button" className="admin-reset" onClick={onReset}>
          Reset to default
        </button>
      </header>

      <div className="admin-advanced">
        <section className="admin-advanced__card">
          <h2>Identity</h2>
          <label className="admin-field">
            <span>Cockpit name</span>
            <input
              type="text"
              value={general.name}
              onChange={(event) => onChange({ name: event.target.value })}
            />
          </label>
          <label className="admin-field">
            <span>Description</span>
            <input
              type="text"
              value={general.description}
              onChange={(event) => onChange({ description: event.target.value })}
              placeholder="Optional summary"
            />
          </label>
          <label className="admin-field">
            <span>Access</span>
            <select
              value={general.access}
              onChange={(event) =>
                onChange({ access: event.target.value as CockpitGeneralSettings['access'] })
              }
            >
              {ACCESS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Roles</span>
            <input
              type="text"
              value={general.roles}
              onChange={(event) => onChange({ roles: event.target.value })}
              placeholder="ADM, TEC, OPS"
            />
          </label>
        </section>

        <section className="admin-advanced__card">
          <h2>Branding</h2>
          <label className="admin-field">
            <span>Default background image</span>
            <select
              value={general.defaultBackgroundImage}
              onChange={(event) => onChange({ defaultBackgroundImage: event.target.value })}
            >
              <option value={DEFAULT_COCKPIT_BACKGROUND}>Trophy default</option>
              <option value="/backgrounds/general.svg">General</option>
              <option value="/backgrounds/custom-cockpit.svg">Custom cockpit</option>
            </select>
          </label>
          <div className="admin-preview">
            <img src={general.defaultBackgroundImage} alt="" />
          </div>
          <label className="admin-field">
            <span>Logo image</span>
            <input
              type="text"
              value={general.logoImage}
              onChange={(event) => onChange({ logoImage: event.target.value })}
            />
          </label>
          <label className="admin-field">
            <span>Timezone</span>
            <select
              value={general.timezone}
              onChange={(event) => onChange({ timezone: event.target.value })}
            >
              {['Time in EST', 'Time in CST', 'Time in PST', 'Time in UTC'].map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Language</span>
            <select
              value={general.language}
              onChange={(event) => onChange({ language: event.target.value })}
            >
              {['English', 'Spanish', 'French', 'German'].map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="admin-advanced__card">
          <h2>Competition data</h2>
          <label className="admin-field">
            <span>Host cities</span>
            <input
              type="text"
              value={general.hostCities}
              onChange={(event) => onChange({ hostCities: event.target.value })}
            />
          </label>
          <label className="admin-field">
            <span>Teams</span>
            <input
              type="text"
              value={general.teams}
              onChange={(event) => onChange({ teams: event.target.value })}
            />
          </label>
          <label className="admin-field">
            <span>Matches</span>
            <input
              type="text"
              value={general.matches}
              onChange={(event) => onChange({ matches: event.target.value })}
            />
          </label>
        </section>
      </div>
    </div>
  )
}

function TopBarItemsPanel({
  cockpitTitle,
  pages,
  onRename,
  onVisibilityChange,
  onAdminRightsChange,
  onMove,
  onAdd,
  onOpenAdvanced,
}: {
  cockpitTitle: string
  pages: TopBarPageSetting[]
  onRename: (id: string, name: string) => void
  onVisibilityChange: (id: string, visibility: PageVisibility) => void
  onAdminRightsChange: (id: string, adminRights: AdminRights) => void
  onMove: (id: string, delta: number) => void
  onAdd: () => void
  onOpenAdvanced: (id: string) => void
}) {
  return (
    <div className="admin-panel">
      <header className="admin-panel__head">
        <h1 className="admin-panel__title">Top bar items</h1>
        <p className="admin-panel__sub">
          Pages shown in the {cockpitTitle} cockpit top bar. Rename and reorder from this table.
        </p>
      </header>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Name</th>
              <th>Visibility</th>
              <th>Admin rights</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pages.map((page, index) => (
              <tr key={page.id}>
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
                      onChange={(event) => onRename(page.id, event.target.value)}
                      aria-label="Page name"
                    />
                    {page.visibility === 'Classified' ? (
                      <span className="admin-table__tag">Classified</span>
                    ) : null}
                  </div>
                </td>
                <td>
                  <select
                    value={page.visibility}
                    onChange={(event) =>
                      onVisibilityChange(page.id, event.target.value as PageVisibility)
                    }
                  >
                    {VISIBILITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={page.adminRights}
                    onChange={(event) =>
                      onAdminRightsChange(page.id, event.target.value as AdminRights)
                    }
                  >
                    {ADMIN_RIGHTS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
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
            ))}
            <tr className="admin-table__add-row">
              <td colSpan={5}>
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
  onOpenAdvanced,
}: {
  cockpitTitle: string
  items: SidebarItemSetting[]
  onToggleVisible: (id: string, visible: boolean) => void
  onOpenAdvanced: (id: string) => void
}) {
  return (
    <div className="admin-panel">
      <header className="admin-panel__head">
        <h1 className="admin-panel__title">Sidebar items</h1>
        <p className="admin-panel__sub">
          Show or hide tools in the {cockpitTitle} cockpit sidebar.
        </p>
      </header>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Visible</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="admin-table__item">
                    <span className="icon-box">
                      <img className="icon" src={item.icon} alt="" />
                    </span>
                    {item.label}
                  </span>
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
                <td>
                  <button
                    type="button"
                    className="admin-link"
                    onClick={() => onOpenAdvanced(item.id)}
                  >
                    Advanced options
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
    </div>
  )
}

function TopBarAdvancedPanel({
  page,
  defaultBackground,
  onBack,
  onChange,
}: {
  page: TopBarPageSetting
  defaultBackground: string
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
          Top bar items
        </button>
        <h1 className="admin-panel__title">{page.name} · Advanced</h1>
        <p className="admin-panel__sub">Header contents, background, and page-wide filters.</p>
      </header>

      <div className="admin-advanced">
        <section className="admin-advanced__card">
          <h2>Header bar contents</h2>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={advanced.showTitle}
              onChange={(event) => onChange({ showTitle: event.target.checked })}
            />
            <span>Page title</span>
          </label>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={advanced.showDate}
              onChange={(event) => onChange({ showDate: event.target.checked })}
            />
            <span>Date selector</span>
          </label>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={advanced.showWeather}
              onChange={(event) => onChange({ showWeather: event.target.checked })}
            />
            <span>Weather chip</span>
          </label>
          <label className="admin-field">
            <span>Custom link label</span>
            <input
              type="text"
              value={advanced.customLinkLabel}
              onChange={(event) => onChange({ customLinkLabel: event.target.value })}
              placeholder="e.g. TOM Agenda"
            />
          </label>
          <label className="admin-field">
            <span>Custom link URL</span>
            <input
              type="text"
              value={advanced.customLinkUrl}
              onChange={(event) => onChange({ customLinkUrl: event.target.value })}
              placeholder="#tom-agenda"
            />
          </label>
        </section>

        <section className="admin-advanced__card">
          <h2>Page background</h2>
          <label className="admin-field">
            <span>Background image</span>
            <select
              value={advanced.backgroundImage}
              onChange={(event) => onChange({ backgroundImage: event.target.value })}
            >
              <option value={DEFAULT_COCKPIT_BACKGROUND}>Trophy default</option>
              <option value="general.svg">General</option>
              <option value="custom-cockpit.svg">Custom cockpit</option>
              <option value={defaultBackground}>Cockpit default</option>
            </select>
          </label>
        </section>

        <section className="admin-advanced__card">
          <h2>Page-wide filters</h2>
          <label className="admin-field">
            <span>Default filters</span>
            <input
              type="text"
              value={advanced.pageFilters}
              onChange={(event) => onChange({ pageFilters: event.target.value })}
              placeholder="None"
            />
          </label>
        </section>
      </div>
    </div>
  )
}

function SidebarAdvancedPanel({
  item,
  onBack,
  onChange,
}: {
  item: SidebarItemSetting
  onBack: () => void
  onChange: (patch: Partial<SidebarItemSetting['advanced']>) => void
}) {
  const { advanced } = item
  return (
    <div className="admin-panel">
      <header className="admin-panel__head">
        <button type="button" className="admin-back" onClick={onBack}>
          <span className="icon-box">
            <img className="icon" src="/assets/icons/arrow-left.svg" alt="" />
          </span>
          Sidebar items
        </button>
        <h1 className="admin-panel__title">{item.label} · Advanced</h1>
        <p className="admin-panel__sub">Background and module-level settings.</p>
      </header>

      <div className="admin-advanced">
        <section className="admin-advanced__card">
          <h2>Background image</h2>
          <label className="admin-field">
            <span>Image URL or asset</span>
            <input
              type="text"
              value={advanced.backgroundImage}
              onChange={(event) => onChange({ backgroundImage: event.target.value })}
              placeholder="Optional"
            />
          </label>
        </section>
        <section className="admin-advanced__card">
          <h2>Other settings</h2>
          <label className="admin-field">
            <span>Default filter</span>
            <input
              type="text"
              value={advanced.defaultFilter}
              onChange={(event) => onChange({ defaultFilter: event.target.value })}
              placeholder="Placeholder"
            />
          </label>
          <label className="admin-field">
            <span>Notes</span>
            <input
              type="text"
              value={advanced.notes}
              onChange={(event) => onChange({ notes: event.target.value })}
              placeholder="Placeholder"
            />
          </label>
        </section>
      </div>
    </div>
  )
}
