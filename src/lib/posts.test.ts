import { describe, expect, it } from "vitest"

import type { Block } from "@/lib/blocks"
import { prepare, plainText } from "@/lib/post-source"
import { getPosts, getTags, related } from "@/lib/posts"

/**
 * The posts as content: every file parses, carries what the pages need, and is not a wall of
 * text — an article may be long, but never undifferentiated.
 */

const WORDS_ONLY = new Set<Block["type"]>(["p", "h", "pull", "note", "aside"])
const MAX_CONSECUTIVE_PROSE = 4
const MIN_VISUAL_BLOCKS = 2

const posts = getPosts()

describe("posts", () => {
  it("reads every file in content/posts, newest first", () => {
    expect(posts.length).toBeGreaterThanOrEqual(5)
    const dates = posts.map((p) => p.published)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  for (const post of posts) {
    describe(post.slug, () => {
      it("has the front matter its pages and its share card use", () => {
        expect(post.title.length).toBeGreaterThan(3)
        expect(post.standfirst.length).toBeGreaterThan(40)
        expect(post.published).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(post.tags.length).toBeGreaterThanOrEqual(2)
        expect(post.minutes).toBeGreaterThanOrEqual(1)
      })

      it(`breaks up prose at least every ${MAX_CONSECUTIVE_PROSE} blocks`, () => {
        let run = 0
        let worst = 0
        for (const block of post.blocks) {
          run = block.type === "p" ? run + 1 : 0
          worst = Math.max(worst, run)
        }
        expect(worst).toBeLessThanOrEqual(MAX_CONSECUTIVE_PROSE)
      })

      it(`carries at least ${MIN_VISUAL_BLOCKS} things that are not words`, () => {
        expect(post.blocks.filter((b) => !WORDS_ONLY.has(b.type)).length).toBeGreaterThanOrEqual(MIN_VISUAL_BLOCKS)
      })

      it("compiles: every plate and quantity it names exists", () => {
        expect(() => prepare(post.source)).not.toThrow()
      })
    })
  }

  it("uses more of the vocabulary than paragraphs and headings", () => {
    expect(new Set(posts.flatMap((p) => p.blocks.map((b) => b.type))).size).toBeGreaterThanOrEqual(7)
  })

  it("files every topic under at least one post, and relates posts by shared topics", () => {
    const tags = getTags()
    expect(tags.every((t) => t.count >= 1)).toBe(true)
    const fins = posts.find((p) => p.slug === "what-the-fins-are-for")!
    expect(related(fins)[0].tags.some((t) => fins.tags.includes(t))).toBe(true)
  })
})

describe("prepare", () => {
  const src = `Text with [[finDepth]] and again [[finDepth]].

<Plate kind="elevation" />

<Plate kind="section">Drag the cut.</Plate>`

  it("numbers plates in reading order and points the elevation at the section", () => {
    const out = prepare(src)
    expect(out).toContain('<Plate kind="elevation" number={1} refersTo={2}')
    expect(out).toContain('<Plate kind="section" number={2}')
  })

  it("marks only the first mention of a quantity as the one the schedule links to", () => {
    const out = prepare(src)
    expect(out.match(/<Q name="finDepth" first \/>/g)).toHaveLength(1)
    expect(out.match(/<Q name="finDepth" \/>/g)).toHaveLength(1)
  })

  it("fails the build on a quantity or a plate that does not exist", () => {
    expect(() => prepare("the fins are [[finLength]] deep")).toThrow(/finLength/)
    expect(() => prepare('<Plate kind="perspective" />')).toThrow(/perspective/)
  })

  it("reads quantities as the figures a reader sees, for search and reading time", () => {
    expect(plainText("Fins [[finDepth]] deep.")).toMatch(/^Fins \d+ mm deep\.$/)
  })
})
