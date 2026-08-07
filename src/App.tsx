import { useState } from 'react'
import { TopBar } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { NotificationPanel, RECENT_NEW_COUNT } from './components/NotificationPanel'
import './App.css'

type NotifTab = 'Recent' | 'Starred' | 'Query'

function App() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifTab, setNotifTab] = useState<NotifTab>('Recent')
  const [recentDotsCleared, setRecentDotsCleared] = useState(false)
  const unreadCount = recentDotsCleared ? 0 : RECENT_NEW_COUNT

  return (
    <div className="app-shell">
      <div className="app-shell__bg" aria-hidden />
      <TopBar
        notificationsOpen={notificationsOpen}
        unreadCount={unreadCount}
        onToggleNotifications={() => setNotificationsOpen((open) => !open)}
      />
      <div className="app-shell__body">
        <Sidebar />
        <main className="app-shell__main">
          <Dashboard compact={notificationsOpen} />
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
          />
        </div>
      </div>
    </div>
  )
}

export default App
