import { QUANTITIES, splitQuantities, type QuantityKey } from "@/lib/quantities"
import { plateRegister } from "@/lib/plates"
import type { Block } from "@/data/bodies"
import type { Article } from "@/data/issue"

/**
 * The title block, which is the box every drawing sheet carries and this one did not.
 *
 * The gutter held three lines of grey and then two thousand pixels of nothing, on a page whose
 * subject is drawings. A sheet states who drew it, when, which sheet of how many, and what is
 * on it — and a journal that prints its quantities can state those too. So the column now
 * carries the sheet's own data, the drawing register for the article, and the schedule of every
 * quantity the text quotes, each one a link to the sentence that quotes it.
 *
 * None of it is written here. The register is derived from the body's blocks and the schedule
 * from the markers in its prose, so a plate added or a quantity dropped moves the gutter with
 * it.
 */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-rule flex items-baseline justify-between gap-3 border-t py-1.5">
      <dt className="instrument shrink-0">{label}</dt>
      <dd className="text-fg-muted text-right text-xs">{children}</dd>
    </div>
  )
}

export function TitleBlock({
  article,
  blocks,
  index,
  total,
  minutes,
  issue,
}: {
  article: Article
  blocks: readonly Block[]
  index: number
  total: number
  minutes: number
  issue: { number: number; season: string }
}) {
  const register = plateRegister(blocks)

  // Every quantity the article actually quotes, in the order it first quotes them.
  const quoted: QuantityKey[] = []
  for (const block of blocks) {
    const fields = ("text" in block ? [block.text] : []).concat(
      "caption" in block ? [block.caption] : [],
    )
    for (const field of fields) {
      splitQuantities(field).forEach((part, i) => {
        if (i % 2 === 1 && !quoted.includes(part as QuantityKey)) quoted.push(part as QuantityKey)
      })
    }
  }

  return (
    <div className="space-y-8">
      <dl>
        <Row label="Issue">
          №{issue.number} · {issue.season}
        </Row>
        <Row label="Sheet">
          <span className="tnum font-mono">
            {String(index).padStart(2, "0")} of {String(total).padStart(2, "0")}
          </span>
        </Row>
        <Row label="Drawn by">{article.author}</Row>
        <Row label="Date">
          <span className="tnum font-mono">{article.published}</span>
        </Row>
        <Row label="Plates">
          <span className="tnum font-mono">{String(register.length).padStart(2, "0")}</span>
        </Row>
        <Row label="Reading">
          <span className="tnum font-mono">{minutes} min</span>
        </Row>
      </dl>

      {register.length ? (
        <div>
          <p className="instrument border-rule-strong border-b pb-2">Drawing register</p>
          <ol>
            {register.map((plate, i) => (
              <li key={plate.kind} className="border-rule border-b">
                {/*
                  A register row is a link to its sheet. The plate frames carry the matching id,
                  so this is the one piece of furniture that makes the plate set navigable as a
                  set — which is what the prose keeps assuming the reader can see.
                */}
                <a
                  href={`#plate-${i + 1}`}
                  className="group flex items-baseline gap-3 py-2 focus-visible:outline-none"
                >
                  <span className="instrument tnum text-sun-ink/80 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-fg-faint group-hover:text-fg text-xs group-focus-visible:underline">
                    {plate.title}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {quoted.length ? (
        <div>
          <p className="instrument border-rule-strong border-b pb-2">Quantities quoted</p>
          <dl>
            {quoted.map((key) => {
              const q = QUANTITIES[key]
              return (
                <div key={key} className="border-rule border-b">
                  <a
                    href={`#q-${key}`}
                    className="group flex items-baseline justify-between gap-3 py-2 focus-visible:outline-none"
                  >
                    <dt className="text-fg-faint group-hover:text-fg text-xs group-focus-visible:underline">
                      {/* camelCase reads as a word here, not as an identifier. */}
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </dt>
                    <dd className="tnum text-fg-muted shrink-0 font-mono text-xs">
                      {q.value}
                      {q.unit ? <span className="text-fg-faint ml-0.5">{q.unit}</span> : null}
                    </dd>
                  </a>
                </div>
              )
            })}
          </dl>
        </div>
      ) : null}
    </div>
  )
}
