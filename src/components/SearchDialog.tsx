"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type Entry = {
  slug: string
  title: string
  kicker: string
  standfirst: string
  author: string
  tags: string[]
  text: string
}

/**
 * ⌘K (or /) searches the journal: titles, standfirsts, authors, topics and the full text. The
 * index is a static file built with the site and fetched the first time the box opens, so the
 * search costs nothing until someone uses it.
 */
export function SearchDialog() {
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState<Entry[] | null>(null)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)

  const open = () => {
    // ⌘K again while searching: already open, nothing to do.
    if (!dialog.current || dialog.current.open) return
    dialog.current.showModal()
    if (!index)
      fetch("/search.json")
        .then((r) => r.json())
        .then(setIndex)
        .catch(() => setIndex([]))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        e.preventDefault()
        open()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const results = (index ?? [])
    .map((e) => {
      const fields = [e.title, e.kicker, e.standfirst, e.author, e.tags.join(" ")].join(" ").toLowerCase()
      const body = e.text.toLowerCase()
      let score = 0
      for (const t of terms) {
        if (fields.includes(t)) score += 3
        else if (body.includes(t)) score += 1
        else return null
      }
      const hit = terms.length ? body.indexOf(terms[0]) : -1
      const excerpt = hit >= 0 ? `…${e.text.slice(Math.max(0, hit - 50), hit + 90)}…` : e.standfirst
      return { e, score, excerpt }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  const go = (slug: string) => {
    dialog.current?.close()
    setQuery("")
    router.push(`/${slug}`)
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="instrument flex min-h-9 items-center gap-2 border border-rule-strong px-2.5 transition-colors hover:border-sun hover:text-fg"
        aria-label="Search the journal"
      >
        Search <kbd className="hidden text-fg-faint sm:inline">⌘K</kbd>
      </button>
      <dialog
        ref={dialog}
        aria-label="Search the journal"
        className="m-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] border border-rule-strong bg-bg p-0 text-fg backdrop:bg-black/60"
        onClose={() => setActive(0)}
      >
        <div className="flex items-center gap-3 border-b border-rule px-4">
          <label htmlFor="search-q" className="mark">
            Find
          </label>
          <input
            id="search-q"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1))
              if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0))
              if (e.key === "Enter" && results[active]) go(results[active].e.slug)
            }}
            placeholder="fins, plinth, demolition…"
            className="min-h-14 flex-1 bg-transparent font-sans text-lg outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `r-${results[active].e.slug}` : undefined}
          />
        </div>
        <ul id="search-results" role="listbox" aria-label="Results" className="max-h-[60vh] overflow-auto">
          {index === null ? <li className="instrument p-4 text-fg-faint">Loading the index…</li> : null}
          {index && results.length === 0 ? (
            <li className="instrument p-4 text-fg-faint">Nothing in this issue matches.</li>
          ) : null}
          {results.map((r, i) => (
            <li
              key={r.e.slug}
              id={`r-${r.e.slug}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r.e.slug)}
              className={`cursor-pointer border-b border-rule px-4 py-3 ${i === active ? "bg-bg-deep" : ""}`}
            >
              <p className="mark">{r.e.kicker}</p>
              <p className="mt-1 text-lg font-medium">{r.e.title}</p>
              <p className="prose-fig mt-1 line-clamp-2 text-sm text-fg-muted">{r.excerpt}</p>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  )
}
