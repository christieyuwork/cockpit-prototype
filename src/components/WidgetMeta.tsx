import type { ReactNode } from 'react'
import './WidgetMeta.css'

type WidgetMetaProps = {
  category: string
  timestamp: string
  location?: string
  end?: ReactNode
}

export function WidgetMeta({ category, timestamp, location, end }: WidgetMetaProps) {
  return (
    <div className="widget-meta">
      <div className="widget-meta__line">
        <span className="widget-meta__cat">{category}</span>
        <span className="widget-meta__sep" aria-hidden>
          ·
        </span>
        <span className="widget-meta__time">{timestamp}</span>
        {location ? (
          <>
            <span className="widget-meta__sep" aria-hidden>
              ·
            </span>
            <span className={`widget-meta__loc ${location.toLowerCase()}`}>{location}</span>
          </>
        ) : null}
      </div>
      {end ? <div className="widget-meta__end">{end}</div> : null}
    </div>
  )
}
