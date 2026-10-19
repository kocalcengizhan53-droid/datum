import { chromium } from "@playwright/test"
const browser = await chromium.launch({ channel: "chromium", args: ["--use-gl=angle", "--use-angle=metal"] })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })
await page.goto("http://localhost:3300/what-the-fins-are-for", { waitUntil: "networkidle" })
await page.waitForTimeout(1800)
const figs = page.locator("figure")
const n = await figs.count()
for (let i = 0; i < n; i++) {
  await figs.nth(i).scrollIntoViewIfNeeded()
  await page.waitForTimeout(900)
  await figs.nth(i).screenshot({ path: `qa/out/plate-${i + 1}.png` })
  console.log(`plate-${i + 1}.png`)
}
await browser.close()
