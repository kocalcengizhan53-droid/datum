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
  /** The overhang is what the cantilever projects past the slab it springs from. */
  overhang: m(
    cantilever.position[2] + cantilever.size[2] / 2 - (slab.position[2] + slab.size[2] / 2),
    1,
  ),
  overallWidth: mm(
    tower.position[0] + tower.size[0] / 2 - (plinth.position[0] - plinth.size[0] / 2),
  ),
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
