"use client"

import { useState } from "react"

import { DimSlider } from "@/components/sheet/DimSlider"
import { PlateFrame } from "@/components/three/plates/PlateFrame"
import { MASSING, hourLabel, sunPosition } from "@/lib/massing"

/**
 * The shade nobody wrote down, and the hour it stops working.
 *
 * The cantilevered study projects two metres west of the room below it. That was a planning
 * move, not a shading one, and it is not in the energy model, which assumed a flat facade. It
 * does shade — and the plate exists because what it does is more interesting than "it shades":
 * a horizontal projection drops two metres of shade at noon and eleven centimetres at six, so
 * it gives up at exactly the hour a west elevation needs it. That is the standard argument for
 * vertical fins on a west face and it is sitting unremarked in the cover study's own geometry.
 *
 * Every figure is computed from MASSING and from the same sun arc the cover uses. Nothing here
 * is a shading coefficient from a table.
 */

const slab = MASSING.find((v) => v.id === "slab")!
const cantilever = MASSING.find((v) => v.id === "cantilever")!

const FACADE_X = slab.position[0] - slab.size[0] / 2
const OVERHANG = FACADE_X - (cantilever.position[0] - cantilever.size[0] / 2)
const SOFFIT = cantilever.position[1] - cantilever.size[1] / 2
const GLAZE_BOTTOM = slab.position[1] - slab.size[1] / 2
const GLAZE_TOP = slab.position[1] + slab.size[1] / 2
const GLAZE_HEIGHT = GLAZE_TOP - GLAZE_BOTTOM

/** Altitude of the sun above the horizon at a given hour, from the cover's own arc. */
function altitudeDeg(hour: number) {
  const [x, y, z] = sunPosition(hour)
  return (Math.atan2(y, Math.hypot(x, z)) * 180) / Math.PI
}

/** How far a horizontal projection of depth d drops shade down the wall below it. */
const shadeDrop = (altitude: number, depth: number) =>
  depth * Math.tan((altitude * Math.PI) / 180)

/*
 * Section frame, in metres, with x = 0 at the facade and west to the left.
 *
 * The first frame was 5 m wide against 7.6 m tall, which made a portrait plate out of a
 * horizontal subject: the room was a 1.6 m sliver and most of the sheet was empty ground. Sky
 * to the west and depth to the east are both given room, because the thing being drawn is a
 * ray arriving at an angle and it needs somewhere to arrive from.
 */
const WEST_SKY = 4.5
const ROOM_DEPTH = 3.5
const VIEW_W = WEST_SKY + OVERHANG + ROOM_DEPTH
const VIEW_H = 7.4
const sx = (x: number) => WEST_SKY + OVERHANG + x
const sy = (y: number) => VIEW_H - y

export function OverhangSection({ plate }: { plate: number }) {
  const [hour, setHour] = useState(15)
  const [asBuilt, setAsBuilt] = useState(true)

  const altitude = altitudeDeg(hour)
  const depth = asBuilt ? OVERHANG : 0
  const drop = Math.min(shadeDrop(altitude, depth), SOFFIT - GLAZE_BOTTOM)
  const shadedFraction = drop / GLAZE_HEIGHT

  /*
   * The grazing ray: the one that just clears the edge of the projection and so defines the
   * bottom of the shade. It passes through the tip and lands on the glass, and is extended back
   * west of the tip so the angle is readable as an angle.
   */
  const tan = Math.tan((altitude * Math.PI) / 180)
  const tipX = -depth
  const rayLandY = SOFFIT - drop
  const backX = tipX - 3.4
  const backY = SOFFIT + 3.4 * tan

  return (
    <PlateFrame
      plate={plate}
      type="west elevation · section"
      hint="move the hour"
      caption={
        asBuilt
          ? `At ${hourLabel(hour)} the sun is ${altitude.toFixed(1)}° up and the overhang drops ${drop.toFixed(2)} m of shade — ${Math.round(shadedFraction * 100)}% of the glass. By 18:00 it drops ${shadeDrop(altitudeDeg(18), OVERHANG).toFixed(2)} m, which is the case against a horizontal device on a west face.`
          : "The facade the energy model was built from. No projection, no shade, and the figure that went into the report."
      }
    >
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_15rem] lg:items-start">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full" role="img"
          aria-label={`Section through the west elevation at ${hourLabel(hour)}: sun altitude ${altitude.toFixed(1)} degrees, ${drop.toFixed(2)} metres of shade on the glazing`}>
          {/* Ground. */}
          <line x1={0} y1={sy(0)} x2={VIEW_W} y2={sy(0)} className="stroke-rule" vectorEffect="non-scaling-stroke" />

          {/* The room behind the glass, and the glass itself. */}
          <rect x={sx(0)} y={sy(GLAZE_TOP)} width={VIEW_W - sx(0)} height={GLAZE_HEIGHT}
            className="fill-fg/5 stroke-rule-strong" vectorEffect="non-scaling-stroke" />

          {/*
            Sunlit glass, then the shaded band over it. The shade was drawn in fg at 45% and the
            sun in sun at 35%, which put the pale band on the side that is in shadow — the
            drawing said the opposite of the caption. Shade is darker than sun.
          */}
          <rect x={sx(-0.1)} y={sy(GLAZE_TOP)} width={0.2} height={GLAZE_HEIGHT}
            className="fill-sun/45" />
          {drop > 0.001 ? (
            <rect x={sx(-0.1)} y={sy(SOFFIT)} width={0.2} height={drop} className="fill-bg/80" />
          ) : null}
          <rect x={sx(-0.1)} y={sy(GLAZE_TOP)} width={0.2} height={GLAZE_HEIGHT}
            className="fill-none stroke-rule-strong" vectorEffect="non-scaling-stroke" />

          {/* The cantilever. */}
          {asBuilt ? (
            <rect x={sx(-OVERHANG)} y={sy(cantilever.position[1] + cantilever.size[1] / 2)}
              width={OVERHANG} height={cantilever.size[1]}
              className="fill-fg/12 stroke-rule-strong" vectorEffect="non-scaling-stroke" />
          ) : null}
          <rect x={sx(0)} y={sy(cantilever.position[1] + cantilever.size[1] / 2)}
            width={VIEW_W - sx(0)} height={cantilever.size[1]}
            className="fill-fg/12 stroke-rule-strong" vectorEffect="non-scaling-stroke" />

          <polyline
            points={`${sx(backX)},${sy(Math.min(backY, VIEW_H - 0.1))} ${sx(tipX)},${sy(SOFFIT)} ${sx(0)},${sy(rayLandY)}`}
            fill="none" className="stroke-sun/70" strokeDasharray="0.14 0.1" vectorEffect="non-scaling-stroke" />

          {/* The shade, dimensioned. */}
          {drop > 0.001 ? (
            <>
              <line x1={sx(0.34)} y1={sy(SOFFIT)} x2={sx(0.34)} y2={sy(rayLandY)} className="stroke-sun" vectorEffect="non-scaling-stroke" />
              <line x1={sx(0.24)} y1={sy(SOFFIT)} x2={sx(0.44)} y2={sy(SOFFIT)} className="stroke-sun" vectorEffect="non-scaling-stroke" />
              <line x1={sx(0.24)} y1={sy(rayLandY)} x2={sx(0.44)} y2={sy(rayLandY)} className="stroke-sun" vectorEffect="non-scaling-stroke" />
            </>
          ) : null}
        </svg>

        <div className="space-y-5">
          <div role="group" aria-label="Which facade" className="flex gap-5">
            {[
              { on: true, label: "As built" },
              { on: false, label: "As modelled" },
            ].map((o) => (
              <button key={o.label} type="button" onClick={() => setAsBuilt(o.on)} aria-pressed={asBuilt === o.on}
                className={`instrument min-h-11 border-b pb-1 ${asBuilt === o.on ? "border-sun text-sun-ink" : "border-transparent hover:text-fg-muted"}`}>
                {o.label}
              </button>
            ))}
          </div>

          <DimSlider label="Hour" value={hour} min={12} max={18} step={0.25}
            detents={[12, 13, 14, 15, 16, 17, 18]} format={hourLabel} onChange={setHour} />

          <dl className="border-rule space-y-3 border-t pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="instrument">Sun altitude</dt>
              <dd className="tnum font-mono text-sm">{altitude.toFixed(1)}°</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="instrument">Projection</dt>
              <dd className="tnum font-mono text-sm">{depth.toFixed(2)} m</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="instrument">Glass in shade</dt>
              <dd className="tnum text-sun-ink font-mono text-sm">{Math.round(shadedFraction * 100)}%</dd>
            </div>
          </dl>
        </div>
      </div>
    </PlateFrame>
  )
}
