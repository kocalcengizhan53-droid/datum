import { getPosts } from "@/lib/posts"

export const dynamic = "force-static"

/** The search index the ⌘K box fetches on first use: metadata and the full plain text. */
export function GET() {
  return Response.json(
    getPosts().map(({ slug, title, kicker, standfirst, author, tags, text }) => ({
      slug,
      title,
      kicker,
      standfirst,
      author,
      tags,
      text,
    })),
  )
}
