import { ISSUE } from "@/data/issue"
import { SITE, getPosts, getTags } from "@/lib/posts"

export const dynamic = "force-static"

/** The site for language models (llmstxt.org): what it is, every post, the feeds. Built with the site. */
export function GET() {
  const posts = getPosts()
    .map((p) => `- [${p.title}](${SITE}/${p.slug}): ${p.standfirst}`)
    .join("\n")
  const body = `# Datum

> A journal of architecture and the built environment. Issue ${ISSUE.number}: ${ISSUE.theme}. Every illustration is a live three-dimensional study drawn in the browser, and every measured quantity in the prose comes from the same model of the building.

## Posts

${posts}

## Topics

${getTags()
  .map(({ tag, count }) => `- [${tag}](${SITE}/tags/${tag}): ${count} ${count === 1 ? "post" : "posts"}`)
  .join("\n")}

## Machine-readable

- [RSS feed](${SITE}/feed.xml)
- [Search index](${SITE}/search.json): titles, standfirsts, topics and full text as JSON
- [Sitemap](${SITE}/sitemap.xml)
`
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
