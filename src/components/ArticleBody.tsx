import dynamic from "next/dynamic"

import { Dim } from "@/components/sheet/Dim"
import { Dimension } from "@/components/sheet/Datum"
import { splitQuantities } from "@/lib/quantities"
import type { Block } from "@/data/bodies"

const SectionStudy = dynamic(() =>
  import("@/components/three/SectionStudy").then((m) => m.SectionStudy),
)
const ElevationPlate = dynamic(() =>
  import("@/components/three/plates/ElevationPlate").then((m) => m.ElevationPlate),
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
    <div className="prose-fig max-w-[62ch]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h":
            return (
              <section key={i} className="mt-14">
                <span aria-hidden="true" className="bg-rule-strong draw-x block h-px w-full origin-left" />
                <h2 className="mt-4 mb-5 text-2xl font-medium text-balance">
                  <Prose text={block.text} />
                </h2>
              </section>
            )

          case "pull":
            return (
              <figure key={i} className="my-12">
                <span aria-hidden="true" className="bg-sun/60 draw-x block h-px w-2/3 origin-left" />
                <blockquote className="py-5">
                  <p className="text-xl text-balance">
                    <Prose text={block.text} />
                  </p>
                </blockquote>
                <span aria-hidden="true" className="bg-sun/25 draw-x block h-px w-1/3 origin-left" />
              </figure>
            )

          case "note":
            return (
              <aside key={i} className="mt-14">
                <span aria-hidden="true" className="bg-rule draw-x block h-px w-full origin-left" />
                <p className="text-fg-faint pt-4 text-sm">
                  <Prose text={block.text} />
                </p>
              </aside>
            )

          case "dimension":
            return <Dimension key={i} value={block.value} caption={<Prose text={block.caption} />} />

          case "figure": {
            const number = plates.indexOf(i) + 1
            return block.kind === "elevation" ? (
              <ElevationPlate key={i} plate={number} />
            ) : (
              <SectionStudy key={i} caption={<Prose text={block.caption} />} plate={number} />
            )
          }

          default:
            return (
              <p key={i} className="mb-6 text-lg text-pretty">
                <Prose text={block.text} />
              </p>
            )
        }
      })}
    </div>
  )
}

/**
 * Prose with its measured quantities set as figures rather than as words. splitQuantities throws
 * on an unknown marker at build time, so a typo in the copy fails the build instead of shipping
 * a literal marker into a paragraph.
 *
 * Every block that carries prose runs through this, not only body paragraphs. When only the
 * default case did, a quantity written into a pull quote or a plate caption rendered as its own
 * raw marker — the build-time guard protected the one place a marker was least likely to be
 * wrong and left the rest open.
 */
function Prose({ text }: { text: string }) {
  return (
    <>
      {splitQuantities(text).map((part, i) =>
        i % 2 === 0 ? part : <Dim key={i} name={part as never} />,
      )}
    </>
  )
}
