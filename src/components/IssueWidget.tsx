import './IssueWidget.css'

export type IssueTag = {
  code: string
  label: string
}

export type IssueDetail = {
  id: string
  title: string
  city: string
  severity: number
  status: 'OPEN' | 'CLOSED'
  body: string
  author: string
  lastUpdated: string
  opened: string
  tags: IssueTag[]
}

type IssueWidgetProps = {
  issue: IssueDetail
}

export function IssueWidget({ issue }: IssueWidgetProps) {
  return (
    <article className="issue-widget">
      <div className="issue-widget__bar">
        <span>Issue detail</span>
      </div>

      <div className="issue-widget__status">
        <span className={`issue-widget__sev is-${Math.min(issue.severity, 5)}`}>{issue.severity}</span>
        <span className="issue-widget__open">{issue.status}</span>
        <span className={`city-pill city-pill--meta ${issue.city.toLowerCase()}`}>{issue.city}</span>
      </div>

      <h3 className="issue-widget__title">{issue.title}</h3>
      <p className="issue-widget__desc">{issue.body}</p>

      <div className="issue-widget__meta">
        <span className="issue-widget__author">
          <span className="issue-widget__avatar" aria-hidden>
            👤
          </span>
          {issue.author}
        </span>
        <span className="issue-widget__chip">
          <em>LAST UPDATED</em> {issue.lastUpdated}
        </span>
        <span className="issue-widget__chip">
          <em>OPENED</em> {issue.opened}
        </span>
      </div>

      <div className="issue-widget__sources">
        <div className="issue-widget__sources-label">Tags</div>
        <div className="issue-widget__tags">
          {issue.tags.map((tag) => (
            <span key={`${tag.code}-${tag.label}`} className="issue-widget__tag">
              <em>{tag.code}</em> {tag.label}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

const DEFAULT_TAGS: IssueTag[] = [
  { code: 'TXT', label: 'Ticketing' },
  { code: 'HOS', label: 'Hospitality' },
  { code: 'VOL', label: 'Volunteers' },
  { code: 'MOC', label: 'Main Operation Center' },
  { code: 'GOP', label: 'Guest Operations' },
  { code: 'ERO', label: 'Broadcast VOL' },
]

/** Build a full issue detail card from sparse recent/starred fields. */
export function buildIssueDetail(input: {
  id: string
  title: string
  city: string
  detail?: string
  when?: string
  severity?: number
}): IssueDetail {
  const when = input.when ?? '11 Jul 22:30'
  return {
    id: input.id,
    title: input.title,
    city: input.city,
    severity: input.severity ?? (input.city === 'LA' ? 4 : 5),
    status: 'OPEN',
    body:
      input.detail ??
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    author: 'John Smith',
    lastUpdated: when,
    opened: when,
    tags: DEFAULT_TAGS,
  }
}
