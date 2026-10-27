import Link from "next/link"

import { SearchDialog } from "@/components/SearchDialog"
import { ISSUE } from "@/data/issue"

/** The rule runs the full width; the contents sit on the same sheet edge as the page below. */
export function Masthead() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex w-full max-w-[94rem] flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 sm:px-10">
        <Link href="/" className="font-sans text-xl font-semibold tracking-[-0.03em]">
          Datum
        </Link>
        <nav aria-label="Journal" className="flex items-center gap-5">
          <Link href="/" className="mark hidden hover:text-fg sm:inline">
            Essays
          </Link>
          <Link href="/tags" className="mark hover:text-fg">
            Topics
          </Link>
          <a href="/feed.xml" className="mark hover:text-fg">
            RSS
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <span className="instrument tnum hidden md:inline">
            №{ISSUE.number} / {ISSUE.season}
          </span>
          <SearchDialog />
        </div>
      </div>
    </header>
  )
}
