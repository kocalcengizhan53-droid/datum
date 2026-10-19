import { describe, expect, it } from "vitest"

import model from "@/lib/ar-model.json"
import { FINS, MASSING } from "@/lib/massing"

/**
 * The thing you put on your desk is the thing the drawings describe.
 *
 * scripts/build-ar.mjs runs on prebuild, so a deployed model cannot be stale. What this guards
 * is the gap in between: editing MASSING and running the suite without a build, and reading
 * figures off a plate that describes the previous building. The AR plate prints these numbers,
 * so they are a published claim like any other.
 */
describe("the AR model", () => {
  const parts = [...MASSING, ...FINS]
  const extent = (axis: 0 | 1 | 2) => {
    const low = Math.min(...parts.map((p) => p.position[axis] - p.size[axis] / 2))
    const high = Math.max(...parts.map((p) => p.position[axis] + p.size[axis] / 2))
    return high - low
  }
  const atScale = (metres: number) =>
    Math.round((metres / Number(model.scale.split(":")[1])) * 1000)

  it("is the same building, at the stated scale", () => {
    expect(model.widthMm).toBe(atScale(extent(0)))
    expect(model.heightMm).toBe(atScale(extent(1)))
    expect(model.depthMm).toBe(atScale(extent(2)))
  })

  it("contains every volume and every fin", () => {
    expect(model.parts).toBe(MASSING.length + FINS.length)
  })

  it("stands on the datum, so the table it lands on is the line", () => {
    // Nothing may sit below y=0: the plinth's underside is the datum, and the whole point of
    // placing it on a surface is that the surface reads as that line.
    const lowest = Math.min(...parts.map((p) => p.position[1] - p.size[1] / 2))
    expect(lowest).toBe(0)
  })

  it("keeps the fin screen clear of the facade it shades", () => {
    // Interpenetrating solids have no drawable front-to-back order, which is what broke the
    // axonometric; they are also not how a brise-soleil is fixed.
    const slab = MASSING.find((v) => v.id === "slab")!
    const facade = slab.position[2] + slab.size[2] / 2
    const finBack = FINS[0].position[2] - FINS[0].size[2] / 2
    expect(finBack).toBeGreaterThanOrEqual(facade - 1e-9)
  })

  it("is small enough to be a desk object", () => {
    // 1:50 is chosen; this is the consequence being checked. A model you have to back away from
    // is not the invitation the plate makes.
    expect(model.widthMm).toBeLessThan(500)
    expect(model.widthMm).toBeGreaterThan(150)
  })
})
