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
    <figure className="border-rule bg-bg-deep my-12 overflow-hidden rounded-md border">
      <div className="border-rule flex items-baseline justify-between border-b px-5 py-2.5">
        <span className="instrument tnum text-sun-ink">Plate {String(plate).padStart(2, "0")}</span>
        <span className="instrument">{type}</span>
      </div>
      <div className="relative">{children}</div>
      <figcaption className="border-rule text-fg-faint border-t px-5 py-3 text-sm">
        {caption}
        {hint ? <span className="instrument ml-3">{hint}</span> : null}
      </figcaption>
    </figure>
  )
}
