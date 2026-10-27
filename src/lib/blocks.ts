/**
 * The shape of an article once its MDX has been read: prose, headings, notes and the plates in
 * the order they appear. The drawing register, the quantity schedule and the reading time are
 * all derived from this, so they cannot disagree with the text they describe.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "pull"; text: string }
  | { type: "figure"; kind: "section" | "elevation" | "ar"; caption: string; cut?: number }
  | { type: "levels" }
  | { type: "approach" }
  | { type: "programme" }
  | { type: "overhang" }
  | { type: "survey" }
  | { type: "dimension"; value: string; caption: string }
  | { type: "note"; text: string }
  /** A qualification set in the margin, beside the sentence it qualifies. */
  | { type: "aside"; text: string }
