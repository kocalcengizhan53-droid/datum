"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Environment, Lightformer, Sparkles } from "@react-three/drei"
import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"

import { FINS, GROUND_SIZE, MASSING, hourLabel, sunColour, sunIntensity, sunPosition } from "@/lib/massing"

/**
 * The cover: a massing model with a sun you can drag from six in the morning to six at night.
 * The hour lives in a ref read inside useFrame, so dragging re-renders nothing — the light, the
 * shadow camera and the readout are written imperatively.
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
 * Dust in the light shafts, so the sun reads as a volume and not only where it lands. Densest
 * when the light rakes through the fins at either end of the day, almost gone at noon.
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

/** Tells the stage the scene has drawn, so it can fade in over the poster. */
function Drawn({ onDrawn }: { onDrawn: () => void }) {
  const frames = useRef(0)
  useFrame(() => {
    frames.current += 1
    if (frames.current === 3) onDrawn()
  })
  return null
}

/** A slow drift so the scene is alive before anyone touches it, stopped under reduced motion. */
/*
 * Where the camera sits, and what it looks at. Module scope so the frame loop can reuse one
 * scratch vector instead of allocating two per frame.
 */
const LOOK_AT = new THREE.Vector3(-3.4, 4.1, 1.2)
const CAMERA_HOME = new THREE.Vector3(20.5, 13.6, 27)
const scratch = new THREE.Vector3()

function widen(lens: THREE.PerspectiveCamera, fov: number) {
  if (lens.fov === fov) return
  lens.fov = fov
  lens.updateProjectionMatrix()
}

function Camera({ pointer, still }: { pointer: React.RefObject<{ x: number; y: number }>; still: boolean }) {
  const { camera, size } = useThree()
  const t = useRef(0)
  const placed = useRef(false)

  useFrame((_, delta) => {
    if (!still) t.current += delta * 0.055
    const drift = Math.sin(t.current) * 2.1
    const px = pointer.current.x
    const py = pointer.current.y
    /*
     * Composed like a magazine cover: the massing low and right, the upper left kept as sky for
     * the cover line. fov is vertical, so a portrait frame loses width; it backs off a little,
     * widens the lens, pans toward the model and raises the aim, because there the cover line
     * sits above the model rather than across it. Backing off further walks into the fog.
     */
    const aspect = size.width / Math.max(1, size.height)
    const narrow = Math.min(1, Math.max(0, (1.45 - aspect) / 0.75))
    const pull = Math.min(1.6, Math.max(1, 1.45 / aspect))
    const pan = narrow * 2.2
    widen(camera as THREE.PerspectiveCamera, 34 + narrow * 7)

    scratch.copy(CAMERA_HOME).sub(LOOK_AT).multiplyScalar(pull).add(LOOK_AT)
    scratch.y += narrow * 2.4
    scratch.x += drift + px * 2.4 + pan
    scratch.y -= py * 1.6
    scratch.z -= drift * 0.5

    // The first frame starts where the camera rests, so the live scene opens on the same
    // picture as the poster it fades in over, rather than gliding into place.
    if (placed.current) camera.position.lerp(scratch, 0.045)
    else camera.position.copy(scratch)
    placed.current = true
    // Aimed below the middle of the massing, so the plinth stays inside the frame.
    camera.lookAt(LOOK_AT.x + pan, LOOK_AT.y + narrow * 2.0, LOOK_AT.z)
  })
  return null
}

export function LightStudy({ onReady, focusOnReady = false }: { onReady?: () => void; focusOnReady?: boolean }) {
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
        {/*
          Built here, not downloaded: a preset HDR from a third-party CDN suspended the whole
          scene until it arrived. Baked once (frames={1}), since nothing in it moves.
        */}
        <Environment resolution={256} frames={1} environmentIntensity={0.3}>
          <Lightformer intensity={0.9} color="#5878b4" position={[0, 8, -12]} scale={[24, 12, 1]} />
          <Lightformer
            intensity={0.35}
            color="#2b3340"
            position={[-12, 3, 8]}
            scale={[16, 10, 1]}
            rotation={[0, Math.PI / 3, 0]}
          />
          <Lightformer
            intensity={0.5}
            color="#6b5433"
            position={[10, 1.5, 6]}
            scale={[14, 6, 1]}
            rotation={[0, -Math.PI / 4, 0]}
          />
        </Environment>
        <Camera pointer={pointer} still={reduced} />
        <Drawn
          onDrawn={() => {
            onReady?.()
            // Started from the stage's button: hand focus on to the control it revealed.
            if (focusOnReady) surface.current?.focus({ preventScroll: true })
          }}
        />
      </Canvas>

      {/* The control, over the scene rather than beside it: the sun is part of the picture. */}
      <div ref={track} className="pointer-events-none absolute right-6 bottom-6 left-6 sm:right-10 sm:left-10">
        <div className="flex items-end justify-between pb-2">
          <span className="instrument">drag anywhere · solar study</span>
          <span className="tnum font-mono text-xs text-sun-ink">
            <span ref={readout}>08:24</span>
          </span>
        </div>
        <div className="relative h-px w-full bg-rule-strong">
          <span
            className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-sun"
            style={{ left: "var(--at, 20%)" }}
          />
          <span className="absolute inset-y-0 left-0 bg-sun/60" style={{ width: "var(--at, 20%)" }} />
        </div>
      </div>
    </div>
  )
}
