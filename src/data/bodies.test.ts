import { describe, expect, it } from "vitest"

import { BODIES, type Block } from "@/data/bodies"

/**
 * The wall-of-text guard.
 *
 * This exists because of a verdict, not a theory. After the bodies were written out to length,
 * the owner's response was "sayfa içerikleri düz metinden başka bir şey olmamış" — the pages are
 * nothing but plain text. He was right, and it was measurable: three of the five articles had
 * eleven paragraphs in a row and not one visual block between them. Writing more words made it
 * worse, because the only block the copy could reach for was <p>.
 *
 * So the complaint is encoded rather than remembered. An article is allowed to be long. It is
 * not allowed to be undifferentiated.
 */

/*
 * Defined by exclusion, so the rule keeps working as the vocabulary grows. Listing the visual
 * types instead would mean every new component has to remember to add itself here, and the one
 * that forgot would make the article look better while the guard said it had not changed.
 */
const WORDS_ONLY = new Set<Block["type"]>(["p", "h", "pull", "note"])
const isVisual = (block: Block) => !WORDS_ONLY.has(block.type)
const isProse = (block: Block) => block.type === "p"

/** Long enough to be a real read, short enough that the reader is never only reading. */
const MAX_CONSECUTIVE_PROSE = 4
const MIN_VISUAL_BLOCKS = 2

describe("article bodies", () => {
  for (const [slug, blocks] of Object.entries(BODIES)) {
    describe(slug, () => {
      it(`breaks up prose at least every ${MAX_CONSECUTIVE_PROSE} blocks`, () => {
        let run = 0
        let worst = 0
        let at = -1
        blocks.forEach((block, i) => {
          if (isProse(block)) {
            run += 1
            if (run > worst) {
              worst = run
              at = i
            }
          } else {
            run = 0
          }
        })
        expect(worst, `longest unbroken run of paragraphs ends at block ${at}`).toBeLessThanOrEqual(
          MAX_CONSECUTIVE_PROSE,
        )
      })

      it(`carries at least ${MIN_VISUAL_BLOCKS} things that are not words`, () => {
        const visual = blocks.filter(isVisual)
        expect(visual.length, `block types present: ${[...new Set(blocks.map((b) => b.type))].join(", ")}`).toBeGreaterThanOrEqual(MIN_VISUAL_BLOCKS)
      })
    })
  }

  it("uses more of the vocabulary than paragraphs and headings", () => {
    // A union of block types nobody reaches for is the same as not having them. Measured across
    // the issue rather than per article, because a component belongs where its subject is.
    const used = new Set(Object.values(BODIES).flat().map((b) => b.type))
    expect([...used].sort().join(", ")).toBeTruthy()
    expect(used.size).toBeGreaterThanOrEqual(7)
  })
})
