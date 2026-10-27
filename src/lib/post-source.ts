import type { Block } from "@/lib/blocks"
import { PLATE_TITLES, type PlateKind } from "@/lib/plates"
import { QUANTITIES } from "@/lib/quantities"

/**
 * An article is an MDX file a writer can edit without touching code: Markdown for the prose, a
 * handful of tags for the things a journal of drawings needs — <Plate kind="section">,
 * <Aside>, <Pull>, <Note>, <Dimension> — and [[finDepth]] wherever a measured quantity is
 * quoted, so the figure always comes from the model rather than being typed twice.
 *
 * Before the MDX is compiled, `prepare` numbers the plates in reading order, points the
 * elevation at the section it refers to, marks the first mention of each quantity (the one the
 * schedule links to), and fails the build on an unknown quantity or plate. `outline` reads the
 * same source into blocks for the parts of the page that are derived from the text.
 *
 * Attributes are strings, never `{expressions}`: the compiler runs with JavaScript blocked, so a
 * file can be edited by someone who is not a developer, and it drops expressions silently.
 */

const QUANTITY = /\[\[(\w+)\]\]/g
const PLATE = /<Plate\s+kind="(\w+)"/g
const FIGURES = new Set(["section", "elevation", "ar"])

function checkQuantity(key: string) {
  if (!(key in QUANTITIES)) throw new Error(`Unknown quantity [[${key}]]; known: ${Object.keys(QUANTITIES).join(", ")}`)
}

function checkPlate(kind: string): asserts kind is PlateKind {
  if (!(kind in PLATE_TITLES))
    throw new Error(`Unknown plate kind "${kind}"; known: ${Object.keys(PLATE_TITLES).join(", ")}`)
}

export function prepare(source: string): string {
  const kinds = [...source.matchAll(PLATE)].map((m) => m[1])
  kinds.forEach(checkPlate)
  const section = kinds.indexOf("section") + 1
  let n = 0
  const numbered = source.replace(PLATE, (_, kind: string) => {
    n += 1
    const refers = kind === "elevation" && section ? ` refersTo="${section}"` : ""
    return `<Plate kind="${kind}" number="${n}"${refers}`
  })
  const seen = new Set<string>()
  return numbered.replace(QUANTITY, (_, key: string) => {
    checkQuantity(key)
    const first = !seen.has(key)
    seen.add(key)
    return `<Q name="${key}"${first ? " first" : ""} />`
  })
}

/** Strips tags and markers to the words a reader reads. */
export function plainText(source: string): string {
  return source
    .replace(/^---[\s\S]*?---/, "")
    .replace(QUANTITY, (_, key: string) => {
      const q = QUANTITIES[key as keyof typeof QUANTITIES]
      return q ? `${q.value} ${q.unit}` : key
    })
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

const inner = (chunk: string, tag: string) => chunk.replace(new RegExp(`^<${tag}[^>]*>|</${tag}>$`, "g"), "").trim()
const asMarker = (text: string) => text.replace(QUANTITY, "{{$1}}")

/** The article as blocks, chunk by chunk (chunks are separated by blank lines). */
export function outline(source: string): Block[] {
  return source
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter(Boolean)
    .map((chunk): Block => {
      if (chunk.startsWith("## ")) return { type: "h", text: asMarker(chunk.slice(3)) }
      if (chunk.startsWith("<Pull>")) return { type: "pull", text: asMarker(inner(chunk, "Pull")) }
      if (chunk.startsWith("<Aside>")) return { type: "aside", text: asMarker(inner(chunk, "Aside")) }
      if (chunk.startsWith("<Note>")) return { type: "note", text: asMarker(inner(chunk, "Note")) }
      if (chunk.startsWith("<Dimension")) {
        const value = /value="([^"]*)"/.exec(chunk)?.[1] ?? ""
        return { type: "dimension", value, caption: asMarker(inner(chunk, "Dimension")) }
      }
      if (chunk.startsWith("<Plate")) {
        const kind = /kind="(\w+)"/.exec(chunk)?.[1] ?? ""
        checkPlate(kind)
        if (FIGURES.has(kind)) {
          const cut = /cut="([\d.]+)"/.exec(chunk)?.[1]
          const caption = chunk.endsWith("/>") ? "" : asMarker(inner(chunk, "Plate"))
          return {
            type: "figure",
            kind: kind as "section" | "elevation" | "ar",
            caption,
            ...(cut ? { cut: Number(cut) } : {}),
          }
        }
        return { type: kind as "levels" | "approach" | "programme" | "overhang" | "survey" }
      }
      return { type: "p", text: asMarker(chunk) }
    })
}

/**
 * Reading time, counted rather than claimed: words of prose and captions at 230 a minute, the
 * middle of the range measured for adult silent reading of nonfiction. Drawings are not counted.
 */
export function readingMinutes(blocks: readonly Block[]): number {
  const words = blocks
    .flatMap((b) => ["text" in b ? b.text : "", "caption" in b ? b.caption : ""])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 230))
}
