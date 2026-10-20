/**
 * The declared level.
 *
 * "Drawing the datum" argues that before anything can be measured something has to be declared
 * level, and that choosing where to put the line is the first design decision on any site. The
 * journal is named for it, so the page states its own: one rule across the full sheet, labelled
 * in the instrument voice, with every band below it dimensioned from here.
 */
export function Datum({ label = "±0.000", note }: { label?: string; note?: string }) {
  return (
    <div className="relative" aria-hidden="true">
      <div className="bg-rule-strong draw-x h-px w-full origin-left" />
      <div className="flex items-start justify-between pt-1.5">
        <span className="instrument tnum text-sun-ink">{label}</span>
        {note ? <span className="instrument">{note}</span> : null}
      </div>
    </div>
  )
}

/**
 * A dimension: the line extends from the margin and the figure arrives at the end of it. Used
 * wherever the prose states a measured quantity that a plate also draws.
 */
/**
 * A single figure, lifted out of the prose and set at the end of a rule.
 *
 * The figure was 11px — the instrument size, smaller than the body text it was supposed to be
 * lifted out of. This block exists to make one number the largest thing on the screen for a
 * moment; at the reading size it was a footnote with a line in front of it. It is now set in
 * the display face, which is also the only other place a reader sees that face on the page.
 */
export function Dimension({ value, caption }: { value: string; caption: React.ReactNode }) {
  return (
    <div className="my-10 max-w-[62ch]">
      <div className="flex items-end gap-4">
        <span className="bg-sun/55 draw-dim mb-3 h-px flex-1 origin-left" />
        <span className="tnum draw-dim-label text-sun-ink font-sans text-4xl font-medium whitespace-nowrap sm:text-5xl">
          {value}
        </span>
      </div>
      <p className="instrument pt-2 text-right">{caption}</p>
    </div>
  )
}

/** A section mark in the margin: the leader drops, the tag sits at its head. */
export function SectionMark({ tag }: { tag: string }) {
  return (
    <div className="flex flex-col items-start" aria-hidden="true">
      <span className="border-sun/70 tnum text-sun-ink inline-flex size-6 items-center justify-center rounded-full border font-mono text-[10px]">
        {tag}
      </span>
      <span className="bg-sun/35 draw-y mt-1 h-10 w-px origin-top" />
    </div>
  )
}
