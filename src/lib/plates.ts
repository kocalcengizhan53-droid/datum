import type { Block } from "@/data/bodies"
import { SURVEY } from "@/lib/survey"

/**
 * What each plate is called, in one place.
 *
 * The title appears twice — on the plate's own header and in the drawing register in the
 * gutter — and a register that disagrees with the sheet it indexes is worse than no register.
 * Both read this.
 */
export const PLATE_TITLES = {
  elevation: "south elevation · 1:200",
  section: "section · the cut moves",
  ar: "model · 1:50",
  levels: "level schedule · press to re-base",
  approach: "approach · section at 1:1 both axes",
  programme: "programme · weeks",
  overhang: "west elevation · section",
  survey: `survey · ${SURVEY.total} buildings`,
} as const

export type PlateKind = keyof typeof PLATE_TITLES

/** Blocks that occupy a numbered sheet. The order here is the order plates are numbered in. */
export function plateKind(block: Block): PlateKind | null {
  switch (block.type) {
    case "figure":
      return block.kind
    case "levels":
    case "approach":
    case "programme":
    case "overhang":
    case "survey":
      return block.type
    default:
      return null
  }
}

/** The drawing register for one article: every plate, numbered, in order. */
export function plateRegister(blocks: readonly Block[]) {
  return blocks.flatMap((block) => {
    const kind = plateKind(block)
    return kind ? [{ kind, title: PLATE_TITLES[kind] }] : []
  })
}
