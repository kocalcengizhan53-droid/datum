import Link from "next/link"

/** Topics as small drawing labels; each one is a page of every piece filed under it. */
export function TagList({ tags, className = "" }: { tags: readonly string[]; className?: string }) {
  return (
    <ul aria-label="Topics" className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${tag}`}
            className="instrument inline-block border border-rule-strong px-2.5 py-1.5 transition-colors hover:border-sun hover:text-fg"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}
