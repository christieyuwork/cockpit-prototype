import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { QueryIntent } from '../data/query'
import { QueryChatbot, type StarableWidget } from './QueryChatbot'
import { QueryWidgetBundle } from './QueryWidgets'
import {
  ArrivalDetailWidget,
  IssueDetailWidget,
  MatchDetailWidget,
  PressDetailWidget,
  ReportDetailWidget,
  buildArrivalDetail,
  buildMatchDetail,
  buildPressDetail,
  buildReportDetail,
  issueFromSparse,
} from './DetailWidgets'
import { WidgetMeta } from './WidgetMeta'
import './NotificationPanel.css'

type Tab = 'Recent' | 'Starred' | 'Query'

type NotificationPanelProps = {
  tab: Tab
  onTabChange: (tab: Tab) => void
  recentDotsCleared: boolean
  onRecentDotsCleared: () => void
  /** Deep-link: expand this Recent/Starred card id on mount. */
  initialExpandId?: string | null
  /** Deep-link: seed Query with this intent response (risk|flights|issues|matchday). */
  seedIntent?: string | null
}

type RecentItem =
  | {
      id: string
      time: string
      kind: 'match'
      city: string
      scoreL: string
      scoreR: string
      matchup: string
      matchId: string
      detail: string
      isNew?: boolean
    }
  | {
      id: string
      time: string
      kind: 'issue'
      city: string
      count: string
      title: string
      meta: string
      detail: string
      severity?: number
      isNew?: boolean
    }
  | {
      id: string
      time: string
      kind: 'doc'
      title: string
      link: string
      detail: string
      isNew?: boolean
    }
  | {
      id: string
      time: string
      kind: 'arrival'
      title: string
      detail: string
      isNew?: boolean
    }
  | {
      id: string
      time: string
      kind: 'press'
      city: string
      title: string
      detail: string
      isNew?: boolean
    }

const RECENT_CATEGORY: Record<RecentItem['kind'], string> = {
  match: 'Match',
  issue: 'Issue',
  doc: 'Report',
  arrival: 'Arrival',
  press: 'Press',
}

const RECENT_DAYS: { date: string; items: RecentItem[] }[] = [
  {
    date: '13 Jul',
    items: [
      {
        id: 'r1',
        time: '09:30',
        kind: 'match',
        city: 'SEA',
        scoreL: '2',
        scoreR: '1',
        matchup: 'BEL v. EGY',
        matchId: 'M37',
        isNew: true,
        detail:
          'Kickoff 18:00 local. Broadcast power redundancy validated. Watch last-mile densification around the stadium precinct through T-90.',
      },
      {
        id: 'r2',
        time: '19:37',
        kind: 'issue',
        city: 'MIA',
        count: '3',
        title: 'Crowd flow risk at Miami Stadium',
        meta: '3 new comments',
        severity: 5,
        isNew: true,
        detail:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      },
      {
        id: 'r3',
        time: '14:12',
        kind: 'doc',
        title: 'New TOM minutes — access & pitch actions',
        link: 'View',
        isNew: true,
        detail:
          'Four open actions from yesterday’s minutes: MIA access RCA, pitch retest outcome, LA demonstration posture, SEA Matchday confirmation.',
      },
      {
        id: 'r4',
        time: '11:05',
        kind: 'arrival',
        title: 'Team USA arrived · MIA hotel transfer complete',
        detail: 'Charter wheels-down 10:42. Motorcade cleared. Hotel check-in complete; training window unchanged.',
      },
      {
        id: 'r5',
        time: '08:40',
        kind: 'press',
        city: 'PHL',
        title: 'Press Conference · Media compound Desk B',
        detail: 'Mixed zone congestion expected 30 min pre/post. Overflow desks C–D available. Media shuttle every 10 minutes.',
      },
    ],
  },
  {
    date: '12 Jul',
    items: [
      {
        id: 'r6',
        time: '21:10',
        kind: 'match',
        city: 'MIA',
        scoreL: '1',
        scoreR: '0',
        matchup: 'USA v. PAR',
        matchId: 'M38',
        detail: 'Full-time. No major incidents. Pitch walk deferred pending overnight remediation clearance.',
      },
      {
        id: 'r7',
        time: '18:22',
        kind: 'issue',
        city: 'LA',
        count: '2',
        title: 'Los Angeles Demonstrations — watch window set',
        meta: '1 new comment',
        severity: 4,
        isNew: true,
        detail:
          'Est. 2–4k participants near fan fest, 15:00–21:00. Soft-closure plan ready with local LE. Hospitality remains green if plaza stays open.',
      },
      {
        id: 'r8',
        time: '15:04',
        kind: 'doc',
        title: 'Host city transport densification note',
        link: 'View',
        detail: 'SEA last-mile surge plan updated. Additional shuttle loops from 15:00. Parking lot C reserved for broadcast compounds.',
      },
      {
        id: 'r9',
        time: '12:48',
        kind: 'arrival',
        title: 'Team BEL delayed 40 min into SEA',
        detail: 'ETA revised to 18:31 (+62s buffer on ground ops). Hotel transfer slots slid; training still on schedule.',
      },
      {
        id: 'r10',
        time: '09:15',
        kind: 'press',
        city: 'SEA',
        title: 'Matchday Ops Brief published',
        detail: 'Brief covers weather, risk chips, ticketing status, and related fixtures for M37. Sources linked in Query widgets.',
      },
    ],
  },
]

export const RECENT_NEW_COUNT = RECENT_DAYS.reduce(
  (total, day) => total + day.items.filter((item) => item.isNew).length,
  0,
)

type StarredItem = {
  id: string
  type: 'Issue' | 'Match' | 'Reports' | 'AI'
  title?: string
  city?: string
  when: string
  match?: boolean
  intent?: Exclude<QueryIntent, 'general'>
  prompt?: string
  detail?: string
}

const INITIAL_STARRED: StarredItem[] = [
  {
    id: 's1',
    type: 'Issue',
    title: 'Crowd flow risk at Miami Stadium',
    city: 'MIA',
    when: '11 Jul 22:30',
    detail:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    id: 's2',
    type: 'Match',
    city: 'SEA',
    when: '11 Jul 22:30',
    match: true,
    detail: 'BEL v. EGY · M37 · Kickoff 18:00. Readiness tracking green with last-mile densification as main watchpoint.',
  },
  {
    id: 's3',
    type: 'Reports',
    title: 'Operational Report 15 Jun',
    city: 'MIA',
    when: '11 Jul 20:10',
    detail: 'Daily ops summary covering access control failover, pitch remediation, and gate staffing levels.',
  },
  {
    id: 's4',
    type: 'Issue',
    title: 'Los Angeles Demonstrations',
    city: 'LA',
    when: '11 Jul 18:05',
    detail: 'Watch window 15:00–21:00. Soft-closure plan prepared with local LE for west plaza.',
  },
]

const FILTERS = {
  Recent: ['All notifications', 'Matches', 'Issues', 'Documents'],
  Starred: ['All starred', 'Issues', 'Matches', 'Reports', 'AI widgets'],
  Query: ['All queries'],
} as const

function StarButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      className={`notif__star-btn${active ? ' is-active' : ''}`}
      aria-label={label}
      onClick={onClick}
    >
      <span className="icon-box">
        <img
          className="icon"
          src={active ? '/assets/icons/starred.svg' : '/assets/icons/star.svg'}
          alt=""
        />
      </span>
    </button>
  )
}

function AccordionToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`notif__accordion${open ? ' is-open' : ''}`}
      aria-expanded={open}
      onClick={onClick}
    >
      <span>{open ? 'Hide details' : 'View details'}</span>
      <span className="icon-box">
        <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
      </span>
    </button>
  )
}

export function NotificationPanel({
  tab,
  onTabChange,
  recentDotsCleared,
  onRecentDotsCleared,
  initialExpandId = null,
  seedIntent = null,
}: NotificationPanelProps) {
  const tabs: Tab[] = ['Recent', 'Starred', 'Query']
  const [filter, setFilter] = useState('All notifications')
  const [filterOpen, setFilterOpen] = useState(false)
  const [starred, setStarred] = useState(INITIAL_STARRED)
  const [pendingUnstar, setPendingUnstar] = useState<Set<string>>(() => new Set())
  const [starToast, setStarToast] = useState<{ undoId: string } | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const [expandedRecent, setExpandedRecent] = useState<string | null>(() =>
    initialExpandId && initialExpandId.startsWith('r') ? initialExpandId : null,
  )
  const [expandedStarred, setExpandedStarred] = useState<string | null>(() =>
    initialExpandId && initialExpandId.startsWith('s') ? initialExpandId : null,
  )

  const filterOptions = FILTERS[tab]

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  const recentDays = useMemo(() => {
    if (filter === 'All notifications') return RECENT_DAYS
    return RECENT_DAYS.map((day) => ({
      ...day,
      items: day.items.filter((item) => {
        if (filter === 'Matches') return item.kind === 'match'
        if (filter === 'Issues') return item.kind === 'issue'
        if (filter === 'Documents') return item.kind === 'doc'
        return true
      }),
    })).filter((day) => day.items.length > 0)
  }, [filter])

  const starredItems = useMemo(() => {
    if (filter === 'All starred') return starred
    if (filter === 'Issues') return starred.filter((item) => item.type === 'Issue')
    if (filter === 'Matches') return starred.filter((item) => item.type === 'Match')
    if (filter === 'Reports') return starred.filter((item) => item.type === 'Reports')
    if (filter === 'AI widgets') return starred.filter((item) => item.type === 'AI')
    return starred
  }, [filter, starred])

  const starredWidgetIds = useMemo(
    () =>
      starred
        .filter((item) => item.type === 'AI' && !pendingUnstar.has(item.id))
        .map((item) => item.id),
    [starred, pendingUnstar],
  )

  function isActivelyStarred(id: string) {
    return starred.some((s) => s.id === id) && !pendingUnstar.has(id)
  }

  function showStarredToast(undoId: string) {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    setStarToast({ undoId })
    toastTimerRef.current = window.setTimeout(() => setStarToast(null), 5000)
  }

  function undoStar() {
    if (!starToast) return
    const id = starToast.undoId
    setStarred((prev) => prev.filter((s) => s.id !== id))
    setPendingUnstar((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setStarToast(null)
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
  }

  function flushPendingUnstars() {
    if (pendingUnstar.size === 0) return
    const pending = pendingUnstar
    setStarred((prev) => prev.filter((s) => !pending.has(s.id)))
    setPendingUnstar(new Set())
  }

  function queueUnstar(id: string) {
    if (tab === 'Starred') {
      setPendingUnstar((prev) => new Set(prev).add(id))
      return
    }
    setStarred((prev) => prev.filter((s) => s.id !== id))
    setPendingUnstar((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function restoreStar(id: string) {
    setPendingUnstar((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function toggleStarWidget(widget: StarableWidget) {
    const exists = starred.some((s) => s.id === widget.messageId)
    if (exists) {
      if (pendingUnstar.has(widget.messageId)) {
        restoreStar(widget.messageId)
        showStarredToast(widget.messageId)
        return
      }
      queueUnstar(widget.messageId)
      return
    }
    setStarred((prev) => [
      {
        id: widget.messageId,
        type: 'AI',
        title: widget.title,
        when: 'Just now',
        intent: widget.intent,
        prompt: widget.prompt,
        detail: widget.prompt,
      },
      ...prev,
    ])
    showStarredToast(widget.messageId)
  }

  function toggleStarFromRecent(item: RecentItem) {
    const id = `from-${item.id}`
    const exists = starred.some((s) => s.id === id)
    if (exists) {
      if (pendingUnstar.has(id)) {
        restoreStar(id)
        showStarredToast(id)
        return
      }
      queueUnstar(id)
      return
    }

    if (item.kind === 'match') {
      setStarred((prev) => [
        {
          id,
          type: 'Match',
          city: item.city,
          when: 'Just now',
          match: true,
          detail: item.detail,
        },
        ...prev,
      ])
    } else if (item.kind === 'issue') {
      setStarred((prev) => [
        {
          id,
          type: 'Issue',
          title: item.title,
          city: item.city,
          when: 'Just now',
          detail: item.detail,
        },
        ...prev,
      ])
    } else {
      setStarred((prev) => [
        {
          id,
          type: 'Reports',
          title: item.title,
          city: 'city' in item ? item.city : 'SEA',
          when: 'Just now',
          detail: item.detail,
        },
        ...prev,
      ])
    }
    showStarredToast(id)
  }

  function toggleStarredItemStar(id: string) {
    if (pendingUnstar.has(id)) {
      restoreStar(id)
      showStarredToast(id)
      return
    }
    queueUnstar(id)
  }

  function onSelectTab(next: Tab) {
    if (tab === 'Starred' && next !== 'Starred') {
      flushPendingUnstars()
    }
    if (tab === 'Recent' && next !== 'Recent') {
      onRecentDotsCleared()
    }
    onTabChange(next)
    setFilterOpen(false)
    setFilter(FILTERS[next][0])
  }

  return (
    <aside className="notif" aria-label="Notifications">
      {starToast
        ? createPortal(
            <div className="star-toast" role="status">
              <span>Your item was starred. </span>
              <button type="button" className="star-toast__undo" onClick={undoStar}>
                Undo
              </button>
            </div>,
            document.body,
          )
        : null}

      <div className="tab-bar notif__tabs">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            className={`tab${tab === t ? ' active' : ''}`}
            onClick={() => onSelectTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="notif__body">
        {tab !== 'Query' ? (
          <div className="notif__header">
            <h2 className="section-title">{tab === 'Starred' ? 'STARRED' : 'RECENT'}</h2>
            <div className="notif__filter">
              <button type="button" className="chip" onClick={() => setFilterOpen((v) => !v)}>
                {filter}
                <span className="icon-box">
                  <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
                </span>
              </button>
              {filterOpen ? (
                <div className="notif__filter-list">
                  {filterOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={option === filter ? 'is-active' : undefined}
                      onClick={() => {
                        setFilter(option)
                        setFilterOpen(false)
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="notif__header">
            <h2 className="section-title">QUERY</h2>
            <span className="notif__muted">Simulated AI</span>
          </div>
        )}

        <div className={`notif__list scroll-area${tab === 'Query' ? ' notif__list--chat' : ''}`}>
          {/* Keep Query mounted so conversation persists across tabs */}
          <div className={tab === 'Query' ? 'notif__pane' : 'notif__pane notif__pane--hidden'} hidden={tab !== 'Query'}>
            <QueryChatbot
              starredWidgetIds={starredWidgetIds}
              onToggleStarWidget={toggleStarWidget}
              seedIntent={seedIntent}
            />
          </div>

          {tab === 'Starred' ? (
            <div className="notif__starred">
              {starredItems.map((item) => {
                const isOpen = expandedStarred === item.id
                const activelyStarred = isActivelyStarred(item.id)
                return (
                  <article
                    key={item.id}
                    className={`notif__card${item.type === 'AI' ? ' notif__card--ai' : ''}${
                      isOpen ? ' is-open' : ''
                    }${activelyStarred ? '' : ' is-unstarring'}`}
                  >
                    <StarButton
                      active={activelyStarred}
                      label={activelyStarred ? 'Unstar' : 'Star'}
                      onClick={() => toggleStarredItemStar(item.id)}
                    />
                    <div className="notif__card-main">
                      <WidgetMeta
                        category={item.type === 'AI' ? 'AI' : item.type}
                        timestamp={item.when}
                        location={item.city}
                      />
                      {item.match ? (
                        <div className="notif__match-row">
                          <span className="notif__score">2</span>
                          <img className="notif__flag" src="/assets/flag-uy.svg" alt="" />
                          <span>BEL v. EGY</span>
                          <img className="notif__flag" src="/assets/flag-cv.svg" alt="" />
                          <span className="notif__muted">1</span>
                          <span className="notif__match-id">
                            M37
                            <span className="icon-box">
                              <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
                            </span>
                          </span>
                        </div>
                      ) : (
                        <div className="notif__card-title-row">
                          <span>{item.title}</span>
                        </div>
                      )}
                      {item.type === 'AI' && item.prompt ? (
                        <p className="notif__card-prompt">{item.prompt}</p>
                      ) : null}
                      <div className="notif__card-foot">
                        <AccordionToggle
                          open={isOpen}
                          onClick={() =>
                            setExpandedStarred((cur) => (cur === item.id ? null : item.id))
                          }
                        />
                      </div>
                      {isOpen ? (
                        <div className="notif__card-detail">
                          {item.type === 'AI' && item.intent ? (
                            <article className="detail-widget">
                              <WidgetMeta
                                category="AI"
                                timestamp={item.when}
                                location={
                                  item.intent === 'matchday'
                                    ? 'SEA'
                                    : item.intent === 'risk' || item.intent === 'issues'
                                      ? 'MIA'
                                      : undefined
                                }
                              />
                              <QueryWidgetBundle intent={item.intent} />
                            </article>
                          ) : item.type === 'Issue' && item.title && item.city ? (
                            <IssueDetailWidget
                              issue={issueFromSparse({
                                id: item.id,
                                title: item.title,
                                city: item.city,
                                detail: item.detail,
                                when: item.when,
                                severity: item.city === 'LA' ? 4 : 5,
                              })}
                            />
                          ) : item.type === 'Match' ? (
                            <MatchDetailWidget
                              match={buildMatchDetail({
                                city: item.city ?? 'SEA',
                                detail: item.detail,
                                when: item.when,
                              })}
                            />
                          ) : item.type === 'Reports' && item.title ? (
                            <ReportDetailWidget
                              report={buildReportDetail({
                                title: item.title,
                                city: item.city,
                                detail: item.detail,
                                when: item.when,
                              })}
                            />
                          ) : (
                            <ReportDetailWidget
                              report={buildReportDetail({
                                title: item.title ?? 'Starred item',
                                city: item.city,
                                detail: item.detail,
                                when: item.when,
                              })}
                            />
                          )}
                        </div>
                      ) : null}
                    </div>
                  </article>
                )
              })}
              {starredItems.length === 0 ? <p className="notif__empty">Nothing starred yet.</p> : null}
            </div>
          ) : null}

          {tab === 'Recent' ? (
            <>
              {recentDays.map((day) => (
                <section key={day.date} className="notif__day">
                  <h3 className="notif__muted">{day.date}</h3>
                  {day.items.map((item) => {
                    const starId = `from-${item.id}`
                    const isStarred = isActivelyStarred(starId)
                    const isOpen = expandedRecent === item.id
                    const showNewDot = Boolean(item.isNew) && !recentDotsCleared
                    return (
                      <article
                        key={item.id}
                        className={`notif__card notif__card--recent${isOpen ? ' is-open' : ''}${
                          isStarred ? ' is-starred' : ''
                        }${showNewDot ? ' is-new' : ''}`}
                      >
                        {showNewDot ? <span className="notif__new-dot" aria-label="New" /> : null}
                        <StarButton
                          active={isStarred}
                          label={isStarred ? 'Unstar' : 'Star'}
                          onClick={() => toggleStarFromRecent(item)}
                        />
                        <div className="notif__card-main">
                          <WidgetMeta
                            category={RECENT_CATEGORY[item.kind]}
                            timestamp={`${day.date} ${item.time}`}
                            location={'city' in item ? item.city : undefined}
                          />
                          {item.kind === 'match' ? (
                            <div className="notif__match-row">
                              <span className="notif__score">{item.scoreL}</span>
                              <img className="notif__flag" src="/assets/flag-uy.svg" alt="" />
                              <span>{item.matchup}</span>
                              <img className="notif__flag" src="/assets/flag-cv.svg" alt="" />
                              <span className="notif__muted">{item.scoreR}</span>
                              <span className="notif__match-id">
                                {item.matchId}
                                <span className="icon-box">
                                  <img className="icon" src="/assets/icons/arrow-right.svg" alt="" />
                                </span>
                              </span>
                            </div>
                          ) : null}
                          {item.kind === 'issue' ? (
                            <div className="notif__issue">
                              <div className="notif__issue-top">
                                <span className="notif__issue-count">{item.count}</span>
                                <span className="notif__issue-label">Issue</span>
                              </div>
                              <p>{item.title}</p>
                              <p className="notif__muted">{item.meta}</p>
                            </div>
                          ) : null}
                          {item.kind === 'doc' ? (
                            <div className="notif__doc">
                              <span>{item.title}</span>
                            </div>
                          ) : null}
                          {item.kind === 'arrival' ? (
                            <div className="notif__arrival">
                              <img className="notif__flag notif__flag--lg" src="/assets/usa-flag.png" alt="" />
                              <span>{item.title}</span>
                            </div>
                          ) : null}
                          {item.kind === 'press' ? (
                            <div className="notif__press">
                              <span>{item.title}</span>
                            </div>
                          ) : null}
                          <div className="notif__card-foot">
                            <AccordionToggle
                              open={isOpen}
                              onClick={() =>
                                setExpandedRecent((cur) => (cur === item.id ? null : item.id))
                              }
                            />
                          </div>
                          {isOpen ? (
                            <div className="notif__card-detail">
                              {item.kind === 'issue' ? (
                                <IssueDetailWidget
                                  issue={issueFromSparse({
                                    id: item.id,
                                    title: item.title,
                                    city: item.city,
                                    detail: item.detail,
                                    when: `${day.date} ${item.time}`,
                                    severity: item.severity,
                                  })}
                                />
                              ) : item.kind === 'match' ? (
                                <MatchDetailWidget
                                  match={buildMatchDetail({
                                    city: item.city,
                                    matchup: item.matchup,
                                    matchId: item.matchId,
                                    scoreL: item.scoreL,
                                    scoreR: item.scoreR,
                                    detail: item.detail,
                                    when: `${day.date} ${item.time}`,
                                  })}
                                />
                              ) : item.kind === 'arrival' ? (
                                <ArrivalDetailWidget
                                  arrival={buildArrivalDetail({
                                    title: item.title,
                                    detail: item.detail,
                                    when: `${day.date} ${item.time}`,
                                  })}
                                />
                              ) : item.kind === 'press' ? (
                                <PressDetailWidget
                                  press={buildPressDetail({
                                    title: item.title,
                                    city: item.city,
                                    detail: item.detail,
                                    when: `${day.date} ${item.time}`,
                                  })}
                                />
                              ) : (
                                <ReportDetailWidget
                                  report={buildReportDetail({
                                    title: item.title,
                                    detail: item.detail,
                                    when: `${day.date} ${item.time}`,
                                  })}
                                />
                              )}
                            </div>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </section>
              ))}
              {recentDays.length === 0 ? (
                <p className="notif__empty">No notifications for this filter.</p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
