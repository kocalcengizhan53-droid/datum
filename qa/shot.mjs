/**
 * Screenshots the built journal. A WebGL scene that fails to compile renders a transparent canvas
 * and the page still looks plausible, so the canvas is sampled for actual lit pixels.
 */
import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"

const URL = process.env.QA_URL ?? "http://localhost:3300/"
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

for (const view of views) {
  const context = await browser.newContext({ viewport: view, deviceScaleFactor: 2 })
  const page = await context.newPage()
  page.on("console", (m) => m.type() === "error" && problems.push(`${view.name}: ${m.text()}`))
  page.on("pageerror", (e) => problems.push(`${view.name}: ${e.message}`))

  await page.goto(URL, { waitUntil: "networkidle" })
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

  if (!lit.ok) problems.push(`${view.name}: ${lit.reason}`)
  // A scene that compiled but is unlit looks like a dark rectangle; both numbers catch that.
  else if (lit.bright < 40) problems.push(`${view.name}: scene is dark (${lit.bright} lit samples)`)
  else if (lit.tones < 24) problems.push(`${view.name}: scene is flat (${lit.tones} tones)`)

  await page.screenshot({ path: `qa/out/${view.name}.png`, fullPage: true })

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  if (overflow) problems.push(`${view.name}: horizontal overflow`)

  console.log(`${view.name} ${view.width}x${view.height} — lit ${lit.bright}, tones ${lit.tones}`)
  await context.close()
}

await browser.close()
if (problems.length) {
  console.error("\nproblems:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log("\nscene is lit, no console errors, no overflow")
