"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

/**
 * A sideways rail with a pair of arrows. The rail itself is native scrolling with snap points —
 * a finger, a trackpad and the keyboard all work without this component — and the arrows only
 * page it by one card, disabled at either end.
 */
export function Rail({ label, children }: { label: string; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null)
  const [ends, setEnds] = useState({ start: true, end: false })

  useEffect(() => {
    const el = track.current
    if (!el) return
    const update = () =>
      setEnds({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 })
    update()
    el.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      el.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  const page = (direction: 1 | -1) => {
    const el = track.current
    const card = el?.querySelector("li")
    if (!el || !card) return
    el.scrollBy({ left: direction * (card.getBoundingClientRect().width + 24), behavior: "smooth" })
  }

  const arrow = "grid size-11 place-items-center border border-rule-strong text-fg transition-colors hover:border-sun disabled:opacity-30 disabled:hover:border-rule-strong"
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end gap-2">
        <button type="button" className={arrow} onClick={() => page(-1)} disabled={ends.start} aria-label={`Previous in ${label}`}>
          ←
        </button>
        <button type="button" className={arrow} onClick={() => page(1)} disabled={ends.end} aria-label={`Next in ${label}`}>
          →
        </button>
      </div>
      <ul
        ref={track}
        aria-label={label}
        className="rail -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-2 sm:-mx-10 sm:px-10"
      >
        {children}
      </ul>
    </div>
  )
}
