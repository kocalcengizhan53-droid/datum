/**
 * The invisible-content probe.
 *
 * A reveal animation that never runs leaves its element at opacity 0 forever, and the page looks
 * like a layout bug or like nothing at all. A screenshot cannot tell the difference between
 * "content absent" and "content transparent", so each element is scrolled into view with INSTANT
 * behaviour — smooth scrolling returns before the element has arrived and every reveal reads as
 * invisible, which is a false alarm I have raised before.
 */
import { chromium } from "@playwright/test"

const BASE = (process.env.QA_URL ?? "http://localhost:3300").replace(/\/$/, "")
const browser = await chromium.launch({ channel: "chromium" })
const problems = []

for (const path of ["/", "/what-the-fins-are-for"]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  await page.goto(BASE + path, { waitUntil: "networkidle" })

  const total = await page.locator(".reveal").count()
  const hidden = []
  for (let i = 0; i < total; i++) {
    const node = page.locator(".reveal").nth(i)
    await node.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }))
    await page.waitForTimeout(120)
    const state = await node.evaluate((el) => ({
      opacity: Number(getComputedStyle(el).opacity),
      text: (el.textContent ?? "").trim().slice(0, 46),
    }))
    if (state.opacity < 0.95) hidden.push(`${state.opacity.toFixed(2)} — ${state.text}`)
  }

  console.log(`${path.padEnd(26)} ${total} reveals, ${hidden.length} still transparent`)
  for (const h of hidden.slice(0, 6)) console.log(`    ${h}`)
  if (hidden.length) problems.push(`${path}: ${hidden.length}/${total} reveals never became visible`)
  await page.close()
}

await browser.close()
if (problems.length) {
  console.error("\nproblems:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log("\nevery reveal ends visible")
