import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import matter from "gray-matter"

import type { Block } from "@/lib/blocks"
import { outline, plainText, readingMinutes } from "@/lib/post-source"

/**
 * The journal's posts, read from content/posts at build time. A post is its file: adding a
 * Markdown file with the front matter below publishes it, with its own page, tag pages, a place
 * in the feed, the search index and the sitemap, and its own share card.
 */
export type Post = {
  slug: string
  title: string
  kicker: string
  standfirst: string
  author: string
  published: string
  tags: string[]
  source: string
  blocks: Block[]
  minutes: number
  text: string
}

const DIR = join(process.cwd(), "content/posts")

function read(file: string): Post {
  const { data, content } = matter(readFileSync(join(DIR, file), "utf8"))
  for (const field of ["title", "kicker", "standfirst", "author", "published", "tags"])
    if (!(field in data)) throw new Error(`${file}: front matter is missing "${field}"`)
  const blocks = outline(content)
  const published = data.published instanceof Date ? data.published.toISOString().slice(0, 10) : String(data.published)
  return {
    slug: file.replace(/\.mdx$/, ""),
    title: data.title,
    kicker: data.kicker,
    standfirst: data.standfirst,
    author: data.author,
    published,
    tags: (data.tags as string[]).map((t) => String(t).toLowerCase()),
    source: content,
    blocks,
    minutes: readingMinutes(blocks),
    text: plainText(content),
  }
}

let cache: Post[] | null = null

/** Newest first. */
export function getPosts(): Post[] {
  cache ??= readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(read)
    .sort((a, b) => b.published.localeCompare(a.published))
  return cache
}

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug)

export function getTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const p of getPosts()) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/** The posts that share the most tags with this one, then the newest. */
export function related(post: Post, limit = 2): Post[] {
  return getPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, shared: p.tags.filter((t) => post.tags.includes(t)).length }))
    .sort((a, b) => b.shared - a.shared || b.p.published.localeCompare(a.p.published))
    .slice(0, limit)
    .map(({ p }) => p)
}

export const SITE = "https://datum-journal-62n.pages.dev"
