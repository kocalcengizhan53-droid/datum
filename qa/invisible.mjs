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

  console.log(`${path.padEnd(26)} ${total} drawn elements, ${hidden.length} never completed`)
  for (const h of hidden.slice(0, 6)) console.log(`    ${h}`)
  if (hidden.length) problems.push(`${path}: ${hidden.length}/${total} drawn elements never completed`)
  await page.close()
}

await browser.close()
if (problems.length) {
  console.error("\nproblems:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log("\nevery drawn line completes")
