import { ISSUE } from "@/data/issue"

/**
 * The foot of the sheet.
 *
 * It exists on the contents page and not on the articles, which is the wrong way round — the
 * article is the longer read and the one that ends abruptly. It also does a second job the
 * contents page does not need: an article's last rule could never finish drawing, because the
 * document ended before the element could rise far enough up the window for its scroll range
 * to complete. A page needs somewhere to go after its last line.
 */
export function Colophon() {
  return (
    <footer className="mt-auto border-t border-rule">
      <div className="mx-auto flex w-full max-w-[94rem] flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-6 py-12 sm:px-10">
        <p className="mark">Datum · a journal of architecture and the built environment · set in Geist</p>
        <p className="instrument tnum">
          №{ISSUE.number} · {ISSUE.season} · {ISSUE.theme}
        </p>
        {/* A plain link: /admin is a static page outside the app, which next/link would try to route. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/admin/" className="mark hover:text-fg">
          Editing screen (demo) →
        </a>
      </div>
    </footer>
  )
}
