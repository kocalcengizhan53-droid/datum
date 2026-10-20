import Link from "next/link"
import { ViewTransition } from "react"

import { BODIES } from "@/data/bodies"
import { ARTICLES, readingMinutes } from "@/data/issue"
import { PlateGlyph } from "@/components/sheet/PlateGlyph"
import { plateRegister } from "@/lib/plates"

/**
 * The contents, as a drawing list.
 *
 * Each row was a number, a title and a standfirst inside a 62ch cap, with the right half of
 * the page left black — the same emptiness as the article pages and for the same reason. A
 * contents page in a journal of drawings should say which drawings are in each piece, so the
 * third column is that article's register, derived from its own blocks. It fills the row with
 * the one thing a reader scanning an issue actually wants to know.
 */
export function ArticleIndex() {
  return (
    <section aria-label="In this issue" className="mx-auto w-full max-w-[94rem] px-6 sm:px-10">
      <ol>
        {ARTICLES.map((article, index) => {
          const register = plateRegister(BODIES[article.slug] ?? [])
          return (
            <li key={article.slug} className="border-rule border-b last:border-0">
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
                    <h2 className="group-hover:text-sun-ink max-w-[15ch] text-4xl font-medium text-balance transition-colors duration-300 lg:text-5xl">
                      {article.title}
                    </h2>
                  </ViewTransition>
                  <p className="text-fg-muted prose-fig mt-4 max-w-[44ch] text-lg text-pretty">
                    {article.standfirst}
                  </p>
                  <p className="mark mt-4">
                    {article.author} · {readingMinutes(article.slug)} min
                  </p>
                </div>

                {/*
                  The first plate, in miniature. The register below says what the drawings are
                  called; this says what they look like, which is the question a reader
                  scanning an issue is actually asking.
                */}
                <div className="hidden h-fit items-end lg:flex lg:justify-end">
                  {register.length ? (
                    <div className="w-[180px] opacity-80 transition-opacity duration-300 group-hover:opacity-100">
                      <PlateGlyph kind={register[0].kind} />
                    </div>
                  ) : null}
                </div>

                <div className="lg:border-rule h-fit lg:border-l lg:pl-6">
                  <p className="instrument border-rule-strong flex items-baseline justify-between border-b pb-2">
                    <span>Plates</span>
                    <span className="tnum">{String(register.length).padStart(2, "0")}</span>
                  </p>
                  <ol>
                    {register.map((plate, i) => (
                      <li key={plate.kind} className="border-rule flex items-baseline gap-3 border-b py-1.5">
                        <span className="instrument tnum text-sun-ink/70 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {/* The register is read on the way past, not clicked: the whole row is
                            already one link to the article the plates are in. */}
                        <span className="text-fg-faint group-hover:text-fg-muted text-xs transition-colors">
                          {plate.title}
                        </span>
                      </li>
                    ))}
                  </ol>
                  {/* The rule that draws itself on hover, moved here where it terminates the
                      register rather than floating in an empty column. */}
                  <span
                    aria-hidden="true"
                    className="bg-sun mt-2 block h-px w-0 transition-[width] duration-500 ease-[var(--ease-out-expo)] group-hover:w-full"
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
