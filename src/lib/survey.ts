import { CLUSTER_BAND_MM, PLINTHS, type Plinth } from "@/data/plinths"
import { MASSING } from "@/lib/massing"

/**
 * The survey, counted.
 *
 * Every figure the plinth article quotes about its own eleven buildings is computed here. The
 * clustering in particular is a measurement rather than an adjective: the modal height is the
 * one the most buildings sit within CLUSTER_BAND_MM of, and "cluster hard" means that count.
 */

const count = (predicate: (p: Plinth) => boolean) => PLINTHS.filter(predicate).length

export const HEIGHTS_MM = PLINTHS.map((p) => p.heightMm)
export const MIN_MM = Math.min(...HEIGHTS_MM)
export const MAX_MM = Math.max(...HEIGHTS_MM)

/** The height the most buildings land within a band of, and how many land there. */
export const MODE = HEIGHTS_MM.map((centre) => ({
  centre,
  n: count((p) => Math.abs(p.heightMm - centre) <= CLUSTER_BAND_MM),
})).reduce((best, row) => (row.n > best.n ? row : best))

export const SURVEY = {
  total: PLINTHS.length,
  clustered: MODE.n,
  reasonPresence: count((p) => p.reason === "presence"),
  reasonDrainage: count((p) => p.reason === "drainage"),
  earliestPreWorkshop: count((p) => p.earliest === "pre-workshop"),
  earliestWorkshop: count((p) => p.earliest === "workshop-to-planning"),
  earliestUnknown: count((p) => p.earliest === "unknown"),
  rampFront: count((p) => p.ramp === "front"),
  rampSide: count((p) => p.ramp === "side"),
  rampLift: count((p) => p.ramp === "lift"),
  rampAfterPlanning: count((p) => p.rampAddedAfterPlanning),
} as const

/**
 * The rules the approach is drawn to. Named constants rather than numbers inside a formula,
 * because a reader who disagrees with the drawing should be able to find the rule they
 * disagree with and not have to reverse-engineer it from a line.
 */
export const APPROACH = {
  /** Maximum gradient for a public ramp, as a rise:run ratio. */
  rampGradient: 1 / 20,
  /** Maximum rise permitted in one flight before a landing is required. */
  flightRiseMm: 500,
  landingMm: 1500,
  /** Stair: the going that goes with a comfortable riser on a public approach. */
  maxRiserMm: 170,
  treadMm: 300,
} as const

export type Approach = {
  readonly rampRunMm: number
  readonly landings: number
  readonly rampTotalMm: number
  readonly stairGoingMm: number
  readonly risers: number
}

/** Both routes up a given rise, under the rules above. */
export function approachFor(riseMm: number): Approach {
  const rampRunMm = riseMm / APPROACH.rampGradient
  const landings = Math.max(0, Math.ceil(riseMm / APPROACH.flightRiseMm) - 1)
  const risers = Math.max(1, Math.ceil(riseMm / APPROACH.maxRiserMm))
  return {
    rampRunMm,
    landings,
    rampTotalMm: rampRunMm + landings * APPROACH.landingMm,
    // One fewer tread than risers: the top tread is the floor you have arrived at.
    stairGoingMm: (risers - 1) * APPROACH.treadMm,
    risers,
  }
}

const plinth = MASSING.find((v) => v.id === "plinth")!
const tower = MASSING.find((v) => v.id === "tower")!
const cantilever = MASSING.find((v) => v.id === "cantilever")!

/** The cover study's own plinth, in the same units as the survey. */
export const COVER_HEIGHT_MM = Math.round(plinth.size[1] * 1000)

/**
 * How wide the building is, for the comparison the article implies and never makes. Computed
 * from the extremes of the model rather than from two volumes that look like the extremes —
 * the cantilever is the westmost thing in it and the plinth the eastmost.
 */
export const BUILDING_WIDTH_MM = Math.round(
  (Math.max(
    tower.position[0] + tower.size[0] / 2,
    plinth.position[0] + plinth.size[0] / 2,
    cantilever.position[0] + cantilever.size[0] / 2,
  ) -
    Math.min(
      tower.position[0] - tower.size[0] / 2,
      plinth.position[0] - plinth.size[0] / 2,
      cantilever.position[0] - cantilever.size[0] / 2,
    )) *
    1000,
)

/** The rise at which the approach stops fitting across the front of the building. */
export const OUTGROWS_AT_MM = (() => {
  for (let mm = MIN_MM; mm <= MAX_MM; mm += 1) {
    if (approachFor(mm).rampTotalMm > BUILDING_WIDTH_MM) return mm
  }
  return null
})()
