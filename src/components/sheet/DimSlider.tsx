"use client"

import { useId } from "react"

/**
 * A control that looks like a dimension string and behaves like a range input.
 *
 * Built on a native <input type="range"> rather than on pointer handlers, which is the whole
 * reason it exists: keyboard, touch, screen readers and the browser's own value announcements
 * all arrive for free and correct. The two plates written before this one were pointer-only
 * for exactly as long as their controls were hand-rolled.
 *
 * The track is the dimension line and the thumb is the rotated square already used on the
 * section plate's track, so it reads as drawing apparatus rather than as a form field.
 */
export function DimSlider({
  label,
  value,
  min,
  max,
  step = 1,
  detents,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** Values worth landing on. Rendered as ticks and offered to the browser's own snapping. */
  detents?: readonly number[]
  format: (value: number) => string
  onChange: (value: number) => void
}) {
  const id = useId()
  const listId = detents?.length ? `${id}-detents` : undefined
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-4 pb-2">
        <label htmlFor={id} className="instrument">
          {label}
        </label>
        <span className="tnum text-sun-ink font-mono text-xs">{format(value)}</span>
      </div>

      <div className="relative h-4">
        <span aria-hidden="true" className="bg-rule-strong absolute inset-x-0 top-1/2 h-px" />
        <span
          aria-hidden="true"
          className="bg-sun/60 absolute top-1/2 left-0 h-px"
          style={{ width: `${pct}%` }}
        />
        {detents?.map((d) => (
          <span
            key={d}
            aria-hidden="true"
            className="bg-rule-strong absolute top-1/2 h-1.5 w-px -translate-y-1/2"
            style={{ left: `${((d - min) / (max - min)) * 100}%` }}
          />
        ))}
        <span
          aria-hidden="true"
          className="bg-sun absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          style={{ left: `${pct}%` }}
        />
        {/*
          The input itself is transparent and sits over the drawing at full size, so the hit
          area is the whole dimension string and the focus ring lands on the real control.
        */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          list={listId}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={format(value)}
          className="focus-visible:outline-sun absolute inset-0 w-full cursor-pointer opacity-0 outline-offset-4"
        />
        {listId ? (
          <datalist id={listId}>
            {detents?.map((d) => <option key={d} value={d} />)}
          </datalist>
        ) : null}
      </div>
    </div>
  )
}
