import { compileMDX } from "next-mdx-remote/rsc"

import { mdxComponents } from "@/components/mdx/components"
import { prepare } from "@/lib/post-source"

/** The article's MDX, prepared (plates numbered, quantities resolved) and compiled at build time. */
export async function ArticleMdx({ source }: { source: string }) {
  const { content } = await compileMDX({
    source: prepare(source),
    components: mdxComponents,
  })
  return <div className="article-body prose-fig max-w-[56rem]">{content}</div>
}
