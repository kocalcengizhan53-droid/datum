import { FINS, MASSING, sunPosition } from "@/lib/massing"

/**
 * Hours of direct sun on the ground around the building — the sunlight-hours study an
 * architect runs before anyone argues about where the bench goes.
 *
 * Each point of a half-metre grid looks toward the sun every quarter of an hour from 06:00 to
 * 18:00 and asks whether any volume of the massing, fins included, is in the way. The sun is the
 * cover's own arc (see `sunPosition`), so the map, the cover and its shadow readout describe the
 * same day.
 */

/** The plan's half-width in metres, and its grid step. */
export const PLAN_HALF = 16
export const PLAN_STEP = 0.5
export const PLAN_CELLS = (PLAN_HALF * 2) / PLAN_STEP

export const FIRST_HOUR = 6
export const LAST_HOUR = 18
export const SAMPLE = 0.25
export const SAMPLES = Math.round((LAST_HOUR - FIRST_HOUR) / SAMPLE) + 1
/** The cell value for ground the building stands on. */
export const BUILT = 255

type Box = { min: readonly number[]; max: readonly number[] }

const BOXES: readonly Box[] = [...MASSING, ...FINS].map((v) => ({
  min: v.position.map((p, i) => p - v.size[i] / 2),
  max: v.position.map((p, i) => p + v.size[i] / 2),
}))

/** Volumes that stand on the ground; the cantilever and the study overhead only cast shade. */
const FOOTPRINTS = BOXES.filter((b) => b.min[1] <= 1)

/** The centre of grid cell `i` along an axis, in metres. */
export const cellCentre = (i: number) => -PLAN_HALF + (i + 0.5) * PLAN_STEP

export function isBuilt(x: number, z: number): boolean {
  return FOOTPRINTS.some((b) => x >= b.min[0] && x <= b.max[0] && z >= b.min[2] && z <= b.max[2])
}

/** Slab test: does the ray from `o` along `d` enter the box ahead of its origin? */
function hits(o: readonly number[], d: readonly number[], b: Box): boolean {
  let near = 0
  let far = Infinity
  for (let a = 0; a < 3; a++) {
    if (Math.abs(d[a]) < 1e-9) {
      if (o[a] < b.min[a] || o[a] > b.max[a]) return false
      continue
    }
    let t1 = (b.min[a] - o[a]) / d[a]
    let t2 = (b.max[a] - o[a]) / d[a]
    if (t1 > t2) [t1, t2] = [t2, t1]
    near = Math.max(near, t1)
    far = Math.min(far, t2)
    if (near > far) return false
  }
  return far > 1e-6
}

const direction = (hour: number) => {
  const p = sunPosition(hour)
  const l = Math.hypot(...p)
  return p.map((v) => v / l)
}

export function inShadow(x: number, z: number, hour: number): boolean {
  const d = direction(hour)
  const o = [x, 0.02, z]
  return BOXES.some((b) => hits(o, d, b))
}

/** One hour's shadow over the whole grid, row by row (z north to south), 1 in shade. */
export function shadowGrid(hour: number): Uint8Array {
  const d = direction(hour)
  const out = new Uint8Array(PLAN_CELLS * PLAN_CELLS)
  for (let r = 0; r < PLAN_CELLS; r++)
    for (let c = 0; c < PLAN_CELLS; c++) {
      const o = [cellCentre(c), 0.02, cellCentre(r)]
      out[r * PLAN_CELLS + c] = BOXES.some((b) => hits(o, d, b)) ? 1 : 0
    }
  return out
}

/** Quarter-hours of sun per cell, row by row; `BUILT` where the building stands. */
export function sunHours(): Uint8Array {
  const out = new Uint8Array(PLAN_CELLS * PLAN_CELLS)
  for (let r = 0; r < PLAN_CELLS; r++)
    for (let c = 0; c < PLAN_CELLS; c++) if (isBuilt(cellCentre(c), cellCentre(r))) out[r * PLAN_CELLS + c] = BUILT
  for (let s = 0; s < SAMPLES; s++) {
    const shade = shadowGrid(FIRST_HOUR + s * SAMPLE)
    for (let i = 0; i < out.length; i++) if (out[i] !== BUILT && !shade[i]) out[i] += 1
  }
  return out
}

/** Hours of sun a cell value stands for. A sample is the quarter-hour around it. */
export const hoursOf = (v: number) => (v === BUILT ? null : Math.min(LAST_HOUR - FIRST_HOUR, v * SAMPLE))

/**
 * Packed for the page as one character per cell (value + 48, built as "~"), so the static
 * export carries the whole study in a 4 kB string instead of computing it on a phone.
 */
export const encodeHours = (h: Uint8Array) =>
  Array.from(h, (v) => (v === BUILT ? "~" : String.fromCharCode(48 + v))).join("")

export const decodeHours = (s: string) => Uint8Array.from(s, (ch) => (ch === "~" ? BUILT : ch.charCodeAt(0) - 48))

/** What a reader can say about the ground: how much of it is bright all day, how much never. */
export function planSummary(h: Uint8Array) {
  const open = Array.from(h).filter((v) => v !== BUILT)
  const share = (pred: (hours: number) => boolean) => open.filter((v) => pred(hoursOf(v)!)).length / open.length
  return {
    allDay: share((x) => x >= 11),
    underThree: share((x) => x < 3),
    ground: open.length * PLAN_STEP * PLAN_STEP,
  }
}
