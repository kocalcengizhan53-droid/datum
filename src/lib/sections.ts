import type { ReactNode } from "react"

/** The id a heading is linked by: its words, lower-cased and hyphenated. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** The plain text of rendered heading children, which MDX hands over as strings or arrays. */
export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (node && typeof node === "object" && "props" in node) return textOf((node.props as { children?: ReactNode }).children)
  return ""
}

/** An article's sections, from its `##` headings, with the ids the rendered headings carry. */
export function sectionsOf(source: string): { id: string; title: string }[] {
  return source
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3).trim())
    .map((title) => ({ id: slugify(title), title }))
}
