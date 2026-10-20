import { FINS, MASSING } from "@/lib/massing"
import { LEVELS } from "@/data/levels"
import { PLINTHS } from "@/data/plinths"
import { ATTEMPTS } from "@/data/reuse"
import { BUILDING_WIDTH_MM, COVER_HEIGHT_MM, approachFor } from "@/lib/survey"
import type { PlateKind } from "@/lib/plates"

/**
 * A plate in miniature, for the contents page.
 *
 * The contents listed the plates by name, which on a journal selling five interactive drawings
 * means showing the reader their filenames. Each row now carries a thumbnail of its own
 * argument — the fin comb, the clustering, the programme, the cut, the overhang — drawn from
 * the same arrays the full plates are drawn from, so a row cannot advertise a drawing the
 * article does not contain.
 *
 * Deliberately one weight and one accent. At this size a thumbnail that tries to be the plate
 * becomes a smudge; what survives is the shape of the claim.
 */

const W = 180
const H = 76
/*
 * Drawn in the foreground greys, not in the rule tokens. At 150px and 0.16 alpha the first
 * version was three faint scratches — a smudge where a drawing should be. A thumbnail has to
 * carry at full strength or it should not be there.
 */
const line = "stroke-fg-faint"
const key = "stroke-sun"

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full"
      aria-hidden="true"
      fill="none"
      strokeWidth={1.4}
      vectorEffect="non-scaling-stroke"
    >
      {children}
    </svg>
  )
}

/** The south elevation: fourteen blades at their real pitch, over the plinth. */
function Elevation() {
  const left = -9.3
  const span = 17.05
  const x = (m: number) => ((m - left) / span) * W
  const top = H - 8
  return (
    <Frame>
      <line x1={0} y1={top} x2={W} y2={top} className={line} />
      {FINS.map((f) => (
        <line key={f.id} x1={x(f.position[0])} y1={top - 34} x2={x(f.position[0])} y2={top} className={line} />
      ))}
      <line x1={x(FINS[0].position[0])} y1={top + 5} x2={x(FINS[1].position[0])} y2={top + 5} className={key} />
    </Frame>
  )
}

/** The survey: eleven heights on one axis, nine of them in a picket. */
function Survey() {
  const x = (mm: number) => ((mm - 500) / 1000) * W
  const base = H - 10
  return (
    <Frame>
      <line x1={0} y1={base} x2={W} y2={base} className={line} />
      {PLINTHS.map((p) => (
        <line
          key={p.id}
          x1={x(p.heightMm)}
          y1={base}
          x2={x(p.heightMm)}
          y2={base - 42}
          className={p.heightMm === COVER_HEIGHT_MM ? key : line}
        />
      ))}
    </Frame>
  )
}

/** The programme: four durations on one week axis. */
function Programme() {
  const phases = ATTEMPTS[0].phases
  const max = Math.max(...phases.map((p) => p.weeks))
  const gap = (H - 12) / phases.length
  return (
    <Frame>
      {phases.map((p, i) => (
        <line
          key={p.id}
          x1={0}
          y1={8 + i * gap}
          x2={(p.weeks / max) * (W - 6)}
          y2={8 + i * gap}
          className={p.weeks === max ? key : line}
          strokeWidth={2}
        />
      ))}
    </Frame>
  )
}

/** The section: the massing in silhouette, with the plane through it. */
function Section() {
  const left = -9.3
  const span = 17.05
  const x = (m: number) => ((m - left) / span) * W
  const y = (m: number) => H - 8 - (m / 7.2) * (H - 16)
  return (
    <Frame>
      <line x1={0} y1={H - 8} x2={W} y2={H - 8} className={line} />
      {MASSING.map((v) => (
        <rect
          key={v.id}
          x={x(v.position[0] - v.size[0] / 2)}
          y={y(v.position[1] + v.size[1] / 2)}
          width={(v.size[0] / span) * W}
          height={(v.size[1] / 7.2) * (H - 16)}
          className={line}
        />
      ))}
      <line x1={x(-1.4)} y1={2} x2={x(-1.4)} y2={H - 4} className={key} strokeDasharray="3 2" />
    </Frame>
  )
}

/** The level schedule: seven levels on a rod, the datum marked. */
function Levels() {
  const y = (m: number) => H - 6 - ((m + 0.35) / 6.4) * (H - 12)
  return (
    <Frame>
      <line x1={10} y1={4} x2={10} y2={H - 4} className={line} />
      {LEVELS.map((l) => (
        <line
          key={l.id}
          x1={4}
          y1={y(l.height)}
          x2={l.id === "datum" ? W - 10 : 44}
          y2={y(l.height)}
          className={l.id === "datum" ? key : line}
        />
      ))}
    </Frame>
  )
}

/** The approach: the stair against the ramp, at one scale, running off the sheet. */
function Approach() {
  const total = BUILDING_WIDTH_MM
  const a = approachFor(COVER_HEIGHT_MM)
  const x = (mm: number) => W - (mm / total) * W
  return (
    <Frame>
      <line x1={0} y1={18} x2={W} y2={18} className={line} />
      <line x1={x(a.stairGoingMm)} y1={14} x2={W} y2={14} className={line} strokeWidth={2} />
      <line x1={0} y1={H - 14} x2={W} y2={H - 14} className={line} />
      <line x1={0} y1={H - 18} x2={W} y2={H - 18} className={key} strokeWidth={2} />
      <polyline points={`6,${H - 23} 0,${H - 18} 6,${H - 13}`} className={key} />
    </Frame>
  )
}

/** The overhang: the projection, and the shade it drops. */
function Overhang() {
  const tan = Math.tan((29.3 * Math.PI) / 180)
  const facade = W * 0.62
  const depth = W * 0.3
  const soffit = 14
  const drop = depth * tan
  return (
    <Frame>
      <line x1={facade} y1={soffit} x2={facade} y2={H - 4} className={line} />
      <line x1={facade - depth} y1={soffit} x2={facade + 26} y2={soffit} className={line} strokeWidth={2} />
      <line x1={facade - depth - 16} y1={soffit - 16 * tan} x2={facade} y2={soffit + drop} className={key} strokeDasharray="3 2" />
      <line x1={facade + 5} y1={soffit} x2={facade + 5} y2={soffit + drop} className={key} strokeWidth={2} />
    </Frame>
  )
}

/** The model: the massing as a block, the way the AR plate draws it. */
function Model() {
  const o = 9
  return (
    <Frame>
      <polygon points={`30,${H - 14} 74,${H - 30} 118,${H - 14} 74,2`} className={line} />
      <polyline points={`30,${H - 14} 30,${H - 14 + o} 74,${H - 30 + o} 74,${H - 30}`} className={line} />
      <polyline points={`74,${H - 30 + o} 118,${H - 14 + o} 118,${H - 14}`} className={line} />
      <line x1={20} y1={H - 5} x2={128} y2={H - 5} className={key} />
    </Frame>
  )
}

const GLYPHS: Record<PlateKind, () => React.ReactElement> = {
  elevation: Elevation,
  section: Section,
  ar: Model,
  levels: Levels,
  approach: Approach,
  programme: Programme,
  overhang: Overhang,
  survey: Survey,
}

export function PlateGlyph({ kind }: { kind: PlateKind }) {
  const Glyph = GLYPHS[kind]
  return <Glyph />
}
