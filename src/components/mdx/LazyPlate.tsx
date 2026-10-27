"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { PLATE_TITLES } from "@/lib/plates"

const SectionStudy = dynamic(() => import("@/components/three/SectionStudy").then((m) => m.SectionStudy), {
  ssr: false,
})
const ElevationPlate = dynamic(() => import("@/components/three/plates/ElevationPlate").then((m) => m.ElevationPlate), {
  ssr: false,
})

/**
 * The WebGL plates mount when they come within a screen of the reader, not when the page loads:
 * loading three.js up front kept a phone's main thread busy for over a second before the first
 * sentence could be scrolled. Until then the sheet holds their place with number and title.
 */
export function LazyPlate({
  kind,
  number,
  refersTo,
  cut,
  children,
}: {
  kind: "section" | "elevation"
  number: number
  refersTo?: number
  cut?: number
  children?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "800px 0px" })
    io.observe(el)
    return () => io.disconnect()
  }, [near])

  if (near) {
    return kind === "section" ? (
      <SectionStudy caption={children} plate={number} start={cut} elevation={cut === undefined ? undefined : 5.6} />
    ) : (
      <ElevationPlate plate={number} refersTo={refersTo ?? 0} />
    )
  }

  return (
    <figure
      ref={ref}
      data-plate-pending
      className="my-12 grid min-h-[26rem] place-items-center border border-rule"
      aria-label={`Plate ${number}: ${PLATE_TITLES[kind]}`}
    >
      <p className="instrument tnum text-fg-faint">
        {String(number).padStart(2, "0")} · {PLATE_TITLES[kind]}
      </p>
    </figure>
  )
}
