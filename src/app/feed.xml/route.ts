import { ISSUE } from "@/data/issue"
import { SITE, getPosts } from "@/lib/posts"

export const dynamic = "force-static"

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** RSS 2.0, built with the site: every post, newest first, with its standfirst and topics. */
export function GET() {
  const items = getPosts()
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/${p.slug}</guid>
      <pubDate>${new Date(`${p.published}T08:00:00Z`).toUTCString()}</pubDate>
      <dc:creator>${esc(p.author)}</dc:creator>
      <description>${esc(p.standfirst)}</description>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n")
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Datum</title>
    <link>${SITE}</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>A journal of architecture and the built environment. Issue ${ISSUE.number}: ${esc(ISSUE.theme)}.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } })
}
