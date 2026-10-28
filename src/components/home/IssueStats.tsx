import { plateRegister } from "@/lib/plates"
import type { Post } from "@/lib/posts"
import { SURVEY } from "@/lib/survey"

/**
 * The issue in four figures, each counted from the content rather than typed: essays, plates,
 * minutes of reading, and the buildings the survey plate measured. The figure is real text; the
 * count-up is a picture of it drawn in CSS, so a reader without the animation loses nothing.
 */
export function IssueStats({ posts }: { posts: readonly Post[] }) {
  const figures = [
    { value: posts.length, label: "Essays", note: "one argument each" },
    { value: posts.reduce((n, p) => n + plateRegister(p.blocks).length, 0), label: "Plates", note: "drawn from data, most of them live" },
    { value: posts.reduce((n, p) => n + p.minutes, 0), label: "Minutes", note: "of reading, end to end" },
    { value: SURVEY.total, label: "Buildings", note: "surveyed for the plinth essay" },
  ]
  return (
    <section aria-label="This issue in figures" className="border-b border-rule">
      <dl className="mx-auto grid w-full max-w-[94rem] grid-cols-2 px-6 sm:px-10 lg:grid-cols-4">
        {figures.map((f, i) => (
          <div
            key={f.label}
            className={`flex flex-col gap-2 border-rule py-8 pr-4 ${i % 2 ? "border-l pl-5 sm:pl-8" : ""} ${i > 1 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l lg:pl-8" : ""}`}
          >
            <dt className="mark order-2">{f.label}</dt>
            <dd className="order-1 font-sans text-5xl font-medium tracking-tight text-fg sm:text-6xl">
              <span className="sr-only">{f.value}</span>
              <span aria-hidden="true" className="count tnum" style={{ "--to": f.value } as React.CSSProperties} />
            </dd>
            <dd className="order-3 text-sm text-fg-faint">{f.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
