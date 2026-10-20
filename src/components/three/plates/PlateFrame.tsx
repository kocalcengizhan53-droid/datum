/**
 * The sheet a plate is drawn on.
 *
 * Numbered and titled like a drawing set, with the drawing type stated, because the argument of
 * this issue is that drawing type is a position — "the section drawing is the only honest one" —
 * and a set of untitled pictures cannot make that argument.
 */
export function PlateFrame({
  plate,
  type,
  caption,
  hint,
  children,
}: {
  plate: number
  type: string
  caption: React.ReactNode
  /** Only present when the plate is interactive. A locked drawing says nothing. */
  hint?: string
  children: React.ReactNode
}) {
  return (
    <figure
      id={`plate-${plate}`}
      /* scroll-mt keeps a jumped-to plate clear of the reading-progress rule at the top. */
      /*
       * clear-right because overflow-hidden makes this a block formatting context, which
       * shrink-wraps it beside a floated sidenote. Two pages were printing plates at 616 and
       * 896 pixels wide, one under the other, which looks like a bug rather than a margin.
       */
      className="border-rule bg-bg-deep my-12 clear-right scroll-mt-8 overflow-hidden rounded-md border"
    >
      <div className="border-rule flex items-baseline justify-between border-b px-5 py-2.5">
        <span className="instrument tnum text-sun-ink">Plate {String(plate).padStart(2, "0")}</span>
        <span className="instrument">{type}</span>
      </div>
      <div className="relative">{children}</div>
      {/* The hint is set apart rather than appended: trailing a one-line caption it reads as a
          tag, but trailing a caption that wraps it reads as the last two words of the sentence,
          which is how "…which is the datum. scan" got onto a phone screen. */}
      <figcaption className="border-rule text-fg-faint flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t px-5 py-3 text-sm">
        <span className="min-w-[20ch] flex-1">{caption}</span>
        {hint ? <span className="instrument shrink-0">{hint}</span> : null}
      </figcaption>
    </figure>
  )
}
