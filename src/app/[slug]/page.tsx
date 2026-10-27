import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ViewTransition } from "react"

import { ArticleMdx } from "@/components/mdx/ArticleMdx"
import { ReadingProgress } from "@/components/ReadingProgress"
import { Subscribe } from "@/components/Subscribe"
import { TagList } from "@/components/TagList"
import { Datum } from "@/components/sheet/Datum"
import { TitleBlock } from "@/components/sheet/TitleBlock"
import { ISSUE } from "@/data/issue"
import { SITE, getPost, getPosts, related } from "@/lib/posts"

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug)
  if (!post) return {}
  return {
    title: `${post.title} — Datum`,
    description: post.standfirst,
    alternates: {
      canonical: `${SITE}/${post.slug}`,
      types: { "application/rss+xml": "/feed.xml" },
    },
    openGraph: {
      type: "article",
      siteName: "Datum",
      title: post.title,
      description: post.standfirst,
      publishedTime: post.published,
      authors: [post.author],
      tags: post.tags,
    },
  }
}

export default async function ArticlePage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const posts = getPosts()
  const index = posts.indexOf(post)
  const next = posts[(index + 1) % posts.length]
  const more = related(post)

  return (
    <>
      <ReadingProgress />

      {/* A bounded sheet: title block, the measure, and a margin the sidenotes can occupy. */}
      <main>
        <article className="mx-auto w-full max-w-[94rem] px-6 sm:px-10">
          <div className="pt-6">
            <Datum note={`plate set · issue ${ISSUE.number}`} />
          </div>

          <header className="grid gap-x-12 gap-y-6 border-b border-rule py-12 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            <div className="flex h-fit items-baseline gap-4">
              <span className="instrument tnum">{String(index + 1).padStart(2, "0")}</span>
              <span className="mark">{post.kicker}</span>
            </div>
            <div>
              {/* Shares a name with the index card, so the title moves between the two pages. */}
              <ViewTransition name={`title-${post.slug}`} share="morph" default="none">
                <h1 className="max-w-[18ch] text-5xl font-medium text-balance lg:text-6xl">{post.title}</h1>
              </ViewTransition>
              <p className="prose-fig mt-8 max-w-[46ch] border-t border-rule pt-6 text-xl text-pretty text-fg-muted">
                {post.standfirst}
              </p>
              <TagList tags={post.tags} className="mt-6" />
            </div>
          </header>

          <div className="grid gap-x-12 py-12 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            {/* Reference material: beside the text on a wide sheet, after it on a phone. */}
            <aside className="order-last mt-10 h-fit border-t border-rule pt-10 lg:sticky lg:top-10 lg:order-none lg:mt-0 lg:border-t-0 lg:pt-0">
              <TitleBlock
                article={post}
                blocks={post.blocks}
                index={index + 1}
                total={posts.length}
                minutes={post.minutes}
                issue={ISSUE}
              />
            </aside>

            <ArticleMdx source={post.source} />
          </div>

          <section aria-labelledby="related" className="border-t border-rule py-10">
            <h2 id="related" className="mark">
              Read next
            </h2>
            <ul className="mt-4 grid gap-6 md:grid-cols-2">
              {more.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}`} className="group block">
                    <p className="mark">{p.kicker}</p>
                    <p className="mt-2 text-2xl font-medium transition-colors group-hover:text-sun-ink">{p.title}</p>
                    <p className="prose-fig mt-2 max-w-[48ch] text-pretty text-fg-muted">{p.standfirst}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <Subscribe />

          <nav aria-label="More from the issue" className="border-t border-rule py-10">
            <Link href={`/${next.slug}`} className="group block">
              <p className="mark">Next in this issue</p>
              <p className="mt-2 text-2xl font-medium">
                <span className="transition-colors group-hover:text-sun-ink">{next.title}</span>
                <span
                  aria-hidden="true"
                  className="ml-3 inline-block text-fg-faint transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </p>
            </Link>
            <Link href="/" className="mark mt-8 inline-block hover:text-fg">
              ← Back to the issue
            </Link>
          </nav>
        </article>
      </main>
    </>
  )
}
