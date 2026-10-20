/**
 * The invisible-content probe.
 *
 * Nothing on this page animates text any more, so the old opacity check has nothing to guard.
 * What can still fail is a drawn line that never finishes: a rule stuck at scaleX(0) is an
 * invisible hairline, and a dimension whose figure never arrives is a missing number — both look
 * like the element was simply not designed.
 *
 * Each element is scrolled into view with INSTANT behaviour. Smooth scrolling returns before the
 * element has arrived, every line reads as undrawn, and the whole run is a false alarm — which I
 * have raised before on another project.
 */
import { chromium } from "@playwright/test"

const BASE = (process.env.QA_URL ?? "http://localhost:3300").replace(/\/$/, "")
const browser = await chromium.launch({ channel: "chromium" })
const problems = []

for (const path of ["/", "/what-the-fins-are-for"]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  await page.goto(BASE + path, { waitUntil: "networkidle" })

  const drawn = page.locator(".draw-x, .draw-y, .draw-dim, .draw-dim-label")
  const total = await drawn.count()
  const hidden = []
  for (let i = 0; i < total; i++) {
    const node = drawn.nth(i)
    await node.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }))
    await page.waitForTimeout(120)
    const state = await node.evaluate((el) => {
      const s = getComputedStyle(el)
      const m = new DOMMatrixReadOnly(s.transform === "none" ? undefined : s.transform)
      const box = el.getBoundingClientRect()
      return {
        scaleX: Math.abs(m.a),
        scaleY: Math.abs(m.d),
        opacity: Number(s.opacity),
        width: Math.round(box.width),
        cls: el.className.split(" ").find((c) => c.startsWith("draw-")) ?? "?",
      }
    })
    const undrawn =
      state.opacity < 0.95 ||
      (state.cls !== "draw-y" && state.scaleX < 0.95) ||
      (state.cls === "draw-y" && state.scaleY < 0.95)
    if (undrawn) {
      hidden.push(`${state.cls} sx=${state.scaleX.toFixed(2)} sy=${state.scaleY.toFixed(2)} a=${state.opacity.toFixed(2)} w=${state.width}`)
    }
  }

  /*
   * Dimensions in the prose are measured separately because they are not drawn by a transform:
   * the rule is an animated background-size and the extension ticks live on pseudo-elements,
   * neither of which the loop above can see. A dimension frozen at 0% is a number with no rule
   * under it — the same failure, in a place the original probe had no way to look.
   */
  const dims = page.locator("span.dim")
  const dimTotal = await dims.count()
  const dimBad = []
  for (let i = 0; i < dimTotal; i++) {
    const node = dims.nth(i)
    await node.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }))
    await page.waitForTimeout(120)
    const state = await node.evaluate((el) => {
      const rule = getComputedStyle(el).backgroundSize
      const tickY = (which) => {
        const t = getComputedStyle(el, which).transform
        return Math.abs(new DOMMatrixReadOnly(t === "none" ? undefined : t).d)
      }
      return {
        text: el.textContent,
        // "148.5px 1px" when drawn, "0px 1px" or "0% 1px" when stuck at the start.
        ruleWidth: parseFloat(rule),
        rulePct: rule.includes("%") ? parseFloat(rule) : null,
        boxWidth: el.getBoundingClientRect().width,
        before: tickY("::before"),
        after: tickY("::after"),
      }
    })
    const ruleDrawn =
      state.rulePct !== null ? state.rulePct >= 95 : state.ruleWidth >= state.boxWidth * 0.95
    if (!ruleDrawn || state.before < 0.95 || state.after < 0.95) {
      dimBad.push(`${state.text} rule=${state.ruleWidth.toFixed(0)}/${state.boxWidth.toFixed(0)} ticks=${state.before.toFixed(2)},${state.after.toFixed(2)}`)
    }
  }
  if (dimTotal) {
    console.log(`${path.padEnd(26)} ${dimTotal} dimensions, ${dimBad.length} never drawn`)
    for (const d of dimBad.slice(0, 6)) console.log(`    ${d}`)
    if (dimBad.length) problems.push(`${path}: ${dimBad.length}/${dimTotal} dimensions never drew their rule`)
  }

  console.log(`${path.padEnd(26)} ${total} drawn elements, ${hidden.length} never completed`)
  for (const h of hidden.slice(0, 6)) console.log(`    ${h}`)
  if (hidden.length) problems.push(`${path}: ${hidden.length}/${total} drawn elements never completed`)
  await page.close()
}

/*
 * The motion has to happen where someone is looking.
 *
 * Every range in globals.css was keyed to `entry`, which for a one-pixel rule is the instant
 * it crosses the bottom edge of the window. Swept in 60px steps down a 4,200px article, every
 * one of eighteen mid-draw frames had its element between 897 and 1008 pixels down a
 * 1000-pixel window. The lines drew, the check above confirmed they finished, and no reader
 * ever saw a frame of it — which is indistinguishable from having written no motion at all.
 *
 * So: sweep the page and require that the drawing is caught in progress inside the reading
 * band, not only at the bottom edge.
 */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await page.goto(BASE + "/the-ninety-centimetre-lie/", { waitUntil: "load" })
  await page.waitForTimeout(900)

  const height = await page.evaluate(() => document.body.scrollHeight)
  const tops = []
  for (let y = 0; y < height; y += 60) {
    await page.evaluate((v) => scrollTo(0, v), y)
    await page.waitForTimeout(40)
    tops.push(
      ...(await page.evaluate(() => {
        const found = []
        for (const el of document.querySelectorAll(".draw-x, .draw-y, .dim")) {
          const s = getComputedStyle(el)
          const m = new DOMMatrixReadOnly(s.transform === "none" ? undefined : s.transform)
          const size = s.backgroundSize
          const pct = size.includes("%") ? parseFloat(size) : null
          const partway =
            (Math.abs(m.a) > 0.02 && Math.abs(m.a) < 0.98) ||
            (Math.abs(m.d) > 0.02 && Math.abs(m.d) < 0.98) ||
            (pct !== null && pct > 2 && pct < 98)
          if (partway) found.push(Math.round(el.getBoundingClientRect().top))
        }
        return found
      })),
    )
  }

  const READING_BAND = 760
  const inBand = tops.filter((t) => t < READING_BAND).length
  const highest = tops.length ? Math.min(...tops) : null
  console.log(
    `\nmotion: ${tops.length} frames caught mid-draw, ${inBand} inside the reading band` +
      (highest === null ? "" : `, highest at ${highest}px`),
  )
  if (!tops.length) problems.push("no drawing animation was ever caught in progress")
  else if (!inBand)
    problems.push(
      `every mid-draw frame sat below ${READING_BAND}px (highest ${highest}px) — the motion plays off the bottom edge`,
    )
  await page.close()
}

await browser.close()
if (problems.length) {
  console.error("\nproblems:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log("\nevery drawn line completes")
