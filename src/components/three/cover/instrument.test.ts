import { describe, expect, it } from "vitest"

import { COVER_START_HOUR, hourAtVideoTime, videoFrameHours } from "@/components/three/cover/Instrument"

describe("the phone cover's video clock", () => {
  it("opens on the poster's hour, so the video takes over without a jump", () => {
    expect(hourAtVideoTime(0)).toBeCloseTo(COVER_START_HOUR, 6)
    expect(videoFrameHours()[0]).toBeCloseTo(COVER_START_HOUR, 6)
  })

  it("loops seamlessly: the end of the video is the hour it started on", () => {
    const frames = videoFrameHours()
    const step = Math.abs(frames[1] - frames[0])
    expect(Math.abs(frames.at(-1)! - frames[0])).toBeLessThan(step * 1.5)
    expect(hourAtVideoTime(16)).toBeCloseTo(hourAtVideoTime(0), 6)
  })

  it("crosses the whole day and never leaves it", () => {
    const frames = videoFrameHours()
    expect(Math.min(...frames)).toBeCloseTo(6.6, 1)
    expect(Math.max(...frames)).toBeCloseTo(17.4, 1)
  })
})
