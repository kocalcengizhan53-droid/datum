import Link from "next/link"
import { ViewTransition } from "react"

import { PlateGlyph } from "@/components/sheet/PlateGlyph"
import { plateRegister } from "@/lib/plates"
import type { Post } from "@/lib/posts"

/**
 * The contents, as a drawing list: number and topic, title and standfirst, the first plate in
 * miniature, and the article's drawing register — the thing a reader scanning an issue of a
 * journal of drawings wants to know.
 */
export function ArticleIndex({ posts, label = "In this issue" }: { posts: readonly Post[]; label?: string }) {
  return (
    <section aria-label={label} className="mx-auto w-full max-w-[94rem] px-6 sm:px-10">
      <ol>
        {posts.map((article, index) => {
          const register = plateRegister(article.blocks)
          return (
            <li key={article.slug} className="border-b border-rule last:border-0">
              <Link
                href={`/${article.slug}`}
                className="group grid gap-x-12 gap-y-4 py-9 lg:grid-cols-[minmax(0,9rem)_minmax(0,34rem)_minmax(0,1fr)_minmax(0,17rem)]"
              >
                <div className="flex h-fit items-baseline gap-4">
                  <span className="instrument tnum">{String(index + 1).padStart(2, "0")}</span>
                  <span className="mark">{article.kicker}</span>
                </div>

                <div>
                  <ViewTransition name={`title-${article.slug}`} share="morph" default="none">
                    <h2 className="max-w-[15ch] text-4xl font-medium text-balance transition-colors duration-300 group-hover:text-sun-ink lg:text-5xl">
                      {article.title}
                    </h2>
                  </ViewTransition>
                  <p className="prose-fig mt-4 max-w-[44ch] text-lg text-pretty text-fg-muted">{article.standfirst}</p>
                  <p className="mark mt-4">
                    {article.author} · {article.minutes} min
                  </p>
                </div>

                <div className="hidden h-fit items-end lg:flex lg:justify-end">
                  {register.length ? (
                    <div className="w-[180px] opacity-80 transition-opacity duration-300 group-hover:opacity-100">
                      <PlateGlyph kind={register[0].kind} />
                    </div>
                  ) : null}
                </div>

                <div className="h-fit lg:border-l lg:border-rule lg:pl-6">
                  <p className="instrument flex items-baseline justify-between border-b border-rule-strong pb-2">
                    <span>Plates</span>
                    <span className="tnum">{String(register.length).padStart(2, "0")}</span>
                  </p>
                  <ol>
                    {register.map((plate, i) => (
                      <li key={plate.kind} className="flex items-baseline gap-3 border-b border-rule py-1.5">
                        <span className="instrument tnum shrink-0 text-sun-ink/70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-xs text-fg-faint transition-colors group-hover:text-fg-muted">
                          {plate.title}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <span
                    aria-hidden="true"
                    className="mt-2 block h-px w-0 bg-sun transition-[width] duration-500 ease-[var(--ease-out-expo)] group-hover:w-full"
                  />
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
