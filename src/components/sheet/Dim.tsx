import { QUANTITIES, type QuantityKey } from "@/lib/quantities"

/**
 * A measured quantity, set in the running text as a dimension.
 *
 * The number is never written in the copy. It is read from the same array the model is built
 * from, so a paragraph cannot drift from the building it describes — which it had, claiming
 * fins "140 millimetres deep" against a model that projects 520.
 *
 * The styling lives in `.dim` (globals.css): lining tabular figures, a small-caps unit, and a
 * rule terminated by two extension ticks. It is deliberately not sun-coloured — sun on text is
 * the link hover state here, and a coloured underlined number reads as something to click.
 */
export function Dim({ name, anchor = false }: { name: QuantityKey; anchor?: boolean }) {
  const { value, unit } = QUANTITIES[name]
  return (
    <span
      /* Only the first statement of a quantity is the anchor: the schedule in the gutter sends
         the reader to where the article says it, not to the fourth time it repeats it. */
      id={anchor ? `q-${name}` : undefined}
      className={unit ? "dim" : "dim dim-count"}
    >
      {value}
      {unit ? <span className="dim-unit">{unit}</span> : null}
    </span>
  )
}
