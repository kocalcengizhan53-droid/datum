import { notFound } from "next/navigation"
import Link from "next/link"
import { ViewTransition } from "react"

import { ArticleBody } from "@/components/ArticleBody"
import { Datum } from "@/components/sheet/Datum"
import { Colophon } from "@/components/Colophon"
import { Masthead } from "@/components/Masthead"
import { ReadingProgress } from "@/components/ReadingProgress"
import { TitleBlock } from "@/components/sheet/TitleBlock"
import { BODIES } from "@/data/bodies"
import { ARTICLES, ISSUE, readingMinutes } from "@/data/issue"

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
  const minutes = readingMinutes(article.slug)

  return (
    <>
      <ReadingProgress />
      <Masthead />

      {/*
        The page is a sheet, and a sheet has edges.

        This was a 22rem column of grey and a 62ch measure, both pinned left, which left 58% of
        a wide screen as empty black — the article was a strip of prose with nothing on the page
        around it. The spread is bounded and centred now, so the space outside it reads as the
        margin of a sheet rather than as a layout that ran out. Inside, three columns: the title
        block, the measure, and a margin the sidenotes can occupy.
      */}
      <article className="mx-auto w-full max-w-[94rem] px-6 sm:px-10">
        {/* The sheet declares its level before anything is dimensioned from it. */}
        <div className="pt-6">
          <Datum note={`plate set · issue ${ISSUE.number}`} />
        </div>

        <header className="border-rule grid gap-x-12 gap-y-6 border-b py-12 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
          <div className="flex h-fit items-baseline gap-4">
            <span className="instrument tnum">{String(index + 1).padStart(2, "0")}</span>
            <span className="mark">{article.kicker}</span>
          </div>
          <div>
            {/*
              The same name as the index card, so React pairs them and the browser moves one
              object between the two pages instead of crossfading two. `default="none"` keeps it
              from animating on every unrelated transition, and the explicit share is required
              alongside it or the pair silently stops morphing.
            */}
            <ViewTransition name={`title-${article.slug}`} share="morph" default="none">
              <h1 className="max-w-[18ch] text-5xl font-medium text-balance lg:text-6xl">
                {article.title}
              </h1>
            </ViewTransition>
            {/*
              The standfirst belongs in the measure, at the head of the thing it introduces,
              rather than as a third line of grey off to one side. Set larger than the body and
              against a rule, which is how a magazine marks the difference between the piece and
              the sentence that sells it.
            */}
            <p className="border-rule prose-fig text-fg-muted mt-8 max-w-[46ch] border-t pt-6 text-xl text-pretty">
              {article.standfirst}
            </p>
          </div>
        </header>

        <div className="grid gap-x-12 py-12 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
          <aside className="border-rule mb-10 h-fit border-b pb-10 lg:sticky lg:top-10 lg:mb-0 lg:border-b-0 lg:pb-0">
            <TitleBlock
              article={article}
              blocks={body}
              index={index + 1}
              total={ARTICLES.length}
              minutes={minutes}
              issue={ISSUE}
            />
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

      <Colophon />
    </>
  )
}
