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
const ArPlate = dynamic(() => import("@/components/ar/ArPlate").then((m) => m.ArPlate))
const LevelStack = dynamic(() => import("@/components/plates/LevelStack").then((m) => m.LevelStack))
const ApproachSection = dynamic(() =>
  import("@/components/plates/ApproachSection").then((m) => m.ApproachSection),
)
const ProgrammeStrip = dynamic(() =>
  import("@/components/plates/ProgrammeStrip").then((m) => m.ProgrammeStrip),
)
const OverhangSection = dynamic(() =>
  import("@/components/plates/OverhangSection").then((m) => m.OverhangSection),
)
const PlinthSurvey = dynamic(() =>
  import("@/components/plates/PlinthSurvey").then((m) => m.PlinthSurvey),
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
  const PLATE_TYPES = new Set(["figure", "levels", "approach", "programme", "overhang", "survey"])
  const plates = blocks.flatMap((block, i) => (PLATE_TYPES.has(block.type) ? [i] : []))

  // The elevation's caption points at the section. Derived here, where the numbering is, so a
  // reordered figure list moves the reference with it instead of leaving it pointing at
  // whatever is now in second place.
  const sectionIndex = blocks.findIndex((b) => b.type === "figure" && b.kind === "section")
  const sectionPlate = plates.indexOf(sectionIndex) + 1

  /*
   * Where each quantity is first stated, so exactly one <Dim> per key carries the id the
   * gutter's schedule links to. Computed here rather than tracked with a mutable set during
   * render, which would give a different answer the second time the list rendered.
   */
  const firstDim: Record<string, string> = {}
  blocks.forEach((block, bi) => {
    const fields = ("text" in block ? [block.text] : []).concat(
      "caption" in block ? [block.caption] : [],
    )
    fields.forEach((field, fi) => {
      splitQuantities(field).forEach((part, pi) => {
        if (pi % 2 === 1 && !(part in firstDim)) firstDim[part as string] = `${bi}:${fi}:${pi}`
      })
    })
  })

  /*
   * The measure belongs to the text, not to the container.
   *
   * Capping the whole body at 62ch capped the plates too, so a drawing of a building got the
   * same width as a sentence about it — about 700px in a column that had more to give. Here
   * each prose block carries the measure and the figures take the column, which is how a page
   * with figures on it is actually set.
   */
  /*
   * Capped at the measure plus one margin column. Uncapped, a floated sidenote went to the far
   * right of a 1fr track and sat 290px clear of the sentence it annotates, which reads as two
   * unrelated columns rather than as a note in a margin.
   */
  return (
    <div className="prose-fig max-w-[56rem]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h":
            return (
              <section key={i} className="mt-14 max-w-[62ch]">
                <span aria-hidden="true" className="bg-rule-strong draw-x block h-px w-full origin-left" />
                <h2 className="mt-4 mb-5 text-2xl font-medium text-balance">
                  <Prose text={block.text} at={`${i}:0`} firstDim={firstDim} />
                </h2>
              </section>
            )

          case "pull":
            return (
              <figure key={i} className="my-12 max-w-[62ch]">
                <span aria-hidden="true" className="bg-sun/60 draw-x block h-px w-2/3 origin-left" />
                <blockquote className="py-5">
                  <p className="text-xl text-balance">
                    <Prose text={block.text} at={`${i}:0`} firstDim={firstDim} />
                  </p>
                </blockquote>
                <span aria-hidden="true" className="bg-sun/25 draw-x block h-px w-1/3 origin-left" />
              </figure>
            )

          case "aside":
            return (
              <aside key={i} className="sidenote">
                <Prose text={block.text} at={`${i}:0`} firstDim={firstDim} />
              </aside>
            )

          case "note":
            return (
              <aside key={i} className="mt-14 max-w-[62ch]">
                <span aria-hidden="true" className="bg-rule draw-x block h-px w-full origin-left" />
                <p className="text-fg-faint pt-4 text-sm">
                  <Prose text={block.text} at={`${i}:0`} firstDim={firstDim} />
                </p>
              </aside>
            )

          case "levels":
            return <LevelStack key={i} plate={plates.indexOf(i) + 1} />

          case "approach":
            return <ApproachSection key={i} plate={plates.indexOf(i) + 1} />

          case "programme":
            return <ProgrammeStrip key={i} plate={plates.indexOf(i) + 1} />

          case "overhang":
            return <OverhangSection key={i} plate={plates.indexOf(i) + 1} />

          case "survey":
            return <PlinthSurvey key={i} plate={plates.indexOf(i) + 1} />

          case "dimension":
            return <Dimension key={i} value={block.value} caption={<Prose text={block.caption} at={`${i}:${"text" in block ? 1 : 0}`} firstDim={firstDim} />} />

          case "figure": {
            const number = plates.indexOf(i) + 1
            if (block.kind === "elevation")
              return <ElevationPlate key={i} plate={number} refersTo={sectionPlate} />
            if (block.kind === "ar") return <ArPlate key={i} plate={number} />
            return <SectionStudy key={i} caption={<Prose text={block.caption} at={`${i}:${"text" in block ? 1 : 0}`} firstDim={firstDim} />} plate={number} />
          }

          default: {
            // The first paragraph of the article, wherever it happens to sit in the array.
            const isLead = i === blocks.findIndex((b) => b.type === "p")
            return (
              <p
                key={i}
                className={`mb-6 max-w-[62ch] text-pretty ${isLead ? "lead" : "text-lg"}`}
              >
                <Prose text={block.text} at={`${i}:0`} firstDim={firstDim} />
              </p>
            )
          }
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
function Prose({
  text,
  at,
  firstDim,
}: {
  text: string
  /** "<block>:<field>" — identifies this run of prose so the first Dim can be found again. */
  at?: string
  firstDim?: Record<string, string>
}) {
  return (
    <>
      {splitQuantities(text).map((part, i) =>
        i % 2 === 0 ? (
          part
        ) : (
          <Dim key={i} name={part as never} anchor={firstDim?.[part as string] === `${at}:${i}`} />
        ),
      )}
    </>
  )
}
