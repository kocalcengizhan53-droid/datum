import { describe, expect, it } from "vitest"

import { BODIES } from "@/data/bodies"
import { QUANTITIES, splitQuantities, type QuantityKey } from "@/lib/quantities"

describe("quantities", () => {
  it("resolves every marker used in every article", () => {
    // The guard that makes the marker syntax safe: a typo in the copy fails here rather than
    // shipping a literal {{finDepth}} into a paragraph nobody re-reads.
    for (const [slug, blocks] of Object.entries(BODIES)) {
      for (const block of blocks) {
        // Captions included: they render through the same splitter as body text, so a marker in
        // a plate caption has to resolve too.
        const fields = ("text" in block ? [block.text] : []).concat(
          "caption" in block ? [block.caption] : [],
        )
        for (const field of fields) {
          expect(() => splitQuantities(field), `${slug}: ${field.slice(0, 50)}`).not.toThrow()
        }
      }
    }
  })

  it("rejects a marker that names nothing", () => {
    expect(() => splitQuantities("the fins are {{finLength}} deep")).toThrow(/finLength/)
  })

  it("states the fin depth the model actually has, not the one the prose used to claim", () => {
    // The article said 140 mm for as long as it was a hard-coded string; the blade projects 520.
    expect(QUANTITIES.finDepth).toEqual({ value: "520", unit: "mm" })
  })

  it("keeps every quantity a finite, non-empty figure", () => {
    for (const [key, q] of Object.entries(QUANTITIES)) {
      expect(q.value, key).toMatch(/^\d/)
      expect(Number.isFinite(Number(q.value)), key).toBe(true)
    }
  })

  it("agrees with the elevation plate about the overall width", () => {
    // Both read MASSING; if they ever diverge the drawing and its caption are telling different
    // stories, which is the one failure this whole mechanism exists to prevent.
    expect(QUANTITIES.overallWidth.value).toBe("15250")
  })

  it("leaves prose without markers untouched", () => {
    const parts = splitQuantities("no quantities here")
    expect(parts).toEqual(["no quantities here"])
  })

  it("splits around a marker in both directions", () => {
    const parts = splitQuantities("fins at {{finPitch}} centres")
    expect(parts[0]).toBe("fins at ")
    expect(parts[1]).toBe("finPitch" satisfies QuantityKey)
    expect(parts[2]).toBe(" centres")
  })

  /*
   * The mechanism is only worth having if a written number cannot come back. A marker guarantees
   * the figure is current; nothing so far guaranteed that an author would not simply type "520
   * millimetres" next to it again, which is the exact drift that put "140 millimetres deep" in a
   * paragraph describing a 520mm fin.
   *
   * Scanned against the raw bodies, not the rendered output: a marker is replaced before render,
   * so anything still spelled out in digits there was spelled out by hand.
   */
  it("has no quantity written out as a literal anywhere in the bodies", () => {
    const prose = Object.values(BODIES)
      .flat()
      .flatMap((block) => ("text" in block ? [block.text] : []).concat("caption" in block ? [block.caption] : []))
      .join("\n")

    const offenders: string[] = []
    for (const [key, q] of Object.entries(QUANTITIES)) {
      // Two-digit values are left out: they collide with years and counts that are genuinely
      // prose ("2015", "eleven buildings"), and a false failure here would get the rule deleted.
      if (q.value.replace(".", "").length < 3) continue
      if (new RegExp(`(?<![\\d.])${q.value.replace(".", "\\.")}(?![\\d.])`).test(prose)) {
        offenders.push(`${q.value} (${key})`)
      }
    }

    expect(offenders, "write {{marker}} instead of the number").toEqual([])
  })
})
