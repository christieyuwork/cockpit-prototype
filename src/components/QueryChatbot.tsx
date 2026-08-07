import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import {
  QUERY_SUGGESTIONS,
  detectQueryIntent,
  mockAssistantReply,
  type QueryIntent,
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
}

type QueryChatbotProps = {
  starredWidgetIds: string[]
  onToggleStarWidget: (widget: StarableWidget) => void
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

export function QueryChatbot({ starredWidgetIds, onToggleStarWidget }: QueryChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)
  const lastPromptRef = useRef('')

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  function send(prompt: string) {
    const text = prompt.trim()
    if (!text || typing) return

    lastPromptRef.current = text
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    const intent = detectQueryIntent(text)
    const delay = 700 + Math.floor(Math.random() * 900)
    timerRef.current = window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: mockAssistantReply(text, intent),
        intent,
        prompt: text,
        timestamp: '15 Jun 14:22',
      }
      setMessages((prev) => [...prev, reply])
      setTyping(false)
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

  return (
    <div className="chat">
      <div className="chat__messages scroll-area" ref={listRef}>
        {messages.map((msg) => {
          const widgetIntent =
            msg.role === 'assistant' && msg.intent && msg.intent !== 'general' ? msg.intent : null
          const isStarred = widgetIntent ? starredWidgetIds.includes(msg.id) : false

          return (
            <div key={msg.id} className={`chat__turn chat__turn--${msg.role}`}>
              <span className="chat__role">{msg.role === 'assistant' ? 'Cockpit AI' : 'You'}</span>
              <p className="chat__text">{msg.text}</p>
              {widgetIntent ? (
                <div className="chat__widgets">
                  <div className={`chat__widget-card${isStarred ? ' is-starred' : ''}`}>
                    <WidgetMeta
                      category={INTENT_TITLE[widgetIntent]}
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
                            <img className="icon" src="/assets/star.svg" alt="" />
                          </span>
                        </button>
                      }
                    />
                    <QueryWidgetBundle intent={widgetIntent} />
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
        {typing ? (
          <div className="chat__turn chat__turn--assistant chat__turn--typing">
            <span className="chat__role">Cockpit AI</span>
            <p className="chat__text">
              <span className="chat__dot" />
              <span className="chat__dot" />
              <span className="chat__dot" />
            </p>
          </div>
        ) : null}
      </div>

      <div className="chat__dock">
        <div className="chat__suggestions">
          {QUERY_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="chat__suggestion"
              disabled={typing}
              onClick={() => send(suggestion)}
            >
              {suggestion}
            </button>
          ))}
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
