/**
 * Proves the type is the type it claims to be.
 *
 * A self-hosted font that 404s falls back silently to Georgia and the page still looks like a
 * serif — which is exactly the failure a screenshot cannot show. So this checks that the loaded
 * family is the one requested, that small caps actually substitute (the glyph is narrower than
 * the full cap), and that the prose and the instrument voice disagree about figure style.
 */
import { chromium } from "@playwright/test"

const BASE = (process.env.QA_URL ?? "http://localhost:3300").replace(/\/$/, "")
const browser = await chromium.launch({ channel: "chromium" })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const problems = []

await page.goto(`${BASE}/what-the-fins-are-for`, { waitUntil: "networkidle" })
await page.evaluate(() => document.fonts.ready)

const report = await page.evaluate(() => {
  const loaded = [...document.fonts].map((f) => `${f.family} ${f.status}`)
  const prose = document.querySelector(".prose-fig p")
  const label = document.querySelector(".mark")
  const inst = document.querySelector(".instrument")

  // Small caps substitute only if the feature is present: render the same string with and
  // without the variant and compare widths. Identical widths mean the feature did nothing.
  const probe = document.createElement("span")
  probe.textContent = "HAMBURGEFONTSIV"
  probe.style.cssText = `position:absolute;visibility:hidden;font-size:40px;font-family:${getComputedStyle(label).fontFamily}`
  document.body.append(probe)
  const plain = probe.getBoundingClientRect().width
  probe.style.fontVariantCaps = "all-small-caps"
  const small = probe.getBoundingClientRect().width
  probe.remove()

  return {
    loaded,
    proseFamily: prose ? getComputedStyle(prose).fontFamily : null,
    proseNums: prose ? getComputedStyle(prose).fontVariantNumeric : null,
    labelFamily: label ? getComputedStyle(label).fontFamily : null,
    instFamily: inst ? getComputedStyle(inst).fontFamily : null,
    instNums: inst ? getComputedStyle(inst).fontVariantNumeric : null,
    smallCapRatio: small / plain,
  }
})

console.log("yuklenen:", report.loaded.join(" | "))
console.log("prose   :", report.proseFamily, "|", report.proseNums)
console.log("label   :", report.labelFamily)
console.log("instr   :", report.instFamily, "|", report.instNums)
console.log("smallcap genislik orani:", report.smallCapRatio.toFixed(3))

if (!report.loaded.some((f) => f.includes("loaded"))) problems.push("no font reported as loaded")
// next/font derives the family name from the variable, so assert on the SHAPE: the first family
// must be the generated one, not a system serif further down the stack.
const firstFamily = (report.proseFamily ?? "").split(",")[0].replace(/["']/g, "").trim()
if (/^(serif|Georgia|Palatino|Iowan|Times)/i.test(firstFamily) || firstFamily === "") {
  problems.push(`prose fell back to a system serif: ${firstFamily}`)
}
if (!report.loaded.some((f) => f.startsWith(firstFamily) && f.endsWith("loaded"))) {
  problems.push(`the first prose family (${firstFamily}) is not reported loaded`)
}
if (!/mono|Geist/i.test(report.instFamily ?? "")) problems.push(`instrument voice is not mono: ${report.instFamily}`)
// Real small caps are meaningfully narrower than full caps. Georgia has none and would tie.
if (report.smallCapRatio > 0.93) problems.push(`small caps did not substitute (ratio ${report.smallCapRatio.toFixed(3)}) — likely a fallback face`)
if (!/oldstyle/.test(report.proseNums ?? "")) problems.push("prose is not using old-style figures")
if (!/lining/.test(report.instNums ?? "")) problems.push("instrument figures are not lining")

await browser.close()
if (problems.length) {
  console.error("\nproblems:\n  " + problems.join("\n  "))
  process.exit(1)
}
console.log("\ntype is the type it claims to be")
