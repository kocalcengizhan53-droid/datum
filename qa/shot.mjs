/**
 * Screenshots the built journal. A WebGL scene that fails to compile renders a transparent canvas
 * and the page still looks plausible, so the canvas is sampled for actual lit pixels.
 */
import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"

const BASE = (process.env.QA_URL ?? "http://localhost:3300").replace(/\/$/, "")
// Both scenes get shot: the cover is perspective with a sun, the article is orthographic with a
// cut, and a regression in either one is invisible from the other page.
/*
 * Every article, not a sample.
 *
 * This covered the cover and one article, so an overflow that only existed on "The
 * ninety-centimetre lie" — eleven swatches and a fixed label column demanding 408px on a 393px
 * phone — passed the suite while pushing the whole page sideways. A check that looks at two of
 * six pages reports on two of six pages.
 */
const PAGES = [
  { path: "/", slug: "cover" },
  { path: "/what-the-fins-are-for", slug: "fins" },
  { path: "/the-ninety-centimetre-lie", slug: "plinth" },
  { path: "/concrete-remembers", slug: "concrete" },
  { path: "/drawing-the-datum", slug: "datum" },
  { path: "/a-thermal-argument", slug: "thermal" },
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
let deferred = 0

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

  /*
   * Nothing on this site may be fetched from somewhere else.
   *
   * The cover carried <Environment preset="night" />, which pulls a 1K HDR from
   * raw.githack.com and suspends the whole Canvas subtree until it lands. Seven loads in eight
   * showed a black cover on a loaded machine — the hero of a portfolio, waiting on a third
   * party. The lit check above did not catch it for a precise reason: it navigated with
   * waitUntil "networkidle", which waits for exactly that fetch to finish. It was measuring a
   * condition no visitor is in.
   *
   * So the page is loaded the way a visitor loads it, and any request leaving localhost is a
   * failure on its own, whatever the pixels say.
   */
  const offsite = []
  page.on("request", (r) => {
    const url = r.url()
    if (!url.startsWith(BASE) && !url.startsWith("data:") && !url.startsWith("blob:")) {
      offsite.push(url)
    }
  })

  await page.goto(BASE + path, { waitUntil: "load" })

  /*
   * The WebGL plates mount when a reader nears them, so a page measured where it loads has
   * nothing to measure below the fold. Walk the sheet first: every placeholder must turn into
   * its plate, and at least one must have been waiting — otherwise the deferral is not working.
   */
  const pendingAtLoad = await page.locator("[data-plate-pending]").count()
  for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += view.height * 0.8) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(120)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  const pendingAfter = await page.locator("[data-plate-pending]").count()
  if (pendingAfter) problems.push(`${label}: ${pendingAfter} plate(s) never mounted`)

  // The cover shows its poster until the scene runs: on idle on a desktop, on request on a phone.
  const start = page.getByRole("button", { name: "Move the sun" })
  if (await start.isVisible().catch(() => false)) await start.click()
  if (await page.locator("[data-scene]").count()) {
    await page.locator('[data-scene="live"]').waitFor({ timeout: 20_000 }).catch(() => problems.push(`${label}: cover never went live`))
  }

  /*
   * Not every page has WebGL on it any more. Three of the articles are drawn entirely in SVG,
   * and waiting unconditionally for a canvas turned "this page has no 3D" into a 20-second
   * timeout and a failed run. A page that has one must still paint it; a page that has none is
   * not a failure, and is still checked for console errors and overflow below.
   */
  const hasCanvas = (await page.locator("canvas").count()) > 0
  if (hasCanvas) {
    await page.locator("canvas").first().waitFor({ timeout: 20_000 })
    // Give the scene a few frames: a canvas measured on mount is always black.
    await page.waitForTimeout(1800)
  } else {
    await page.waitForTimeout(600)
  }

  /*
   * Every canvas is sampled, not just the first.
   *
   * The article now carries a drawing SET, and the plates are deliberately not alike: an
   * elevation is flat-lit on purpose — that is what an elevation is — while the section and the
   * cover are rendered. Checking only the first canvas reported "scene is flat" for a plate
   * whose flatness is the design. So: every canvas must be PAINTED, and at least one on the page
   * must be RICH, which still catches a shader that failed to compile or a scene left unlit.
   */
  /*
   * Each canvas is measured from a screenshot of the element — the pixels a visitor sees —
   * not from toDataURL. The plates draw on demand, and toDataURL on a canvas whose last frame
   * has already been presented returns the cleared buffer: a black plate that nobody sees.
   */
  const measure = (png) =>
    page.evaluate(async (src) => {
      const img = new Image()
      await new Promise((r) => {
        img.onload = r
        img.src = src
      })
      const c = document.createElement("canvas")
      c.width = 160
      c.height = 100
      const ctx = c.getContext("2d")
      ctx.drawImage(img, 0, 0, 160, 100)
      const d = ctx.getImageData(0, 0, 160, 100).data
      let bright = 0
      const distinct = new Set()
      for (let i = 0; i < d.length; i += 4) {
        const v = (d[i] + d[i + 1] + d[i + 2]) / 3
        if (v > 60) bright++
        distinct.add(`${d[i] >> 4}-${d[i + 1] >> 4}-${d[i + 2] >> 4}`)
      }
      return { bright, tones: distinct.size }
    }, `data:image/png;base64,${png.toString("base64")}`)
  const ONLY_CANVAS = "*:not(canvas):not(:has(canvas)) { visibility: hidden !important }"
  let lit = null
  if (hasCanvas) {
    const canvases = []
    for (const el of await page.locator("canvas").all()) {
      await el.scrollIntoViewIfNeeded()
      await page.waitForTimeout(250)
      // Only the drawing: the labels and readouts laid over it would pass a blank canvas.
      canvases.push(await measure(await el.screenshot({ style: ONLY_CANVAS })))
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    lit = canvases.length ? { ok: true, canvases } : { ok: false, reason: "no canvas" }
  }

  if (lit === null) {
    // Drawn in SVG. Nothing to sample, and nothing wrong.
  } else if (!lit.ok) {
    problems.push(`${label}: ${lit.reason}`)
  } else {
    lit.canvases.forEach((c, i) => {
      if (c.bright < 40) problems.push(`${label}: canvas ${i} is dark (${c.bright} lit samples)`)
    })
    const richest = Math.max(...lit.canvases.map((c) => c.tones))
    if (richest < 24) problems.push(`${label}: no canvas on the page is lit (best ${richest} tones)`)
  }

  /*
   * Every plate on a page is the same width.
   *
   * A floated sidenote shrink-wraps a block formatting context, and PlateFrame carries
   * overflow-hidden, so two pages were printing plates at 616 and 896 pixels one under the
   * other. Two widths on one sheet reads as a bug, not as a margin.
   */
  const plateWidths = await page.evaluate(() =>
    [...document.querySelectorAll("figure[id^=plate-]")].map((el) =>
      Math.round(el.getBoundingClientRect().width),
    ),
  )
  const distinct = [...new Set(plateWidths)]
  if (distinct.length > 1) {
    problems.push(`${label}: plates at ${distinct.join(" and ")} px on one page`)
  }

  if (offsite.length) {
    problems.push(`${label}: ${offsite.length} off-site request(s), first ${offsite[0].slice(0, 90)}`)
  }

  await page.screenshot({ path: `qa/out/${slug}-${view.name}.png`, fullPage: true })

  const motion = await browser.newContext({ viewport: view, deviceScaleFactor: 2 })
  const livePage = await motion.newPage()
  await livePage.goto(BASE + path, { waitUntil: "load" })
  await livePage.waitForTimeout(1600)
  await livePage.screenshot({ path: `qa/out/${slug}-${view.name}-live.png` })
  await motion.close()

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  if (overflow) problems.push(`${label}: horizontal overflow`)

  const reading = lit?.canvases?.map((c) => `${c.bright}/${c.tones}t`).join("  ") ?? "svg only"
  console.log(`${label.padEnd(18)} ${view.width}x${view.height} — ${reading}${pendingAtLoad ? `  (${pendingAtLoad} deferred)` : ""}`)
  deferred += pendingAtLoad
  await context.close()
}

await browser.close()
if (!deferred) problems.push("no WebGL plate was deferred on any page — the lazy mount is not working")
if (problems.length) {
  console.error("\nproblems:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log("\nscene is lit, no console errors, no overflow")
