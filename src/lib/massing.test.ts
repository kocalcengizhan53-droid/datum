import { describe, expect, it } from "vitest"

import { TOWER_TOP, compassPoint, shadowLength, skyColours, sunAngles } from "@/lib/massing"

describe("the cover's sun", () => {
  it("rises in the east, stands due south at noon and sets in the west", () => {
    expect(compassPoint(sunAngles(6.5).azimuth)).toBe("E")
    expect(sunAngles(12).azimuth).toBeCloseTo(180, 5)
    expect(compassPoint(sunAngles(17.5).azimuth)).toBe("W")
  })

  it("is highest at noon and throws the shortest shadow then", () => {
    const hours = [7, 9, 12, 15, 17]
    const altitudes = hours.map((h) => sunAngles(h).altitude)
    expect(Math.max(...altitudes)).toBe(sunAngles(12).altitude)
    expect(shadowLength(TOWER_TOP, 12)).toBeLessThan(shadowLength(TOWER_TOP, 9))
    expect(shadowLength(TOWER_TOP, 9)).toBeLessThan(shadowLength(TOWER_TOP, 7))
  })

  it("keeps the readout honest: a 45° sun throws a shadow as long as the tower is tall", () => {
    const hour = [...Array(600).keys()].map((i) => 6 + i / 100).find((h) => sunAngles(h).altitude >= 45)
    expect(hour).toBeDefined()
    expect(shadowLength(TOWER_TOP, hour!)).toBeCloseTo(TOWER_TOP, 0)
  })

  it("paints a warmer horizon at the ends of the day than at noon", () => {
    const warmth = (h: number) => skyColours(h).horizon[0] - skyColours(h).horizon[2]
    expect(warmth(6.5)).toBeGreaterThan(warmth(12))
    expect(warmth(17.5)).toBeGreaterThan(warmth(12))
  })
})
