"use client"

import { getImageProps } from "next/image"
import dynamic from "next/dynamic"
import { Component, useEffect, useState, useSyncExternalStore, type ReactNode } from "react"

import tallPoster from "@/assets/cover-tall.webp"
import widePoster from "@/assets/cover-wide.webp"

/*
 * The cover's solar study is three.js — the heaviest thing on the site. Until it runs, the stage
 * shows a picture of it, rendered from the scene itself by `npm run posters`. On a desktop the
 * live scene loads once the page is idle and fades in over the picture; on a phone it waits to
 * be asked for, because a phone pays for WebGL in battery and in the time before a tap answers.
 */
const LightStudy = dynamic(() => import("@/components/three/LightStudy").then((m) => m.LightStudy), { ssr: false })

/** If the scene throws — a driver bug, a lost context — the picture stays and the page lives on. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const PHONE = "(max-width: 767px)"
const subscribe = (notify: () => void) => {
  const mq = matchMedia(PHONE)
  mq.addEventListener("change", notify)
  return () => mq.removeEventListener("change", notify)
}
const usePhone = () =>
  useSyncExternalStore(
    subscribe,
    () => matchMedia(PHONE).matches,
    () => false,
  )

/*
 * Whether the browser has WebGL — the API, not a context: creating one just to ask costs a phone
 * tens of milliseconds. The server assumes yes, so the button is in the HTML and only the rare
 * browser without WebGL drops it after hydration.
 */
const noChange = () => () => {}
const useWebGL = () =>
  useSyncExternalStore(
    noChange,
    () => typeof WebGLRenderingContext !== "undefined",
    () => true,
  )

const ALT = "The massing model at 08:24, low sun from the east on the fin screen and the tower"
const common = { alt: ALT, sizes: "100vw", loading: "eager", fetchPriority: "high" } as const
const tall = getImageProps({ ...common, src: tallPoster }).props
const wide = getImageProps({ ...common, src: widePoster }).props

export function CoverStage() {
  const phone = usePhone()
  const webgl = useWebGL()
  const [live, setLive] = useState(false)
  const [ready, setReady] = useState(false)
  const [asked, setAsked] = useState(false)

  useEffect(() => {
    if (!webgl || phone || live) return
    // Safari has no requestIdleCallback; a short timeout after load stands in for it.
    const start = () => setLive(true)
    const idle = typeof requestIdleCallback === "function"
    const id = idle ? requestIdleCallback(start, { timeout: 1800 }) : setTimeout(start, 600)
    return () => (idle ? cancelIdleCallback(id as number) : clearTimeout(id))
  }, [webgl, phone, live])

  return (
    <div data-scene={ready ? "live" : live ? "loading" : "poster"} className="absolute inset-0">
      <picture>
        <source media={PHONE} srcSet={tall.srcSet ?? tall.src} width={tall.width} height={tall.height} />
        <img
          {...wide}
          alt={ALT}
          className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
        />
      </picture>

      {live ? (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <SceneBoundary>
            <LightStudy onReady={() => setReady(true)} focusOnReady={asked} />
          </SceneBoundary>
        </div>
      ) : null}

      {/* A scrim so the cover line always has ground, over the picture and the scene alike. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-2/5"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.11 0.004 86 / 0.82), oklch(0.11 0.004 86 / 0.45) 42%, transparent)",
        }}
      />

      {!live && webgl ? (
        <button
          type="button"
          onClick={() => {
            setAsked(true)
            setLive(true)
          }}
          className="instrument absolute bottom-6 left-6 z-10 flex min-h-11 items-center gap-3 border border-sun/60 bg-bg/70 px-4 text-fg backdrop-blur-sm transition-colors hover:border-sun md:hidden"
        >
          <span aria-hidden="true" className="size-2 rotate-45 bg-sun" />
          Move the sun
        </button>
      ) : null}
      {live && !ready ? (
        <p role="status" className="instrument absolute bottom-6 left-6 z-10 text-fg-faint sm:left-10">
          raising the model…
        </p>
      ) : null}
    </div>
  )
}
