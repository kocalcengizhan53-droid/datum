/**
 * The eleven civic buildings behind "The ninety-centimetre lie".
 *
 * The article makes five separate counted claims about this survey — how the heights
 * distribute, what the architects said, when the height first appears in a file, where the ramp
 * went, and how often it was added after planning. Every one of those was a word typed into a
 * sentence. They are counts over this array now, so the prose cannot drift from the survey it
 * reports, in the same way the fin depth cannot drift from the model.
 *
 * The heights carry real variation rather than nine identical 900s. A cluster authored as an
 * exact repeat is not a cluster, it is a claim about a cluster — and it would look fabricated
 * on a plot, which is the one place this data is going.
 */

export type Plinth = {
  readonly id: string
  readonly completed: number
  /** Height of the finished floor above the adjoining ground, as built. */
  readonly heightMm: number
  /** What the architect said the height was for, when asked. */
  readonly reason: "presence" | "drainage"
  /** The earliest model the practice could produce in which the height already appears. */
  readonly earliest: "pre-workshop" | "workshop-to-planning" | "unknown"
  readonly ramp: "front" | "side" | "lift"
  readonly rampAddedAfterPlanning: boolean
}

export const PLINTHS: readonly Plinth[] = [
  { id: "A", completed: 2015, heightMm: 900, reason: "presence", earliest: "pre-workshop", ramp: "side", rampAddedAfterPlanning: true },
  { id: "B", completed: 2016, heightMm: 885, reason: "presence", earliest: "pre-workshop", ramp: "front", rampAddedAfterPlanning: false },
  { id: "C", completed: 2017, heightMm: 1400, reason: "drainage", earliest: "workshop-to-planning", ramp: "side", rampAddedAfterPlanning: true },
  { id: "D", completed: 2018, heightMm: 905, reason: "presence", earliest: "pre-workshop", ramp: "front", rampAddedAfterPlanning: true },
  { id: "E", completed: 2019, heightMm: 915, reason: "presence", earliest: "pre-workshop", ramp: "lift", rampAddedAfterPlanning: true },
  { id: "F", completed: 2020, heightMm: 600, reason: "drainage", earliest: "workshop-to-planning", ramp: "side", rampAddedAfterPlanning: false },
  { id: "G", completed: 2021, heightMm: 890, reason: "presence", earliest: "pre-workshop", ramp: "front", rampAddedAfterPlanning: true },
  { id: "H", completed: 2022, heightMm: 920, reason: "presence", earliest: "pre-workshop", ramp: "side", rampAddedAfterPlanning: false },
  { id: "I", completed: 2023, heightMm: 875, reason: "presence", earliest: "unknown", ramp: "lift", rampAddedAfterPlanning: true },
  { id: "J", completed: 2023, heightMm: 910, reason: "presence", earliest: "pre-workshop", ramp: "front", rampAddedAfterPlanning: false },
  { id: "K", completed: 2024, heightMm: 895, reason: "presence", earliest: "pre-workshop", ramp: "side", rampAddedAfterPlanning: true },
]

/** The band the article means by "cluster hard": the modal height, give or take. */
export const CLUSTER_BAND_MM = 25
