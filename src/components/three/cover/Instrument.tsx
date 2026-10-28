"use client"

import { useCallback, useRef } from "react"

import { TOWER_TOP, compassPoint, hourLabel, shadowLength, sunAngles } from "@/lib/massing"

/**
 * The cover's instrument: a sun-path diagram in elevation, facing south, with the day's arc and
 * the sun on it, and the readouts an architect would take off a solar study — the time, how
 * high the sun stands, where it bears from, and how far the tower's shadow reaches. Written
 * imperatively, because it follows a sun that moves every frame, live or on video.
 */

const W = 150
const H = 62
const PAD = 8
const EAST = sunAngles(6).azimuth
const WEST = sunAngles(18).azimuth
const HIGHEST = sunAngles(12).altitude

function dialPoint(hour: number): [number, number] {
  const { altitude, azimuth } = sunAngles(hour)
  return [PAD + ((azimuth - EAST) / (WEST - EAST)) * (W - 2 * PAD), H - PAD - (altitude / HIGHEST) * (H - 2 * PAD - 6)]
}

const ARC = Array.from({ length: 49 }, (_, i) => dialPoint(6 + i / 4))
  .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
  .join(" ")
const TICKS = Array.from({ length: 13 }, (_, i) => dialPoint(6 + i))

type Nodes = Partial<Record<"time" | "altitude" | "bearing" | "shadow" | "sun" | "glow" | "drop" | "track", Element | null>>

/** Returns the instrument and the function that moves it to an hour. */
export function useInstrument() {
  const nodes = useRef<Nodes>({})
  const write = useCallback((hour: number) => {
    const n = nodes.current
    const { altitude, azimuth } = sunAngles(hour)
    const shadow = shadowLength(TOWER_TOP, hour)
    const [x, y] = dialPoint(hour)
    if (n.time) n.time.textContent = hourLabel(hour)
    if (n.altitude) n.altitude.textContent = `${altitude.toFixed(0)}°`
    if (n.bearing) n.bearing.textContent = `${azimuth.toFixed(0).padStart(3, "0")}° ${compassPoint(azimuth)}`
    if (n.shadow) n.shadow.textContent = shadow > 99 ? "> 99 m" : `${shadow.toFixed(1)} m`
    for (const c of [n.sun, n.glow]) {
      c?.setAttribute("cx", x.toFixed(1))
      c?.setAttribute("cy", y.toFixed(1))
    }
    n.drop?.setAttribute("x1", x.toFixed(1))
    n.drop?.setAttribute("x2", x.toFixed(1))
    n.drop?.setAttribute("y1", y.toFixed(1))
    ;(n.track as HTMLElement | null | undefined)?.style.setProperty("--at", `${((hour - 6) / 12) * 100}%`)
  }, [])
  const bind = (key: keyof Nodes) => (el: Element | null) => void (nodes.current[key] = el)
  return { write, bind }
}

function Readout({ label, bind }: { label: string; bind: (el: Element | null) => void }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="instrument text-[0.625rem] text-fg-faint">{label}</span>
      <span ref={bind} className="tnum font-mono text-xs text-fg sm:text-sm">
        —
      </span>
    </span>
  )
}

export function Instrument({ bind, hint }: { bind: (key: keyof Nodes) => (el: Element | null) => void; hint?: string }) {
  return (
    <div ref={bind("track")} className="pointer-events-none absolute right-6 bottom-6 left-6 z-10 sm:right-10 sm:left-10">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-3">
        <div className="flex items-end gap-4">
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true" className="overflow-visible">
            <line x1={0} x2={W} y1={H - PAD} y2={H - PAD} className="stroke-fg-faint" strokeWidth={1} />
            <path d={ARC} fill="none" className="stroke-sun-ink" strokeWidth={1} strokeDasharray="2 3" opacity={0.7} />
            {TICKS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.6 : 1} className="fill-sun-ink" opacity={0.7} />
            ))}
            <line ref={bind("drop")} y2={H - PAD} className="stroke-sun" strokeWidth={1} opacity={0.5} />
            <circle ref={bind("glow")} r={8} className="fill-sun" opacity={0.22} />
            <circle ref={bind("sun")} r={3.4} className="fill-sun" />
            <text x={PAD} y={H} className="fill-fg-faint font-mono text-[8px]">
              E
            </text>
            <text x={W / 2} y={H} textAnchor="middle" className="fill-fg-faint font-mono text-[8px]">
              S
            </text>
            <text x={W - PAD} y={H} textAnchor="end" className="fill-fg-faint font-mono text-[8px]">
              W
            </text>
          </svg>
          {hint ? <span className="instrument hidden pb-1 lg:inline">{hint}</span> : null}
        </div>
        <div className="flex gap-5 sm:gap-8">
          <span className="flex flex-col gap-0.5">
            <span className="instrument text-[0.625rem] text-fg-faint">Time</span>
            <span ref={bind("time")} className="tnum font-mono text-xs text-sun-ink sm:text-sm">
              —
            </span>
          </span>
          <Readout label="Altitude" bind={bind("altitude")} />
          <Readout label="Bearing" bind={bind("bearing")} />
          <Readout label="Tower shadow" bind={bind("shadow")} />
        </div>
      </div>
      <div className="relative h-px w-full bg-rule-strong">
        <span className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-sun" style={{ left: "var(--at, 20%)" }} />
        <span className="absolute inset-y-0 left-0 bg-sun/60" style={{ width: "var(--at, 20%)" }} />
      </div>
    </div>
  )
}

/** The hour the cover opens on, live or as a picture, so the poster, video and scene agree. */
export const COVER_START_HOUR = 8.4

/*
 * The phone's cover is a video of the same sweep, rendered from the scene: an eased pendulum
 * from first light to last and back, rotated so it opens on the poster's hour. The frames and
 * the readout that follows the video both come from here, so they cannot drift apart.
 */
const VIDEO = { fps: 24, forward: 8, first: 6.6, last: 17.4 } as const

const pendulum = (u: number) => VIDEO.first + ((VIDEO.last - VIDEO.first) * (1 - Math.cos(Math.PI * u))) / 2
const startOffset = (VIDEO.forward * Math.acos(1 - (2 * (COVER_START_HOUR - VIDEO.first)) / (VIDEO.last - VIDEO.first))) / Math.PI

/** The hour shown at a moment of the video. */
export function hourAtVideoTime(seconds: number) {
  const loop = 2 * VIDEO.forward
  const s = (((seconds + startOffset) % loop) + loop) % loop
  return pendulum(s <= VIDEO.forward ? s / VIDEO.forward : (loop - s) / VIDEO.forward)
}

/** The hour of every frame the video script renders, in order. */
export function videoFrameHours() {
  const frames = 2 * VIDEO.forward * VIDEO.fps
  return Array.from({ length: frames }, (_, i) => hourAtVideoTime(i / VIDEO.fps))
}

export const VIDEO_FPS = VIDEO.fps
