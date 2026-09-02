export type ExecAttachment = {
  id: string
  name: string
  kind: string
}

export type ExecComment = {
  id: string
  author: string
  text: string
  at: string
}

export type ExecFa = {
  code: string
  label: string
}

/** When the executive needs to know about this item. */
export type KnowWindow = 'today' | 'tomorrow' | 'week' | null

export type Urgency = 1 | 2 | 3 | 4 | 5

export type ExecTopicSource = {
  cockpitId?: string
  cockpitLabel?: string
  upstreamedBy: string
  reason: string
}

export type ExecTopic = {
  id: string
  title: string
  description: string
  owner: string
  fa: ExecFa
  tags: string[]
  status: 'active' | 'archived'
  knowWindow: KnowWindow
  urgency: Urgency
  /** ISO date used for secondary sorting. */
  sortDate: string
  /** Org / cockpit / team shown in the Upstreamed by column. */
  upstreamOrg: string
  latestDevelopments: string
  actionsTaken: string
  nextSteps: string
  attachments: ExecAttachment[]
  comments: ExecComment[]
  source?: ExecTopicSource
}

export type UpstreamCandidate = {
  id: string
  title: string
  description: string
  owner: string
  fa: ExecFa
  cockpitId: 'wc26' | 'wwc' | 'youth' | 'corp'
  cockpitLabel: string
  upstreamedBy: string
  upstreamOrg: string
  reason: string
  urgency: Urgency
  knowWindow?: KnowWindow
  tags?: string[]
  attachments: ExecAttachment[]
  latestDevelopments?: string
  actionsTaken?: string
  nextSteps?: string
}

export type IntakeDraft = {
  title: string
  description: string
  owner: string
  fa: ExecFa
  urgency: Urgency
  knowWindow: KnowWindow
  tags: string[]
  /** Suggestions shown in intake; not applied until accepted. */
  suggestedTags: string[]
  upstreamOrg: string
  attachments: ExecAttachment[]
  latestDevelopments: string
  actionsTaken: string
  nextSteps: string
  reason: string
  source?: ExecTopicSource
  /** When promoting from triage, remove this candidate id on confirm. */
  fromUpstreamId?: string
  /** Present when continuing a saved draft. */
  draftId?: string
}

export type SavedIntakeDraft = IntakeDraft & {
  id: string
  savedAt: string
}

export const DEMO_ATTACHMENT_POOL: ExecAttachment[] = [
  { id: 'demo-att-1', name: 'MBM_Briefing_Slide.pptx', kind: 'presentation' },
  { id: 'demo-att-2', name: 'Risk_Memo_Exec.pdf', kind: 'memo' },
  { id: 'demo-att-3', name: 'SG_Letter_Draft.docx', kind: 'letter' },
  { id: 'demo-att-4', name: 'Status_Update_Photo.png', kind: 'image' },
  { id: 'demo-att-5', name: 'Action_Log.xlsx', kind: 'spreadsheet' },
]

export const FA_OPTIONS: ExecFa[] = [
  { code: 'TRN', label: 'Transport' },
  { code: 'BRD', label: 'Broadcast' },
  { code: 'OPS', label: 'Operations' },
  { code: 'TXT', label: 'Ticketing' },
  { code: 'SEC', label: 'Security' },
  { code: 'COM', label: 'Comms' },
  { code: 'TLD', label: 'Tournament Lead' },
  { code: 'MED', label: 'Medical' },
  { code: 'CML', label: 'Commercial' },
  { code: 'ACR', label: 'Accreditation' },
  { code: 'EXE', label: 'Executive' },
  { code: 'STD', label: 'Stadiums' },
  { code: 'LOG', label: 'Logistics' },
  { code: 'VEN', label: 'Venue Development' },
  { code: 'SRV', label: 'Services' },
]

export const UPSTREAM_ORGS = [
  'World Cup 2026',
  'Women’s World Cup 2027',
  'Youth Tournament 2026',
  'Security',
  'Services team',
  'Venue development team',
  'Broadcast services',
  'Commercial',
  'Executive assistant',
] as const

const AVATAR_COLORS = [
  '#c45c26',
  '#1f7a4c',
  '#8a4b2f',
  '#b33b2e',
  '#0f6b5c',
  '#a05a00',
  '#355c7d',
  '#6b4f3a',
  '#7a3e5c',
  '#3d6b3d',
  '#6e4c1e',
  '#4a5568',
]

export function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function isoOffset(days: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function fa(code: string, label: string): ExecFa {
  return { code, label }
}

export function faDisplay(area: ExecFa): string {
  return `${area.code} ${area.label}`
}

export function knowWindowLabel(window: KnowWindow): string {
  if (window === 'today') return 'Know today'
  if (window === 'tomorrow') return 'Know tomorrow'
  if (window === 'week') return 'Know this week'
  return ''
}

export function urgencyClass(level: Urgency): string {
  if (level >= 5) return 'is-critical'
  if (level >= 3) return 'is-moderate'
  return 'is-low'
}

function mockAttachment(id: string, name: string, kind = 'memo'): ExecAttachment {
  return { id, name, kind }
}

const HAND_ACTIVE: ExecTopic[] = [
  // Know today — urgency 5→1
  {
    id: 'topic-t5',
    title: 'Host city transport corridor readiness',
    description: 'Last-mile corridors ahead of opening ceremonies and MBM briefing.',
    owner: 'Heimo',
    fa: fa('TRN', 'Transport'),
    tags: ['MBM', 'transport'],
    status: 'active',
    knowWindow: 'today',
    urgency: 5,
    sortDate: isoOffset(0),
    upstreamOrg: 'Executive assistant',
    latestDevelopments: 'MIA and LA cleared; SEA still pending LE sign-off.',
    actionsTaken: 'Daily stand-up with city ops leads.',
    nextSteps: 'Confirm SEA LE window before briefing.',
    attachments: [mockAttachment('a1', 'Corridor_Status_Map.pdf'), mockAttachment('a2', 'MBM_Transport_Agenda.pptx', 'presentation')],
    comments: [],
  },
  {
    id: 'topic-t4',
    title: 'Ticketing soft-launch exception handling',
    description: 'High-visibility exceptions during soft launch requiring executive awareness.',
    owner: 'Marcus Lee',
    fa: fa('TXT', 'Ticketing'),
    tags: ['customer', 'soft-launch'],
    status: 'active',
    knowWindow: 'today',
    urgency: 4,
    sortDate: isoOffset(0),
    upstreamOrg: 'Executive assistant',
    latestDevelopments: 'Three VIP cases remain open after overnight queue clear.',
    actionsTaken: 'VIP desk staffed through soft launch.',
    nextSteps: 'Close VIP cases; prepare one-pager for Heimo.',
    attachments: [mockAttachment('a4', 'SoftLaunch_Exceptions.xlsx', 'spreadsheet')],
    comments: [],
  },
  {
    id: 'topic-t3',
    title: 'Broadcast compound power redundancy',
    description: 'UPS warm-running overnight at BRS; vendor remediation framing.',
    owner: 'Ana Costa',
    fa: fa('BRD', 'Broadcast'),
    tags: ['infrastructure', 'vendor'],
    status: 'active',
    knowWindow: 'today',
    urgency: 3,
    sortDate: isoOffset(0),
    upstreamOrg: 'World Cup 2026',
    latestDevelopments: 'Vendor on site; temporary load-shed plan agreed.',
    actionsTaken: 'Opened P1 ticket; dual-path UPS swap scheduled.',
    nextSteps: 'Validate overnight telemetry.',
    attachments: [mockAttachment('a3', 'UPS_Incident_Brief.pdf')],
    comments: [],
    source: {
      cockpitId: 'wc26',
      cockpitLabel: 'World Cup 2026',
      upstreamedBy: 'John Smith',
      reason: 'May impact opening-window broadcast confidence.',
    },
  },
  {
    id: 'topic-t2',
    title: 'Secretary General briefing pack — September',
    description: 'Standing pack of crucial topics for SG one-on-ones.',
    owner: 'Heimo',
    fa: fa('EXE', 'Executive'),
    tags: ['SG', 'briefing'],
    status: 'active',
    knowWindow: 'today',
    urgency: 2,
    sortDate: isoOffset(0),
    upstreamOrg: 'Executive assistant',
    latestDevelopments: 'Pack assembled; awaiting two FA updates.',
    actionsTaken: 'Requested latest status from Ticketing and Security.',
    nextSteps: 'Lock pack by EOD.',
    attachments: [mockAttachment('a13', 'SG_September_Pack.pptx', 'presentation')],
    comments: [],
  },
  {
    id: 'topic-t1',
    title: 'Accreditation desk staffing note',
    description: 'Minor staffing note for accreditation HQ desk — awareness only.',
    owner: 'Tom Nguyen',
    fa: fa('ACR', 'Accreditation'),
    tags: ['accreditation', 'workforce'],
    status: 'active',
    knowWindow: 'today',
    urgency: 1,
    sortDate: isoOffset(0),
    upstreamOrg: 'Services team',
    latestDevelopments: 'Coverage confirmed for evening shift.',
    actionsTaken: 'Services reassigned two floaters.',
    nextSteps: 'Monitor overnight queue length.',
    attachments: [mockAttachment('a-t1', 'Accreditation_Staffing.pdf')],
    comments: [],
    source: { upstreamedBy: 'Tom Nguyen', reason: 'Low-priority awareness for executive pack.' },
  },
  // Know tomorrow — urgency 5→1
  {
    id: 'topic-m5',
    title: 'Security LE liaison protocol update',
    description: 'Updated liaison protocol across host cities for management meetings.',
    owner: 'Sofia Mendes',
    fa: fa('SEC', 'Security'),
    tags: ['LE', 'protocol'],
    status: 'active',
    knowWindow: 'tomorrow',
    urgency: 5,
    sortDate: isoOffset(1),
    upstreamOrg: 'Security',
    latestDevelopments: 'Draft protocol circulated to city security leads.',
    actionsTaken: 'Legal review completed.',
    nextSteps: 'Collect city acknowledgements.',
    attachments: [mockAttachment('a6', 'LE_Protocol_v3.pdf')],
    comments: [],
    source: { upstreamedBy: 'Omar Haddad', reason: 'Security requesting executive alignment.' },
  },
  {
    id: 'topic-m4',
    title: 'Sponsorship activation conflict — media compound',
    description: 'Activation conflict requiring executive decision path.',
    owner: 'Heimo',
    fa: fa('CML', 'Commercial'),
    tags: ['sponsorship', 'media'],
    status: 'active',
    knowWindow: 'tomorrow',
    urgency: 4,
    sortDate: isoOffset(1),
    upstreamOrg: 'Commercial',
    latestDevelopments: 'Compromise layout proposed.',
    actionsTaken: 'Commercial + Comms joint recommendation drafted.',
    nextSteps: 'Decision in ad-hoc management meeting.',
    attachments: [mockAttachment('a10', 'Activation_Layouts.pdf')],
    comments: [],
    source: { upstreamedBy: 'Elena Rossi', reason: 'Commercial conflict elevated.' },
  },
  {
    id: 'topic-m3',
    title: 'WWC 27 host city readiness snapshot',
    description: 'Cross-tournament readiness snapshot for women’s competition.',
    owner: 'Priya Nair',
    fa: fa('TLD', 'Tournament Lead'),
    tags: ['WWC27', 'readiness'],
    status: 'active',
    knowWindow: 'tomorrow',
    urgency: 3,
    sortDate: isoOffset(1),
    upstreamOrg: 'Women’s World Cup 2027',
    latestDevelopments: 'BRS/SAO green; FOR flagged for pitch delay.',
    actionsTaken: 'Requested FOR remediation timeline.',
    nextSteps: 'Include in standing management pack if slip holds.',
    attachments: [mockAttachment('a8', 'WWC27_Readiness.pdf')],
    comments: [],
    source: {
      cockpitId: 'wwc',
      cockpitLabel: 'Women’s World Cup 2027',
      upstreamedBy: 'Priya Nair',
      reason: 'Pitch delay may affect executive schedule.',
    },
  },
  {
    id: 'topic-m2',
    title: 'Media parking overflow plan',
    description: 'Overflow parking plan for media compound Matchday surge.',
    owner: 'Elena Rossi',
    fa: fa('COM', 'Comms'),
    tags: ['media', 'matchday'],
    status: 'active',
    knowWindow: 'tomorrow',
    urgency: 2,
    sortDate: isoOffset(1),
    upstreamOrg: 'Broadcast services',
    latestDevelopments: 'Overflow lot reserved; shuttle count pending.',
    actionsTaken: 'Comms aligned with city transport.',
    nextSteps: 'Confirm shuttle count by noon.',
    attachments: [mockAttachment('a-m2', 'Media_Parking_Plan.pdf')],
    comments: [],
  },
  {
    id: 'topic-m1',
    title: 'Volunteer meal voucher clarification',
    description: 'Low-priority clarification on meal voucher coverage windows.',
    owner: 'Nadia Beltrán',
    fa: fa('SRV', 'Services'),
    tags: ['workforce', 'cities'],
    status: 'active',
    knowWindow: 'tomorrow',
    urgency: 1,
    sortDate: isoOffset(1),
    upstreamOrg: 'Services team',
    latestDevelopments: 'FAQ drafted for city volunteer leads.',
    actionsTaken: 'Services circulated draft FAQ.',
    nextSteps: 'Publish FAQ after legal skim.',
    attachments: [mockAttachment('a-m1', 'Meal_Voucher_FAQ.docx', 'letter')],
    comments: [],
  },
  // Know this week — urgency 5→1
  {
    id: 'topic-w5',
    title: 'Fan fest soft-closure LE window',
    description: 'Local LE requesting updated soft-closure window.',
    owner: 'Sofia Mendes',
    fa: fa('SEC', 'Security'),
    tags: ['fan-fest', 'LE'],
    status: 'active',
    knowWindow: 'week',
    urgency: 5,
    sortDate: isoOffset(3),
    upstreamOrg: 'Security',
    latestDevelopments: 'Proposed 15:00–21:00 window under legal review.',
    actionsTaken: 'Aligned city ops and security on proposed hours.',
    nextSteps: 'Confirm with LE; update talking points.',
    attachments: [mockAttachment('a9', 'SoftClosure_Proposal.docx', 'letter')],
    comments: [],
    source: { upstreamedBy: 'Omar Haddad', reason: 'Security soft-closure narrative needs sign-off.' },
  },
  {
    id: 'topic-w4',
    title: 'Venue overlay freeze — media tribune',
    description: 'Venue development freeze date for media tribune overlay drawings.',
    owner: 'Grace Mwangi',
    fa: fa('VEN', 'Venue Development'),
    tags: ['infrastructure', 'venue'],
    status: 'active',
    knowWindow: 'week',
    urgency: 4,
    sortDate: isoOffset(4),
    upstreamOrg: 'Venue development team',
    latestDevelopments: 'Drawings 90% complete; two comments open.',
    actionsTaken: 'Scheduled freeze review with broadcast and security.',
    nextSteps: 'Close comments; confirm freeze in Friday pack.',
    attachments: [mockAttachment('a16', 'Media_Tribune_Overlay.pdf')],
    comments: [],
    source: { upstreamedBy: 'Grace Mwangi', reason: 'Venue development seeking freeze visibility.' },
  },
  {
    id: 'topic-w3',
    title: 'Volunteer show-rate recovery plan',
    description: 'Network show-rate below target; standby recruitment messaging.',
    owner: 'Ana Costa',
    fa: fa('OPS', 'Operations'),
    tags: ['workforce', 'cities'],
    status: 'active',
    knowWindow: 'week',
    urgency: 3,
    sortDate: isoOffset(2),
    upstreamOrg: 'Services team',
    latestDevelopments: 'Show-rate recovered to 88% after standby surge.',
    actionsTaken: 'Activated standby pool.',
    nextSteps: 'Hold at ≥90% for three consecutive days.',
    attachments: [mockAttachment('a3b', 'Volunteer_ShowRate.xlsx', 'spreadsheet')],
    comments: [],
    source: { upstreamedBy: 'Nadia Beltrán', reason: 'Services escalating workforce risk.' },
  },
  {
    id: 'topic-w2',
    title: 'Congress venue AV contingency',
    description: 'Corporate congress AV fail-over path and contingency messaging.',
    owner: 'Heimo',
    fa: fa('COM', 'Comms'),
    tags: ['congress', 'contingency'],
    status: 'active',
    knowWindow: 'week',
    urgency: 2,
    sortDate: isoOffset(5),
    upstreamOrg: 'Venue development team',
    latestDevelopments: 'Secondary AV vendor contracted; dry-run scheduled.',
    actionsTaken: 'Contingency runbook drafted.',
    nextSteps: 'Complete dry-run.',
    attachments: [mockAttachment('a7', 'AV_Contingency_Runbook.pptx', 'presentation')],
    comments: [],
    source: { upstreamedBy: 'Grace Mwangi', reason: 'Venue development flagging AV residual risk.' },
  },
  {
    id: 'topic-w1',
    title: 'Host city FAQ pack refresh',
    description: 'Routine refresh of host city FAQ for external briefings.',
    owner: 'Priya Nair',
    fa: fa('COM', 'Comms'),
    tags: ['briefing', 'cities'],
    status: 'active',
    knowWindow: 'week',
    urgency: 1,
    sortDate: isoOffset(6),
    upstreamOrg: 'Executive assistant',
    latestDevelopments: 'Draft FAQ circulating for FA comments.',
    actionsTaken: 'Collected updates from transport and security.',
    nextSteps: 'Publish after Friday review.',
    attachments: [mockAttachment('a-w1', 'Host_City_FAQ.docx', 'letter')],
    comments: [],
  },
  // Beyond this week — urgency 5→1
  {
    id: 'topic-b5',
    title: 'Youth tournament medical surge plan',
    description: 'Medical surge capacity for youth finals window.',
    owner: 'Marcus Lee',
    fa: fa('MED', 'Medical'),
    tags: ['youth', 'medical'],
    status: 'active',
    knowWindow: null,
    urgency: 5,
    sortDate: isoOffset(10),
    upstreamOrg: 'Youth Tournament 2026',
    latestDevelopments: 'Two venues confirmed; third MoH letter pending.',
    actionsTaken: 'Escalated MoH letter request via LOC.',
    nextSteps: 'Chase MoH response.',
    attachments: [mockAttachment('a8b', 'Youth_Medical_Surge.pdf')],
    comments: [],
    source: {
      cockpitId: 'youth',
      cockpitLabel: 'Youth Tournament 2026',
      upstreamedBy: 'Dr. Helen Park',
      reason: 'Medical surge capacity for finals window.',
    },
  },
  {
    id: 'topic-b4',
    title: 'Cross-tournament lessons: accreditation queues',
    description: 'Lessons linking WC26 and WWC accreditation congestion.',
    owner: 'Priya Nair',
    fa: fa('ACR', 'Accreditation'),
    tags: ['lessons', 'cross-tournament'],
    status: 'active',
    knowWindow: null,
    urgency: 4,
    sortDate: isoOffset(12),
    upstreamOrg: 'Services team',
    latestDevelopments: 'Draft lessons note circulating among FA leads.',
    actionsTaken: 'Pulled WC26 metrics; mapped to WWC footprints.',
    nextSteps: 'Finalize note after SG office acknowledgement.',
    attachments: [mockAttachment('a12', 'Accreditation_Lessons.docx')],
    comments: [],
    source: { upstreamedBy: 'Tom Nguyen', reason: 'Services capturing accreditation lessons.' },
  },
  {
    id: 'topic-b3',
    title: 'Opening ceremony budget contingency',
    description: 'Budget contingency tracking for opening ceremony creative freeze.',
    owner: 'Maya Okonkwo',
    fa: fa('CML', 'Commercial'),
    tags: ['ceremony', 'budget'],
    status: 'active',
    knowWindow: null,
    urgency: 3,
    sortDate: isoOffset(14),
    upstreamOrg: 'Venue development team',
    latestDevelopments: 'Contingency band narrowed; creative options still open.',
    actionsTaken: 'Commercial prepared option set.',
    nextSteps: 'Select path before freeze date.',
    attachments: [mockAttachment('a-b3', 'Ceremony_Budget.xlsx', 'spreadsheet')],
    comments: [],
  },
  {
    id: 'topic-b2',
    title: 'Historical transport corridor metrics pack',
    description: 'Long-lead metrics pack for future corridor planning.',
    owner: 'John Smith',
    fa: fa('TRN', 'Transport'),
    tags: ['transport', 'lessons'],
    status: 'active',
    knowWindow: null,
    urgency: 2,
    sortDate: isoOffset(16),
    upstreamOrg: 'World Cup 2026',
    latestDevelopments: 'Metrics draft 70% complete.',
    actionsTaken: 'Pulled rehearsal telemetry from MIA/LA/SEA.',
    nextSteps: 'Complete pack for next month’s review.',
    attachments: [mockAttachment('a-b2', 'Corridor_Metrics.pdf')],
    comments: [],
  },
  {
    id: 'topic-b1',
    title: 'Style guide update — executive briefs',
    description: 'Non-urgent style guide tweak for executive brief templates.',
    owner: 'Heimo',
    fa: fa('EXE', 'Executive'),
    tags: ['briefing'],
    status: 'active',
    knowWindow: null,
    urgency: 1,
    sortDate: isoOffset(20),
    upstreamOrg: 'Executive assistant',
    latestDevelopments: 'Draft markup ready for review.',
    actionsTaken: 'Collected comments from two assistants.',
    nextSteps: 'Apply markup after next standing meeting.',
    attachments: [mockAttachment('a-b1', 'Brief_Style_Guide.docx', 'letter')],
    comments: [],
  },
]

const ARCHIVE_TITLES = [
  'Pitch irrigation pump failure closed',
  'Volunteer roster freeze completed',
  'Broadcast fiber splice validated',
  'Hotel room-block shortfall resolved',
  'Accreditation badge reprint window closed',
  'Fan fest waste contract renegotiated',
  'LE soft-closure drill completed',
  'Media mixed-zone layout signed off',
  'Team bus GPS outage restored',
  'WBGT sensor calibration complete',
  'VIP lounge catering dispute closed',
  'Stadium turnstile firmware rolled back',
  'LOC budget variance explained',
  'Opening ceremony cue sheet locked',
  'Youth finals seating overlay approved',
  'Transport convoy timing sheet archived',
  'Security radio channel plan closed',
  'Ticketing chargeback spike resolved',
  'Comms crisis holding statement archived',
  'Medical ice-bath logistics closed',
  'Commercial hospitality suite conflict closed',
  'Venue overlay clash cleared',
  'Services cleaning surge completed',
  'Broadcast compound access badge recall closed',
  'Team training pitch booking conflict closed',
  'City transport strike contingency stood down',
  'MOC staffing gap filled',
  'Guest ops queue redesign closed',
  'Referee hotel escort drill archived',
  'Social listening spike follow-up closed',
  'Power redundancy test passed',
  'Lightning protocol tabletop archived',
  'Volunteer meal voucher dispute closed',
  'Pitch paint curing delay cleared',
  'Media parking overflow plan archived',
  'Accreditation printer lease renewed',
  'Fan march route LE approval archived',
  'Sponsorship LED board failure replaced',
  'Youth medical MoH letter received',
  'WWC host city FAQ pack archived',
  'Congress AV dry-run signed off',
  'SEA corridor LE escort gap closed',
  'BRS compound UPS swap completed',
  'Ticketing soft-launch VIP backlog cleared',
  'Volunteer show-rate recovery archived',
  'Transport SLA amendment filed',
  'Accreditation lessons note published',
  'Sponsorship activation layout archived',
  'Soft-closure proposal accepted',
  'SG briefing pack September archived',
  'Lightning risk window — evening kickoff',
  'Access control failover complete',
  'Transport vendor SLA dispute — closed',
]

const ARCHIVE_OWNERS = [
  'Heimo',
  'Ana Costa',
  'Marcus Lee',
  'Sofia Mendes',
  'Priya Nair',
  'Grace Mwangi',
  'John Smith',
  'Elena Rossi',
  'Nadia Beltrán',
  'Omar Haddad',
  'Tom Nguyen',
  'Carlos Vega',
]

const ARCHIVE_TAGS = [
  'ops',
  'transport',
  'security',
  'broadcast',
  'ticketing',
  'venue',
  'medical',
  'lessons',
  'infrastructure',
  'MBM',
  'workforce',
]

/** Catalog used by the Add tag search picker. */
export const TAG_CATALOG = [
  'MBM',
  'transport',
  'infrastructure',
  'vendor',
  'workforce',
  'cities',
  'customer',
  'soft-launch',
  'LE',
  'protocol',
  'congress',
  'contingency',
  'WWC27',
  'readiness',
  'youth',
  'medical',
  'fan-fest',
  'sponsorship',
  'media',
  'lessons',
  'cross-tournament',
  'SG',
  'briefing',
  'venue',
  'stadium',
  'pitch',
  'matchday',
  'hotel',
  'contract',
  'accreditation',
  'weather',
  'policy',
  'rights',
  'ceremony',
  'budget',
  'ops',
  'security',
  'broadcast',
  'ticketing',
]

function buildArchiveTopics(): ExecTopic[] {
  return ARCHIVE_TITLES.map((title, index) => {
    const area = FA_OPTIONS[index % FA_OPTIONS.length]
    const owner = ARCHIVE_OWNERS[index % ARCHIVE_OWNERS.length]
    const org = UPSTREAM_ORGS[index % UPSTREAM_ORGS.length]
    const urgency = (((index % 5) + 1) as Urgency)
    const tagA = ARCHIVE_TAGS[index % ARCHIVE_TAGS.length]
    const tagB = ARCHIVE_TAGS[(index + 3) % ARCHIVE_TAGS.length]
    return {
      id: `topic-arch-${index + 1}`,
      title,
      description: `Closed executive topic: ${title.toLowerCase()}. Retained for historical search and pattern learning.`,
      owner,
      fa: { ...area },
      tags: [tagA, tagB],
      status: 'archived' as const,
      knowWindow: null,
      urgency,
      sortDate: isoOffset(-(index + 2)),
      upstreamOrg: org,
      latestDevelopments: 'Issue closed and moved to archive.',
      actionsTaken: 'Remediation completed and stakeholders notified.',
      nextSteps: 'None — archived.',
      attachments: [
        mockAttachment(
          `arch-att-${index + 1}`,
          `${title.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 28)}_Closeout.pdf`,
        ),
      ],
      comments: [],
      source: {
        upstreamedBy: owner,
        reason: `Archived from ${org}.`,
        cockpitLabel: org.includes('Cup') || org.includes('Youth') ? org : undefined,
      },
    }
  })
}

export const SEED_EXEC_TOPICS: ExecTopic[] = [...HAND_ACTIVE, ...buildArchiveTopics()]

export const SEED_UPSTREAM_CANDIDATES: UpstreamCandidate[] = [
  {
    id: 'up-1',
    title: 'Pitch installation seams — Miami stadium',
    description: 'Turf seams failing acceptance on sectors 3–4; remediation crew on site.',
    owner: 'John Smith',
    fa: fa('STD', 'Stadiums'),
    cockpitId: 'wc26',
    cockpitLabel: 'World Cup 2026',
    upstreamedBy: 'John Smith',
    upstreamOrg: 'World Cup 2026',
    reason: 'May delay soft acceptance and executive venue walkthrough.',
    urgency: 5,
    knowWindow: 'today',
    tags: ['stadium', 'pitch'],
    attachments: [
      mockAttachment('ua1', 'Miami_Pitch_Photos.pdf'),
      mockAttachment('ua1b', 'Pitch_Acceptance_Report.docx', 'letter'),
    ],
    latestDevelopments: 'Remediation crew on sectors 3–4; acceptance retest pending.',
    actionsTaken: 'Stadium ops opened P1 with turf vendor.',
    nextSteps: 'Confirm retest window before executive venue walkthrough.',
  },
  {
    id: 'up-2',
    title: 'Media compound congestion — Matchday surge',
    description: 'Check-in backlog risk for Matchday surge after desks were added.',
    owner: 'John Smith',
    fa: fa('COM', 'Comms'),
    cockpitId: 'wc26',
    cockpitLabel: 'World Cup 2026',
    upstreamedBy: 'Elena Rossi',
    upstreamOrg: 'Broadcast services',
    reason: 'Partner visibility risk; executives may be asked in media stand-ups.',
    urgency: 3,
    tags: ['media', 'matchday'],
    attachments: [mockAttachment('ua2', 'Media_Compound_Queue.pdf')],
    latestDevelopments: 'Two desks added; surge model still shows backlog risk.',
    actionsTaken: 'Comms reviewing staff plan with accreditation.',
    nextSteps: 'Decide whether to brief executives before next Matchday.',
  },
  {
    id: 'up-3',
    title: 'FOR pitch acceptance delay',
    description: 'Pitch acceptance slipped; impacts WWC readiness narrative.',
    owner: 'Priya Nair',
    fa: fa('STD', 'Stadiums'),
    cockpitId: 'wwc',
    cockpitLabel: 'Women’s World Cup 2027',
    upstreamedBy: 'Priya Nair',
    upstreamOrg: 'Women’s World Cup 2027',
    reason: 'Directly affects executive readiness snapshot for WWC27.',
    urgency: 4,
    knowWindow: 'tomorrow',
    tags: ['WWC27', 'pitch'],
    attachments: [mockAttachment('ua3', 'FOR_Pitch_Delay.pdf')],
    latestDevelopments: 'Acceptance slipped one week; remediation plan received.',
    actionsTaken: 'Requested stadium ops timeline and contingency.',
    nextSteps: 'Include in executive readiness snapshot if slip holds.',
  },
  {
    id: 'up-4',
    title: 'Team hotel contract escalation — BEL',
    description: 'Contract terms disputed; LOC requesting FIFA corporate support.',
    owner: 'Sofia Mendes',
    fa: fa('LOG', 'Logistics'),
    cockpitId: 'wwc',
    cockpitLabel: 'Women’s World Cup 2027',
    upstreamedBy: 'Carlos Vega',
    upstreamOrg: 'Services team',
    reason: 'Cross-functional commercial exposure beyond tournament ops.',
    urgency: 3,
    tags: ['hotel', 'contract'],
    attachments: [
      mockAttachment('ua4', 'BEL_Hotel_Contract.docx', 'letter'),
      mockAttachment('ua4b', 'LOC_Escalation_Note.pdf'),
    ],
    latestDevelopments: 'LOC requested corporate commercial support.',
    actionsTaken: 'Services team reviewing disputed clauses.',
    nextSteps: 'Decide if executive commercial intervention is needed.',
  },
  {
    id: 'up-5',
    title: 'Youth finals medical MoH letter pending',
    description: 'Third venue still awaiting MoH surge-capacity letter.',
    owner: 'Marcus Lee',
    fa: fa('MED', 'Medical'),
    cockpitId: 'youth',
    cockpitLabel: 'Youth Tournament 2026',
    upstreamedBy: 'Dr. Helen Park',
    upstreamOrg: 'Youth Tournament 2026',
    reason: 'Executive may need to engage MoH if letter slips past deadline.',
    urgency: 4,
    tags: ['medical', 'youth'],
    attachments: [mockAttachment('ua5', 'MoH_Letter_Draft.pdf')],
    latestDevelopments: 'Two venues confirmed; third letter still pending.',
    actionsTaken: 'Medical FA chasing MoH through LOC.',
    nextSteps: 'Escalate to executive if no response in 48h.',
  },
  {
    id: 'up-6',
    title: 'Youth accreditation printer outage',
    description: 'Primary badge printers offline at HQ desk; backup capacity limited.',
    owner: 'Marcus Lee',
    fa: fa('ACR', 'Accreditation'),
    cockpitId: 'youth',
    cockpitLabel: 'Youth Tournament 2026',
    upstreamedBy: 'Tom Nguyen',
    upstreamOrg: 'Services team',
    reason: 'Could cascade into VIP / executive guest experience.',
    urgency: 5,
    knowWindow: 'today',
    tags: ['accreditation', 'infrastructure'],
    attachments: [
      mockAttachment('ua6', 'Printer_Outage_Log.xlsx', 'spreadsheet'),
      mockAttachment('ua6b', 'Badge_Backup_Plan.pdf'),
    ],
    latestDevelopments: 'Primary printers offline; backup queue growing.',
    actionsTaken: 'Vendor on site; VIP desk prioritized.',
    nextSteps: 'Confirm restore ETA before executive guest arrivals.',
  },
  {
    id: 'up-7',
    title: 'WBGT threshold policy clarification',
    description: 'Conflicting guidance between city LE and medical FA on delay thresholds.',
    owner: 'Ana Costa',
    fa: fa('OPS', 'Operations'),
    cockpitId: 'wc26',
    cockpitLabel: 'World Cup 2026',
    upstreamedBy: 'Ana Costa',
    upstreamOrg: 'Security',
    reason: 'Needs single executive-aligned policy before heat season matches.',
    urgency: 3,
    tags: ['weather', 'policy'],
    attachments: [mockAttachment('ua7', 'WBGT_Policy_Draft.pdf')],
    latestDevelopments: 'City LE and medical FA using different thresholds.',
    actionsTaken: 'Ops drafted single policy for review.',
    nextSteps: 'Seek executive alignment before heat-season matches.',
  },
  {
    id: 'up-8',
    title: 'Fan fest broadcast rights query',
    description: 'Local broadcaster querying fan fest clip rights for non-match content.',
    owner: 'Elena Rossi',
    fa: fa('CML', 'Commercial'),
    cockpitId: 'wc26',
    cockpitLabel: 'World Cup 2026',
    upstreamedBy: 'Elena Rossi',
    upstreamOrg: 'Commercial',
    reason: 'Corporate legal/commercial ownership — not tournament ops alone.',
    urgency: 2,
    tags: ['rights', 'fan-fest'],
    attachments: [mockAttachment('ua8', 'FanFest_Rights_Query.pdf')],
    latestDevelopments: 'Local broadcaster sent formal rights query.',
    actionsTaken: 'Commercial legal reviewing response options.',
    nextSteps: 'Confirm whether executive commercial sign-off is required.',
  },
  {
    id: 'up-9',
    title: 'WWC opening ceremony concept freeze',
    description: 'Creative freeze date approaching; budget contingency still open.',
    owner: 'Priya Nair',
    fa: fa('COM', 'Comms'),
    cockpitId: 'wwc',
    cockpitLabel: 'Women’s World Cup 2027',
    upstreamedBy: 'Maya Okonkwo',
    upstreamOrg: 'Venue development team',
    reason: 'SG office expected to see concept options this month.',
    urgency: 3,
    tags: ['ceremony', 'budget'],
    attachments: [
      mockAttachment('ua9', 'Ceremony_Concept_Options.pptx', 'presentation'),
      mockAttachment('ua9b', 'Budget_Contingency.xlsx', 'spreadsheet'),
    ],
    latestDevelopments: 'Creative freeze approaching; contingency still open.',
    actionsTaken: 'Venue development prepared option set for SG office.',
    nextSteps: 'Select concept path for executive pack.',
  },
  {
    id: 'up-10',
    title: 'Transport corridor LE escort gap — SEA',
    description: 'SEA LE escort coverage incomplete for last-mile corridor rehearsal.',
    owner: 'John Smith',
    fa: fa('TRN', 'Transport'),
    cockpitId: 'wc26',
    cockpitLabel: 'World Cup 2026',
    upstreamedBy: 'John Smith',
    upstreamOrg: 'Security',
    reason: 'Overlaps executive transport readiness topic.',
    urgency: 5,
    knowWindow: 'today',
    tags: ['transport', 'LE'],
    attachments: [
      mockAttachment('ua10', 'SEA_Transport_Gap.pptx', 'presentation'),
      mockAttachment('ua10b', 'LE_Escort_Map.pdf'),
    ],
    latestDevelopments: 'SEA LE escort coverage incomplete for rehearsal.',
    actionsTaken: 'Security coordinating with city LE for coverage fill.',
    nextSteps: 'Confirm escort plan before next corridor rehearsal.',
  },
]

export function cloneTopics(source: ExecTopic[] = SEED_EXEC_TOPICS): ExecTopic[] {
  return source.map((topic) => ({
    ...topic,
    fa: { ...topic.fa },
    tags: [...topic.tags],
    attachments: topic.attachments.map((item) => ({ ...item })),
    comments: topic.comments.map((item) => ({ ...item })),
    source: topic.source ? { ...topic.source } : undefined,
  }))
}

export function cloneUpstream(
  source: UpstreamCandidate[] = SEED_UPSTREAM_CANDIDATES,
): UpstreamCandidate[] {
  return source.map((item) => ({
    ...item,
    fa: { ...item.fa },
    tags: item.tags ? [...item.tags] : undefined,
    attachments: item.attachments.map((file) => ({ ...file })),
  }))
}

export function emptyIntakeDraft(): IntakeDraft {
  return {
    title: '',
    description: '',
    owner: '',
    fa: { ...FA_OPTIONS[0] },
    urgency: 3,
    knowWindow: 'today',
    tags: [],
    suggestedTags: ['MBM', 'infrastructure', 'transport', 'briefing'],
    upstreamOrg: 'Executive assistant',
    attachments: [],
    latestDevelopments: '',
    actionsTaken: '',
    nextSteps: '',
    reason: '',
  }
}

export function intakeFromUpstream(candidate: UpstreamCandidate): IntakeDraft {
  const suggested = [...new Set([...(candidate.tags ?? []), candidate.fa.label.toLowerCase()])]
  return {
    title: candidate.title,
    description: candidate.description,
    owner: candidate.owner,
    fa: { ...candidate.fa },
    urgency: candidate.urgency,
    knowWindow: candidate.knowWindow ?? null,
    tags: [],
    suggestedTags: suggested,
    upstreamOrg: candidate.upstreamOrg,
    attachments: candidate.attachments.map((file) => ({ ...file })),
    latestDevelopments: candidate.latestDevelopments ?? '',
    actionsTaken: candidate.actionsTaken ?? '',
    nextSteps: candidate.nextSteps ?? '',
    reason: candidate.reason,
    source: {
      cockpitId: candidate.cockpitId,
      cockpitLabel: candidate.cockpitLabel,
      upstreamedBy: candidate.upstreamedBy,
      reason: candidate.reason,
    },
    fromUpstreamId: candidate.id,
  }
}

export function intakeToTopic(draft: IntakeDraft): ExecTopic {
  const stamp = Date.now()
  return {
    id: `topic-${stamp}`,
    title: draft.title.trim() || 'Untitled topic',
    description: draft.description.trim(),
    owner: draft.owner.trim() || 'Unassigned',
    fa: { ...draft.fa },
    tags: [...draft.tags],
    status: 'active',
    knowWindow: draft.knowWindow,
    urgency: draft.urgency,
    sortDate: isoOffset(0),
    upstreamOrg: draft.upstreamOrg,
    latestDevelopments: draft.latestDevelopments,
    actionsTaken: draft.actionsTaken,
    nextSteps: draft.nextSteps,
    attachments: draft.attachments.map((file) => ({ ...file })),
    comments: [
      {
        id: `c-${stamp}`,
        author: 'You',
        text: draft.fromUpstreamId
          ? `Promoted from ${draft.upstreamOrg}: ${draft.reason}`
          : 'Added manually by executive assistant.',
        at: new Date().toISOString(),
      },
    ],
    source: draft.source
      ? { ...draft.source, reason: draft.reason || draft.source.reason }
      : draft.upstreamOrg === 'Executive assistant'
        ? undefined
        : {
            upstreamedBy: 'Executive assistant',
            reason: draft.reason || 'Manually added to executive tracker.',
          },
  }
}

export function knowWindowSortRank(window: KnowWindow): number {
  if (window === 'today') return 0
  if (window === 'tomorrow') return 1
  if (window === 'week') return 2
  return 3
}
