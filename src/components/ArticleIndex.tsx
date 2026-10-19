import Link from "next/link"
import { ViewTransition } from "react"

import { ARTICLES, readingMinutes } from "@/data/issue"

export function ArticleIndex() {
  return (
    <section aria-label="In this issue" className="px-6 sm:px-10">
      <ol>
        {ARTICLES.map((article, index) => (
          <li key={article.slug} className="border-rule border-b last:border-0">
            <Link
                href={`/${article.slug}`}
                className="group grid gap-x-10 gap-y-3 py-8 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
            >
                <div className="flex h-fit items-baseline gap-4">
                  <span className="instrument tnum">{String(index + 1).padStart(2, "0")}</span>
                  <span className="mark">{article.kicker}</span>
                  {/* A rule that draws itself on hover, left to right. */}
                  <span
                    aria-hidden="true"
                    className="bg-sun ml-auto hidden h-px w-0 self-center transition-[width] duration-500 ease-[var(--ease-out-expo)] group-hover:w-24 md:block"
                  />
                </div>
                <div className="max-w-[62ch]">
                  <ViewTransition name={`title-${article.slug}`} share="morph" default="none">
                    <h2 className="group-hover:text-sun-ink text-3xl font-medium text-balance transition-colors duration-300">
                      {article.title}
                    </h2>
                  </ViewTransition>
                  <p className="text-fg-muted prose-fig mt-3 text-lg text-pretty">{article.standfirst}</p>
                  <p className="mark mt-4">
                    {article.author} · {readingMinutes(article.slug)} min
                  </p>
                </div>
              </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
