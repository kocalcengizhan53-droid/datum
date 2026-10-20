import { ISSUE } from "@/data/issue";

export function Masthead() {
  return (
    /*
      The rule runs the full width, the contents sit on the sheet. The masthead was flush to the
      viewport while everything below it was a bounded spread, so the two read as unrelated
      pages stacked on each other.
    */
    <header className="border-rule border-b">
      <div className="mx-auto flex w-full max-w-[94rem] items-baseline gap-4 px-6 py-4 sm:px-10">
        <span className="font-sans text-xl font-semibold tracking-[-0.03em]">
          Datum
        </span>
        <span className="mark hidden sm:inline">
          architecture · the built environment
        </span>
        <span className="instrument ml-auto tnum">
          №{ISSUE.number} / {ISSUE.season}
        </span>
      </div>
    </header>
  );
}
