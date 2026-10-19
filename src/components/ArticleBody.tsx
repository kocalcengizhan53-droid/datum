import dynamic from "next/dynamic"

import { Reveal } from "@/components/Reveal"
import type { Block } from "@/data/bodies"

const SectionStudy = dynamic(() =>
  import("@/components/three/SectionStudy").then((m) => m.SectionStudy),
)

export function ArticleBody({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div className="max-w-[64ch]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h":
            return (
              <Reveal key={i}>
                <h2 className="mt-12 mb-4 text-2xl font-medium text-balance">{block.text}</h2>
              </Reveal>
            )
          case "pull":
            return (
              <Reveal key={i}>
                <blockquote className="border-sun/60 my-10 border-l-2 pl-6">
                  <p className="text-xl text-balance">{block.text}</p>
                </blockquote>
              </Reveal>
            )
          case "note":
            return (
              <Reveal key={i}>
                <p className="border-rule text-fg-faint mt-12 border-t pt-4 text-sm">
                  {block.text}
                </p>
              </Reveal>
            )
          case "figure":
            return <SectionStudy key={i} caption={block.caption} />
          default:
            return (
              <Reveal key={i}>
                <p className="mb-6 text-lg text-pretty">{block.text}</p>
              </Reveal>
            )
        }
      })}
    </div>
  )
}
