import { describe, expect, it } from "vitest"

import { getPosts } from "@/lib/posts"
import { sectionsOf, slugify } from "@/lib/sections"

describe("sections", () => {
  it("links a heading by its words", () => {
    expect(slugify("Who actually set the geometry")).toBe("who-actually-set-the-geometry")
    expect(slugify("The 90 cm lie — revisited")).toBe("the-90-cm-lie-revisited")
  })

  it("gives every article at least two sections with distinct ids", () => {
    for (const post of getPosts()) {
      const ids = sectionsOf(post.source).map((s) => s.id)
      expect(ids.length, post.slug).toBeGreaterThanOrEqual(2)
      expect(new Set(ids).size, post.slug).toBe(ids.length)
    }
  })
})
