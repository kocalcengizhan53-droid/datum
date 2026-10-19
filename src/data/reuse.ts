/**
 * The two reuse attempts behind "Concrete remembers".
 *
 * The article's finding is a programme, not a carbon figure: the same engineering, the same
 * embodied-carbon case, and two outcomes, separated only by when the paperwork happened. Held
 * as data so the plate can draw the durations on one axis — where the thing the article
 * actually found becomes visible, which is that the bar everyone argues about is the shortest
 * one on the sheet.
 */

export type Phase = {
  readonly id: string
  readonly label: string
  readonly weeks: number
  /** Whether this phase blocks the steel being released, in this sequence. */
  readonly onCriticalPath: boolean
  readonly note: string
}

export type Attempt = {
  readonly id: "before" | "after"
  readonly label: string
  readonly building: string
  readonly phases: readonly Phase[]
  /** Tonnes of steel released for reuse. */
  readonly tonnesReleased: number
  readonly testingCostGbp: number
  readonly outcome: string
}

/** Shared by both attempts: the work is identical, only its order changes. */
const ENGINEERING: Phase = {
  id: "engineering",
  label: "Engineering",
  weeks: 2,
  onCriticalPath: true,
  note: "Solved in about a fortnight on both buildings. The part everyone assumes is the obstacle.",
}

const CHARACTERISATION: Phase = {
  id: "characterisation",
  label: "Characterisation",
  weeks: 3,
  onCriticalPath: true,
  note: "Three coupons per batch, cut from members still standing and still attached to drawings.",
}

const PROCUREMENT: Phase = {
  id: "procurement",
  label: "New steel, lead time",
  weeks: 14,
  onCriticalPath: false,
  note: "The alternative. Testing beat it by eleven weeks, and that — not the carbon — is the number that decided it.",
}

const CONSENT: Phase = {
  id: "consent",
  label: "Testing regime agreed",
  weeks: 39,
  onCriticalPath: true,
  note: "Nine months to agree the regime with the approving authority. Nobody counts this in a programme, and it is the longest bar on the sheet.",
}

export const ATTEMPTS: readonly Attempt[] = [
  {
    id: "before",
    label: "Paperwork before demolition",
    building: "Building 02",
    phases: [CONSENT, ENGINEERING, CHARACTERISATION, PROCUREMENT],
    tonnesReleased: 60,
    testingCostGbp: 11000,
    outcome:
      "The steel was characterised while it was still standing and still had drawings attached to it. Sixty tonnes released.",
  },
  {
    id: "after",
    label: "Paperwork after demolition",
    building: "Building 01",
    phases: [ENGINEERING, CHARACTERISATION, CONSENT, PROCUREMENT],
    tonnesReleased: 0,
    testingCostGbp: 11000,
    outcome:
      "Attempted once the frame was down and the members were in a yard with their connections cut off. Nothing released. The carbon case was identical.",
  },
]

/** The comparison the article makes and never quantifies: a new frame against the old one. */
export const EMBODIED_CARBON_RATIO = 4
