export type Article = {
  readonly slug: string
  readonly kicker: string
  readonly title: string
  readonly standfirst: string
  readonly author: string
  readonly published: string
}

export const ISSUE = {
  number: 14,
  season: "Autumn 2026",
  theme: "Shade",
  coverLine: "What a building does with the sun",
  coverNote:
    "Issue fourteen is about shade: the brise-soleil as an economic instrument, the plinth as an act of exclusion, and why the section drawing is the only honest one.",
} as const
