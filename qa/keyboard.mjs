/**
 * Every interactive plate has to be operable without a mouse.
 *
 * This was written after the fact, which is the point of recording it: the cover's sun and the
 * section's cut — the two best things on the site, and the only two the page actively invites
 * you to touch — shipped pointer-only. No tabIndex, no key handling, no input. Nothing in the
 * suite noticed, because every check measured what the page looked like after a drag that only
 * a pointer could perform.
 *
 * Each control is reached by Tab from the top of the document rather than by .focus(), because
 * an element that is only focusable from script is not reachable by a reader.
 */
import { chromium } from "playwright"

const BASE = (process.env.QA_URL ?? "http://localhost:3300").replace(/\/$/, "")
const browser = await chromium.launch({ channel: "chromium" })
const problems = []

const CONTROLS = [
  { page: "/", label: "Hour of the solar study", keys: ["ArrowRight", "ArrowRight"] },
  { page: "/what-the-fins-are-for/", label: "Position of the section cut", keys: ["ArrowRight", "ArrowRight", "ArrowRight"] },
]

for (const control of CONTROLS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE + control.page, { waitUntil: "networkidle" })
  const el = page.locator(`[aria-label*="${control.label}"]`)

  if (!(await el.count())) {
    problems.push(`${control.page}: no control labelled "${control.label}"`)
    await page.close()
    continue
  }
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)

  let hops = 0
  let reached = false
  for (; hops < 30 && !reached; hops++) {
    await page.keyboard.press("Tab")
    reached = await el.evaluate((node) => node === document.activeElement)
  }

  const before = await el.getAttribute("aria-valuenow")
  for (const key of control.keys) await page.keyboard.press(key)
  const after = await el.getAttribute("aria-valuenow")
  await page.keyboard.press("End")
  const atEnd = await el.getAttribute("aria-valuenow")

  const role = await el.getAttribute("role")
  console.log(
    `${control.page.padEnd(26)} ${role} · tab ${reached ? `in ${hops}` : "UNREACHABLE"} · ${before} → ${after} · End → ${atEnd}`,
  )

  if (!reached) problems.push(`${control.page}: "${control.label}" is not reachable by Tab`)
  if (before === after) problems.push(`${control.page}: "${control.label}" did not respond to arrow keys`)
  if (atEnd === after) problems.push(`${control.page}: "${control.label}" did not respond to End`)
  if (role !== "slider") problems.push(`${control.page}: "${control.label}" has role "${role}", not slider`)
  await page.close()
}

await browser.close()
if (problems.length) {
  console.error("\nproblems:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log("\nevery plate the page invites you to touch can be touched from the keyboard")
