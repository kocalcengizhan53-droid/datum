import dynamic from "next/dynamic"

import { ArticleIndex } from "@/components/ArticleIndex"
import { Colophon } from "@/components/Colophon"
import { Masthead } from "@/components/Masthead"
import { ISSUE } from "@/data/issue"

// The scene is the heaviest thing on the page and it cannot render on the server anyway, so it
// is split out and the cover reserves its space rather than collapsing while it arrives.
const LightStudy = dynamic(() =>
  import("@/components/three/LightStudy").then((m) => m.LightStudy),
)

export default function Page() {
  return (
    <>
      <Masthead />

      <section className="relative">
        <div className="bg-bg-deep relative h-[clamp(26rem,74vh,46rem)] w-full overflow-hidden">
          <LightStudy />
          {/*
            The cover line sits in the scene's sky, not above it in a separate band — and on
            the same sheet edge as everything else. The image bleeds to the viewport; the type
            does not. Left full-bleed, the headline started at x=40 while the masthead above it
            started at 248 on a wide screen, and the step between the two largest things on the
            page was the first thing the eye caught.
          */}
          <div className="pointer-events-none absolute inset-x-0 top-0">
            <div className="mx-auto w-full max-w-[94rem] px-6 py-6 sm:px-10 sm:py-10">
              <h1 className="font-sans text-cover max-w-[15ch] font-medium">{ISSUE.coverLine}</h1>
            </div>
          </div>
        </div>

        <div className="border-rule border-b">
          <div className="mx-auto grid w-full max-w-[94rem] gap-x-12 gap-y-4 px-6 py-7 sm:px-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            <p className="mark">
              Issue {ISSUE.number} · {ISSUE.season} · {ISSUE.theme}
            </p>
            <p className="text-fg-muted prose-fig max-w-[62ch] text-lg text-pretty">
              {ISSUE.coverNote}
            </p>
          </div>
        </div>
      </section>

      <ArticleIndex />

      <Colophon />
    </>
  )
}
