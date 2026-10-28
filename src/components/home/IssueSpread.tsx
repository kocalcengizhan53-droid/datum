import Link from "next/link"
import { ViewTransition } from "react"

import { PlateGlyph } from "@/components/sheet/PlateGlyph"
import { plateRegister } from "@/lib/plates"
import type { Post } from "@/lib/posts"

/**
 * The contents as a magazine spread rather than a list: the lead essay across the sheet with its
 * first plate drawn large, the rest as a grid of cards, each on squared paper with its own plate
 * wiping on as it scrolls in. Every card still carries the drawing register, because on a
 * journal of drawings that is what a reader scans an issue for.
 */

const pad = (n: number) => String(n).padStart(2, "0")

function Meta({ post }: { post: Post }) {
  const plates = plateRegister(post.blocks).length
  return (
    <p className="instrument flex flex-wrap gap-x-4 gap-y-1">
      <span>{post.author}</span>
      <span className="tnum">{post.minutes} min</span>
      <span className="tnum text-sun-ink/80">{pad(plates)} plates</span>
    </p>
  )
}

function Lead({ post }: { post: Post }) {
  const register = plateRegister(post.blocks)
  return (
    <Link
      href={`/${post.slug}`}
      className="group grid gap-8 border-b border-rule py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14"
    >
      <div className="flex flex-col gap-6">
        <p className="flex items-baseline gap-4">
          <span className="instrument tnum">01</span>
          <span className="mark">Lead essay · {post.kicker}</span>
        </p>
        <ViewTransition name={`title-${post.slug}`} share="morph" default="none">
          <h2 className="max-w-[16ch] text-5xl font-medium text-balance transition-colors duration-300 group-hover:text-sun-ink lg:text-7xl">
            {post.title}
          </h2>
        </ViewTransition>
        <p className="prose-fig max-w-[48ch] text-xl text-pretty text-fg-muted">{post.standfirst}</p>
        <Meta post={post} />
        <span className="instrument mt-2 inline-flex items-center gap-3 text-fg">
          Read the essay
          <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
            →
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <div className="sheet-grid grid aspect-[16/10] place-items-center border border-rule-strong p-8 transition-colors duration-300 group-hover:border-sun/70">
          <span className="instrument absolute top-3 left-4">Plate 01 · {register[0]?.title}</span>
          <div className="wipe w-full max-w-[34rem]">{register[0] ? <PlateGlyph kind={register[0].kind} /> : null}</div>
        </div>
        <ol className="flex flex-wrap gap-2">
          {register.map((plate, i) => (
            <li key={plate.kind} className="instrument border border-rule px-2 py-1 text-fg-faint">
              <span className="tnum text-sun-ink/80">{pad(i + 1)}</span> {plate.title.split(" · ")[0]}
            </li>
          ))}
        </ol>
      </div>
    </Link>
  )
}

function Card({ post, number }: { post: Post; number: number }) {
  const register = plateRegister(post.blocks)
  return (
    <li className="min-w-0">
      <Link
        href={`/${post.slug}`}
        className="group flex h-full flex-col border border-rule bg-bg transition-[border-color,transform] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-sun/70"
      >
        <div className="sheet-grid grid aspect-[2/1] place-items-center border-b border-rule px-8">
          <span className="instrument absolute top-3 left-4 tnum">{pad(number)}</span>
          <span className="instrument absolute top-3 right-4 text-sun-ink/80">{pad(register.length)} plates</span>
          <div className="wipe w-full max-w-[22rem] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
            {register[0] ? <PlateGlyph kind={register[0].kind} /> : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <p className="mark">{post.kicker}</p>
          <ViewTransition name={`title-${post.slug}`} share="morph" default="none">
            <h3 className="text-3xl font-medium text-balance transition-colors duration-300 group-hover:text-sun-ink">
              {post.title}
            </h3>
          </ViewTransition>
          <p className="prose-fig line-clamp-3 text-pretty text-fg-muted">{post.standfirst}</p>
          <div className="mt-auto pt-2">
            <Meta post={post} />
          </div>
        </div>
      </Link>
    </li>
  )
}

export function IssueSpread({ posts }: { posts: readonly Post[] }) {
  const [lead, ...rest] = posts
  return (
    <section aria-label="In this issue" className="mx-auto w-full max-w-[94rem] px-6 sm:px-10">
      <Lead post={lead} />
      <ul className="grid gap-6 py-12 md:grid-cols-2">
        {rest.map((post, i) => (
          <Card key={post.slug} post={post} number={i + 2} />
        ))}
      </ul>
    </section>
  )
}
