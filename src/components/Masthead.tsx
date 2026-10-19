import { ISSUE } from "@/data/issue"

export function Masthead() {
  return (
    <header className="border-rule flex items-baseline gap-4 border-b px-6 py-4 sm:px-10">
      <span className="font-sans text-xl font-semibold tracking-[-0.03em]">Datum</span>
      <span className="mark hidden sm:inline">
        architecture · the built environment
      </span>
      <span className="instrument ml-auto tnum">
        №{ISSUE.number} / {ISSUE.season}
      </span>
    </header>
  )
}
