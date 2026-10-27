import type { MetadataRoute } from "next"

import { SITE, getPosts, getTags } from "@/lib/posts"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts()
  return [
    { url: SITE, lastModified: posts[0]?.published },
    { url: `${SITE}/tags` },
    ...posts.map((p) => ({ url: `${SITE}/${p.slug}`, lastModified: p.published })),
    ...getTags().map(({ tag }) => ({ url: `${SITE}/tags/${tag}` })),
  ]
}
