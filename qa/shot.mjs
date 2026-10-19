/**
 * Screenshots the built journal. A WebGL scene that fails to compile renders a transparent canvas
 * and the page still looks plausible, so the canvas is sampled for actual lit pixels.
 */
import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"

const BASE = (process.env.QA_URL ?? "http://localhost:3300").replace(/\/$/, "")
// Both scenes get shot: the cover is perspective with a sun, the article is orthographic with a
// cut, and a regression in either one is invisible from the other page.
const PAGES = [
  { path: "/", slug: "cover" },
  { path: "/what-the-fins-are-for", slug: "article" },
]
await mkdir("qa/out", { recursive: true })

const views = [
  { name: "desktop", width: 1600, height: 1000 },
  { name: "laptop", width: 1280, height: 860 },
  { name: "phone", width: 390, height: 844 },
]

const browser = await chromium.launch({
  channel: "chromium",
  args: ["--use-gl=angle", "--use-angle=metal", "--enable-unsafe-swiftshader"],
})
const problems = []

for (const { path, slug } of PAGES)
for (const view of views) {
  const label = `${slug}/${view.name}`
  /*
   * Two passes per view, because one cannot tell the truth about both things.
   *
   * A fullPage capture resizes the viewport to the document height, which puts every
   * scroll-driven reveal outside its animation range — they freeze at `from`, i.e. opacity 0,
   * and the shot shows a page with holes in it that the live page does not have. Emulating
   * reduced motion switches the reveals off entirely, so the layout shot is honest, and it
   * exercises the reduced-motion branch at the same time.
   *
   * The atmosphere shot is viewport-sized with motion on, which is what a visitor sees.
   */
  const context = await browser.newContext({
    viewport: view,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  page.on("console", (m) => m.type() === "error" && problems.push(`${label}: ${m.text()}`))
  page.on("pageerror", (e) => problems.push(`${label}: ${e.message}`))

  await page.goto(BASE + path, { waitUntil: "networkidle" })
  await page.locator("canvas").first().waitFor({ timeout: 20_000 })
  // Give the scene a few frames: a canvas measured on mount is always black.
  await page.waitForTimeout(1800)

  const lit = await page.evaluate(async () => {
    const el = document.querySelector("canvas")
    if (!el) return { ok: false, reason: "no canvas" }
    const shot = await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(el.toDataURL("image/png"))))
    })
    const img = new Image()
    await new Promise((r) => {
      img.onload = r
      img.src = shot
    })
    const c = document.createElement("canvas")
    c.width = 160
    c.height = 100
    const ctx = c.getContext("2d")
    ctx.drawImage(img, 0, 0, 160, 100)
    const d = ctx.getImageData(0, 0, 160, 100).data
    let bright = 0
    let distinct = new Set()
    for (let i = 0; i < d.length; i += 4) {
      const v = (d[i] + d[i + 1] + d[i + 2]) / 3
      if (v > 60) bright++
      distinct.add(`${d[i] >> 4}-${d[i + 1] >> 4}-${d[i + 2] >> 4}`)
    }
    return { ok: true, bright, tones: distinct.size }
  })

  if (!lit.ok) problems.push(`${label}: ${lit.reason}`)
  // A scene that compiled but is unlit looks like a dark rectangle; both numbers catch that.
  else if (lit.bright < 40) problems.push(`${label}: scene is dark (${lit.bright} lit samples)`)
  else if (lit.tones < 24) problems.push(`${label}: scene is flat (${lit.tones} tones)`)

  await page.screenshot({ path: `qa/out/${slug}-${view.name}.png`, fullPage: true })

  const motion = await browser.newContext({ viewport: view, deviceScaleFactor: 2 })
  const livePage = await motion.newPage()
  await livePage.goto(BASE + path, { waitUntil: "networkidle" })
  await livePage.waitForTimeout(1600)
  await livePage.screenshot({ path: `qa/out/${slug}-${view.name}-live.png` })
  await motion.close()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  if (overflow) problems.push(`${label}: horizontal overflow`)

  console.log(`${label.padEnd(18)} ${view.width}x${view.height} — lit ${lit.bright}, tones ${lit.tones}`)
  await context.close()
}

await browser.close()
if (problems.length) {
  console.error("\nproblems:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log("\nscene is lit, no console errors, no overflow")
