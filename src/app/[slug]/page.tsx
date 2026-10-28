import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ViewTransition } from "react"

import { ArticleContents } from "@/components/article/ArticleContents"
import { NextEssay } from "@/components/article/NextEssay"
import { ArticleMdx } from "@/components/mdx/ArticleMdx"
import { ReadingProgress } from "@/components/ReadingProgress"
import { Subscribe } from "@/components/Subscribe"
import { TagList } from "@/components/TagList"
import { Datum } from "@/components/sheet/Datum"
import { TitleBlock } from "@/components/sheet/TitleBlock"
import { ISSUE } from "@/data/issue"
import { plateRegister } from "@/lib/plates"
import { SITE, getPost, getPosts, related } from "@/lib/posts"
import { sectionsOf } from "@/lib/sections"

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
  const sections = sectionsOf(post.source)
  const figures = [
    ["Reading", `${post.minutes} min`],
    ["Plates", String(plateRegister(post.blocks).length).padStart(2, "0")],
    ["Sections", String(sections.length).padStart(2, "0")],
    ["Published", new Date(post.published).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })],
  ] as const

  return (
    <>
      <ReadingProgress />

      {/* A bounded sheet: title block, the measure, and a margin the sidenotes can occupy. */}
      <main>
        <article className="mx-auto w-full max-w-[94rem] px-6 sm:px-10">
          <div className="pt-6">
            <Datum note={`plate set · issue ${ISSUE.number}`} />
          </div>

          <header className="grid grid-cols-1 gap-x-12 gap-y-6 border-b border-rule py-12 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
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
              <dl className="mt-8 grid max-w-[46rem] grid-cols-2 border-t border-rule sm:grid-cols-4">
                {figures.map(([label, value], i) => (
                  <div key={label} className={`flex flex-col gap-1 py-4 ${i % 2 ? "border-l border-rule pl-4" : ""} ${i === 2 ? "sm:border-l sm:pl-4" : ""}`}>
                    <dt className="instrument">{label}</dt>
                    <dd className="tnum font-mono text-sm text-fg">{value}</dd>
                  </div>
                ))}
              </dl>
              <TagList tags={post.tags} className="mt-6" />
              {/* On a phone the sections come first, as a row of jumps; on a wide sheet they sit in the gutter. */}
              <ol aria-label="Sections" className="rail mt-6 flex gap-2 overflow-x-auto lg:hidden">
                {sections.map((section, i) => (
                  <li key={section.id} className="shrink-0">
                    <a href={`#${section.id}`} className="instrument inline-flex gap-2 border border-rule px-3 py-2 text-fg-muted">
                      <span className="tnum text-sun-ink/80">{String(i + 1).padStart(2, "0")}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </header>

          <div data-essay className="grid gap-x-12 py-12 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            {/* Reference material: beside the text on a wide sheet, after it on a phone. */}
            <aside className="order-last mt-10 h-fit border-t border-rule pt-10 lg:sticky lg:top-10 lg:order-none lg:mt-0 lg:border-t-0 lg:pt-0">
              <div className="mb-10 hidden lg:block">
                <ArticleContents sections={sections} minutes={post.minutes} />
              </div>
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

          <NextEssay next={next} index={index} total={posts.length} />
          <Link href="/" className="mark mb-12 inline-block hover:text-fg">
            ← Back to the issue
          </Link>
        </article>
      </main>
    </>
  )
}
