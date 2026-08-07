import './Sidebar.css'

const ICONS = [
  '/assets/sidebar-1.svg',
  '/assets/sidebar-2.svg',
  '/assets/sidebar-3.svg',
  '/assets/sidebar-4.svg',
  '/assets/sidebar-5.svg',
  '/assets/sidebar-6.svg',
  '/assets/sidebar-7.svg',
  '/assets/sidebar-8.svg',
  '/assets/sidebar-9.svg',
  '/assets/sidebar-10.svg',
]

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Secondary">
      <div className="sidebar__inner">
        <div className="sidebar__group">
          {ICONS.map((src, index) => (
            <button key={src} type="button" className="sidebar__btn" aria-label={`Nav ${index + 1}`}>
              <span className="icon-box" style={{ width: index === 6 ? 32 : 28, height: index === 6 ? 32 : 28 }}>
                <img className="icon" src={src} alt="" />
              </span>
            </button>
          ))}
        </div>
        <button type="button" className="sidebar__btn sidebar__btn--bottom" aria-label="Feedback">
          <span className="sidebar__bottom-wrap">
            <span className="icon-box" style={{ width: 24, height: 24 }}>
              <img className="icon" src="/assets/sidebar-bottom.svg" alt="" />
            </span>
          </span>
        </button>
      </div>
    </aside>
  )
}
