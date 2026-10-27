import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"

import { ArticleIndex } from "@/components/ArticleIndex"
import { getPosts, getTags } from "@/lib/posts"

export function generateStaticParams() {
  return getTags().map(({ tag }) => ({ tag }))
}

export async function generateMetadata({ params }: PageProps<"/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params
  return {
    title: `${tag} — Datum`,
    description: `Every piece in Datum filed under ${tag}.`,
  }
}

export default async function TagPage({ params }: PageProps<"/tags/[tag]">) {
  const { tag } = await params
  const posts = getPosts().filter((p) => p.tags.includes(tag))
  if (!posts.length) notFound()
  return (
    <main>
      <div className="border-b border-rule">
        <div className="mx-auto w-full max-w-[94rem] px-6 py-12 sm:px-10">
          <Link href="/tags" className="mark hover:text-fg">
            ← All topics
          </Link>
          <h1 className="mt-4 text-5xl font-medium">{tag}</h1>
          <p className="prose-fig mt-3 text-lg text-fg-muted">
            {posts.length} {posts.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </div>
      <ArticleIndex posts={posts} label={`Filed under ${tag}`} />
    </main>
  )
}
