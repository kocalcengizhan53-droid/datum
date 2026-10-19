"use client"

import { useState } from "react"

import { DimSlider } from "@/components/sheet/DimSlider"
import { PlateFrame } from "@/components/three/plates/PlateFrame"
import { PLINTHS } from "@/data/plinths"
import {
  APPROACH,
  BUILDING_WIDTH_MM,
  COVER_HEIGHT_MM,
  MAX_MM,
  MIN_MM,
  OUTGROWS_AT_MM,
  approachFor,
} from "@/lib/survey"

/**
 * The two ways up, at the same scale, against the building they belong to.
 *
 * "Eighteen metres has to go somewhere" is the article's line and it is doing rhetorical work a
 * sentence cannot finish. Drawn true to scale, the ramp for the cover study's own plinth is
 * longer than the building is wide — so it cannot go along the front, which is the thing four
 * of the eleven practices did anyway. Drag the height and the sheet visibly stops containing
 * the consequence.
 *
 * Nothing here is exaggerated. A long shallow ramp drawn with a stretched vertical scale looks
 * like a climb, which is the opposite of true: it is a crawl, and the crawl is the point. The
 * plate is therefore a wide thin band rather than a square, both axes at one scale.
 */

const MARGIN_MM = 900
const VIEW_W = (BUILDING_WIDTH_MM + MARGIN_MM * 2) / 1000
const ROW_H = 1.9
const DIM_H = 0.62
const VIEW_H = ROW_H * 2 + DIM_H

const PLINTH_FACE = VIEW_W - MARGIN_MM / 1000

const detents = [...new Set(PLINTHS.map((p) => p.heightMm))].sort((a, b) => a - b)

/** Ramp polyline from the top of the plinth, walking back down and west. */
function rampPoints(riseM: number, groundY: number) {
  const flights = Math.max(1, Math.ceil((riseM * 1000) / APPROACH.flightRiseMm))
  const flightRise = riseM / flights
  const flightRun = flightRise / APPROACH.rampGradient
  const points: [number, number][] = [[PLINTH_FACE, groundY - riseM]]
  let x = PLINTH_FACE
  let y = riseM
  for (let f = 0; f < flights; f++) {
    x -= flightRun
    y -= flightRise
    points.push([x, groundY - y])
    if (f < flights - 1) {
      x -= APPROACH.landingMm / 1000
      points.push([x, groundY - y])
    }
  }
  return points
}

function stairPoints(riseM: number, groundY: number) {
  const risers = Math.max(1, Math.ceil((riseM * 1000) / APPROACH.maxRiserMm))
  const rise = riseM / risers
  const tread = APPROACH.treadMm / 1000
  const points: [number, number][] = [[PLINTH_FACE, groundY - riseM]]
  let x = PLINTH_FACE
  let y = riseM
  for (let i = 0; i < risers; i++) {
    if (i > 0) {
      x -= tread
      points.push([x, groundY - y])
    }
    y -= rise
    points.push([x, groundY - y])
  }
  return points
}

const d = (points: [number, number][]) => points.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(" ")

function Row({
  groundY,
  riseM,
  points,
  overflows,
}: {
  groundY: number
  riseM: number
  points: [number, number][]
  overflows: boolean
}) {
  const end = points[points.length - 1][0]
  const dimY = groundY + 0.3
  return (
    <g>
      <line x1={0} y1={groundY} x2={VIEW_W} y2={groundY} className="stroke-rule" vectorEffect="non-scaling-stroke" />
      <rect
        x={PLINTH_FACE}
        y={groundY - riseM}
        width={VIEW_W - PLINTH_FACE}
        height={riseM}
        className="fill-fg/10 stroke-rule-strong"
        vectorEffect="non-scaling-stroke"
      />
      <polyline points={d(points)} fill="none" className="stroke-fg-muted" strokeWidth={2} vectorEffect="non-scaling-stroke" />

      {/* The run, dimensioned under the thing it measures. */}
      <line x1={Math.max(0, end)} y1={dimY} x2={PLINTH_FACE} y2={dimY} className={overflows ? "stroke-sun" : "stroke-rule-strong"} vectorEffect="non-scaling-stroke" />
      <line x1={PLINTH_FACE} y1={dimY - 0.1} x2={PLINTH_FACE} y2={dimY + 0.1} className="stroke-rule-strong" vectorEffect="non-scaling-stroke" />
      {end >= 0 ? (
        <line x1={end} y1={dimY - 0.1} x2={end} y2={dimY + 0.1} className="stroke-rule-strong" vectorEffect="non-scaling-stroke" />
      ) : (
        /* Runs off the sheet: an open arrow rather than a tick, because the dimension does not
           end here — the drawing does. */
        <polyline points={`0.34,${dimY - 0.12} 0,${dimY} 0.34,${dimY + 0.12}`} fill="none" className="stroke-sun" vectorEffect="non-scaling-stroke" />
      )}
    </g>
  )
}

/** viewBox coordinates as percentages of the plate, so HTML can be placed on the drawing. */
const px = (x: number) => `${(x / VIEW_W) * 100}%`
const py = (y: number) => `${(y / VIEW_H) * 100}%`

function Tag({
  x,
  y,
  children,
  tone = "faint",
}: {
  x: number
  y: number
  children: React.ReactNode
  tone?: "faint" | "sun"
}) {
  return (
    <span
      className={`instrument absolute -translate-y-full whitespace-nowrap ${tone === "sun" ? "text-sun-ink" : ""}`}
      style={{ right: `calc(100% - ${px(x)})`, top: py(y) }}
    >
      {children}
    </span>
  )
}

export function ApproachSection({ plate }: { plate: number }) {
  const [riseMm, setRiseMm] = useState(COVER_HEIGHT_MM)
  const riseM = riseMm / 1000
  const a = approachFor(riseMm)
  const overflows = a.rampTotalMm > BUILDING_WIDTH_MM

  const stairGround = ROW_H
  const rampGround = ROW_H * 2

  return (
    <PlateFrame
      plate={plate}
      type="approach · section at 1:1 both axes"
      hint="drag the height"
      caption={
        overflows
          ? `At ${riseMm} mm the ramp is ${(a.rampTotalMm / 1000).toFixed(1)} m developed, against a building ${(BUILDING_WIDTH_MM / 1000).toFixed(2)} m wide. It does not fit along the front, which is where four of the eleven put it.`
          : `At ${riseMm} mm the approach still fits across the front. It stops fitting at ${OUTGROWS_AT_MM} mm.`
      }
    >
      <div className="space-y-5 p-5">
        <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block w-full"
          role="img"
          aria-label={`Section through the approach at a rise of ${riseMm} millimetres: a stair ${(a.stairGoingMm / 1000).toFixed(1)} metres long and a ramp ${(a.rampTotalMm / 1000).toFixed(1)} metres long`}
        >
          {/* The building's own width, as the measure both routes are judged against. */}
          <line
            x1={PLINTH_FACE - BUILDING_WIDTH_MM / 1000}
            y1={0.3}
            x2={PLINTH_FACE}
            y2={0.3}
            className="stroke-rule"
            strokeDasharray="0.18 0.14"
            vectorEffect="non-scaling-stroke"
          />

          <Row groundY={stairGround} riseM={riseM} points={stairPoints(riseM, stairGround)} overflows={false} />
          <Row groundY={rampGround} riseM={riseM} points={rampPoints(riseM, rampGround)} overflows={overflows} />
        </svg>

        <Tag x={PLINTH_FACE - 0.2} y={0.28}>
          building {(BUILDING_WIDTH_MM / 1000).toFixed(2)} m
        </Tag>
        <Tag x={PLINTH_FACE - 0.2} y={stairGround + 0.28}>
          stair {(a.stairGoingMm / 1000).toFixed(1)} m
        </Tag>
        <Tag x={PLINTH_FACE - 0.2} y={rampGround + 0.28} tone={overflows ? "sun" : "faint"}>
          ramp {(a.rampTotalMm / 1000).toFixed(1)} m
        </Tag>
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <DimSlider
            label="Floor above ground"
            value={riseMm}
            min={MIN_MM}
            max={MAX_MM}
            step={5}
            detents={detents}
            format={(v) => `${v} mm`}
            onChange={setRiseMm}
          />
          <dl className="instrument flex gap-6 sm:justify-end">
            <div>
              <dt>Gradient</dt>
              <dd className="tnum text-fg-muted">1:{Math.round(1 / APPROACH.rampGradient)}</dd>
            </div>
            <div>
              <dt>Landings</dt>
              <dd className="tnum text-fg-muted">{a.landings}</dd>
            </div>
            <div>
              <dt>Risers</dt>
              <dd className="tnum text-fg-muted">{a.risers}</dd>
            </div>
          </dl>
        </div>
      </div>
    </PlateFrame>
  )
}
