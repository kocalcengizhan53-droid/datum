/**
 * The AR plate, measured rather than looked at.
 *
 * Three things here fail silently and all three look fine in a screenshot: a QR code can be
 * unscannable while looking like a QR code, an AR anchor can be malformed in the one way Quick
 * Look cares about and still render, and the model files can be stale or absent while the plate
 * around them is perfect. So the code is decoded from real pixels, the anchor is inspected
 * against WebKit's documented requirement, and the assets are fetched.
 */
import { chromium, devices } from "playwright"
import jsQR from "jsqr"
import { PNG } from "pngjs"

import model from "../src/lib/ar-model.json" with { type: "json" }

const BASE = (process.env.QA_URL ?? "http://localhost:3300").replace(/\/$/, "")
const PAGE = `${BASE}/what-the-fins-are-for/`
const problems = []
const browser = await chromium.launch({ channel: "chromium" })

/* ---- the files the plate points at actually exist and are the right kind ---- */
const ASSETS = [
  ["/ar/datum-massing.usdz", "PK", model.usdzBytes],
  ["/ar/datum-massing.glb", "glTF", model.glbBytes],
  ["/ar/datum-axonometric.svg", "<svg", null],
  ["/ar/datum-qr.svg", "<svg", null],
]
for (const [file, magic, bytes] of ASSETS) {
  const res = await fetch(BASE + file)
  const buf = Buffer.from(await res.arrayBuffer())
  const head = buf.subarray(0, magic.length).toString("ascii")
  const ok = res.ok && head === magic && (bytes === null || buf.byteLength === bytes)
  console.log(`${file.padEnd(32)} ${res.status} ${String(buf.byteLength).padStart(6)}b ${head}`)
  if (!ok) problems.push(`${file}: ${res.status}, magic "${head}", ${buf.byteLength}b (expected ${bytes ?? "any"})`)
}

/* ---- the QR decodes, from the pixels the reader's camera would see ---- */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })
  await page.goto(PAGE, { waitUntil: "networkidle" })
  const qr = page.locator('img[alt^="Link to"]')
  if (!(await qr.count())) {
    problems.push("no QR on the desktop plate")
  } else {
    await qr.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    /*
     * Shot with the page around it, not cropped to the element.
     *
     * A tight crop is the one condition under which a bad code still reads: the decoder gets a
     * clean edge for free, so the quiet zone it is missing does not matter and the polarity it
     * has inverted is unambiguous. Cropping tight, this check passed a code with no margin and
     * light modules on a black ground — which is to say it checked nothing. A camera sees the
     * sheet around the code, so the probe does too.
     */
    const b = await qr.boundingBox()
    const bleed = 28
    const png = PNG.sync.read(
      await page.screenshot({
        clip: {
          x: Math.max(0, b.x - bleed),
          y: Math.max(0, b.y - bleed),
          width: b.width + bleed * 2,
          height: b.height + bleed * 2,
        },
      }),
    )
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)
    console.log(`qr ${png.width}×${png.height} → ${decoded ? decoded.data : "ÇÖZÜLEMEDİ"}`)
    if (!decoded) problems.push(`the QR does not decode at ${png.width}×${png.height} as rendered`)
    else if (decoded.data !== model.page) problems.push(`the QR points at ${decoded.data}, not ${model.page}`)
  }
  await page.close()
}

/* ---- the code is built the way a scanner expects, which a decode does not prove ---- */
{
  const svg = await (await fetch(BASE + "/ar/datum-qr.svg")).text()
  const viewBox = svg.match(/viewBox="0 0 ([\d.]+) /)?.[1]
  const expected = model.qrModules + model.qrQuietZone * 2
  const ground = svg.match(/<rect width="[\d.]+" height="[\d.]+" fill="(#[0-9a-f]{6})"/i)?.[1]
  const modules = svg.match(/<g fill="(#[0-9a-f]{6}|currentColor)"/i)?.[1]

  // Relative luminance, to say "the ground is the light one" rather than name two hex strings.
  const lum = (hex) => {
    if (!hex?.startsWith("#")) return null
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const groundL = lum(ground)
  const moduleL = lum(modules)
  console.log(`qr structure: viewBox ${viewBox} (${model.qrModules}+2×${model.qrQuietZone}=${expected}), ground ${ground}, modules ${modules}`)

  /*
   * Four is the figure in ISO/IEC 18004, not the figure the generator happens to have used.
   * Comparing the drawing against model.qrQuietZone alone is circular — set the generator to
   * zero and both sides move together and the check passes, which is what it did.
   */
  const SPEC_QUIET = 4
  if (model.qrQuietZone < SPEC_QUIET)
    problems.push(`the QR quiet zone is ${model.qrQuietZone} modules; the specification asks for ${SPEC_QUIET}`)
  if (Number(viewBox) !== expected)
    problems.push(`the QR drawing is ${viewBox} modules wide but carries ${model.qrModules} modules and a ${model.qrQuietZone} margin, which is ${expected}`)
  if (groundL === null)
    problems.push("the QR has no opaque ground, so it sits on whatever the page is")
  else if (moduleL === null || groundL - moduleL < 0.4)
    problems.push(`the QR is not dark-on-light: ground ${ground} (${groundL?.toFixed(2)}) vs modules ${modules} (${moduleL?.toFixed(2)})`)
}

/* ---- the Quick Look anchor is shaped the way WebKit requires ---- */
{
  const ctx = await browser.newContext(devices["iPhone 15 Pro"])
  // Chromium has no Quick Look, so the capability it tests for is stubbed. This exercises the
  // branch the component takes on iOS; it cannot prove Safari launches, and does not claim to.
  await ctx.addInitScript(() => {
    const real = DOMTokenList.prototype.supports
    DOMTokenList.prototype.supports = function (token) {
      return token === "ar" ? true : real.call(this, token)
    }
  })
  const page = await ctx.newPage()
  await page.goto(PAGE, { waitUntil: "networkidle" })
  const anchor = await page.evaluate(() => {
    const a = document.querySelector('a[rel="ar"]')
    if (!a) return null
    return {
      href: a.getAttribute("href"),
      childCount: a.children.length,
      childTags: [...a.children].map((c) => c.tagName),
      imgLoaded: [...a.querySelectorAll("img")].every((i) => i.naturalWidth > 0),
    }
  })
  console.log("quick look anchor:", JSON.stringify(anchor))
  if (!anchor) problems.push("no rel=ar anchor when the browser advertises Quick Look")
  else {
    // https://webkit.org/blog/8421/ — one child, and it must be an img or a picture.
    if (anchor.childCount !== 1 || !["IMG", "PICTURE"].includes(anchor.childTags[0]))
      problems.push(`rel=ar anchor has ${anchor.childCount} children (${anchor.childTags}); Quick Look needs exactly one img or picture`)
    if (!anchor.href?.includes("allowsContentScaling=0"))
      problems.push("the Quick Look link does not pin the scale")
    if (!anchor.imgLoaded) problems.push("the drawing inside the AR anchor did not paint")
  }
  await ctx.close()
}

/* ---- Android gets Scene Viewer, and desktop gets the code instead ---- */
{
  const ctx = await browser.newContext(devices["Pixel 7"])
  const page = await ctx.newPage()
  await page.goto(PAGE, { waitUntil: "networkidle" })
  const state = await page.evaluate(() => {
    const a = [...document.querySelectorAll("a")].find((x) => x.href.startsWith("intent://"))
    return { intent: a?.href?.slice(0, 60) ?? null, qr: !!document.querySelector('img[alt^="Link to"]') }
  })
  console.log("scene viewer:", JSON.stringify(state))
  if (!state.intent) problems.push("Android does not get a Scene Viewer intent")
  if (state.qr) problems.push("Android still shows the desktop QR")
  await ctx.close()
}

await browser.close()
if (problems.length) {
  console.error("\nproblems:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log("\nthe model is reachable, the code scans, and the anchor is the shape Quick Look needs")
