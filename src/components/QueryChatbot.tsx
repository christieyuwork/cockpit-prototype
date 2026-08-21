import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import {
  PROMPT_LIBRARY,
  PROMPT_LIBRARY_RECOMMENDED,
  QUERY_SUGGESTIONS,
  detectQueryIntent,
  findScenarioStep,
  nextScenarioPrompt,
  resolveScenarioReply,
  type ActionConfirm,
  type ActionDraft,
  type PromptLibraryItem,
  type QueryIntent,
  type ScenarioWidgetLayout,
} from '../data/query'
import { QueryWidgetBundle } from './QueryWidgets'
import { WidgetMeta } from './WidgetMeta'
import './QueryChatbot.css'

export type StarableWidget = {
  messageId: string
  intent: Exclude<QueryIntent, 'general'>
  prompt: string
  title: string
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  intent?: QueryIntent
  prompt?: string
  timestamp?: string
  action?: ActionDraft
  widgets?: ScenarioWidgetLayout
  resultLink?: ActionConfirm
}

type QueryChatbotProps = {
  starredWidgetIds: string[]
  onToggleStarWidget: (widget: StarableWidget) => void
  /** Deep-link: instantly show welcome + reply for this intent (no typing delay). */
  seedIntent?: string | null
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'I’m your Cockpit ops assistant. Ask about risks, flights, issues, or Matchday — I’ll pull widgets with source links so you can verify every claim.',
}

const INTENT_TITLE: Record<Exclude<QueryIntent, 'general'>, string> = {
  risk: 'Risk',
  flights: 'Flights',
  issues: 'Issues',
  matchday: 'Matchday',
}

const INTENT_LOCATION: Partial<Record<Exclude<QueryIntent, 'general'>, string>> = {
  matchday: 'SEA',
  risk: 'MIA',
  issues: 'MIA',
}

const SEEDABLE_INTENTS: Exclude<QueryIntent, 'general'>[] = [
  'risk',
  'flights',
  'issues',
  'matchday',
]

function promptForIntent(intent: Exclude<QueryIntent, 'general'>): string {
  const fromLibrary = PROMPT_LIBRARY_RECOMMENDED.find((item) => item.steps[0]?.intent === intent)
  if (fromLibrary) return fromLibrary.steps[0].prompt
  const match = QUERY_SUGGESTIONS.find((s) => detectQueryIntent(s) === intent)
  return match ?? QUERY_SUGGESTIONS[0]
}

function seededMessages(intentRaw: string | null | undefined): ChatMessage[] {
  const intent = SEEDABLE_INTENTS.find((i) => i === intentRaw)
  if (!intent) return [WELCOME]
  const prompt = promptForIntent(intent)
  const resolved = resolveScenarioReply(prompt, intent)
  return [
    WELCOME,
    { id: 'seed-user', role: 'user', text: prompt },
    {
      id: 'seed-assistant',
      role: 'assistant',
      text: resolved.text,
      intent: resolved.intent,
      prompt,
      timestamp: '15 Jun 14:22',
      action: resolved.action,
      widgets: resolved.widgets,
    },
  ]
}

export function QueryChatbot({
  starredWidgetIds,
  onToggleStarWidget,
  seedIntent = null,
}: QueryChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => seededMessages(seedIntent))
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [thinkingGif, setThinkingGif] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(
    PROMPT_LIBRARY_RECOMMENDED[0]?.id ?? null,
  )
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null)
  const [scenarioStepIndex, setScenarioStepIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const libraryRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)
  const lastPromptRef = useRef('')

  useEffect(() => {
    const intent = SEEDABLE_INTENTS.find((i) => i === seedIntent)
    if (intent) {
      const prompt = promptForIntent(intent)
      lastPromptRef.current = prompt
      const hit = findScenarioStep(prompt)
      if (hit) {
        setActiveScenarioId(hit.scenario.id)
        setScenarioStepIndex(hit.stepIndex)
      }
    }
  }, [seedIntent])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing, thinkingGif])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!libraryOpen) return
    function onPointerDown(event: PointerEvent) {
      if (!libraryRef.current?.contains(event.target as Node)) setLibraryOpen(false)
    }
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setLibraryOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [libraryOpen])

  function send(prompt: string) {
    const text = prompt.trim()
    if (!text || typing) return

    lastPromptRef.current = text
    setLibraryOpen(false)

    const hit = findScenarioStep(text)
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    const intent = detectQueryIntent(text)
    const resolved = resolveScenarioReply(text, intent)
    const isScenarioFirstPrompt = Boolean(hit && hit.stepIndex === 0)
    setThinkingGif(isScenarioFirstPrompt)
    const delay = isScenarioFirstPrompt ? 2000 : 700 + Math.floor(Math.random() * 900)
    timerRef.current = window.setTimeout(() => {
      if (hit) {
        setActiveScenarioId(hit.scenario.id)
        setScenarioStepIndex(hit.stepIndex)
      } else {
        setActiveScenarioId(null)
        setScenarioStepIndex(0)
      }
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: resolved.text,
        intent: resolved.intent,
        prompt: text,
        timestamp: '15 Jun 14:22',
        action: resolved.action,
        widgets: resolved.widgets,
      }
      setMessages((prev) => [...prev, reply])
      setTyping(false)
      setThinkingGif(false)
    }, delay)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  function onComposerKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  function runLibraryItem(item: PromptLibraryItem, prompt?: string) {
    send(prompt ?? item.steps[0].prompt)
  }

  function handleActionComplete(confirm: ActionConfirm) {
    setThinkingGif(false)
    setTyping(true)
    timerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-confirm-${Date.now()}`,
          role: 'assistant',
          text: confirm.text,
          intent: 'issues',
          widgets: 'action-result',
          resultLink: confirm,
          timestamp: '15 Jun 14:22',
        },
      ])
      setTyping(false)
    }, 450)
  }

  const nextPrompt =
    activeScenarioId != null ? nextScenarioPrompt(activeScenarioId, scenarioStepIndex) : null
  const suggestionPrompts = nextPrompt
    ? [nextPrompt]
    : PROMPT_LIBRARY_RECOMMENDED.map((item) => item.steps[0].prompt)

  return (
    <div className="chat">
      <div className="chat__messages scroll-area" ref={listRef}>
        {messages.map((msg) => {
          const showWidgets =
            msg.role === 'assistant' &&
            (msg.widgets === 'action-result' ||
              Boolean(msg.action) ||
              (msg.widgets != null && msg.widgets !== 'intent') ||
              (msg.intent != null && msg.intent !== 'general'))
          const widgetIntent =
            msg.intent && msg.intent !== 'general' ? msg.intent : null
          const isStarred = widgetIntent ? starredWidgetIds.includes(msg.id) : false
          const metaCategory =
            msg.widgets === 'action-result'
              ? 'Result'
              : msg.widgets?.startsWith('sop')
                ? 'SOP'
                : widgetIntent
                  ? INTENT_TITLE[widgetIntent]
                  : 'Evidence'

          return (
            <div key={msg.id} className={`chat__turn chat__turn--${msg.role}`}>
              <span className="chat__role">{msg.role === 'assistant' ? 'Cockpit AI' : 'You'}</span>
              <p className="chat__text">{msg.text}</p>
              {showWidgets ? (
                <div className="chat__widgets">
                  <div className={`chat__widget-card${isStarred ? ' is-starred' : ''}`}>
                    {widgetIntent && msg.widgets !== 'action-result' ? (
                      <WidgetMeta
                        category={metaCategory}
                        timestamp={msg.timestamp ?? 'Just now'}
                        location={INTENT_LOCATION[widgetIntent]}
                        end={
                          <button
                            type="button"
                            className={`chat__star${isStarred ? ' is-active' : ''}`}
                            aria-label={isStarred ? 'Unstar widget' : 'Star widget'}
                            onClick={() =>
                              onToggleStarWidget({
                                messageId: msg.id,
                                intent: widgetIntent,
                                prompt: msg.prompt ?? lastPromptRef.current,
                                title: INTENT_TITLE[widgetIntent],
                              })
                            }
                          >
                            <span className="icon-box">
                              <img
                                className="icon"
                                src={isStarred ? '/assets/icons/starred.svg' : '/assets/icons/star.svg'}
                                alt=""
                              />
                            </span>
                          </button>
                        }
                      />
                    ) : (
                      <WidgetMeta
                        category={metaCategory}
                        timestamp={msg.timestamp ?? 'Just now'}
                      />
                    )}
                    <QueryWidgetBundle
                      intent={msg.intent ?? 'general'}
                      action={msg.action}
                      widgets={msg.widgets}
                      resultLink={msg.resultLink}
                      onActionComplete={handleActionComplete}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
        {typing ? (
          <div className="chat__turn chat__turn--assistant chat__turn--typing">
            <span className="chat__role">Cockpit AI</span>
            {thinkingGif ? (
              <div className="chat__thinking" aria-label="Thinking">
                <img src="/assets/thinking.gif" alt="" width={56} height={56} />
              </div>
            ) : (
              <p className="chat__text">
                <span className="chat__dot" />
                <span className="chat__dot" />
                <span className="chat__dot" />
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="chat__dock">
        <div className="chat__suggestions" ref={libraryRef}>
          {suggestionPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="chat__suggestion"
              disabled={typing}
              onClick={() => send(prompt)}
            >
              {prompt}
            </button>
          ))}
          <button
            type="button"
            className={`chat__suggestion chat__suggestion--library${libraryOpen ? ' is-open' : ''}`}
            aria-expanded={libraryOpen}
            aria-haspopup="dialog"
            disabled={typing}
            onClick={() => setLibraryOpen((open) => !open)}
          >
            <span className="icon-box" aria-hidden>
              <img className="icon" src="/assets/icons/document.svg" alt="" />
            </span>
            Scenario Library
          </button>

          {libraryOpen ? (
            <div className="chat__library" role="dialog" aria-label="Scenario Library">
              <header className="chat__library-head">
                <div>
                  <h3>Scenario Library</h3>
                  <p>
                    Simulated demo — not a production feature. Walk through TOC scenarios to see how
                    answers, evidence, and actions should work.
                  </p>
                </div>
                <button
                  type="button"
                  className="chat__library-close"
                  aria-label="Close scenario library"
                  onClick={() => setLibraryOpen(false)}
                >
                  <img src="/assets/icons/close.svg" alt="" width={16} height={16} />
                </button>
              </header>
              <div className="chat__library-list scroll-area">
                {PROMPT_LIBRARY.map((item) => {
                  const expanded = expandedId === item.id
                  return (
                    <article
                      key={item.id}
                      className={`chat__library-item${expanded ? ' is-expanded' : ''}`}
                    >
                      <button
                        type="button"
                        className="chat__library-item-head"
                        onClick={() => setExpandedId(expanded ? null : item.id)}
                      >
                        <span className={`chat__library-priority is-${item.priority.toLowerCase()}`}>
                          {item.priority}
                        </span>
                        <span className="chat__library-copy">
                          <strong>{item.scenario}</strong>
                          <em>
                            {item.capability} · {item.persona}
                          </em>
                        </span>
                        <img
                          src="/assets/icons/arrow-down.svg"
                          alt=""
                          width={14}
                          height={14}
                          className="chat__library-chevron"
                        />
                      </button>
                      {expanded ? (
                        <div className="chat__library-body">
                          <p className="chat__library-context">{item.context}</p>
                          <div className="chat__library-prompts">
                            {item.steps.map((step) => (
                              <button
                                key={step.prompt}
                                type="button"
                                className="chat__library-prompt"
                                onClick={() => runLibraryItem(item, step.prompt)}
                              >
                                {step.prompt}
                              </button>
                            ))}
                          </div>
                          <div className="chat__library-answer">
                            <span>Sample first answer</span>
                            <p>{item.steps[0].answer}</p>
                          </div>
                          <button
                            type="button"
                            className="chat__library-run"
                            onClick={() => runLibraryItem(item)}
                          >
                            Run first prompt
                          </button>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        <form className="chat__composer" onSubmit={onSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onComposerKeyDown}
            placeholder="Ask about risks, flights, issues, Matchday…"
            aria-label="Ask Cockpit AI"
            disabled={typing}
            rows={3}
          />
          <button type="submit" disabled={typing || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
