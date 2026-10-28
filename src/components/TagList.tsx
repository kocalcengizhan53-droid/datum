import Link from "next/link"

/**
 * Topics as small drawing labels; each one is a page of every piece filed under it. Given
 * counts, each label carries how many pieces it holds, so the busiest topics show themselves.
 */
export function TagList({
  tags,
  counts,
  className = "",
}: {
  tags: readonly string[]
  counts?: Readonly<Record<string, number>>
  className?: string
}) {
  return (
    <ul aria-label="Topics" className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${tag}`}
            className="instrument group inline-flex items-center gap-2 border border-rule-strong px-2.5 py-1.5 transition-colors hover:border-sun hover:text-fg"
          >
            {tag}
            {counts?.[tag] ? (
              <span className="tnum border-l border-rule-strong pl-2 text-sun-ink/80 transition-colors group-hover:border-sun/60">
                {counts[tag]}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}
