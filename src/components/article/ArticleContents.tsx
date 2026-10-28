"use client"

import { useEffect, useState } from "react"

/**
 * The sections of an essay beside its text, the one being read marked with the sun, and how
 * much reading is left. The links work without script; the marker and the countdown follow
 * the scroll when it runs.
 */
export function ArticleContents({ sections, minutes }: { sections: readonly { id: string; title: string }[]; minutes: number }) {
  const [active, setActive] = useState(sections[0]?.id)
  const [left, setLeft] = useState(minutes)

  useEffect(() => {
    const headings = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null)
    // A heading becomes current once it rises into the upper third of the window.
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).map((e) => e.target.id)
        if (seen.length) setActive(seen[seen.length - 1])
      },
      { rootMargin: "0px 0px -66% 0px" },
    )
    headings.forEach((h) => io.observe(h))

    const article = document.querySelector<HTMLElement>("[data-essay]")
    let frame = 0
    const measure = () => {
      frame = 0
      if (!article) return
      const box = article.getBoundingClientRect()
      const read = Math.min(1, Math.max(0, -box.top / Math.max(1, box.height - innerHeight)))
      setLeft(Math.max(0, Math.ceil(minutes * (1 - read))))
    }
    const onScroll = () => {
      frame ||= requestAnimationFrame(measure)
    }
    measure()
    addEventListener("scroll", onScroll, { passive: true })
    return () => {
      io.disconnect()
      removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [sections, minutes])

  return (
    <nav aria-label="In this essay" className="flex flex-col gap-3">
      <p className="instrument flex items-baseline justify-between border-b border-rule-strong pb-2">
        <span>Sections</span>
        <span className="tnum text-sun-ink">{left ? `${left} min left` : "read"}</span>
      </p>
      <ol className="flex flex-col">
        {sections.map((s, i) => {
          const current = s.id === active
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={current ? "location" : undefined}
                className={`group relative flex gap-3 border-l py-2 pl-4 text-sm transition-colors ${current ? "border-sun text-fg" : "border-rule text-fg-faint hover:text-fg-muted"}`}
              >
                <span className={`tnum font-mono text-xs ${current ? "text-sun-ink" : ""}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className="text-pretty">{s.title}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
