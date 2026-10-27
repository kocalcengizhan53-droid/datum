import type { Metadata } from "next"
import Link from "next/link"

import { getTags } from "@/lib/posts"

export const metadata: Metadata = {
  title: "Topics — Datum",
  description: "Every topic Datum has written about, and how often.",
}

/** The topics as a schedule: name, then how many pieces carry it. */
export default function TagsPage() {
  const tags = getTags()
  return (
    <main className="mx-auto w-full max-w-[94rem] px-6 py-12 sm:px-10">
      <h1 className="text-5xl font-medium">Topics</h1>
      <ul className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map(({ tag, count }) => (
          <li key={tag} className="border-b border-rule">
            <Link href={`/tags/${tag}`} className="group flex items-baseline justify-between py-4">
              <span className="text-2xl font-medium transition-colors group-hover:text-sun-ink">{tag}</span>
              <span className="instrument tnum">{String(count).padStart(2, "0")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
