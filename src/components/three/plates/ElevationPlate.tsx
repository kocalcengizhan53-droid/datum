"use client"

import { Canvas } from "@react-three/fiber"

import { FINS, MASSING } from "@/lib/massing"
import { Model } from "@/components/three/plates/Model"
import { PlateFrame } from "@/components/three/plates/PlateFrame"

/**
 * A true elevation, locked.
 *
 * Deliberately the one plate you cannot touch. Three draggable figures in a row stop being
 * drawings and become toys, and an elevation is the drawing whose whole value is that it is
 * flat, square-on and measurable — rotating it would destroy the thing it is for.
 *
 * The dimension strings are not drawn by hand over a picture. They are computed from the same
 * MASSING and FINS arrays the geometry comes from, through the same world-to-screen mapping the
 * orthographic camera uses, so a dimension cannot disagree with what it is dimensioning. That is
 * the journal's own thesis — the quantities decide the thing, and they are what nobody publishes
 * — applied to its own figures.
 */

/**
 * World units visible across the plate. Fixed, so the mapping below is exact — and chosen with
 * room OUTSIDE the building, because that is where dimensions belong. The first version ran them
 * across the elevation itself, which is how you annotate a photograph, not a drawing.
 */
const VIEW_W = 23.5
const CENTRE = { x: -0.4, y: 4.25 }
const ASPECT = 16 / 9

const VIEW_H = VIEW_W / ASPECT
/** World x,y → fraction of the plate, 0–1 from its top left. */
const fx = (x: number) => (x - CENTRE.x) / VIEW_W + 0.5
const fy = (y: number) => 0.5 - (y - CENTRE.y) / VIEW_H
const pct = (n: number) => `${(n * 100).toFixed(3)}%`

const plinth = MASSING.find((v) => v.id === "plinth")!
const tower = MASSING.find((v) => v.id === "tower")!

const plinthTop = plinth.position[1] + plinth.size[1] / 2
const towerTop = tower.position[1] + tower.size[1] / 2
const finPitch = FINS[1].position[0] - FINS[0].position[0]
/*
 * The extremes of the whole model, not of two volumes that look like the extremes. The plinth is
 * not the west face — the cantilever projects 1,550mm past it — and the tower is not the east
 * face. Drawn from the plinth and the tower, the overall dimension stopped short of the building
 * at both ends while claiming to measure it.
 */
const PARTS: readonly { position: readonly number[]; size: readonly number[] }[] = [
  ...MASSING,
  ...FINS,
]
const buildingLeft = Math.min(...PARTS.map((p) => p.position[0] - p.size[0] / 2))
const buildingRight = Math.max(...PARTS.map((p) => p.position[0] + p.size[0] / 2))
/*
 * Horizontal dimensions stack below the elevation as a chain — parts on the inner line, overall
 * on the outer — which is how a drawing is dimensioned and also the only place they do not
 * collide. The fin pitch was first set above the screen and landed squarely on the cantilever,
 * which projects over it.
 */
const DIM_INNER = -0.85
const DIM_OUTER = -1.85
const DIM_LEFT = buildingLeft - 1.6
const finDepth = FINS[0].size[2]

/*
 * refersTo is passed in rather than written into the caption. It said "Plate 02", which was
 * true only because the section happened to be second; reorder the figures and the sentence
 * would have pointed at the wrong drawing while still reading perfectly.
 */
export function ElevationPlate({ plate, refersTo }: { plate: number; refersTo: number }) {
  return (
    <PlateFrame
      plate={plate}
      type="south elevation · 1:200"
      caption={`The screen reads as a surface here and as a depth in Plate ${String(refersTo).padStart(2, "0")}. An elevation cannot show what a fin is for, which is the argument.`}
    >
      <div className="relative aspect-[16/9] w-full">
        <Canvas
          orthographic
          dpr={[1, 2]}
          camera={{ position: [CENTRE.x, CENTRE.y, 60], zoom: 50, near: 0.1, far: 220 }}
          onCreated={({ camera, size }) => {
            // Square-on, or it is not an elevation. Without this R3F aims the camera at the
            // origin, which tilts the view and crops the tower — the first render did exactly
            // that and the drawing stopped being a drawing.
            camera.lookAt(CENTRE.x, CENTRE.y, 0)
            // zoom is pixels per world unit: fix it so VIEW_W is exactly what is visible.
            camera.zoom = size.width / VIEW_W
            camera.updateProjectionMatrix()
          }}
          resize={{ scroll: false }}
        >
          <color attach="background" args={["#15130d"]} />
          {/* Flat, even light: an elevation is inked, not rendered. */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[0, 6, 40]} intensity={1.1} color="#fff2dd" />
          <directionalLight position={[-18, 10, 12]} intensity={0.22} color="#9fb6e0" />
          <Model palette="line" />
        </Canvas>

        {/* The dimensions, outside the drawing and on their own offsets, with extension lines. */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          {/* Datum: the line the whole issue is named for, running clear of the building. */}
          <line
            x1="1.5%" y1={pct(fy(0))} x2="98.5%" y2={pct(fy(0))}
            stroke="var(--sun)" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="8 6"
          />

          {/* Plinth height, dimensioned to the left of the building. */}
          <line x1={pct(fx(DIM_LEFT))} y1={pct(fy(0))} x2={pct(fx(buildingLeft))} y2={pct(fy(0))}
            stroke="var(--rule-strong)" strokeWidth="1" />
          <line x1={pct(fx(DIM_LEFT))} y1={pct(fy(plinthTop))} x2={pct(fx(buildingLeft))} y2={pct(fy(plinthTop))}
            stroke="var(--rule-strong)" strokeWidth="1" />
          <line x1={pct(fx(DIM_LEFT + 0.5))} y1={pct(fy(0))} x2={pct(fx(DIM_LEFT + 0.5))} y2={pct(fy(plinthTop))}
            stroke="var(--sun)" strokeOpacity="0.85" strokeWidth="1" />

          {/* Inner line: the fin pitch, with extension lines run down from the fins themselves. */}
          {[FINS[0], FINS[1]].map((fin) => (
            <line key={fin.id}
              x1={pct(fx(fin.position[0]))} y1={pct(fy(0))}
              x2={pct(fx(fin.position[0]))} y2={pct(fy(DIM_INNER - 0.25))}
              stroke="var(--rule-strong)" strokeWidth="1" />
          ))}
          <line
            x1={pct(fx(FINS[0].position[0]))} y1={pct(fy(DIM_INNER))}
            x2={pct(fx(FINS[1].position[0]))} y2={pct(fy(DIM_INNER))}
            stroke="var(--sun)" strokeOpacity="0.9" strokeWidth="1"
          />

          {/* Outer line: overall width. */}
          {[buildingLeft, buildingRight].map((x) => (
            <line key={x} x1={pct(fx(x))} y1={pct(fy(0))} x2={pct(fx(x))} y2={pct(fy(DIM_OUTER - 0.25))}
              stroke="var(--rule-strong)" strokeWidth="1" />
          ))}
          <line
            x1={pct(fx(buildingLeft))} y1={pct(fy(DIM_OUTER))}
            x2={pct(fx(buildingRight))} y2={pct(fy(DIM_OUTER))}
            stroke="var(--rule-strong)" strokeWidth="1"
          />
        </svg>

        {/* Figures as HTML, so they take the instrument voice and stay selectable. */}
        <span
          className="instrument tnum text-sun-ink absolute -translate-y-1/2"
          style={{ left: pct(fx(DIM_LEFT + 0.15)), top: pct(fy(plinthTop / 2)) }}
        >
          {(plinthTop * 1000).toFixed(0)}
        </span>
        <span
          className="instrument tnum text-sun-ink absolute -translate-x-1/2"
          style={{
            left: pct((fx(FINS[0].position[0]) + fx(FINS[1].position[0])) / 2),
            top: pct(fy(DIM_INNER - 0.1)),
          }}
        >
          {(finPitch * 1000).toFixed(0)} c/c
        </span>
        <span
          className="instrument tnum absolute -translate-x-1/2"
          style={{ left: pct((fx(buildingLeft) + fx(buildingRight)) / 2), top: pct(fy(DIM_OUTER - 0.2)) }}
        >
          {((buildingRight - buildingLeft) * 1000).toFixed(0)}
        </span>
        {/* The notes a title block carries, kept out of the dimension zone entirely. */}
        <span className="instrument tnum absolute top-3 left-4">
          fin {(finDepth * 1000).toFixed(0)} deep · tower {towerTop.toFixed(1)} m
        </span>
      </div>
    </PlateFrame>
  )
}
