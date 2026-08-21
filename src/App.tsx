import { useMemo, useState } from 'react'
import { TopBar } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { NotificationPanel, RECENT_NEW_COUNT } from './components/NotificationPanel'
import { NewViewModal, type NewViewDraft } from './components/NewViewModal'
import { ModulePicker, type ModuleCounts } from './components/ModulePicker'
import { CustomViewCanvas } from './components/CustomViewCanvas'
import { AdminCenter, type AdminSection } from './components/AdminCenter'
import {
  EXEC_BRIEF_ID,
  ISSUES_PAGE_ID,
  SEED_VIEWS,
  SYSTEM_VIEWS,
  WWC_SYSTEM_VIEWS,
  type AppView,
  type PlacedModule,
} from './data/customViews'
import {
  DEFAULT_COCKPITS,
  newCockpitSettings,
  seedAllCockpitSettings,
  type CockpitAdminSettings,
  type CockpitId,
  type CockpitProfile,
} from './data/adminCenter'
import { countModulesByKind, packModules } from './lib/grid'
import './App.css'

type NotifTab = 'Recent' | 'Starred' | 'Query'

const NOTIF_TABS: NotifTab[] = ['Recent', 'Starred', 'Query']
const ALL_VIEWS: AppView[] = [...SYSTEM_VIEWS, ...SEED_VIEWS]
const WWC_ALL_VIEWS: AppView[] = [...WWC_SYSTEM_VIEWS, ...SEED_VIEWS]

function cloneViews(source: AppView[] = ALL_VIEWS): AppView[] {
  return source.map((view) => ({
    ...view,
    sharedWith: [...view.sharedWith],
    modules: view.modules.map((module) => ({ ...module })),
  }))
}

function emptyViewsFromSettings(cockpitId: CockpitId, settings: CockpitAdminSettings): AppView[] {
  return settings.topBarPages.map((page) => ({
    id: `${cockpitId}-${page.id}`,
    title: page.name,
    navLabel: page.name,
    system: true,
    visibility: 'Anyone at FIFA' as const,
    sharedWith: [],
    modules: [],
  }))
}

function syncViewsWithTopBar(
  cockpitId: CockpitId,
  settings: CockpitAdminSettings,
  existing: AppView[],
): AppView[] {
  const customs = existing.filter((view) => !view.system)
  const system = settings.topBarPages.map((page) => {
    const isIssues = page.id === 'issues' || page.name === 'Issues'
    const match =
      existing.find((view) => view.system && view.id === `${cockpitId}-${page.id}`) ??
      (isIssues
        ? existing.find((view) => view.system && (view.id === ISSUES_PAGE_ID || view.layout === 'issues'))
        : undefined) ??
      existing.find((view) => view.system && view.navLabel === page.name) ??
      existing.find((view) => view.system && view.title === page.name)
    if (match) {
      return {
        ...match,
        id: match.layout === 'issues' || match.id === ISSUES_PAGE_ID
          ? match.id
          : match.id.startsWith(`${cockpitId}-`)
            ? match.id
            : `${cockpitId}-${page.id}`,
        title: page.name,
        navLabel: page.name,
        layout: match.layout ?? (isIssues ? ('issues' as const) : undefined),
      }
    }
    return {
      id: isIssues ? ISSUES_PAGE_ID : `${cockpitId}-${page.id}`,
      title: page.name,
      navLabel: page.name,
      system: true as const,
      visibility: 'Anyone at FIFA' as const,
      sharedWith: [],
      modules: [],
      layout: isIssues ? ('issues' as const) : undefined,
    }
  })
  return [...system, ...customs]
}

function seedViewsByCockpit(): Record<CockpitId, AppView[]> {
  return {
    wc26: cloneViews(),
    wwc: cloneViews(WWC_ALL_VIEWS),
    youth: cloneViews(),
    corporate: cloneViews(),
  }
}

function panelParams() {
  const params = new URLSearchParams(window.location.search)
  const tabParam = params.get('tab')
  const tab = NOTIF_TABS.includes(tabParam as NotifTab) ? (tabParam as NotifTab) : 'Recent'
  return {
    open: params.get('panel') === '1' || params.get('panel') === 'open',
    tab,
    expand: params.get('expand'),
    intent: params.get('intent'),
  }
}

type Screen =
  | { name: 'newView' }
  | { name: 'selectModules'; viewId: string }
  | { name: 'canvas'; viewId: string }
  | { name: 'admin'; section: AdminSection }

function initialViewId() {
  const params = new URLSearchParams(window.location.search)
  const viewId = params.get('view')
  if (viewId && ALL_VIEWS.some((view) => view.id === viewId)) return viewId
  return EXEC_BRIEF_ID
}

function navForView(view: AppView | undefined) {
  if (!view) return 'Home'
  if (view.system) return view.navLabel ?? view.title
  return 'Custom views'
}

function App() {
  const boot = panelParams()
  const [notificationsOpen, setNotificationsOpen] = useState(boot.open)
  const [notifTab, setNotifTab] = useState<NotifTab>(boot.tab)
  const [recentDotsCleared, setRecentDotsCleared] = useState(false)
  const [viewsByCockpit, setViewsByCockpit] = useState(seedViewsByCockpit)
  const [screen, setScreen] = useState<Screen>(() => ({ name: 'canvas', viewId: initialViewId() }))
  const [activeNav, setActiveNav] = useState(() =>
    navForView(ALL_VIEWS.find((view) => view.id === initialViewId())),
  )
  const [configuring, setConfiguring] = useState(false)
  const [cockpits, setCockpits] = useState<CockpitProfile[]>(DEFAULT_COCKPITS)
  const [activeProfileId, setActiveProfileId] = useState<CockpitId>('wc26')
  const [adminCockpitId, setAdminCockpitId] = useState<CockpitId>('wc26')
  const [cockpitSettings, setCockpitSettings] = useState(seedAllCockpitSettings)

  const unreadCount = recentDotsCleared ? 0 : RECENT_NEW_COUNT
  const views = viewsByCockpit[activeProfileId] ?? []
  const canvasId =
    screen.name === 'selectModules' || screen.name === 'canvas' ? screen.viewId : ''
  const activeView = views.find((view) => view.id === canvasId)
  const customViews = views.filter((view) => !view.system)
  const activeSettings = cockpitSettings[activeProfileId]
  const navLabels = useMemo(
    () => activeSettings?.topBarPages.map((page) => page.name) ?? [],
    [activeSettings?.topBarPages],
  )

  function updateViews(updater: (current: AppView[]) => AppView[]) {
    setViewsByCockpit((current) => ({
      ...current,
      [activeProfileId]: updater(current[activeProfileId] ?? []),
    }))
  }

  function openCockpitHome(cockpitId: CockpitId) {
    const settings = cockpitSettings[cockpitId]
    const cockpitViews = viewsByCockpit[cockpitId] ?? []
    const firstName = settings?.topBarPages[0]?.name
    const page =
      (firstName
        ? cockpitViews.find((view) => view.system && view.navLabel === firstName)
        : undefined) ?? cockpitViews.find((view) => view.system) ?? cockpitViews[0]

    setActiveProfileId(cockpitId)
    setConfiguring(false)
    if (page) {
      setActiveNav(navForView(page))
      setScreen({ name: 'canvas', viewId: page.id })
    } else {
      setActiveNav('Home')
      setScreen({ name: 'canvas', viewId: '' })
    }
  }

  function createView(draft: NewViewDraft) {
    const view: AppView = { id: `v${Date.now()}`, ...draft, modules: [] }
    updateViews((current) => [...current, view])
    setConfiguring(true)
    setScreen({ name: 'selectModules', viewId: view.id })
  }

  function addModules(viewId: string, counts: ModuleCounts) {
    updateViews((current) =>
      current.map((view) =>
        view.id === viewId ? { ...view, modules: packModules(counts, view.modules) } : view,
      ),
    )
    setConfiguring(true)
    setScreen({ name: 'canvas', viewId })
  }

  function updateModules(viewId: string, modules: PlacedModule[]) {
    updateViews((current) =>
      current.map((view) => (view.id === viewId ? { ...view, modules } : view)),
    )
  }

  function saveViewSettings(viewId: string, draft: NewViewDraft) {
    updateViews((current) =>
      current.map((view) => (view.id === viewId ? { ...view, ...draft } : view)),
    )
  }

  function deleteView(viewId: string) {
    updateViews((current) => current.filter((view) => view.id !== viewId))
    openCockpitHome(activeProfileId)
  }

  function openView(viewId: string) {
    const view = views.find((item) => item.id === viewId)
    setActiveNav(navForView(view))
    setConfiguring(false)
    setScreen(
      view && view.modules.length === 0
        ? { name: 'selectModules', viewId }
        : { name: 'canvas', viewId },
    )
  }

  function openPage(label: string) {
    const page = views.find((view) => view.system && view.navLabel === label)
    if (!page) return
    setActiveNav(label)
    setConfiguring(false)
    setScreen({ name: 'canvas', viewId: page.id })
  }

  function openAdmin(cockpitId: CockpitId, section: AdminSection) {
    setAdminCockpitId(cockpitId)
    setActiveProfileId(cockpitId)
    setConfiguring(false)
    setNotificationsOpen(false)
    setScreen({ name: 'admin', section })
  }

  function createCockpit() {
    const id = `cockpit-${Date.now()}`
    const title = 'New cockpit'
    const order = cockpits.reduce((max, item) => Math.max(max, item.order), -1) + 1
    const settings = newCockpitSettings(title)
    const profile: CockpitProfile = {
      id,
      title,
      role: 'Project Administrator',
      status: 'active',
      image: '/backgrounds/default-cockpit.png',
      overlay: 0.45,
      visible: true,
      order,
      hasAdmin: true,
    }
    setCockpits((current) => [...current, profile])
    setCockpitSettings((current) => ({ ...current, [id]: settings }))
    setViewsByCockpit((current) => ({
      ...current,
      [id]: emptyViewsFromSettings(id, settings),
    }))
    openAdmin(id, 'general')
  }

  function updateAdminSettings(cockpitId: CockpitId, settings: CockpitAdminSettings) {
    setCockpitSettings((current) => ({ ...current, [cockpitId]: settings }))
    setViewsByCockpit((current) => ({
      ...current,
      [cockpitId]: syncViewsWithTopBar(cockpitId, settings, current[cockpitId] ?? []),
    }))
  }

  const isUserCustom = Boolean(activeView && !activeView.system)
  const isAdmin = screen.name === 'admin'

  if (isAdmin) {
    return (
      <AdminCenter
        cockpits={cockpits}
        settingsByCockpit={cockpitSettings}
        activeCockpitId={adminCockpitId}
        section={screen.section}
        onSectionChange={(section) => setScreen({ name: 'admin', section })}
        onActiveCockpitChange={setAdminCockpitId}
        onCockpitsChange={setCockpits}
        onSettingsChange={updateAdminSettings}
        onCreateCockpit={createCockpit}
        onReturn={() => openCockpitHome(adminCockpitId)}
      />
    )
  }

  return (
    <div
      className={`app-shell${isUserCustom ? ' is-custom' : ''}`}
      data-cockpit={activeProfileId}
    >
      <div className="app-shell__bg" aria-hidden />
      <TopBar
        notificationsOpen={notificationsOpen}
        unreadCount={unreadCount}
        onToggleNotifications={() => setNotificationsOpen((open) => !open)}
        activeNav={activeNav}
        onNavigate={openPage}
        customViews={customViews}
        onOpenCustomView={openView}
        onAddCustomView={() => {
          setActiveNav('Custom views')
          setScreen({ name: 'newView' })
        }}
        navLabels={navLabels}
        cockpits={cockpits}
        activeProfileId={activeProfileId}
        onActiveProfileChange={(id) => openCockpitHome(id)}
        onOpenAdminCenter={(id) => openAdmin(id, 'general')}
        onOpenAllCockpits={() => openAdmin(activeProfileId, 'cockpits')}
      />
      <div className="app-shell__body">
        <Sidebar
          items={activeSettings?.sidebarItems ?? []}
          activeId={activeNav === 'Issues' ? 'issues' : undefined}
          onNavigate={(itemId) => {
            if (itemId === 'issues') {
              const page =
                views.find((view) => view.id === ISSUES_PAGE_ID) ??
                views.find((view) => view.system && view.navLabel === 'Issues')
              if (page) {
                setActiveNav(page.navLabel ?? page.title)
                setConfiguring(false)
                setScreen({ name: 'canvas', viewId: page.id })
              }
            }
          }}
        />
        <main
          className={`app-shell__main${screen.name === 'selectModules' ? ' is-flush' : ''}`}
        >
          {screen.name === 'selectModules' && activeView ? (
            <ModulePicker
              viewTitle={activeView.title}
              existingCounts={countModulesByKind(activeView.modules)}
              seedDefaults={activeView.modules.length === 0}
              onBack={() => {
                setConfiguring(true)
                setScreen({ name: 'canvas', viewId: activeView.id })
              }}
              onConfirm={(counts) => addModules(activeView.id, counts)}
            />
          ) : activeView ? (
            <CustomViewCanvas
              key={`${activeProfileId}-${activeView.id}`}
              view={activeView}
              configuring={configuring}
              onConfiguringChange={setConfiguring}
              onChange={(modules) => updateModules(activeView.id, modules)}
              onSaveSettings={(draft) => saveViewSettings(activeView.id, draft)}
              onDeleteView={activeView.system ? undefined : () => deleteView(activeView.id)}
              onAddModules={() => {
                setConfiguring(true)
                setScreen({ name: 'selectModules', viewId: activeView.id })
              }}
            />
          ) : null}
        </main>
        <div
          className={`notif-slot${notificationsOpen ? ' is-open' : ''}`}
          aria-hidden={!notificationsOpen}
        >
          <NotificationPanel
            tab={notifTab}
            onTabChange={setNotifTab}
            recentDotsCleared={recentDotsCleared}
            onRecentDotsCleared={() => setRecentDotsCleared(true)}
            initialExpandId={boot.expand}
            seedIntent={boot.intent}
          />
        </div>
      </div>

      {screen.name === 'newView' ? (
        <NewViewModal
          onCancel={() => openCockpitHome(activeProfileId)}
          onSubmit={createView}
        />
      ) : null}
    </div>
  )
}

export default App
