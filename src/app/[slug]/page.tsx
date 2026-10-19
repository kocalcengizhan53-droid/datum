import { notFound } from "next/navigation"
import Link from "next/link"
import { ViewTransition } from "react"

import { ArticleBody } from "@/components/ArticleBody"
import { Datum } from "@/components/sheet/Datum"
import { Masthead } from "@/components/Masthead"
import { ReadingProgress } from "@/components/ReadingProgress"
import { BODIES } from "@/data/bodies"
import { ARTICLES, readingMinutes } from "@/data/issue"

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }))
}

export default async function ArticlePage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params
  const article = ARTICLES.find((a) => a.slug === slug)
  const body = BODIES[slug]
  if (!article || !body) notFound()

  const index = ARTICLES.indexOf(article)
  const next = ARTICLES[(index + 1) % ARTICLES.length]

  return (
    <>
      <ReadingProgress />
      <Masthead />

      <article className="px-6 sm:px-10">
        {/* The sheet declares its level before anything is dimensioned from it. */}
        <div className="pt-6">
          <Datum note={`plate set · issue ${String(14)}`} />
        </div>

        <header className="border-rule grid gap-x-10 gap-y-6 border-b py-12 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="flex h-fit items-baseline gap-4">
            <span className="instrument tnum">{String(index + 1).padStart(2, "0")}</span>
            <span className="mark">{article.kicker}</span>
          </div>
          <div className="max-w-[24ch]">
            {/*
              The same name as the index card, so React pairs them and the browser moves one
              object between the two pages instead of crossfading two. `default="none"` keeps it
              from animating on every unrelated transition, and the explicit share is required
              alongside it or the pair silently stops morphing.
            */}
            <ViewTransition name={`title-${article.slug}`} share="morph" default="none">
              <h1 className="text-4xl font-medium text-balance">{article.title}</h1>
            </ViewTransition>
          </div>
        </header>

        <div className="grid gap-x-10 py-12 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <aside className="mb-8 h-fit md:sticky md:top-10 md:mb-0">
            <p className="mark">{article.author}</p>
            <p className="mark mt-1 tnum">
              {readingMinutes(article.slug)} min · {article.published}
            </p>
            <p className="text-fg-muted prose-fig mt-6 max-w-[34ch] text-base text-pretty">
              {article.standfirst}
            </p>
          </aside>

          <ArticleBody blocks={body} />
        </div>

        <nav className="border-rule border-t py-10">
          <Link href={`/${next.slug}`} className="group block">
            <p className="mark">Next in this issue</p>
            <p className="mt-2 text-2xl font-medium">
              <span className="group-hover:text-sun-ink transition-colors">{next.title}</span>
              <span aria-hidden="true" className="text-fg-faint ml-3 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </p>
          </Link>
          <Link href="/" className="mark mt-8 inline-block hover:text-fg">
            ← Back to the issue
          </Link>
        </nav>
      </article>
    </>
  )
}
