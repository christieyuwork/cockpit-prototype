import { useState } from 'react'
import './TopBar.css'

const NAV = [
  { label: 'Home' },
  { label: 'Custom views', dropdown: true },
  { label: 'Executive brief', active: true },
  { label: 'Daily brief' },
  { label: 'Tournament Ops Meeting' },
  { label: 'Host cities', dropdown: true },
  { label: 'Stadiums', dropdown: true },
  { label: 'Matches' },
]

const TIMEZONES = ['Time in EST', 'Time in CST', 'Time in PST', 'Time in UTC'] as const

type TopBarProps = {
  notificationsOpen: boolean
  onToggleNotifications: () => void
  unreadCount?: number
}

export function TopBar({
  notificationsOpen,
  onToggleNotifications,
  unreadCount = 0,
}: TopBarProps) {
  const [activeNav, setActiveNav] = useState('Executive brief')
  const [timezone, setTimezone] = useState<(typeof TIMEZONES)[number]>('Time in EST')
  const [tzOpen, setTzOpen] = useState(false)

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
        {NAV.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`topbar__nav-item${activeNav === item.label ? ' is-active' : ''}`}
            onClick={() => setActiveNav(item.label)}
          >
            <span>{item.label}</span>
            {item.dropdown ? (
              <span className="icon-box">
                <img className="icon" src="/assets/chevron-down.svg" alt="" />
              </span>
            ) : null}
          </button>
        ))}
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
              <img className="icon" src="/assets/chevron-down.svg" alt="" />
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
          <img src="/assets/communications.svg" alt="" width={24} height={24} />
          {unreadCount > 0 ? (
            <span className="topbar__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          ) : null}
        </button>
      </div>
    </header>
  )
}
