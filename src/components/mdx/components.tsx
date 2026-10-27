import type { MDXComponents } from "mdx/types"
import Link from "next/link"
import type { ReactNode } from "react"

import { ArPlate } from "@/components/ar/ArPlate"
import { LazyPlate } from "@/components/mdx/LazyPlate"
import { ApproachSection } from "@/components/plates/ApproachSection"
import { LevelStack } from "@/components/plates/LevelStack"
import { OverhangSection } from "@/components/plates/OverhangSection"
import { PlinthSurvey } from "@/components/plates/PlinthSurvey"
import { ProgrammeStrip } from "@/components/plates/ProgrammeStrip"
import { Dim } from "@/components/sheet/Dim"
import { Dimension as DimensionLine } from "@/components/sheet/Datum"
import type { PlateKind } from "@/lib/plates"
import type { QuantityKey } from "@/lib/quantities"

/**
 * How the journal sets the tags an article is written with. Headings, pull quotes and the
 * closing note are introduced by a rule that draws itself across the measure — the one motion
 * this subject owns. Prose carries the measure; plates take the column.
 */

function Pull({ children }: { children: ReactNode }) {
  return (
    <figure className="clear-right my-12 max-w-[62ch]">
      <span aria-hidden="true" className="draw-x block h-px w-2/3 origin-left bg-sun/60" />
      <blockquote className="py-5">
        <p className="text-xl text-balance">{children}</p>
      </blockquote>
      <span aria-hidden="true" className="draw-x block h-px w-1/3 origin-left bg-sun/25" />
    </figure>
  )
}

// MDX attributes arrive as strings (see post-source.ts); the plates take numbers.
type PlateProps = { kind: PlateKind; number: string; refersTo?: string; cut?: string; children?: ReactNode }
const num = (value?: string) => (value === undefined ? undefined : Number(value))

/** The drawn plates are light SVG and ship in the page; only the WebGL ones wait to be reached. */
function Plate({ kind, number: n, refersTo, cut, children }: PlateProps) {
  const number = Number(n)
  switch (kind) {
    case "section":
    case "elevation":
      return (
        <LazyPlate kind={kind} number={number} refersTo={num(refersTo)} cut={num(cut)}>
          {children}
        </LazyPlate>
      )
    case "ar":
      return <ArPlate plate={number} />
    case "levels":
      return <LevelStack plate={number} />
    case "approach":
      return <ApproachSection plate={number} />
    case "programme":
      return <ProgrammeStrip plate={number} />
    case "overhang":
      return <OverhangSection plate={number} />
    case "survey":
      return <PlinthSurvey plate={number} />
  }
}

export const mdxComponents: MDXComponents = {
  p: ({ children }) => <p className="mb-6 max-w-[62ch] text-lg text-pretty text-fg-body">{children}</p>,
  h2: ({ children }) => (
    <section className="mt-14 max-w-[62ch]">
      <span aria-hidden="true" className="draw-x block h-px w-full origin-left bg-rule-strong" />
      <h2 className="mt-4 mb-5 text-2xl font-medium text-balance">{children}</h2>
    </section>
  ),
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link href={href} className="underline decoration-sun/60 underline-offset-4 hover:decoration-sun">
        {children}
      </Link>
    ) : (
      <a href={href} className="underline decoration-sun/60 underline-offset-4 hover:decoration-sun">
        {children}
      </a>
    ),
  ul: ({ children }) => <ul className="mb-6 max-w-[62ch] list-disc space-y-2 pl-6 text-lg text-fg-body">{children}</ul>,
  ol: ({ children }) => (
    <ol className="mb-6 max-w-[62ch] list-decimal space-y-2 pl-6 text-lg text-fg-body">{children}</ol>
  ),
  blockquote: ({ children }) => <Pull>{children}</Pull>,
  Pull,
  Aside: ({ children }: { children: ReactNode }) => <aside className="sidenote">{children}</aside>,
  Note: ({ children }: { children: ReactNode }) => (
    <aside className="mt-14 max-w-[62ch]">
      <span aria-hidden="true" className="draw-x block h-px w-full origin-left bg-rule" />
      <p className="pt-4 text-sm text-fg-faint">{children}</p>
    </aside>
  ),
  Dimension: ({ value, children }: { value: string; children: ReactNode }) => (
    <DimensionLine value={value} caption={children} />
  ),
  Q: ({ name, first }: { name: QuantityKey; first?: boolean }) => <Dim name={name} anchor={Boolean(first)} />,
  Plate,
}
