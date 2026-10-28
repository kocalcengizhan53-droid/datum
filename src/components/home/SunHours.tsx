"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { FINS, MASSING, compassPoint, hourLabel, sunAngles } from "@/lib/massing"
import {
  BUILT,
  FIRST_HOUR,
  LAST_HOUR,
  PLAN_CELLS,
  PLAN_HALF,
  PLAN_STEP,
  decodeHours,
  hoursOf,
  shadowGrid,
} from "@/lib/sunlight"

/**
 * Shade to full sun in eight steps of an hour and a half, so the map reads as bands with edges —
 * contours of light, the way the study is drawn by hand — from the cover's dusk blue to its
 * noon sun. Muted at the top: most of the ground is bright, and a bright square shouts.
 */
const BANDS = [
  [20, 26, 38],
  [30, 42, 62],
  [46, 62, 88],
  [76, 86, 104],
  [116, 104, 90],
  [150, 118, 82],
  [176, 138, 92],
  [196, 158, 110],
]
const RESUME_MS = 6000
const SPEED = 1.1 // hours per second

const band = (hours: number) => BANDS[Math.min(BANDS.length - 1, Math.floor(hours / 1.5))]
const LEGEND = `linear-gradient(90deg, ${BANDS.map((b, i) => `rgb(${b}) ${(i / BANDS.length) * 100}% ${((i + 1) / BANDS.length) * 100}%`).join(", ")})`

const reducedQuery = "(prefers-reduced-motion: reduce)"
const subscribe = (cb: () => void) => {
  const m = matchMedia(reducedQuery)
  m.addEventListener("change", cb)
  return () => m.removeEventListener("change", cb)
}

/** A volume's outline on the plan, in metres: x east, z south, so north is up. */
const footprint = (v: { position: readonly number[]; size: readonly number[] }) => ({
  x: v.position[0] - v.size[0] / 2,
  y: v.position[2] - v.size[2] / 2,
  width: v.size[0],
  height: v.size[2],
})

/**
 * The ground around the building in hours of direct sun, computed at build time by casting a
 * ray at the cover's sun every quarter-hour from each half-metre of the plan. Over it, the
 * shadow at the hour on the slider, which runs through the day by itself until a reader takes
 * hold of it. Point at the ground for that spot's hours.
 */
export function SunHours({ encoded, summary }: { encoded: string; summary: { allDay: number; underThree: number } }) {
  const heat = useRef<HTMLCanvasElement>(null)
  const shade = useRef<HTMLCanvasElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const reduced = useSyncExternalStore(
    subscribe,
    () => matchMedia(reducedQuery).matches,
    () => false,
  )
  const [hour, setHour] = useState(14.5)
  const [hover, setHover] = useState<{ c: number; r: number } | null>(null)
  const held = useRef(-Infinity)
  const [hours] = useState(() => decodeHours(encoded))

  // The study itself, painted once: one pixel a cell, smoothed by the browser as it scales.
  useEffect(() => {
    const g = heat.current?.getContext("2d")
    if (!g) return
    const img = g.createImageData(PLAN_CELLS, PLAN_CELLS)
    hours.forEach((v, i) => {
      const [r, gr, b] = v === BUILT ? [0, 0, 0] : band(hoursOf(v)!)
      img.data.set([r, gr, b, v === BUILT ? 0 : 255], i * 4)
    })
    g.putImageData(img, 0, 0)
  }, [hours])

  // The shadow at the slider's hour.
  useEffect(() => {
    const g = shade.current?.getContext("2d")
    if (!g) return
    const grid = shadowGrid(hour)
    const img = g.createImageData(PLAN_CELLS, PLAN_CELLS)
    grid.forEach((s, i) => {
      if (s && hours[i] !== BUILT) img.data.set([8, 10, 16, 150], i * 4)
    })
    g.putImageData(img, 0, 0)
  }, [hour, hours])

  // Through the day on its own while on screen, paused for a while by any touch of the control.
  useEffect(() => {
    if (reduced) return
    let raf = 0
    let last = performance.now()
    let visible = false
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    if (box.current) io.observe(box.current)
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (visible && now - held.current > RESUME_MS)
        setHour((h) => (h + dt * SPEED > LAST_HOUR ? FIRST_HOUR : h + dt * SPEED))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [reduced])

  const hold = () => (held.current = performance.now())
  const { altitude, azimuth } = sunAngles(hour)
  const spot = hover ? hours[hover.r * PLAN_CELLS + hover.c] : null
  const spotHours = spot === null ? null : hoursOf(spot)
  const spotShaded = hover && spot !== BUILT ? shadowGrid(hour)[hover.r * PLAN_CELLS + hover.c] === 1 : false
  // The sun's bearing as a point on the plan's rim; north is up, east is right.
  const rad = (azimuth * Math.PI) / 180
  const rim = PLAN_HALF - 1.4
  const sx = Math.sin(rad) * rim
  const sy = -Math.cos(rad) * rim
  const pct = (v: number) => `${Math.round(v * 100)}%`

  return (
    <section aria-labelledby="sun-hours" className="border-t border-rule">
      <div className="mx-auto grid w-full max-w-[94rem] gap-x-12 gap-y-8 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <h2 id="sun-hours" className="mark">
            Plate 0 · the ground, in hours of sun
          </h2>
          <p className="text-2xl font-medium text-balance">Where the bench should go, before anyone argues about it.</p>
          <p className="prose-fig text-fg-muted">
            Every half-metre around the cover&apos;s building, asked every quarter-hour from six to six whether it can
            see the sun. {pct(summary.allDay)} of the open ground gets eleven hours or more; {pct(summary.underThree)}{" "}
            gets under three — nearly all of it against the north face.
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <label htmlFor="sun-hour" className="mark">
                Shadow at
              </label>
              <output htmlFor="sun-hour" className="instrument tnum text-sun-ink">
                {hourLabel(hour)} · {Math.round(altitude)}° · {compassPoint(azimuth)}
              </output>
            </div>
            <input
              id="sun-hour"
              type="range"
              min={FIRST_HOUR}
              max={LAST_HOUR}
              step={0.25}
              value={hour}
              onChange={(e) => {
                hold()
                setHour(Number(e.target.value))
              }}
              onPointerDown={hold}
              onFocus={hold}
              className="w-full accent-[var(--sun)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="mark">Hours of direct sun</p>
            <div aria-hidden="true" className="h-2 w-full" style={{ background: LEGEND }} />
            <div className="instrument tnum flex justify-between text-fg-faint">
              <span>0 h</span>
              <span>6 h</span>
              <span>12 h</span>
            </div>
          </div>

          <p className="instrument tnum min-h-[1.5em] text-fg" aria-live="polite">
            {hover
              ? spot === BUILT
                ? "The building"
                : `This spot: ${spotHours} h of sun · ${spotShaded ? "in shade" : "in sun"} at ${hourLabel(hour)}`
              : "Point at the ground for a spot's hours"}
          </p>
        </div>

        <figure className="m-0 flex flex-col gap-3">
          <div
            ref={box}
            className="sheet-grid relative mx-auto aspect-square w-full max-w-[40rem] touch-none border border-rule"
            onPointerMove={(e) => {
              const b = e.currentTarget.getBoundingClientRect()
              const c = Math.floor(((e.clientX - b.left) / b.width) * PLAN_CELLS)
              const r = Math.floor(((e.clientY - b.top) / b.height) * PLAN_CELLS)
              setHover(c >= 0 && r >= 0 && c < PLAN_CELLS && r < PLAN_CELLS ? { c, r } : null)
            }}
            onPointerLeave={() => setHover(null)}
          >
            <canvas
              ref={heat}
              width={PLAN_CELLS}
              height={PLAN_CELLS}
              aria-hidden="true"
              className="absolute inset-0 size-full [image-rendering:auto]"
            />
            <canvas
              ref={shade}
              width={PLAN_CELLS}
              height={PLAN_CELLS}
              aria-hidden="true"
              className="absolute inset-0 size-full mix-blend-multiply"
            />
            <svg
              viewBox={`${-PLAN_HALF} ${-PLAN_HALF} ${PLAN_HALF * 2} ${PLAN_HALF * 2}`}
              className="absolute inset-0 size-full"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="poche"
                  width="0.6"
                  height="0.6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line x1="0" y1="0" x2="0" y2="0.6" stroke="var(--fg-faint)" strokeWidth="0.12" />
                </pattern>
              </defs>
              {/* A four-metre grid, faint, so distances read without the scale bar. */}
              {Array.from({ length: (PLAN_HALF * 2) / 4 - 1 }, (_, i) => -PLAN_HALF + (i + 1) * 4).map((g) => (
                <g key={g} stroke="#000" strokeOpacity="0.14" strokeWidth="0.05">
                  <line x1={g} y1={-PLAN_HALF} x2={g} y2={PLAN_HALF} />
                  <line x1={-PLAN_HALF} y1={g} x2={PLAN_HALF} y2={g} />
                </g>
              ))}
              {MASSING.filter((v) => v.position[1] - v.size[1] / 2 <= 1).map((v) => {
                const f = footprint(v)
                return <rect key={v.id} {...f} fill="url(#poche)" stroke="var(--fg-muted)" strokeWidth="0.12" />
              })}
              {MASSING.filter((v) => v.position[1] - v.size[1] / 2 > 1).map((v) => {
                const f = footprint(v)
                return (
                  <rect
                    key={v.id}
                    {...f}
                    fill="none"
                    stroke="var(--fg-muted)"
                    strokeWidth="0.1"
                    strokeDasharray="0.5 0.35"
                  />
                )
              })}
              {FINS.map((v) => {
                const f = footprint(v)
                return <rect key={v.id} {...f} fill="var(--fg-muted)" />
              })}
              {hover && spot !== BUILT ? (
                <rect
                  x={-PLAN_HALF + hover.c * PLAN_STEP}
                  y={-PLAN_HALF + hover.r * PLAN_STEP}
                  width={PLAN_STEP}
                  height={PLAN_STEP}
                  fill="none"
                  stroke="var(--fg)"
                  strokeWidth="0.12"
                />
              ) : null}
              {/* The sun's bearing, from the rim toward the building. */}
              <line
                x1={sx}
                y1={sy}
                x2={sx * 0.8}
                y2={sy * 0.8}
                stroke="var(--sun)"
                strokeWidth="0.16"
                strokeLinecap="round"
              />
              <circle cx={sx} cy={sy} r="0.75" fill="var(--sun)" />
              <circle cx={sx} cy={sy} r="1.4" fill="none" stroke="var(--sun)" strokeOpacity="0.35" strokeWidth="0.1" />
              {/* North arrow and a ten-metre bar. */}
              <g transform={`translate(${PLAN_HALF - 2.6} ${-PLAN_HALF + 3})`}>
                <path d="M0 -1.6 L0.8 0.9 L0 0.4 L-0.8 0.9 Z" fill="#1b1712" />
              </g>
              <g transform={`translate(${-PLAN_HALF + 1.5} ${PLAN_HALF - 3.4})`}>
                <rect x="0" y="-0.25" width="5" height="0.5" fill="#1b1712" />
                <rect x="5" y="-0.25" width="5" height="0.5" fill="none" stroke="#1b1712" strokeWidth="0.1" />
              </g>
            </svg>
            <span className="instrument pointer-events-none absolute top-2 right-3 text-[#1b1712]">N</span>
            <span className="instrument pointer-events-none absolute bottom-2 left-3 text-[#1b1712]">0 · 5 · 10 m</span>
          </div>
          <figcaption className="instrument mx-auto w-full max-w-[40rem] text-fg-faint">
            Plan, north up, the building alone. Hatched: the building on the ground; dashed: the study overhead; the
            bars on the south face are the fins.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
