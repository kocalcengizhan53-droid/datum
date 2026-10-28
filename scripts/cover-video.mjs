/**
 * Renders the phone cover's video: the solar study's sweep, frame by frame from the scene's own
 * canvas, at the hours the page itself lists (`window.__cover.videoFrames`), so the readout
 * that follows the video on a phone always names the hour on screen.
 *
 *   npm run build && npm start &
 *   FFMPEG=/path/to/ffmpeg npm run cover-video   # writes public/media/cover-tall.mp4
 */
import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { chromium } from "@playwright/test"

const BASE = (process.env.QA_URL ?? "http://localhost:3300").replace(/\/$/, "")
const FFMPEG = process.env.FFMPEG ?? "ffmpeg"
const OUT = new URL("../public/media/", import.meta.url).pathname
const frames = mkdtempSync(join(tmpdir(), "cover-video-"))
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: "chromium", args: ["--use-gl=angle", "--use-angle=metal"] })
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce",
})
const page = await context.newPage()
await page.goto(BASE + "/?capture", { waitUntil: "load" })
await page.getByRole("button", { name: /move the sun/i }).click()
await page.waitForFunction(() => window.__cover, null, { timeout: 60_000 })
await page.waitForTimeout(4000)
// Only the canvas: the cover line and the instrument are drawn over the video by the page.
await page.addStyleTag({ content: "*:not(canvas):not(:has(canvas)){visibility:hidden!important}" })
const hours = await page.evaluate(() => window.__cover.videoFrames)
const canvas = page.locator("main canvas").first()

for (const [i, hour] of hours.entries()) {
  await page.evaluate((h) => window.__cover.setHour(h), hour)
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  await canvas.screenshot({ path: join(frames, `f${String(i).padStart(4, "0")}.png`) })
  if (i % 48 === 0) console.log(`frame ${i}/${hours.length}`)
}
await browser.close()

const file = join(OUT, "cover-tall.mp4")
execFileSync(FFMPEG, [
  "-y", "-loglevel", "error",
  "-framerate", "24", "-i", join(frames, "f%04d.png"),
  "-vf", "scale=720:-2:flags=lanczos",
  "-c:v", "libx264", "-preset", "slower", "-crf", process.env.CRF ?? "27",
  "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
  file,
])
console.log(`${file} ${(statSync(file).size / 1024).toFixed(0)} KB, ${hours.length} frames`)
