import { Subscribe } from "@/components/Subscribe"
import { TagList } from "@/components/TagList"
import { IssueSpread } from "@/components/home/IssueSpread"
import { IssueStats } from "@/components/home/IssueStats"
import { PlateRail } from "@/components/home/PlateRail"
import { CoverStage } from "@/components/three/CoverStage"
import { ISSUE } from "@/data/issue"
import { getPosts, getTags } from "@/lib/posts"

export default function Page() {
  const posts = getPosts()
  const tags = getTags()
  return (
    <main>
      <section className="relative">
        <div className="relative h-[clamp(26rem,74vh,46rem)] w-full overflow-hidden bg-bg-deep">
          <CoverStage />
          {/* The cover line sits in the sky, on the same sheet edge as everything else. */}
          <div className="pointer-events-none absolute inset-x-0 top-0">
            <div className="mx-auto w-full max-w-[94rem] px-6 py-6 sm:px-10 sm:py-10">
              <h1 className="max-w-[15ch] font-sans text-cover font-medium">{ISSUE.coverLine}</h1>
            </div>
          </div>
        </div>

        <div className="border-b border-rule">
          <div className="mx-auto grid w-full max-w-[94rem] gap-x-12 gap-y-4 px-6 py-7 sm:px-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            <p className="mark">
              Issue {ISSUE.number} · {ISSUE.season} · {ISSUE.theme}
            </p>
            <p className="prose-fig max-w-[62ch] text-lg text-pretty text-fg-muted">{ISSUE.coverNote}</p>
          </div>
        </div>
      </section>

      <IssueStats posts={posts} />

      <IssueSpread posts={posts} />

      <PlateRail posts={posts} />

      <section aria-labelledby="topics" className="border-t border-rule">
        <div className="mx-auto grid w-full max-w-[94rem] gap-x-12 gap-y-4 px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
          <h2 id="topics" className="mark">
            Topics
          </h2>
          <TagList tags={tags.map((t) => t.tag)} counts={Object.fromEntries(tags.map((t) => [t.tag, t.count]))} />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[94rem] px-6 sm:px-10">
        <Subscribe />
      </div>
    </main>
  )
}
