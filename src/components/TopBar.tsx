import { useEffect, useMemo, useRef, useState } from 'react'
import type { CustomView } from '../data/customViews'
import type { CockpitId, CockpitProfile } from '../data/adminCenter'
import './TopBar.css'

const TIMEZONES = ['Time in EST', 'Time in CST', 'Time in PST', 'Time in UTC'] as const

type TopBarProps = {
  notificationsOpen: boolean
  onToggleNotifications: () => void
  unreadCount?: number
  activeNav: string
  onNavigate: (label: string) => void
  customViews: CustomView[]
  onOpenCustomView: (id: string) => void
  onAddCustomView: () => void
  navLabels: string[]
  cockpits: CockpitProfile[]
  activeProfileId: CockpitId
  onActiveProfileChange: (id: CockpitId) => void
  onOpenAdminCenter: (cockpitId: CockpitId) => void
  onOpenAllCockpits: () => void
}

export function TopBar({
  notificationsOpen,
  onToggleNotifications,
  unreadCount = 0,
  activeNav,
  onNavigate,
  customViews,
  onOpenCustomView,
  onAddCustomView,
  navLabels,
  cockpits,
  activeProfileId,
  onActiveProfileChange,
  onOpenAdminCenter,
  onOpenAllCockpits,
}: TopBarProps) {
  const [timezone, setTimezone] = useState<(typeof TIMEZONES)[number]>('Time in EST')
  const [tzOpen, setTzOpen] = useState(false)
  const [viewsOpen, setViewsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const viewsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const visibleCockpits = useMemo(
    () =>
      [...cockpits]
        .filter((item) => item.visible && (item.permanent || item.status !== 'archived'))
        .sort((a, b) => a.order - b.order),
    [cockpits],
  )

  const navItems = useMemo(
    () =>
      navLabels.map((label) => ({
        label,
        dropdown:
          label === 'Custom views' || label === 'Host cities' || label === 'Stadiums',
      })),
    [navLabels],
  )

  useEffect(() => {
    if (!viewsOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!viewsRef.current?.contains(event.target as Node)) setViewsOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setViewsOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [viewsOpen])

  useEffect(() => {
    if (!profileOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [profileOpen])

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <img className="topbar__wc26" src="/assets/logo-wc26.png" alt="FIFA World Cup 26" />
        <span className="topbar__divider" aria-hidden />
        <div className="topbar__lenovo">
          <img src="/assets/logo-lenovo.svg" alt="" />
          <img className="topbar__lenovo-mark" src="/assets/logo-lenovo-mark.svg" alt="Lenovo" />
        </div>
      </div>

      <nav className="topbar__nav" aria-label="Primary">
        {navItems.map((item) =>
          item.label === 'Custom views' ? (
            <div key={item.label} className="topbar__views" ref={viewsRef}>
              <button
                type="button"
                className={`topbar__nav-item${activeNav === item.label ? ' is-active' : ''}`}
                aria-expanded={viewsOpen}
                aria-haspopup="menu"
                onClick={() => setViewsOpen((open) => !open)}
              >
                <span>{item.label}</span>
                <span className="icon-box">
                  <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
                </span>
              </button>
              {viewsOpen ? (
                <div className="views-menu acrylic-card" role="menu">
                  <div className="views-menu__grid">
                    {customViews.map((view) => (
                      <button
                        key={view.id}
                        type="button"
                        className="views-menu__tile"
                        role="menuitem"
                        onClick={() => {
                          onOpenCustomView(view.id)
                          setViewsOpen(false)
                        }}
                      >
                        {view.title}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="views-menu__add"
                      role="menuitem"
                      onClick={() => {
                        onAddCustomView()
                        setViewsOpen(false)
                      }}
                    >
                      <span className="icon-box">
                        <img className="icon" src="/assets/icons/data-store.svg" alt="" />
                      </span>
                      Add view
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              key={item.label}
              type="button"
              className={`topbar__nav-item${activeNav === item.label ? ' is-active' : ''}`}
              onClick={() => onNavigate(item.label)}
            >
              <span>{item.label}</span>
              {item.dropdown ? (
                <span className="icon-box">
                  <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
                </span>
              ) : null}
            </button>
          ),
        )}
      </nav>

      <div className="topbar__actions">
        <div className="topbar__tz">
          <button
            type="button"
            className="chip topbar__timezone"
            onClick={() => setTzOpen((v) => !v)}
            aria-expanded={tzOpen}
          >
            {timezone}
            <span className="icon-box">
              <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
            </span>
          </button>
          {tzOpen ? (
            <div className="topbar__tz-list">
              {TIMEZONES.map((tz) => (
                <button
                  key={tz}
                  type="button"
                  className={tz === timezone ? 'is-active' : undefined}
                  onClick={() => {
                    setTimezone(tz)
                    setTzOpen(false)
                  }}
                >
                  {tz}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className={`topbar__comms${notificationsOpen ? ' is-open' : ''}`}
          aria-label={
            unreadCount > 0
              ? `Communications, ${unreadCount} new`
              : 'Communications'
          }
          aria-pressed={notificationsOpen}
          onClick={onToggleNotifications}
        >
          <img src="/assets/icons/chat.svg" alt="" width={24} height={24} />
          {unreadCount > 0 ? (
            <span className="topbar__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          ) : null}
        </button>
        <div className="topbar__profile" ref={profileRef}>
          <button
            type="button"
            className={`topbar__avatar${profileOpen ? ' is-open' : ''}`}
            aria-label="Account menu"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => {
              setTzOpen(false)
              setProfileOpen((open) => !open)
            }}
          >
            <span className="topbar__avatar-face" aria-hidden>
              JS
            </span>
          </button>
          {profileOpen ? (
            <div className="profile-menu" role="menu">
              <div className="profile-menu__user">
                <div className="profile-menu__identity">
                  <span className="topbar__avatar-face topbar__avatar-face--lg" aria-hidden>
                    JS
                  </span>
                  <div className="profile-menu__who">
                    <p className="profile-menu__name">John Smith</p>
                    <p className="profile-menu__email">johnsmith@email.com</p>
                  </div>
                </div>
                <div className="profile-menu__user-actions">
                  <button type="button" className="profile-menu__btn" role="menuitem">
                    <span className="icon-box">
                      <img className="icon" src="/assets/icons/settings.svg" alt="" />
                    </span>
                    Personal settings
                  </button>
                  <button type="button" className="profile-menu__btn profile-menu__btn--logout" role="menuitem">
                    <span className="icon-box">
                      <img className="icon" src="/assets/icons/logout.svg" alt="" />
                    </span>
                    Log out
                  </button>
                </div>
              </div>
              <div className="profile-menu__switch">
                <div className="profile-menu__switch-head">
                  <p className="profile-menu__switch-title">Switch profile</p>
                  <button
                    type="button"
                    className="profile-menu__view-all"
                    onClick={() => {
                      setProfileOpen(false)
                      onOpenAllCockpits()
                    }}
                  >
                    View all
                  </button>
                </div>
                {visibleCockpits.map((profile) => {
                  const selected = profile.id === activeProfileId
                  return (
                    <div
                      key={profile.id}
                      className={`profile-card${selected ? ' is-selected' : ''}${profile.image ? '' : ' profile-card--solid'}`}
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
                        role="menuitemradio"
                        aria-checked={selected}
                        onClick={() => onActiveProfileChange(profile.id)}
                      >
                        {profile.status ? (
                          <span
                            className={`profile-card__badge${profile.status === 'active' ? ' is-active' : ''}${
                              profile.status === 'archived' ? ' is-archived' : ''
                            }`}
                          >
                            {profile.status !== 'archived' ? (
                              <span className="icon-box">
                                <img
                                  className="icon"
                                  src={
                                    profile.status === 'completed'
                                      ? '/assets/icons/status-check.svg'
                                      : '/assets/icons/status-dot.svg'
                                  }
                                  alt=""
                                />
                              </span>
                            ) : null}
                            {profile.status === 'completed'
                              ? 'Completed'
                              : profile.status === 'active'
                                ? 'Active'
                                : 'Archived'}
                          </span>
                        ) : null}
                        <span className="profile-card__copy">
                          <span className="profile-card__title">{profile.title}</span>
                          <span className="profile-card__role">{profile.role}</span>
                        </span>
                      </button>
                      {selected && profile.hasAdmin ? (
                        <button
                          type="button"
                          className="profile-menu__btn"
                          role="menuitem"
                          onClick={() => {
                            setProfileOpen(false)
                            onOpenAdminCenter(profile.id)
                          }}
                        >
                          <span className="icon-box">
                            <img className="icon" src="/assets/icons/tune.svg" alt="" />
                          </span>
                          Admin center
                        </button>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
