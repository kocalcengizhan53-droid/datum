import { MASSING } from "@/lib/massing"

/**
 * The level schedule for the cover study.
 *
 * Four parties measure the same building from four different places, and the article says so
 * without drawing it. This is the drawing: every level the project actually quotes, each one
 * carrying which discipline owns it, so the reader can re-base the whole schedule on any of
 * them and watch the numbers that were "obvious" change.
 *
 * Levels that the model already knows are read from MASSING. The rest are construction
 * dimensions — a screed thickness, a fall to a gully, a peg on a hoarding — which have no
 * geometry in the massing study and are stated here once.
 */

const plinth = MASSING.find((v) => v.id === "plinth")!
const slab = MASSING.find((v) => v.id === "slab")!

/** Finished floor: the top of the plinth, which is the level the building is entered at. */
const FFL = plinth.position[1] + plinth.size[1] / 2

/** Screed and finish. The structural slab is this far below the floor you stand on. */
const FLOOR_BUILD_UP = 0.15

export type Owner = "architect" | "engineer" | "surveyor" | "contractor"

export type Level = {
  readonly id: string
  /** Metres relative to the drawing datum, which is the underside of the plinth. */
  readonly height: number
  readonly label: string
  readonly owner: Owner
  /** Why this level exists at all — shown when it is made the zero. */
  readonly note: string
}

export const OWNERS: Record<Owner, string> = {
  architect: "Architect",
  engineer: "Engineer",
  surveyor: "Surveyor",
  contractor: "Contractor",
}

/**
 * The site benchmark, above Ordnance Datum. Everything else is quoted relative to the drawing
 * datum; this is the one number that ties the drawing to the ground it is on.
 */
export const BENCHMARK_AOD = 24.0

export const LEVELS: readonly Level[] = [
  {
    id: "ground",
    height: -0.12,
    label: "Existing ground at the entrance",
    owner: "surveyor",
    note: "Measured, not designed. The only level on the sheet that was there before the project.",
  },
  {
    id: "datum",
    height: 0,
    label: "Drawing datum, underside of plinth",
    owner: "architect",
    note: "The line this issue is named for. Chosen so the plinth height is the first dimension on the sheet rather than a subtraction.",
  },
  {
    id: "peg",
    height: 0.15,
    label: "Contractor's peg on the hoarding",
    owner: "contractor",
    note: "A mark on a wall at the edge of the site, and the only level anybody actually builds to.",
  },
  {
    id: "ssl",
    height: FFL - FLOOR_BUILD_UP,
    label: "Structural slab, top",
    owner: "engineer",
    note: "The engineer's zero. A construction depth below the floor the architect is dimensioning from, which is where the two sets quietly stop agreeing.",
  },
  {
    id: "invert",
    height: FFL - FLOOR_BUILD_UP + 0.075,
    label: "Terrace drainage invert",
    owner: "engineer",
    note: "Set from the structural slab. Set the threshold from the finished floor instead and the water crosses the terrace the wrong way.",
  },
  {
    id: "ffl",
    height: FFL,
    label: "Finished floor, entrance",
    owner: "architect",
    note: "The architect's zero on most projects. Make this the datum and the ground becomes something to be adjusted.",
  },
  {
    id: "soffit",
    height: slab.position[1] + slab.size[1] / 2,
    label: "Reading room, structural soffit",
    owner: "engineer",
    note: "Read from the massing model rather than stated, like every other level the building already knows.",
  },
]
