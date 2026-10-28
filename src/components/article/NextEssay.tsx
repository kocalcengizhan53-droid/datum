import Link from "next/link"

import { PlateGlyph } from "@/components/sheet/PlateGlyph"
import { plateRegister } from "@/lib/plates"
import type { Post } from "@/lib/posts"

/**
 * The end of an essay as the turn of a page: where this one sits in the issue, and the next
 * essay laid out large enough to want, with its first drawing on squared paper.
 */
export function NextEssay({ next, index, total }: { next: Post; index: number; total: number }) {
  const plate = plateRegister(next.blocks)[0]
  return (
    <nav aria-label="Next in this issue" className="border-t border-rule py-12">
      <div className="mb-6 flex items-center gap-4">
        <p className="mark">
          Essay {index + 1} of {total} read
        </p>
        <ol aria-hidden="true" className="flex gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <li key={i} className={`h-1 w-6 ${i <= index ? "bg-sun" : "bg-rule-strong"}`} />
          ))}
        </ol>
      </div>
      <Link
        href={`/${next.slug}`}
        className="group grid overflow-hidden border border-rule transition-colors hover:border-sun/70 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]"
      >
        <div className="flex flex-col gap-4 p-8">
          <p className="mark">Next · {next.kicker}</p>
          <p className="max-w-[18ch] font-sans text-4xl font-medium text-balance transition-colors group-hover:text-sun-ink">{next.title}</p>
          <p className="prose-fig max-w-[46ch] text-pretty text-fg-muted">{next.standfirst}</p>
          <span className="instrument mt-auto inline-flex items-center gap-3 pt-4 text-fg">
            Turn the page
            <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </span>
        </div>
        <div className="sheet-grid grid min-h-56 place-items-center border-t border-rule p-10 md:border-t-0 md:border-l">
          <div className="wipe w-full max-w-[22rem] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
            {plate ? <PlateGlyph kind={plate.kind} /> : null}
          </div>
        </div>
      </Link>
    </nav>
  )
}
