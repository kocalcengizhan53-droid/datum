"use client"

import { getImageProps } from "next/image"
import dynamic from "next/dynamic"
import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"

import tallPoster from "@/assets/cover-tall.webp"
import widePoster from "@/assets/cover-wide.webp"
import { Instrument, hourAtVideoTime, useInstrument } from "@/components/three/cover/Instrument"

/*
 * The cover's solar study is three.js — the heaviest thing on the site. Until it runs, the stage
 * shows a picture of it, rendered from the scene itself by `npm run posters`. On a desktop the
 * live scene loads once the page is idle and fades in over the picture. A phone pays for WebGL
 * in battery and in the time before a tap answers, so it plays a video of the same sweep —
 * rendered from the same scene by `npm run cover-video` — and goes live only when asked.
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

function useMedia(query: string, server: boolean) {
  return useSyncExternalStore(
    (notify) => {
      const mq = matchMedia(query)
      mq.addEventListener("change", notify)
      return () => mq.removeEventListener("change", notify)
    },
    () => matchMedia(query).matches,
    () => server,
  )
}

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

const PHONE = "(max-width: 767px)"
const ALT = "The massing model at 08:24, low sun from the east on the fin screen and the tower"
const common = { alt: ALT, sizes: "100vw", loading: "eager", fetchPriority: "high" } as const
const tall = getImageProps({ ...common, src: tallPoster }).props
const wide = getImageProps({ ...common, src: widePoster }).props

/** The video's own clock drives the instrument, so the readout names the hour on screen. */
function SweepVideo({ onPlaying }: { onPlaying: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const { write, bind } = useInstrument()

  useEffect(() => {
    const v = video.current
    if (!v || !playing) return
    let id = 0
    const frameCallback = "requestVideoFrameCallback" in v
    const tick = (_: number, meta?: VideoFrameCallbackMetadata) => {
      write(hourAtVideoTime(meta?.mediaTime ?? v.currentTime))
      id = frameCallback ? v.requestVideoFrameCallback(tick) : requestAnimationFrame((now) => tick(now))
    }
    id = frameCallback ? v.requestVideoFrameCallback(tick) : requestAnimationFrame((now) => tick(now))
    return () => (frameCallback ? v.cancelVideoFrameCallback(id) : cancelAnimationFrame(id))
  }, [playing, write])

  return (
    <>
      <video
        ref={video}
        src="/media/cover-tall.mp4"
        poster={tall.src}
        muted
        playsInline
        autoPlay
        loop
        preload="auto"
        aria-hidden="true"
        onPlaying={() => {
          setPlaying(true)
          onPlaying()
        }}
        className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
      />
      <div className={`transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}>
        <Instrument bind={bind} />
      </div>
    </>
  )
}

export function CoverStage() {
  const phone = useMedia(PHONE, false)
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false)
  const webgl = useWebGL()
  const [live, setLive] = useState(false)
  const [ready, setReady] = useState(false)
  const [asked, setAsked] = useState(false)
  const [video, setVideo] = useState(false)

  useEffect(() => {
    if (!webgl || phone || live) return
    // Safari has no requestIdleCallback; a short timeout after load stands in for it.
    const start = () => setLive(true)
    const idle = typeof requestIdleCallback === "function"
    const id = idle ? requestIdleCallback(start, { timeout: 1800 }) : setTimeout(start, 600)
    return () => (idle ? cancelIdleCallback(id as number) : clearTimeout(id))
  }, [webgl, phone, live])

  return (
    <div data-scene={ready ? "live" : live ? "loading" : video ? "video" : "poster"} className="absolute inset-0">
      <picture>
        <source media={PHONE} srcSet={tall.srcSet ?? tall.src} width={tall.width} height={tall.height} />
        <img
          {...wide}
          alt={ALT}
          className={`pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
        />
      </picture>

      {phone && !reduced && !live ? <SweepVideo onPlaying={() => setVideo(true)} /> : null}

      {live ? (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <SceneBoundary>
            <LightStudy onReady={() => setReady(true)} focusOnReady={asked} />
          </SceneBoundary>
        </div>
      ) : null}

      {/* Scrims so the cover line and the instrument always have ground, at every hour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-3/5"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.11 0.004 86 / 0.86), oklch(0.11 0.004 86 / 0.5) 45%, transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
        style={{ background: "linear-gradient(to top, oklch(0.11 0.004 86 / 0.82), transparent)" }}
      />

      {!live && webgl ? (
        <button
          type="button"
          onClick={() => {
            setAsked(true)
            setLive(true)
          }}
          className="instrument absolute right-6 bottom-[5.25rem] z-20 flex min-h-11 items-center gap-3 border border-sun/60 bg-bg/70 px-4 text-fg backdrop-blur-sm transition-colors hover:border-sun md:hidden"
        >
          <span aria-hidden="true" className="size-2 rotate-45 bg-sun" />
          Move the sun
        </button>
      ) : null}
      {live && !ready ? (
        <p role="status" className="instrument absolute right-6 bottom-[5.25rem] z-20 text-fg-faint">
          raising the model…
        </p>
      ) : null}
    </div>
  )
}
