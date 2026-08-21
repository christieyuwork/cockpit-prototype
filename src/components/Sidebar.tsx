import type { SidebarItemSetting } from '../data/adminCenter'
import './Sidebar.css'

export function Sidebar({
  items,
  activeId,
  onNavigate,
}: {
  items: SidebarItemSetting[]
  activeId?: string
  onNavigate?: (itemId: string) => void
}) {
  const visible = items.filter((item) => item.visible)

  return (
    <aside className="sidebar" aria-label="Secondary">
      <div className="sidebar__inner">
        <div className="sidebar__group">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar__btn${activeId === item.id ? ' is-active' : ''}`}
              aria-label={item.label}
              aria-current={activeId === item.id ? 'page' : undefined}
              onClick={() => onNavigate?.(item.id)}
            >
              <span
                className="icon-box"
                style={{
                  width: item.id === 'live-feed' ? 32 : 28,
                  height: item.id === 'live-feed' ? 32 : 28,
                }}
              >
                <img className="icon" src={item.icon} alt="" />
              </span>
            </button>
          ))}
        </div>
        <button type="button" className="sidebar__btn sidebar__btn--bottom" aria-label="Feedback">
          <span className="sidebar__bottom-wrap">
            <span className="icon-box" style={{ width: 24, height: 24 }}>
              <img className="icon" src="/assets/icons/feedback.svg" alt="" />
            </span>
          </span>
        </button>
      </div>
    </aside>
  )
}
