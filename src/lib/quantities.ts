import { FINS, MASSING, type Volume } from "@/lib/massing"

/**
 * Every measured quantity the prose is allowed to state, derived from the model it describes.
 *
 * The journal's own argument is that the quantities exist, they are produced early, they decide
 * the thing the photographs are of, and they are simply not what anyone publishes. Hard-coding
 * them in the copy would be the same failure in miniature — and it already happened: the article
 * claimed the fins were 140 millimetres deep while the model projected them 520. The number was
 * wrong for as long as it was a string.
 *
 * Nothing here is a style. The treatment lives in <Dim>, and it is deliberately not the sun
 * colour: in this codebase sun-on-text is exclusively the hover state of a link, so a coloured,
 * underlined figure in the middle of a sentence would read as something you can click.
 */

const volume = (id: string): Volume => {
  const found = MASSING.find((v) => v.id === id)
  if (!found) throw new Error(`No volume "${id}" in MASSING`)
  return found
}

const mm = (metres: number) => ({ value: Math.round(metres * 1000).toString(), unit: "mm" })

/**
 * The widest extent of the whole model along an axis, taken over every volume.
 *
 * The overall width used to be written as "tower's east face minus the plinth's west face",
 * which is two hand-picked volumes and was wrong: the cantilever projects 1,550mm further west
 * than the plinth, and the plinth 250mm further east than the tower. The figure read 15,250
 * against a building 17,050 wide, and the elevation drew its overall dimension to match — so the
 * cantilever hung past the end of the line that was supposed to measure it. Nothing caught it,
 * because the drawing and the number were wrong in the same way from the same two volumes. The
 * bounding box of the AR export disagreed, which is the only reason it surfaced.
 */
const extent = (axis: 0 | 1 | 2) => {
  const parts: readonly { position: readonly number[]; size: readonly number[] }[] = [
    ...MASSING,
    ...FINS,
  ]
  const low = Math.min(...parts.map((p) => p.position[axis] - p.size[axis] / 2))
  const high = Math.max(...parts.map((p) => p.position[axis] + p.size[axis] / 2))
  return high - low
}
const m = (metres: number, dp = 1) => ({ value: metres.toFixed(dp), unit: "m" })

const plinth = volume("plinth")
const slab = volume("slab")
const tower = volume("tower")
const cantilever = volume("cantilever")

export type Quantity = { readonly value: string; readonly unit: string }

export const QUANTITIES = {
  finDepth: mm(FINS[0].size[2]),
  finThickness: mm(FINS[0].size[0]),
  finPitch: mm(FINS[1].position[0] - FINS[0].position[0]),
  finCount: { value: String(FINS.length), unit: "" },
  plinthHeight: mm(plinth.position[1] * 2),
  slabWidth: mm(slab.size[0]),
  towerHeight: m(tower.position[1] + tower.size[1] / 2),
  /**
   * What the cantilever projects past the slab it springs from — measured on the axis it
   * actually cantilevers along, which is west.
   *
   * This read the south face and returned 0.2m: the study does lap 200mm past the slab in that
   * direction, and that is not the overhang, it is a tolerance. The cantilever projects two
   * metres west. The volume's own label meanwhile claimed 3.1m, which is true on no axis at
   * all, and nothing noticed because the label is not rendered anywhere — a number can be
   * wrong for years in a field nobody prints.
   */
  overhang: m(
    Math.max(
      slab.position[0] - slab.size[0] / 2 - (cantilever.position[0] - cantilever.size[0] / 2),
      cantilever.position[0] + cantilever.size[0] / 2 - (slab.position[0] + slab.size[0] / 2),
    ),
    1,
  ),
  overallWidth: mm(extent(0)),
} as const satisfies Record<string, Quantity>

export type QuantityKey = keyof typeof QUANTITIES

/** Splits prose on {{key}} markers so the renderer can set figures as figures. */
export function splitQuantities(text: string): (string | QuantityKey)[] {
  return text.split(/\{\{(\w+)\}\}/g).map((part, i) => {
    if (i % 2 === 0) return part
    if (!(part in QUANTITIES)) throw new Error(`Unknown quantity "{{${part}}}"`)
    return part as QuantityKey
  })
}
