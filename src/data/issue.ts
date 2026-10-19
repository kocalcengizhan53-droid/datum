export type Article = {
  readonly slug: string
  readonly kicker: string
  readonly title: string
  readonly standfirst: string
  readonly author: string
  readonly readingMinutes: number
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

export const ARTICLES: readonly Article[] = [
  {
    slug: "what-the-fins-are-for",
    kicker: "Envelope",
    title: "What the fins are for",
    standfirst:
      "A brise-soleil is not a façade decision. It is a plant-room decision taken three years earlier, by someone who will never see the elevation.",
    author: "Mira Çalışkan",
    readingMinutes: 11,
    published: "2026-09-28",
  },
  {
    slug: "the-ninety-centimetre-lie",
    kicker: "Ground",
    title: "The ninety-centimetre lie",
    standfirst:
      "Every civic building in this survey sits on a plinth. Not one of the architects could say what the height was for, and the ramp was added later in all eleven cases.",
    author: "Deniz Arat",
    readingMinutes: 14,
    published: "2026-09-21",
  },
  {
    slug: "concrete-remembers",
    kicker: "Material",
    title: "Concrete remembers",
    standfirst:
      "Demolition is the only part of the life cycle nobody draws. A visit to three buildings being taken apart by hand, and the arithmetic of what comes back.",
    author: "Juno Mbeki",
    readingMinutes: 18,
    published: "2026-09-09",
  },
  {
    slug: "drawing-the-datum",
    kicker: "Method",
    title: "Drawing the datum",
    standfirst:
      "Before anything can be measured something has to be declared level. The line is a fiction, and choosing where to put it is the first design decision on any site.",
    author: "Mira Çalışkan",
    readingMinutes: 9,
    published: "2026-08-30",
  },
  {
    slug: "a-thermal-argument",
    kicker: "Climate",
    title: "A building is a thermal argument",
    standfirst:
      "Orientation, mass and opening are the three terms. Everything else — the cladding, the renders, the award — is commentary on an argument already settled.",
    author: "Pelin Varol",
    readingMinutes: 13,
    published: "2026-08-17",
  },
]
