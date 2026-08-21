import { useEffect, useRef, useState } from 'react'

export function FilterChip({
  value,
  options,
  onChange,
  className,
  align = 'end',
}: {
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  className?: string
  align?: 'start' | 'end'
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`filter-menu${align === 'start' ? ' filter-menu--start' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      <button
        type="button"
        className="chip"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        {value}
        <span className="icon-box">
          <img className="icon" src="/assets/icons/arrow-down.svg" alt="" />
        </span>
      </button>
      {open ? (
        <div className="filter-menu__list" role="listbox">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              className={option === value ? 'is-active' : undefined}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
