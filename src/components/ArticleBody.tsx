import dynamic from "next/dynamic"

import { Dimension } from "@/components/sheet/Datum"
import type { Block } from "@/data/bodies"

const SectionStudy = dynamic(() =>
  import("@/components/three/SectionStudy").then((m) => m.SectionStudy),
)

/**
 * The body, set as a sheet rather than wrapped in an effect.
 *
 * Nothing here animates the prose. Headings, pull quotes and the closing note are introduced by
 * a rule that draws itself across the measure, which is how a drawing is annotated and the one
 * motion this subject actually owns. Text that never changes opacity also cannot be left
 * invisible, which the previous fade-up wrapper risked by construction.
 */
export function ArticleBody({ blocks }: { blocks: readonly Block[] }) {
  // Derived, not accumulated: a counter incremented inside the map is a local reassigned after
  // render, which the React Compiler rejects and which would give a different answer if the list
  // were ever rendered twice.
  const plates = blocks.flatMap((block, i) => (block.type === "figure" ? [i] : []))

  return (
    <div className="max-w-[62ch]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h":
            return (
              <section key={i} className="mt-14">
                <span aria-hidden="true" className="bg-rule-strong draw-x block h-px w-full origin-left" />
                <h2 className="mt-4 mb-5 text-2xl font-medium text-balance">{block.text}</h2>
              </section>
            )

          case "pull":
            return (
              <figure key={i} className="my-12">
                <span aria-hidden="true" className="bg-sun/60 draw-x block h-px w-2/3 origin-left" />
                <blockquote className="py-5">
                  <p className="text-xl text-balance">{block.text}</p>
                </blockquote>
                <span aria-hidden="true" className="bg-sun/25 draw-x block h-px w-1/3 origin-left" />
              </figure>
            )

          case "note":
            return (
              <aside key={i} className="mt-14">
                <span aria-hidden="true" className="bg-rule draw-x block h-px w-full origin-left" />
                <p className="text-fg-faint pt-4 text-sm">{block.text}</p>
              </aside>
            )

          case "dimension":
            return <Dimension key={i} value={block.value} caption={block.caption} />

          case "figure":
            return (
              <SectionStudy key={i} caption={block.caption} plate={plates.indexOf(i) + 1} />
            )

          default:
            return (
              <p key={i} className="mb-6 text-lg text-pretty">
                {block.text}
              </p>
            )
        }
      })}
    </div>
  )
}
