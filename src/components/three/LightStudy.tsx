"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { ContactShadows, Environment, Lightformer } from "@react-three/drei"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"

import { Camera } from "@/components/three/cover/Camera"
import { Air, Massing, Sun } from "@/components/three/cover/Model"
import { Sky } from "@/components/three/cover/Sky"
import { COVER_START_HOUR, Instrument, useInstrument, videoFrameHours } from "@/components/three/cover/Instrument"
import { hourLabel } from "@/lib/massing"

/**
 * The cover: a massing model under a sun that crosses the sky by itself, from just after six in
 * the morning to just before six at night and back, until a reader takes it. The hour lives in a
 * ref read inside useFrame, so neither the sweep nor a drag re-renders anything — the light, the
 * sky and the instrument are written imperatively.
 */

const START_HOUR = COVER_START_HOUR
const FIRST = 6.6
const LAST = 17.4
/** Hours per second at the middle of the day; it slows toward either end, as a pendulum does. */
const SPEED = 0.8
/** After a reader lets go, how long the sun waits before it carries on by itself. */
const RESUME_MS = 6000

declare global {
  interface Window {
    /** Present only with `?capture`: lets the poster and video script set the hour frame by frame. */
    __cover?: { setHour: (hour: number) => void; videoFrames: number[] }
  }
}

function Sweep({ active, hour, write }: { active: React.RefObject<boolean>; hour: React.RefObject<number>; write: (h: number) => void }) {
  const direction = useRef(1)
  useFrame((_, delta) => {
    if (!active.current) return
    const t = (hour.current - FIRST) / (LAST - FIRST)
    const pace = 0.3 + 0.7 * Math.sin(Math.max(0, Math.min(1, t)) * Math.PI)
    let next = hour.current + direction.current * SPEED * pace * Math.min(delta, 0.1)
    if (next >= LAST) [next, direction.current] = [LAST, -1]
    if (next <= FIRST) [next, direction.current] = [FIRST, 1]
    write(next)
  })
  return null
}

/** Tells the stage the scene has drawn, so it can fade in over the poster. */
function Drawn({ onDrawn }: { onDrawn: () => void }) {
  const frames = useRef(0)
  useFrame(() => {
    frames.current += 1
    if (frames.current === 3) onDrawn()
  })
  return null
}

export function LightStudy({ onReady, focusOnReady = false }: { onReady?: () => void; focusOnReady?: boolean }) {
  const hour = useRef(START_HOUR)
  const sunColour = useRef(new THREE.Color())
  const pointer = useRef({ x: 0, y: 0 })
  const { write: writeInstrument, bind } = useInstrument()
  const surface = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  // The sweep runs unless motion is reduced, a capture is driving it, the slider has focus (a
  // value that moves under a screen reader would be announced forever) or a reader just let go.
  const sweeping = useRef(false)
  const resumeAt = useRef(0)
  const [still, setStill] = useState(true)
  const [onScreen, setOnScreen] = useState(true)

  const writeHour = useCallback((next: number) => {
    const h = Math.max(6, Math.min(18, next))
    hour.current = h
    writeInstrument(h)
    // The hour is a ref so that moving it re-renders nothing, which means the slider's
    // announced value has to be written the same way.
    surface.current?.setAttribute("aria-valuenow", h.toFixed(2))
    surface.current?.setAttribute("aria-valuetext", hourLabel(h))
  }, [writeInstrument])

  useEffect(() => {
    writeHour(START_HOUR)
    const capture = new URLSearchParams(location.search).has("capture")
    const reduced = matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => {
      const hold = capture || reduced.matches
      setStill(hold)
      sweeping.current = !hold
    }
    apply()
    reduced.addEventListener("change", apply)
    if (capture) window.__cover = { setHour: writeHour, videoFrames: videoFrameHours() }
    return () => reduced.removeEventListener("change", apply)
  }, [writeHour])

  // Off screen, the scene stops drawing altogether rather than painting frames nobody sees.
  useEffect(() => {
    const el = surface.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const hold = () => {
    sweeping.current = false
    resumeAt.current = Number.POSITIVE_INFINITY
  }
  const release = () => {
    if (still) return
    resumeAt.current = performance.now() + RESUME_MS
  }
  useEffect(() => {
    if (still) return
    const id = setInterval(() => {
      if (!sweeping.current && performance.now() >= resumeAt.current && document.activeElement !== surface.current)
        sweeping.current = true
    }, 500)
    return () => clearInterval(id)
  }, [still])

  const fromClientX = (clientX: number, box: DOMRect) => 6 + ((clientX - box.left) / box.width) * 12

  return (
    <div
      ref={surface}
      role="slider"
      tabIndex={0}
      aria-label="Hour of the solar study"
      aria-valuemin={6}
      aria-valuemax={18}
      aria-valuenow={START_HOUR}
      aria-valuetext={hourLabel(START_HOUR)}
      aria-orientation="horizontal"
      onFocus={hold}
      onBlur={release}
      // A quarter of an hour per arrow, five minutes with Shift, an hour on Page, ends on Home/End.
      onKeyDown={(event) => {
        const step = event.shiftKey ? 1 / 12 : 0.25
        const moves: Record<string, number | "min" | "max"> = {
          ArrowLeft: -step,
          ArrowDown: -step,
          ArrowRight: step,
          ArrowUp: step,
          PageDown: -1,
          PageUp: 1,
          Home: "min",
          End: "max",
        }
        const move = moves[event.key]
        if (move === undefined) return
        event.preventDefault()
        writeHour(move === "min" ? 6 : move === "max" ? 18 : hour.current + move)
      }}
      className="relative h-full w-full touch-none focus-visible:outline-sun"
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        pointer.current = {
          x: ((event.clientX - box.left) / box.width - 0.5) * 2,
          y: ((event.clientY - box.top) / box.height - 0.5) * 2,
        }
        if (dragging.current) writeHour(fromClientX(event.clientX, box))
      }}
      onPointerDown={(event) => {
        dragging.current = true
        hold()
        event.currentTarget.setPointerCapture(event.pointerId)
        writeHour(fromClientX(event.clientX, event.currentTarget.getBoundingClientRect()))
      }}
      onPointerUp={() => {
        dragging.current = false
        release()
      }}
      onPointerCancel={() => {
        dragging.current = false
        release()
      }}
    >
      <Canvas
        shadows
        frameloop={onScreen ? "always" : "never"}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [15, 9.5, 20], fov: 34, far: 400 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.0
        }}
      >
        <fog attach="fog" args={["#d9c4a6", 46, 96]} />
        {/* Cool sky fill: the shadow side goes blue, the lit side gold, and the shadow reads. */}
        <hemisphereLight args={["#86a3d1", "#6b5f4f", 0.7]} />
        <Sun hour={hour} colour={sunColour} />
        <Sky hour={hour} sunColour={sunColour} />
        <Massing />
        <Air hour={hour} />
        <ContactShadows position={[0, 0.02, 0]} opacity={0.45} scale={44} blur={2.4} far={9} />
        {/*
          Built here, not downloaded: a preset HDR from a third-party CDN suspended the whole
          scene until it arrived. Baked once (frames={1}); it only has to give the glass a sky.
        */}
        <Environment resolution={256} frames={1} environmentIntensity={0.45}>
          <Lightformer intensity={1.1} color="#7f9cd0" position={[0, 9, -12]} scale={[26, 12, 1]} />
          <Lightformer intensity={0.6} color="#f1c58c" position={[12, 2, 8]} scale={[16, 6, 1]} rotation={[0, -Math.PI / 4, 0]} />
        </Environment>
        <Camera pointer={pointer} still={still} />
        <Sweep active={sweeping} hour={hour} write={writeHour} />
        <Drawn
          onDrawn={() => {
            onReady?.()
            // Started from the stage's button: hand focus on to the control it revealed.
            if (focusOnReady) surface.current?.focus({ preventScroll: true })
          }}
        />
      </Canvas>

      <Instrument bind={bind} hint="drag anywhere · solar study" />
    </div>
  )
}
