export type QueryIntent = 'risk' | 'flights' | 'issues' | 'matchday' | 'general'

export type SourceLink = {
  label: string
  href: string
  meta?: string
}

export type RiskSnippet = {
  id: string
  title: string
  excerpt: string
  city?: string
  source: SourceLink
}

export type FlightLeg = {
  code: string
  city: string
  date: string
  status: 'Depart' | 'Arrive'
  time: string
}

export type FlightCard = {
  id: string
  label: string
  kind: 'referees' | 'team'
  statusTone: 'ok' | 'alert'
  from: FlightLeg
  to: FlightLeg
  source: SourceLink
}

export type IssueRow = {
  id: string
  severity: 5 | 4 | 3 | 2
  city: string
  category: string
  title: string
  summary: string
  source: SourceLink
}

export type MatchTicketingRow = {
  label: string
  value: string
  pct: string
}

export type MatchWidgetData = {
  city: string
  date: string
  home: string
  away: string
  group: string
  matchId: string
  time: string
  score?: [string, string]
  weather: string
  risks: { label: string; tone: 'risk' | 'neutral' | 'ok' }[]
  standings: {
    rank: number
    team: string
    badge?: 'Q' | 'E'
    w: number
    d: number
    l: number
    pts: number
    gd: string
  }[]
  related: {
    city: string
    matchup: string
    matchId: string
    when: string
    group: string
    weather: string
  }[]
  ticketing: MatchTicketingRow[]
  sources: SourceLink[]
}

export type ActionConfirm = {
  text: string
  linkLabel: string
  href: string
}

export type ActionField = {
  label: string
  value: string
  /** When set, field renders as a required dropdown until the user picks a value. */
  options?: string[]
  required?: boolean
}

export type ActionDraft = {
  title: string
  subtitle?: string
  fields: ActionField[]
  cta: string
  sources?: SourceLink[]
  confirm?: ActionConfirm
}

/** Controls which evidence widgets render for a scenario step. */
export type ScenarioWidgetLayout =
  | 'intent'
  | 'miami-detail'
  | 'miami-open-actions'
  | 'action-only'
  | 'action-result'
  | 'curacao-flights'
  | 'curacao-map'
  | 'curacao-contacts'
  | 'curacao-hotels'
  | 'curacao-calendar'
  | 'attendance-matchday'
  | 'attendance-weather'
  | 'attendance-transport'
  | 'attendance-perimeter'
  | 'weather-impacted'
  | 'weather-ops-impact'
  | 'venue-summary'
  | 'venue-yellow'
  | 'venue-focus'
  | 'tom-agenda'
  | 'tom-actions'
  | 'tom-delta'
  | 'argentina-ops'
  | 'argentina-risks'
  | 'argentina-owners'
  | 'sop-handle'
  | 'sop-escalation'
  | 'sop-full'
  | 'external-la'
  | 'external-impact'

export type ScenarioStep = {
  prompt: string
  answer: string
  intent: QueryIntent
  action?: ActionDraft
  /** Defaults to intent-based widgets when omitted. */
  widgets?: ScenarioWidgetLayout
}

export type CitySnapshot = {
  city: string
  weather: { condition: string; temp: string; wbgt: string; wind: string }
  stadium: {
    name: string
    status: string
    capacity: string
    nextMatch: string
    gates: string
  }
  contacts: { role: string; name: string; detail: string }[]
}

export type SwitchableReport = {
  id: string
  label: string
  title: string
  excerpt: string
  updated: string
  source: SourceLink
}

export type PromptLibraryItem = {
  id: string
  priority: 'P1' | 'P2' | 'P3'
  scenario: string
  capability: string
  persona: string
  context: string
  steps: ScenarioStep[]
}

/** Scenario library — P1 chips are recommended; all appear in the library popover. */
export const PROMPT_LIBRARY: PromptLibraryItem[] = [
  {
    id: 'exec-risk',
    priority: 'P1',
    scenario: 'Executive Risk Investigation Copilot',
    capability: 'Highlights Summary + Data Analysis',
    persona: 'Chief Tournament Officer',
    context: 'Reviewing Executive Brief before TOM meeting; needs to understand highest operational risks.',
    steps: [
      {
        prompt: 'What are today’s highest operational risks?',
        answer:
          'Miami leads today’s risk board: Gate C access failover and pitch sectors 3–4 remediation. LA has a west-plaza demonstration watch; SEA is densifying last-mile for BEL v. EGY. Cards below link to the source briefs.',
        intent: 'risk',
        widgets: 'intent',
      },
      {
        prompt: 'Tell me more about Miami',
        answer:
          'Miami is yellow on heat and Gate C queues. Hard Rock stays open; M38 walkthrough is contingent on access RCA (16:00) and the 22:00 pitch retest. Key contacts and latest stadium / host-city / fan-fest reports are below.',
        intent: 'risk',
        widgets: 'miami-detail',
      },
      {
        prompt: 'What open actions already exist?',
        answer:
          'Two Miami P1s are open: Gate C access RCA (#4821, due 16:00) and pitch remediation (#4790, retest 22:00). Tackle Gate C first — it blocks credential flow and the evening walkthrough if it slips.',
        intent: 'issues',
        widgets: 'miami-open-actions',
      },
      {
        prompt: 'Create a TOM action',
        answer:
          'Drafted a TOM action for Miami Gate C clearance. Choose an Owner and Due date — both are required — then Create.',
        intent: 'issues',
        widgets: 'action-only',
        action: {
          title: 'TOM action — Miami Gate C clearance',
          subtitle: 'Draft for Tournament Operations Meeting · Owner and Due required',
          fields: [
            {
              label: 'Owner',
              value: '',
              required: true,
              options: [
                'James Cole — Venue Access Lead · MIA',
                'Ana Ruiz — Venue Director · MIA',
                'Priya Shah — Host City Ops · MIA',
                'Marcus Chen — TOC Manager',
              ],
            },
            { label: 'Priority', value: 'P1 — Critical' },
            {
              label: 'Due',
              value: '',
              required: true,
              options: ['Today 16:00 EST', 'Today 18:00 EST', 'Tomorrow 09:00 EST', 'Tomorrow 12:00 EST'],
            },
            {
              label: 'Description',
              value:
                'Confirm Gate C failover RCA and credential queue recovery before M38 pitch walk. Escalate to TOM if clearance slips past 16:00.',
            },
          ],
          cta: 'Create',
          sources: [
            {
              label: 'Issue #4821 · Access Control',
              href: '#source/issue-4821',
              meta: 'Priority 1 · opened 07:18',
            },
          ],
          confirm: {
            text: 'TOM action created. Owner has been notified.',
            linkLabel: 'Open TOM action #TOM-8841',
            href: '#tom/TOM-8841',
          },
        },
      },
    ],
  },
  {
    id: 'team-flight',
    priority: 'P1',
    scenario: 'Team Flight Tracker Assistant',
    capability: 'Data Analysis',
    persona: 'TOC Member',
    context: 'CTO asks where Curacao is flying today during live operations.',
    steps: [
      {
        prompt: 'Where is Curacao flying today?',
        answer:
          'Three Curacao movements today: main team CUR→TPA (on time, arrive 14:05), staff charter on delay watch (+25m), and equipment MIA→TPA already inbound. Cards below are the live board.',
        intent: 'flights',
        widgets: 'curacao-flights',
      },
      {
        prompt: 'Show flight route on map',
        answer:
          'All three legs converge on Tampa Bay. Team and staff depart Curaçao; equipment repositions from Miami. Routes are drawn on the map — staff remains the delay-watch arc.',
        intent: 'flights',
        widgets: 'curacao-map',
      },
      {
        prompt: 'Who is receiving the team?',
        answer:
          'Ground receiving is covered across Travel, Team Services, and Accommodations. Elena Vargas (Travel) owns TPA FBO; Marcus Webb liaises the team; Sofia Almeida locks the hotel block.',
        intent: 'flights',
        widgets: 'curacao-contacts',
      },
      {
        prompt: 'What hotel are they staying at?',
        answer:
          'Primary block is Grand Bay Tampa (48 rooms / 62 occupants, confirmed). Harbor Suites holds VIP overflow as partial. Rooming and quiet-hour notes are on the cards.',
        intent: 'flights',
        widgets: 'curacao-hotels',
      },
      {
        prompt: 'What is their next activity?',
        answer:
          'After arrival: kit drop 16:30, medical 18:00, then 16 Jun official training 10:30 and press 12:15. Full Curacao calendar is sorted below.',
        intent: 'flights',
        widgets: 'curacao-calendar',
      },
    ],
  },
  {
    id: 'attendance-anomaly',
    priority: 'P1',
    scenario: 'Attendance Anomaly Investigation',
    capability: 'Data Analysis',
    persona: 'TOC Operator',
    context: 'Attendance and scans are significantly below forecast before kick-off.',
    steps: [
      {
        prompt: 'Why is attendance lower than expected?',
        answer:
          'SEA M37 (BEL v. EGY) scans are ~9% under H-2 forecast. Allocations look fine — entry pace is soft. Matchday board below shows ticketing and risk chips.',
        intent: 'matchday',
        widgets: 'attendance-matchday',
      },
      {
        prompt: 'Is weather contributing?',
        answer:
          'Weather is a secondary factor: overcast with light precip risk at 18°/12°. Not a stoppage threshold — it slows outdoor queues. Keep densification and covered messaging through H-1.',
        intent: 'matchday',
        widgets: 'attendance-weather',
      },
      {
        prompt: 'Any transport disruptions?',
        answer:
          'Yes — SEA #4811 last-mile pinch on Occidental Ave is the strongest correlate. Extra stewards requested from H-3; densification still incomplete.',
        intent: 'issues',
        widgets: 'attendance-transport',
      },
      {
        prompt: 'What is the outer vs inner perimeter variance?',
        answer:
          'Outer 41.2k vs inner 36.5k (−11.5%). Fans are held in approach, not yet through turnstiles. Escalate if variance stays >10% at H-1.',
        intent: 'matchday',
        widgets: 'attendance-perimeter',
      },
    ],
  },
  {
    id: 'wetrack-issue',
    priority: 'P2',
    scenario: 'Wetrack Issue Creator',
    capability: 'Workflow Automation',
    persona: 'TOC Manager',
    context: 'Action identified during Tournament Operations Meeting and needs formal tracking.',
    steps: [
      {
        prompt: 'Create action for Miami access issue',
        answer:
          'Draft WeTrack item tied to Miami Gate C access failover (#4821). Choose an Owner and Due date — both are required — then Create.',
        intent: 'issues',
        widgets: 'action-only',
        action: {
          title: 'WeTrack — Miami access failover',
          subtitle: 'Linked to Issue #4821 · Owner and Due required',
          fields: [
            {
              label: 'Owner',
              value: '',
              required: true,
              options: [
                'James Cole — Venue Access Lead · MIA',
                'Ana Ruiz — Venue Director · MIA',
                'Priya Shah — Host City Ops · MIA',
                'Marcus Chen — TOC Manager',
              ],
            },
            { label: 'Priority', value: 'High' },
            {
              label: 'Due',
              value: '',
              required: true,
              options: ['Today 16:00 EST', 'Today 18:00 EST', 'Tomorrow 09:00 EST', 'Tomorrow 12:00 EST'],
            },
            {
              label: 'Description',
              value:
                'Track Gate C primary-controller failover, credential queue recovery, and vendor RCA before M38 operations.',
            },
          ],
          cta: 'Create',
          sources: [
            {
              label: 'Issue #4821 · Access Control',
              href: '#source/issue-4821',
              meta: 'Priority 1 · opened 07:18',
            },
          ],
          confirm: {
            text: 'WeTrack item created and linked to #4821. Owner notified.',
            linkLabel: 'Open WeTrack #WT-5520',
            href: '#wetrack/WT-5520',
          },
        },
      },
    ],
  },
  {
    id: 'weather-risk',
    priority: 'P2',
    scenario: 'Weather Risk Alert Agent',
    capability: 'Alert & Notification',
    persona: 'Venue Operations',
    context: 'High-risk weather (heat stress, lightning) threatens match operations.',
    steps: [
      {
        prompt: 'What matches/training/team travel are impacted?',
        answer:
          'Four windows need attention: SEA M37 precip risk, MIA outdoor training heat, CUW staff delay watch into TPA, and LA evening lightning radius. List below.',
        intent: 'risk',
        widgets: 'weather-impacted',
      },
      {
        prompt: 'What is likely operational impact?',
        answer:
          'Expect slower scans, shortened warm-ups, and possible pitch-walk holds — not cancellations yet. Mitigations are listed under the impact board.',
        intent: 'risk',
        widgets: 'weather-ops-impact',
      },
    ],
  },
  {
    id: 'venue-status',
    priority: 'P2',
    scenario: 'Venue Status Copilot',
    capability: 'Highlights Summary + Analysis',
    persona: 'Venue Director',
    context: 'Needs a concise status review before hourly operations meeting.',
    steps: [
      {
        prompt: 'Summarize stadium status',
        answer:
          'Hard Rock is yellow. Broadcast and hospitality stay green; Gate C queues, pitch sectors 3–4, and workforce show-rate are the amber drivers.',
        intent: 'issues',
        widgets: 'venue-summary',
      },
      {
        prompt: 'Why is status yellow?',
        answer:
          'Yellow because two P1s (access + pitch) remain open and volunteer show-rate is soft network-wide. No Critical stoppage criteria met.',
        intent: 'issues',
        widgets: 'venue-yellow',
      },
      {
        prompt: 'What should I focus on next hour?',
        answer:
          'Next hour priority order: Gate C queue check-in, standby volunteers on site, then pitch crew status toward the 22:00 retest.',
        intent: 'issues',
        widgets: 'venue-focus',
      },
    ],
  },
  {
    id: 'tom-assistant',
    priority: 'P2',
    scenario: 'TOM Meeting Assistant',
    capability: 'Workflow Automation',
    persona: 'TOC Manager',
    context: 'Preparing TOM briefing pack.',
    steps: [
      {
        prompt: 'Generate agenda',
        answer:
          'Five-item TOM agenda drafted: Miami P1s, LA demo window, SEA densification, open-actions roll-call, AOB. Timing and owners are below.',
        intent: 'risk',
        widgets: 'tom-agenda',
      },
      {
        prompt: 'Summarize open actions',
        answer:
          'Open actions cluster on MIA #4821/#4790, LA #4802, and SEA #4811. Severity-ranked roll-call is ready for TOM.',
        intent: 'issues',
        widgets: 'tom-actions',
      },
      {
        prompt: 'What changed since yesterday?',
        answer:
          'New today: Gate C failover and pitch failed acceptance. SEA densification and LA demo watch are unchanged vs yesterday.',
        intent: 'risk',
        widgets: 'tom-delta',
      },
      {
        prompt: 'Export briefing',
        answer:
          'Briefing pack is ready: agenda, risk deltas, and open actions. Export to share with TOM attendees.',
        intent: 'risk',
        widgets: 'action-only',
        action: {
          title: 'Export TOM briefing pack',
          subtitle: 'Agenda · risks · open actions',
          fields: [
            { label: 'Format', value: 'PDF + slide outline' },
            { label: 'Audience', value: 'TOM attendees' },
            { label: 'Includes', value: 'Risk snippets, issue roll-up, agenda' },
            { label: 'As-of', value: '15 Jun 14:22' },
          ],
          cta: 'Export',
          confirm: {
            text: 'TOM briefing exported. Share link is ready for the distribution list.',
            linkLabel: 'Open briefing pack',
            href: '#export/tom-brief-15jun',
          },
        },
      },
    ],
  },
  {
    id: 'fa-ops',
    priority: 'P3',
    scenario: 'FA Operations Assistant',
    capability: 'Knowledge Q&A',
    persona: 'FA Operations Lead',
    context: 'Need a complete operational picture for one participating team.',
    steps: [
      {
        prompt: 'Show Argentina operations',
        answer:
          'Argentina main and staff charters are on time into MIA (arrive 06:40 / 07:30). Movement board below is the live picture.',
        intent: 'flights',
        widgets: 'argentina-ops',
      },
      {
        prompt: 'Any open risks?',
        answer:
          'No Argentina-specific Criticals. Network risks that can touch their corridor (MIA access/pitch, weather) are on the risk cards.',
        intent: 'risk',
        widgets: 'argentina-risks',
      },
      {
        prompt: 'Who owns them?',
        answer:
          'Transport Lead owns ground buffer; Team Liaison owns training accreditation. Owner map below.',
        intent: 'issues',
        widgets: 'argentina-owners',
      },
      {
        prompt: 'Notify transport lead',
        answer:
          'Draft notice ready for Transport Lead covering Argentina arrival windows and open travel risks. Send to push the alert.',
        intent: 'issues',
        widgets: 'action-only',
        action: {
          title: 'Notify transport lead',
          subtitle: 'Argentina operations',
          fields: [
            { label: 'To', value: 'Transport Lead · Team Services' },
            { label: 'Priority', value: 'Normal' },
            { label: 'Subject', value: 'Argentina movement — status & open risks' },
            {
              label: 'Message',
              value:
                'Please confirm ground plan against today’s charter board and acknowledge any open travel risks before wheels-down.',
            },
          ],
          cta: 'Send',
          confirm: {
            text: 'Notification sent to Transport Lead. Delivery confirmed on the Team Services channel.',
            linkLabel: 'Open notification thread',
            href: '#notify/arg-transport-15jun',
          },
        },
      },
    ],
  },
  {
    id: 'sop-assistant',
    priority: 'P3',
    scenario: 'Operational SOP Assistant',
    capability: 'Knowledge Q&A',
    persona: 'All Users',
    context: 'User does not know process or ownership.',
    steps: [
      {
        prompt: 'How do I handle a VIP transport incident?',
        answer:
          'Secure the party, notify TOC immediately, and hold movement until TOC acknowledges. Do not self-escalate past TOC Manager. Steps below.',
        intent: 'general',
        widgets: 'sop-handle',
      },
      {
        prompt: 'Who approves escalation?',
        answer:
          'TOC Manager approves escalation. Duty CTO is the backup if TOC Manager is unreachable.',
        intent: 'general',
        widgets: 'sop-escalation',
      },
      {
        prompt: 'Show SOP',
        answer:
          'Full VIP Transport Incident SOP: secure → notify TOC → escalation approval → WeTrack log. Steps and contacts below.',
        intent: 'general',
        widgets: 'sop-full',
      },
    ],
  },
  {
    id: 'external-situational',
    priority: 'P3',
    scenario: 'External Situation Awareness Assistant',
    capability: 'Knowledge Q&A + External Search',
    persona: 'Executive / TOC',
    context: 'Need external information that may affect tournament operations.',
    steps: [
      {
        prompt: 'Any external risks affecting Los Angeles today?',
        answer:
          'Primary external watch: west-plaza demonstration 2–4k with soft-closure 15:00–21:00. No city shut-down notice. Sources below.',
        intent: 'risk',
        widgets: 'external-la',
      },
      {
        prompt: 'Could this impact the match?',
        answer:
          'Match ops stay green if soft-closure holds. Exposure is fan fest and last-mile near the plaza — escalate only if LE expands the footprint.',
        intent: 'risk',
        widgets: 'external-impact',
      },
      {
        prompt: 'Create monitoring action',
        answer:
          'Draft TOC monitoring action for the LA plaza window. Choose an Owner and Due window — both are required — then Create.',
        intent: 'risk',
        widgets: 'action-only',
        action: {
          title: 'Monitoring action — LA west plaza',
          subtitle: 'External situation watch · Owner and Due required',
          fields: [
            {
              label: 'Owner',
              value: '',
              required: true,
              options: [
                'Maya Ortiz — Host City Security Desk · LA',
                'David Kim — Venue Security Lead · LA',
                'Marcus Chen — TOC Manager',
                'Priya Shah — Host City Ops Bridge',
              ],
            },
            { label: 'Priority', value: 'P2 — Watch' },
            {
              label: 'Due',
              value: '',
              required: true,
              options: [
                'Today 15:00–21:00 window',
                'Today 18:00 EST',
                'Tomorrow 09:00 EST',
                'End of match window',
              ],
            },
            {
              label: 'Description',
              value:
                'Monitor demonstration volume and soft-closure status; alert TOC if hospitality or last-mile access is threatened.',
            },
          ],
          cta: 'Create',
          sources: [
            {
              label: 'Host City Security Brief · LA',
              href: '#source/security-brief-la',
              meta: 'Security · 15 Jun 09:05',
            },
          ],
          confirm: {
            text: 'Monitoring action created for the LA west-plaza window. Owner notified.',
            linkLabel: 'Open watch item #WATCH-221',
            href: '#watch/WATCH-221',
          },
        },
      },
    ],
  },
]

export const PROMPT_LIBRARY_RECOMMENDED = PROMPT_LIBRARY.filter((item) => item.priority === 'P1')

export const QUERY_SUGGESTIONS = PROMPT_LIBRARY_RECOMMENDED.map((item) => item.steps[0].prompt)

export const RISK_SNIPPETS: RiskSnippet[] = [
  {
    id: 'risk-1',
    title: 'Access control failover — Gate C',
    city: 'MIA',
    excerpt:
      'Primary access controllers faulted at 07:12. Failover lane is online; credential queues elevated. Vendor RCA due by 16:00 EST. Keep M38 walkthrough contingent on clearance.',
    source: {
      label: 'Daily Stadium Report · MIA',
      href: '#source/daily-stadium-mia',
      meta: 'Ops Report · 15 Jun 08:40',
    },
  },
  {
    id: 'risk-2',
    title: 'Pitch remediation sectors 3–4',
    city: 'MIA',
    excerpt:
      'Turf seams failing acceptance on sectors 3–4. Remediation crew on site; retest window 22:00. If not cleared, M38 pitch walk slips to Matchday -1 morning.',
    source: {
      label: 'Pitch Acceptance Log',
      href: '#source/pitch-acceptance-mia',
      meta: 'Venue Ops · 15 Jun 11:15',
    },
  },
  {
    id: 'risk-3',
    title: 'Demonstration watch window — west plaza',
    city: 'LA',
    excerpt:
      'Organizers notifying 2–4k participants near fan fest. Soft-closure plan prepared with local LE for 15:00–21:00. Hospitality remains green if plaza stays open.',
    source: {
      label: 'Host City Security Brief · LA',
      href: '#source/security-brief-la',
      meta: 'Security · 15 Jun 09:05',
    },
  },
  {
    id: 'risk-4',
    title: 'Last-mile densification',
    city: 'SEA',
    excerpt:
      'Matchday shuttle densification underway for BEL v. EGY. Transit surge staffing confirmed; watch pedestrian pinch points at Occidental Ave from H-3.',
    source: {
      label: 'SEA Matchday Ops Brief',
      href: '#source/matchday-ops-sea',
      meta: 'TOM Pack · 15 Jun 07:30',
    },
  },
]

export const FLIGHT_CARDS: FlightCard[] = [
  {
    id: 'flt-cuw-main',
    label: 'CUW Team',
    kind: 'team',
    statusTone: 'ok',
    from: {
      code: 'CUR',
      city: 'Willemstad, Curaçao',
      date: '15 Jun',
      status: 'Depart',
      time: '10:15',
    },
    to: {
      code: 'TPA',
      city: 'Tampa Bay, FL, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '14:05',
    },
    source: {
      label: 'Team Charter Board · CUW',
      href: '#source/team-charter-cuw',
      meta: 'Team Services · on time',
    },
  },
  {
    id: 'flt-cuw-staff',
    label: 'CUW Staff',
    kind: 'referees',
    statusTone: 'alert',
    from: {
      code: 'CUR',
      city: 'Willemstad, Curaçao',
      date: '15 Jun',
      status: 'Depart',
      time: '11:40',
    },
    to: {
      code: 'TPA',
      city: 'Tampa Bay, FL, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '15:35',
    },
    source: {
      label: 'Staff Charter · CUW',
      href: '#source/staff-charter-cuw',
      meta: 'Team Services · delay watch +25m',
    },
  },
  {
    id: 'flt-cuw-equip',
    label: 'CUW Equipment',
    kind: 'team',
    statusTone: 'ok',
    from: {
      code: 'MIA',
      city: 'Miami, FL, USA',
      date: '15 Jun',
      status: 'Depart',
      time: '09:20',
    },
    to: {
      code: 'TPA',
      city: 'Tampa Bay, FL, USA',
      date: '15 Jun',
      status: 'Arrive',
      time: '10:25',
    },
    source: {
      label: 'Equipment Freight · CUW',
      href: '#source/equip-cuw',
      meta: 'Logistics · on time',
    },
  },
]

export const ISSUE_ROWS: IssueRow[] = [
  {
    id: 'qi-1',
    severity: 5,
    city: 'MIA',
    category: 'Ticketing',
    title: 'Access system failover at Gate C',
    summary:
      'Primary controllers faulted at 07:12. Failover online; queues elevated. RCA due 16:00.',
    source: {
      label: 'Issue #4821 · Access Control',
      href: '#source/issue-4821',
      meta: 'Priority 1 · opened 07:18',
    },
  },
  {
    id: 'qi-2',
    severity: 5,
    city: 'MIA',
    category: 'Venue',
    title: 'Pitch installation remediation',
    summary:
      'Sectors 3–4 failed acceptance. Crew on site; retest scheduled 22:00 tonight.',
    source: {
      label: 'Issue #4790 · Pitch',
      href: '#source/issue-4790',
      meta: 'Priority 1 · updated 11:20',
    },
  },
  {
    id: 'qi-3',
    severity: 4,
    city: 'LA',
    category: 'Security',
    title: 'Demonstrations near fan fest',
    summary:
      '2–4k participants expected. Soft-closure plan ready for west plaza 15:00–21:00.',
    source: {
      label: 'Issue #4802 · Security',
      href: '#source/issue-4802',
      meta: 'Priority 2 · watch window',
    },
  },
  {
    id: 'qi-4',
    severity: 4,
    city: 'SEA',
    category: 'Transport',
    title: 'Last-mile pedestrian pinch points',
    summary:
      'Occidental Ave densification incomplete. Extra stewards requested from H-3.',
    source: {
      label: 'Issue #4811 · Transport',
      href: '#source/issue-4811',
      meta: 'Priority 2 · Matchday',
    },
  },
  {
    id: 'qi-5',
    severity: 2,
    city: 'DAL',
    category: 'Workforce',
    title: 'Volunteer show-rate shortfall',
    summary:
      'Show-rate 84% vs 92% network average. 60 standby volunteers confirmed.',
    source: {
      label: 'Issue #4775 · Workforce',
      href: '#source/issue-4775',
      meta: 'Priority 3 · monitoring',
    },
  },
  {
    id: 'qi-6',
    severity: 2,
    city: 'CDMX',
    category: 'Ticketing',
    title: 'Hospitality badge printer delay',
    summary:
      'Temporary paper credentials issued. Permanent badges expected by 17:00.',
    source: {
      label: 'Issue #4768 · Ticketing',
      href: '#source/issue-4768',
      meta: 'Priority 3 · local',
    },
  },
]

export const MATCHDAY_WIDGET: MatchWidgetData = {
  city: 'SEA',
  date: '15 Jun',
  home: 'BEL',
  away: 'EGY',
  group: 'Group (H)',
  matchId: 'M37',
  time: '18:00',
  score: ['2', '1'],
  weather: '27/21°',
  risks: [
    { label: 'Weather', tone: 'neutral' },
    { label: 'RISK', tone: 'risk' },
    { label: 'Sec Risk', tone: 'neutral' },
    { label: 'NO RISK', tone: 'ok' },
  ],
  standings: [
    { rank: 1, team: 'BEL', badge: 'Q', w: 3, d: 0, l: 0, pts: 9, gd: '+14' },
    { rank: 2, team: 'IRN', w: 2, d: 0, l: 1, pts: 6, gd: '-2' },
    { rank: 3, team: 'EGY', w: 1, d: 0, l: 2, pts: 3, gd: '+4' },
    { rank: 4, team: 'NZL', badge: 'E', w: 0, d: 0, l: 3, pts: 0, gd: '-5' },
  ],
  related: [
    {
      city: 'ATL',
      matchup: 'KOR v. UEFA A',
      matchId: 'M41',
      when: '11 Jul 22:30',
      group: 'Group (H)',
      weather: '27/21°',
    },
    {
      city: 'KC',
      matchup: 'KOR v. UEFA A',
      matchId: 'M42',
      when: '11 Jul 22:30',
      group: 'Group (H)',
      weather: '27/21°',
    },
    {
      city: 'NYNJ',
      matchup: 'KOR v. UEFA A',
      matchId: 'M43',
      when: '11 Jul 22:30',
      group: 'Group (H)',
      weather: '27/21°',
    },
  ],
  ticketing: [
    { label: 'Tickets allocated', value: '50,962', pct: '76%' },
    { label: 'General public', value: '50,536', pct: '94%' },
    { label: 'Complimentary', value: '352', pct: '94%' },
    { label: 'Hospitality', value: '423', pct: '94%' },
    { label: 'VVIP guests', value: '32', pct: '23%' },
    { label: 'VIP guests', value: '210', pct: '94%' },
  ],
  sources: [
    {
      label: 'SEA Matchday Ops Brief',
      href: '#source/matchday-ops-sea',
      meta: 'TOM Pack · 15 Jun 07:30',
    },
    {
      label: 'Ticketing Dashboard · M37',
      href: '#source/ticketing-m37',
      meta: 'Live feed · refreshed 2m ago',
    },
    {
      label: 'Group G Standings',
      href: '#source/standings-g',
      meta: 'Competition · official',
    },
  ],
}

export const MIAMI_CITY_SNAPSHOT: CitySnapshot = {
  city: 'MIA',
  weather: {
    condition: 'Partly cloudy · humid',
    temp: '31° / 25°',
    wbgt: '28°C — heat watch',
    wind: 'SE 12 km/h',
  },
  stadium: {
    name: 'Hard Rock Stadium',
    status: 'Yellow',
    capacity: '65,326',
    nextMatch: 'M38 walkthrough · contingent on Gate C + pitch',
    gates: 'Gate C failover online · credential queues elevated',
  },
  contacts: [
    { role: 'Venue Director', name: 'Ana Ruiz', detail: 'Venue Ops · on site' },
    { role: 'Access Lead', name: 'James Cole', detail: 'RCA owner · due 16:00' },
    { role: 'Host City Ops', name: 'Priya Shah', detail: 'City desk · TOC bridge' },
  ],
}

export const MIAMI_REPORTS: SwitchableReport[] = [
  {
    id: 'stadium',
    label: 'Stadium',
    title: 'Daily Stadium Report · MIA',
    excerpt:
      'Gate C primary controllers faulted 07:12; failover lane online with elevated queues. Pitch sectors 3–4 failed acceptance — remediation crew on site, retest 22:00. Hospitality and broadcast green.',
    updated: '15 Jun 08:40',
    source: {
      label: 'Daily Stadium Report · MIA',
      href: '#source/daily-stadium-mia',
      meta: 'Ops Report · 15 Jun 08:40',
    },
  },
  {
    id: 'host',
    label: 'Host city',
    title: 'Host City Ops Brief · Miami',
    excerpt:
      'Heat advisory through 19:00. Last-mile buses running normal frequency. No city-wide event conflicts with M38 walkthrough window. Soft coordination with LE on Gate C overflow if queues persist past 15:00.',
    updated: '15 Jun 09:10',
    source: {
      label: 'Host City Ops Brief · Miami',
      href: '#source/host-city-mia',
      meta: 'Host City · 15 Jun 09:10',
    },
  },
  {
    id: 'fanfest',
    label: 'Fan fest',
    title: 'Fan Fest Status · Miami Beach',
    excerpt:
      'Fan fest open and green. Expected afternoon peak 14:00–18:00. Hydration stations stocked for heat watch. No security incidents; transport link to Hard Rock running on schedule.',
    updated: '15 Jun 10:05',
    source: {
      label: 'Fan Fest Status · Miami Beach',
      href: '#source/fanfest-mia',
      meta: 'Fan Experience · 15 Jun 10:05',
    },
  },
]

export const MIAMI_OPEN_ACTIONS_SUGGESTION =
  'Tackle Gate C (#4821) immediately — RCA clock ends 16:00 and it blocks credential flow for the M38 walkthrough. Pitch (#4790) stays tonight’s retest; monitor but do not divert Access Lead capacity before 16:00.'

export function findScenarioStep(
  prompt: string,
): { scenario: PromptLibraryItem; step: ScenarioStep; stepIndex: number } | null {
  const needle = prompt.trim().toLowerCase()
  for (const scenario of PROMPT_LIBRARY) {
    const stepIndex = scenario.steps.findIndex((s) => s.prompt.toLowerCase() === needle)
    if (stepIndex >= 0) {
      return { scenario, step: scenario.steps[stepIndex], stepIndex }
    }
  }
  return null
}

export function nextScenarioPrompt(scenarioId: string, stepIndex: number): string | null {
  const scenario = PROMPT_LIBRARY.find((item) => item.id === scenarioId)
  if (!scenario) return null
  return scenario.steps[stepIndex + 1]?.prompt ?? null
}

function fallbackReplyText(prompt: string, intent: QueryIntent): string {
  const q = prompt.toLowerCase()

  if (q.includes('vip transport') || q.includes('sop')) {
    return (
      PROMPT_LIBRARY.find((item) => item.id === 'sop-assistant')?.steps[0]?.answer ??
      'Follow the Transport Incident SOP and escalate through TOC Manager.'
    )
  }

  switch (intent) {
    case 'risk':
      return 'Here are the highest-signal risk snippets from today’s reports. Each card links back to the source document so you can verify context before escalating.'
    case 'flights':
      return 'Pulled the active referee and team charter movements. Status colors reflect on-time vs delay watch — open the source manifests for full passenger and slot detail.'
    case 'issues':
      return 'Open issues ranked by severity. Tap a source link to jump to the issue record, comments, and ownership trail.'
    case 'matchday':
      return 'SEA Matchday board for BEL v. EGY (M37): scoreline, risk chips, group standings, related fixtures, and ticketing. Sources are listed under the widget.'
    default:
      return `Here’s a quick ops read on “${prompt.trim()}”: readiness is ~87% overall. Ask about risks, flights, issues, or Matchday to pull structured widgets with source links.`
  }
}

export function resolveScenarioReply(
  prompt: string,
  intent: QueryIntent,
): {
  text: string
  intent: QueryIntent
  action?: ActionDraft
  widgets?: ScenarioWidgetLayout
} {
  const hit = findScenarioStep(prompt)
  if (hit) {
    return {
      text: hit.step.answer,
      intent: hit.step.intent,
      action: hit.step.action,
      widgets: hit.step.widgets ?? 'intent',
    }
  }
  return { text: fallbackReplyText(prompt, intent), intent, widgets: 'intent' }
}

export function detectQueryIntent(prompt: string): QueryIntent {
  const hit = findScenarioStep(prompt)
  if (hit) return hit.step.intent

  const q = prompt.toLowerCase()

  if (
    q.includes('flight') ||
    q.includes('charter') ||
    q.includes('flying') ||
    q.includes('curacao') ||
    q.includes('curaçao') ||
    q.includes('argentina operations') ||
    q.includes('hotel are they') ||
    q.includes('receiving the team') ||
    q.includes('arrive') ||
    q.includes('depart') ||
    q.includes('referee travel') ||
    q.includes('team travel')
  ) {
    return 'flights'
  }

  if (
    q.includes('attendance') ||
    q.includes('perimeter') ||
    q.includes('matchday') ||
    q.includes('match day') ||
    q.includes('m37') ||
    q.includes('kickoff') ||
    q.includes('ticketing') ||
    (q.includes('sea') && (q.includes('match') || q.includes('brief') || q.includes('ready')))
  ) {
    return 'matchday'
  }

  if (
    q.includes('wetrack') ||
    q.includes('create action') ||
    q.includes('stadium status') ||
    q.includes('issue') ||
    q.includes('incident') ||
    q.includes('priority') ||
    q.includes('open high') ||
    q.includes('mid issue') ||
    q.includes('open actions')
  ) {
    return 'issues'
  }

  if (
    q.includes('risk') ||
    q.includes('threat') ||
    q.includes('escalat') ||
    q.includes('weather') ||
    q.includes('tom') ||
    q.includes('agenda') ||
    q.includes('miami') ||
    q.includes('los angeles') ||
    q.includes('external') ||
    q.includes('report snippet') ||
    q.includes('security brief')
  ) {
    return 'risk'
  }

  return 'general'
}

export function mockAssistantReply(prompt: string, intent: QueryIntent): string {
  return resolveScenarioReply(prompt, intent).text
}
