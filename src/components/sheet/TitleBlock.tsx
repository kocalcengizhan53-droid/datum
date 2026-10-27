import { QUANTITIES, splitQuantities, type QuantityKey } from "@/lib/quantities"
import { plateRegister } from "@/lib/plates"
import type { Block } from "@/lib/blocks"
import type { Article } from "@/data/issue"

/**
 * The title block every drawing sheet carries: who drew it, when, which sheet of how many, the
 * register of its plates and a schedule of every quantity the text quotes, each linked to the
 * sentence that quotes it. All of it is derived from the article, so the gutter follows edits.
 */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-rule py-1.5">
      <dt className="instrument shrink-0">{label}</dt>
      <dd className="text-right text-xs text-fg-muted">{children}</dd>
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
    const fields = ("text" in block ? [block.text] : []).concat("caption" in block ? [block.caption] : [])
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
          <p className="instrument border-b border-rule-strong pb-2">Drawing register</p>
          <ol>
            {register.map((plate, i) => (
              <li key={plate.kind} className="border-b border-rule">
                {/*
                  A register row is a link to its sheet. The plate frames carry the matching id,
                  so this is the one piece of furniture that makes the plate set navigable as a
                  set — which is what the prose keeps assuming the reader can see.
                */}
                <a href={`#plate-${i + 1}`} className="group flex items-baseline gap-3 py-2 focus-visible:outline-none">
                  <span className="instrument tnum shrink-0 text-sun-ink/80">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-xs text-fg-faint group-hover:text-fg group-focus-visible:underline">
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
          <p className="instrument border-b border-rule-strong pb-2">Quantities quoted</p>
          <dl>
            {quoted.map((key) => {
              const q = QUANTITIES[key]
              return (
                // The link sits in the term and stretches over the row, so the whole row is the
                // target while dt and dd stay direct children of the list.
                <div
                  key={key}
                  className="group relative flex items-baseline justify-between gap-3 border-b border-rule py-2"
                >
                  <dt className="text-xs text-fg-faint group-hover:text-fg">
                    <a
                      href={`#q-${key}`}
                      className="after:absolute after:inset-0 focus-visible:underline focus-visible:outline-none"
                    >
                      {/* camelCase reads as a word here, not as an identifier. */}
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </a>
                  </dt>
                  <dd className="tnum shrink-0 font-mono text-xs text-fg-muted">
                    {q.value}
                    {q.unit ? <span className="ml-0.5 text-fg-faint">{q.unit}</span> : null}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      ) : null}
    </div>
  )
}
