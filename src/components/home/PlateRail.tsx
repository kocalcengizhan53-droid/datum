import Link from "next/link"

import { Rail } from "@/components/home/Rail"
import { PlateGlyph } from "@/components/sheet/PlateGlyph"
import { plateRegister } from "@/lib/plates"
import type { Post } from "@/lib/posts"

/**
 * Every drawing in the issue on one rail, each opening its essay at the plate itself. A reader
 * who came for the drawings — most of this journal's readers — can start from the one that
 * catches them instead of from the first paragraph.
 */
export function PlateRail({ posts }: { posts: readonly Post[] }) {
  const plates = posts.flatMap((post, essay) =>
    plateRegister(post.blocks).map((plate, i) => ({ ...plate, post, essay: essay + 1, number: i + 1 })),
  )
  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <section aria-labelledby="plates" className="border-t border-rule">
      <div className="mx-auto w-full max-w-[94rem] px-6 py-12 sm:px-10">
        <div className="mb-2 flex flex-col gap-2">
          <h2 id="plates" className="mark">
            Every plate in the issue
          </h2>
          <p className="max-w-[52ch] text-2xl font-medium text-balance">
            {plates.length} drawings, each drawn from the numbers its essay argues with.
          </p>
        </div>
        <Rail label="plates in this issue">
          {plates.map((plate) => (
            <li key={`${plate.post.slug}-${plate.number}`} className="w-[78vw] max-w-[22rem] shrink-0 snap-start">
              <Link href={`/${plate.post.slug}#plate-${plate.number}`} className="group flex h-full flex-col border border-rule transition-colors hover:border-sun/70">
                <div className="sheet-grid grid aspect-[4/3] place-items-center px-6">
                  <div className="w-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.05]">
                    <PlateGlyph kind={plate.kind} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 border-t border-rule p-5">
                  <p className="instrument tnum text-sun-ink/80">
                    Essay {pad(plate.essay)} · plate {pad(plate.number)}
                  </p>
                  <p className="font-medium text-pretty">{plate.title}</p>
                  <p className="mt-auto text-sm text-fg-faint transition-colors group-hover:text-fg-muted">{plate.post.title} →</p>
                </div>
              </Link>
            </li>
          ))}
        </Rail>
      </div>
    </section>
  )
}
