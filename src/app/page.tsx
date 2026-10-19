import dynamic from "next/dynamic"

import { ArticleIndex } from "@/components/ArticleIndex"
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
          {/* The cover line sits in the scene's sky, not above it in a separate band. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 p-6 sm:p-10">
            <h1 className="font-sans text-cover max-w-[16ch] font-medium">{ISSUE.coverLine}</h1>
          </div>
        </div>

        <div className="border-rule grid gap-x-10 gap-y-4 border-b px-6 py-6 sm:px-10 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <p className="mark">
            Issue {ISSUE.number} · {ISSUE.season} · {ISSUE.theme}
          </p>
          <p className="text-fg-muted max-w-[62ch] text-lg text-pretty">{ISSUE.coverNote}</p>
        </div>
      </section>

      <ArticleIndex />

      <footer className="border-rule mt-auto border-t px-6 py-10 sm:px-10">
        <p className="mark">
          Datum · a journal of architecture and the built environment · set in Geist
        </p>
      </footer>
    </>
  )
}
