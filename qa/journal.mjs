/**
 * The journal as a blog: search from the keyboard, topics, related reading, the feed and the
 * sign-up. Driven with real keys against the built site, on a phone and a desktop.
 */
import { chromium } from "@playwright/test"

const BASE = (process.env.QA_URL ?? "http://localhost:3300").replace(/\/$/, "")
const browser = await chromium.launch({ channel: "chromium" })
const problems = []
const check = (label, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`)
  if (!ok) problems.push(label)
}

for (const view of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
]) {
  const context = await browser.newContext({ viewport: view })
  const page = await context.newPage()
  const errors = []
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
  page.on("pageerror", (e) => errors.push(e.message))
  const at = (s) => `${view.name}: ${s}`

  await page.goto(BASE + "/", { waitUntil: "networkidle" })

  // Search opens from the keyboard, finds by body text (not just titles), and goes with Enter.
  await page.keyboard.press("ControlOrMeta+k")
  const box = page.getByRole("dialog", { name: "Search the journal" }).getByRole("combobox", { name: "Find" })
  check(
    at("⌘K opens search with focus in the box"),
    await box.evaluate((el) => el === document.activeElement).catch(() => false),
  )
  await box.fill("brise-soleil")
  const options = page.getByRole("option")
  await options
    .first()
    .waitFor({ timeout: 3000 })
    .catch(() => {})
  const first = await options
    .first()
    .textContent()
    .catch(() => "")
  check(at("a word from inside an article finds it"), /fins/i.test(first ?? ""), first?.slice(0, 50))
  await box.fill("zzqx")
  check(
    at("a miss says so instead of showing nothing"),
    (await options.count()) === 0 && (await page.getByText(/nothing/i).count()) > 0,
  )
  await box.fill("plinth")
  await page.keyboard.press("Enter")
  await page.waitForURL(/ninety-centimetre-lie/, { timeout: 5000 }).catch(() => {})
  check(at("Enter opens the active result"), page.url().includes("the-ninety-centimetre-lie"), page.url())

  // "/" opens it too, Escape closes it and gives focus back.
  await page.keyboard.press("/")
  check(at("/ opens search"), await box.isVisible().catch(() => false))
  await page.keyboard.press("Escape")
  check(at("Escape closes search"), !(await box.isVisible().catch(() => false)))

  // An article offers related reading that shares a topic, and the sign-up.
  const tags = await page.locator("header a[href^='/tags/']").allTextContents()
  const related = page.getByRole("region", { name: "Read next" }).getByRole("link")
  check(at("article lists its topics"), tags.length >= 2, tags.join(", "))
  check(at("article offers two related reads"), (await related.count()) === 2)
  const signup = page.getByRole("region", {
    name: /newsletter|subscribe|issue/i,
  })
  check(at("sign-up is present and points at the feed"), (await signup.getByRole("link", { name: /rss/i }).count()) > 0)
  await signup.getByLabel("Email address").fill("reader@example.com")
  await signup.getByRole("button", { name: "Notify me" }).click()
  const status = await signup.getByRole("status").textContent()
  check(at("sign-up answers honestly while closed"), /issue 15/.test(status ?? ""), status ?? "")

  // Topics: the index lists every tag with a count, and a tag page lists only its posts.
  await page.goto(BASE + "/tags", { waitUntil: "load" })
  const tagLinks = page.locator("main a[href^='/tags/']")
  check(at("topics index lists tags"), (await tagLinks.count()) >= 5)
  await page.goto(BASE + "/tags/shade", { waitUntil: "load" })
  const listed = await page
    .locator("main a[href^='/'][href*='-']")
    .evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("href")))])
  check(at("a tag page lists its posts"), listed.length >= 1, listed.join(" "))

  // The feed is discoverable from every page.
  const rss = await page.locator('link[rel="alternate"][type="application/rss+xml"]').getAttribute("href")
  check(at("RSS is linked in the head"), Boolean(rss?.endsWith("/feed.xml")), rss ?? "missing")

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  check(at("no horizontal overflow"), !overflow)
  // Checked before the 404 below, whose own document status the browser logs as an error.
  check(at("no console errors"), errors.length === 0, errors[0]?.slice(0, 120))

  // A wrong address is the journal's 404 with its masthead and a way back, not a blank page.
  const missing = await page.goto(BASE + "/no-such-essay", { waitUntil: "load" })
  check(at("unknown path answers 404"), missing?.status() === 404, String(missing?.status()))
  check(
    at("the 404 is the journal's own"),
    (await page.getByRole("heading", { name: "No sheet at this address." }).count()) === 1 &&
      (await page.getByRole("button", { name: "Search the journal" }).count()) === 1
  )
  await context.close()
}

await browser.close()
if (problems.length) {
  console.error(`\n${problems.length} failed`)
  process.exit(1)
}
console.log("\njournal features pass")
