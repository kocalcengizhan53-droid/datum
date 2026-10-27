/**
 * Renders the cover's solar study to the pictures shown before the live scene runs — one wide
 * (desktop) and one tall (phone) — straight from the scene's own canvas, so the picture and the
 * model never drift apart.
 *
 *   npm run build && npm start &
 *   npm run posters            # writes src/assets/cover-{wide,tall}.webp
 *
 * cwebp must be on the PATH.
 */
import { execFileSync } from "node:child_process"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { chromium } from "@playwright/test"

const BASE = (process.env.QA_URL ?? "http://localhost:3300").replace(/\/$/, "")
const OUT = new URL("../src/assets/", import.meta.url).pathname
const tmp = mkdtempSync(join(tmpdir(), "cover-"))

const SHAPES = {
  wide: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 },
  tall: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}

const browser = await chromium.launch({ channel: "chromium", args: ["--use-gl=angle", "--use-angle=metal"] })
for (const [shape, options] of Object.entries(SHAPES)) {
  // Reduced motion holds the camera still, so the picture is the frame the live scene opens on.
  const context = await browser.newContext({ ...options, reducedMotion: "reduce" })
  const page = await context.newPage()
  await page.goto(BASE + "/", { waitUntil: "load" })
  const start = page.getByRole("button", { name: /move the sun/i })
  if (await start.isVisible().catch(() => false)) await start.click()
  await page.locator("main canvas").first().waitFor({ timeout: 30_000 })
  await page.waitForTimeout(6000)
  const png = await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve(document.querySelector("main canvas").toDataURL("image/png"))),
        ),
      ),
  )
  const file = join(tmp, `${shape}.png`)
  writeFileSync(file, Buffer.from(png.split(",")[1], "base64"))
  execFileSync("cwebp", ["-quiet", "-q", "78", "-m", "6", file, "-o", join(OUT, `cover-${shape}.webp`)])
  console.log(`cover-${shape}.webp`)
  await context.close()
}
await browser.close()
