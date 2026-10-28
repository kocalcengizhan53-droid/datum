import { describe, expect, it } from "vitest"

import {
  BUILT,
  PLAN_CELLS,
  PLAN_HALF,
  cellCentre,
  decodeHours,
  encodeHours,
  hoursOf,
  inShadow,
  isBuilt,
  planSummary,
  sunHours,
} from "@/lib/sunlight"

const at = (h: Uint8Array, x: number, z: number) => {
  const c = Math.floor((x + PLAN_HALF) / 0.5)
  const r = Math.floor((z + PLAN_HALF) / 0.5)
  return h[r * PLAN_CELLS + c]
}

describe("sunlight hours", () => {
  const hours = sunHours()

  it("marks the ground the building stands on, and nothing else", () => {
    expect(isBuilt(0, 0)).toBe(true)
    expect(isBuilt(15, 15)).toBe(false)
    expect(at(hours, 0, 0)).toBe(BUILT)
    expect(hoursOf(BUILT)).toBeNull()
  })

  it("throws the noon shadow north, away from the sun", () => {
    expect(inShadow(0, -6, 12)).toBe(true)
    expect(inShadow(0, 8, 12)).toBe(false)
  })

  it("throws the morning shadow west and the evening shadow east", () => {
    // Beside the tower at about its own distance: shaded only by the sun on the far side.
    expect(inShadow(-10, -2, 7)).toBe(true)
    expect(inShadow(-10, -2, 17)).toBe(false)
    expect(inShadow(14, -2, 17)).toBe(true)
    expect(inShadow(14, -2, 7)).toBe(false)
  })

  it("gives open ground south of the building the whole day, and the north side little", () => {
    expect(hoursOf(at(hours, 12, 15))!).toBeGreaterThanOrEqual(11.5)
    expect(hoursOf(at(hours, -1, -6.5))!).toBeLessThan(3)
  })

  it("packs and unpacks without loss", () => {
    const s = encodeHours(hours)
    expect(s).toHaveLength(PLAN_CELLS * PLAN_CELLS)
    expect(Array.from(decodeHours(s))).toEqual(Array.from(hours))
  })

  it("summarises the ground in shares that add up", () => {
    const s = planSummary(hours)
    expect(s.allDay).toBeGreaterThan(0.3)
    expect(s.underThree).toBeGreaterThan(0)
    expect(s.allDay + s.underThree).toBeLessThan(1)
    expect(cellCentre(0)).toBe(-PLAN_HALF + 0.25)
  })
})
