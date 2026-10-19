"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Sparkles } from "@react-three/drei"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"

import {
  FINS,
  GROUND_SIZE,
  MASSING,
  hourLabel,
  sunColour,
  sunIntensity,
  sunPosition,
} from "@/lib/massing"

/**
 * The cover: a massing model with a sun you can move.
 *
 * This journal has no photography, so the illustration has to be the real thing — lit, shadowed
 * and running. Dragging across the scene moves the sun from six in the morning to six at night
 * and the shadows rake across the fins in real time, which is the one interaction an architect
 * would actually perform on a model.
 *
 * The hour lives in a ref and is read inside useFrame. Nothing here re-renders while you drag:
 * the light, the shadow camera and the readout are all written imperatively.
 */

const START_HOUR = 8.4

function Sun({ hour }: { hour: React.RefObject<number> }) {
  const light = useRef<THREE.DirectionalLight>(null)
  const colour = useRef(new THREE.Color())

  useFrame(() => {
    const l = light.current
    if (!l) return
    const h = hour.current
    l.position.set(...sunPosition(h))
    l.intensity = sunIntensity(h)
    colour.current.set(sunColour(h))
    l.color.copy(colour.current)
    l.target.position.set(0, 2, 0)
    l.target.updateMatrixWorld()
  })

  return (
    <directionalLight
      ref={light}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0006}
      shadow-normalBias={0.02}
      shadow-camera-left={-26}
      shadow-camera-right={26}
      shadow-camera-top={26}
      shadow-camera-bottom={-26}
      shadow-camera-near={1}
      shadow-camera-far={90}
    />
  )
}

/**
 * The air between the fins.
 *
 * The issue is called Shade and the cover line is "What a building does with the sun", but until
 * now the light was only readable where it landed — a pattern on a wall rather than a volume in a
 * space. Dust in the shafts is how an architectural render shows that, and it is how the fins
 * themselves become legible from the side.
 *
 * Density follows the sun: strongest at the ends of the day when the light rakes through the
 * screen, almost gone at noon when it comes straight down and there are no shafts to catch.
 */
function Air({ hour }: { hour: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = group.current
    if (!g) return
    const t = Math.max(0, Math.min(1, (hour.current - 6) / 12))
    const raking = 1 - Math.sin(t * Math.PI) ** 1.6
    g.visible = raking > 0.06
    g.scale.setScalar(0.6 + raking * 0.4)
  })

  return (
    <group ref={group}>
      {/* Concentrated along the south face where the screen is, not scattered over the whole site. */}
      <Sparkles
        count={420}
        scale={[15, 7, 7]}
        position={[-2.4, 3.9, 3.2]}
        size={2.4}
        speed={0.14}
        opacity={0.5}
        color="#ffd9a0"
      />
      <Sparkles
        count={180}
        scale={[22, 9, 16]}
        position={[0, 5.2, 0]}
        size={1.5}
        speed={0.09}
        opacity={0.22}
        color="#cdd8f0"
      />
    </group>
  )
}

function Massing() {
  return (
    <group>
      {MASSING.map((volume) => (
        <mesh key={volume.id} position={[...volume.position]} castShadow receiveShadow>
          <boxGeometry args={[...volume.size]} />
          <meshStandardMaterial
            color={volume.glazing > 0.4 ? "#2b2f36" : "#b9b3a9"}
            roughness={volume.glazing > 0.4 ? 0.14 : 0.92}
            metalness={volume.glazing > 0.4 ? 0.55 : 0.02}
          />
        </mesh>
      ))}
      {FINS.map((fin) => (
        <mesh key={fin.id} position={[...fin.position]} castShadow receiveShadow>
          <boxGeometry args={[...fin.size]} />
          <meshStandardMaterial color="#c6c0b4" roughness={0.88} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color="#17160f" roughness={1} />
      </mesh>
    </group>
  )
}

/** A slow drift so the scene is alive before anyone touches it, stopped under reduced motion. */
function Camera({ pointer, still }: { pointer: React.RefObject<{ x: number; y: number }>; still: boolean }) {
  const { camera } = useThree()
  const t = useRef(0)

  useFrame((_, delta) => {
    if (!still) t.current += delta * 0.055
    const drift = Math.sin(t.current) * 2.1
    const px = pointer.current.x
    const py = pointer.current.y
    /*
     * Framed so the massing sits in the lower right and the upper left is sky.
     *
     * The first framing centred the model and the cover line ran straight across the tower —
     * legible in neither direction. Looking high and left pushes the subject down and right and
     * leaves the type a clean field, which is how a magazine cover is composed: the photograph
     * is taken for the words that go on it.
     */
    camera.position.lerp(
      new THREE.Vector3(18.5 + drift + px * 2.4, 12.8 - py * 1.6, 24.5 - drift * 0.5),
      0.045,
    )
    camera.lookAt(-4.2, 6.2, 1.2)
  })
  return null
}

export function LightStudy() {
  const hour = useRef(START_HOUR)
  const pointer = useRef({ x: 0, y: 0 })
  const readout = useRef<HTMLSpanElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(query.matches)
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])

  const surface = useRef<HTMLDivElement>(null)

  const writeHour = useCallback((next: number) => {
    hour.current = Math.max(6, Math.min(18, next))
    if (readout.current) readout.current.textContent = hourLabel(hour.current)
    // Announced value follows the drawing. The hour is a ref so that dragging re-renders
    // nothing, which means the attribute has to be written the same way.
    surface.current?.setAttribute("aria-valuenow", hour.current.toFixed(2))
    surface.current?.setAttribute("aria-valuetext", hourLabel(hour.current))
    const pct = ((hour.current - 6) / 12) * 100
    track.current?.style.setProperty("--at", `${pct}%`)
  }, [])

  useEffect(() => {
    writeHour(START_HOUR)
  }, [writeHour])

  const fromClientX = (clientX: number, box: DOMRect) =>
    6 + ((clientX - box.left) / box.width) * 12

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
      /*
       * The cover was pointer-only. Its one interaction — the thing the whole page is built to
       * invite — could not be reached from a keyboard at all. A quarter of an hour per press,
       * five minutes with Shift, an hour on Page, and the ends on Home and End.
       */
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
      className="focus-visible:outline-sun relative h-full w-full touch-none"
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
        event.currentTarget.setPointerCapture(event.pointerId)
        writeHour(fromClientX(event.clientX, event.currentTarget.getBoundingClientRect()))
      }}
      onPointerUp={() => {
        dragging.current = false
      }}
      onPointerCancel={() => {
        dragging.current = false
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [15, 9.5, 20], fov: 34 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        <color attach="background" args={["#141310"]} />
        <fog attach="fog" args={["#141310", 40, 82]} />
        {/* Low fill: the shadow side has to stay dark or the raking light means nothing. */}
        <hemisphereLight args={["#4f6ea6", "#1b1712", 0.34]} />
        <Sun hour={hour} />
        <Massing />
        <Air hour={hour} />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={44} blur={2.4} far={9} />
        <Environment preset="night" environmentIntensity={0.22} />
        <Camera pointer={pointer} still={reduced} />
      </Canvas>

      {/* A scrim so the cover line always has ground, whatever the sun is doing behind it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-2/5"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.11 0.004 86 / 0.82), oklch(0.11 0.004 86 / 0.45) 42%, transparent)",
        }}
      />

      {/* The control, over the scene rather than beside it: the sun is part of the picture. */}
      <div
        ref={track}
        className="pointer-events-none absolute right-6 bottom-6 left-6 sm:right-10 sm:left-10"
      >
        <div className="flex items-end justify-between pb-2">
          <span className="instrument">drag anywhere · solar study</span>
          <span className="tnum text-sun-ink font-mono text-xs">
            <span ref={readout}>08:24</span>
          </span>
        </div>
        <div className="bg-rule-strong relative h-px w-full">
          <span
            className="bg-sun absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45"
            style={{ left: "var(--at, 20%)" }}
          />
          <span className="bg-sun/60 absolute inset-y-0 left-0" style={{ width: "var(--at, 20%)" }} />
        </div>
      </div>
    </div>
  )
}
