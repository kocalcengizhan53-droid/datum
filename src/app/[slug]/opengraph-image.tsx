import { ISSUE } from "@/data/issue"
import { ogCard } from "@/lib/og-card"
import { getPost, getPosts } from "@/lib/posts"

export const dynamic = "force-static"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "The article's title on the journal's dark sheet, beside a drawn elevation"

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug)!
  return ogCard({
    kicker: post.kicker,
    title: post.title,
    foot: `${post.author} · ${post.minutes} min · Issue ${ISSUE.number}, ${ISSUE.theme}`,
  })
}
