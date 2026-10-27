import { ISSUE } from "@/data/issue"
import { ogCard } from "@/lib/og-card"

export const dynamic = "force-static"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Datum, issue 14: what a building does with the sun"

export default function Image() {
  return ogCard({
    kicker: `Issue ${ISSUE.number} · ${ISSUE.theme}`,
    title: ISSUE.coverLine,
    foot: "A journal of architecture and the built environment",
  })
}
