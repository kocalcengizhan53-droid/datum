"use client"

/*
 * react-hooks/immutability is off for this file: three.js objects are mutated inside useFrame,
 * outside React's render, which the rule cannot model. Nothing here is read or written during render.
 */
/* eslint-disable react-hooks/immutability */

import { Canvas, invalidate, useFrame, useThree } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { PlateFrame } from "@/components/three/plates/PlateFrame"
import { PLATE_TITLES } from "@/lib/plates"
import { FINS, MASSING } from "@/lib/massing"

/**
 * The same building, cut: an orthographic section with a plane you move, the counterpart of the
 * cover's perspective sun study. Materials are double-sided, so a cut volume shows its inside faces
 * like a studio sectional model, without a stencil pass.
 */

const MIN_X = -9.5
const MAX_X = 8.2
const START = -1.4

/** Everything the plane can cut, in one list, so the poché is built from the same geometry. */
const SOLIDS = [
  ...MASSING.map((v) => ({ id: v.id, position: v.position, size: v.size })),
  ...FINS.map((f) => ({ id: f.id, position: f.position, size: f.size })),
]

/**
 * The poché: the material the plane passes through, filled solid — the convention that tells cut
 * material from what stands behind it. One unlit plane per solid, parked at the cut and hidden
 * when the cut leaves it, so the fill stays flat whatever the light does.
 */
function Poche({ cut }: { cut: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null)

  useFrame(() => {
    const g = group.current
    if (!g) return
    const x = cut.current
    g.children.forEach((child, i) => {
      const solid = SOLIDS[i]
      const half = solid.size[0] / 2
      const inside = x > solid.position[0] - half && x < solid.position[0] + half
      child.visible = inside
      /*
       * A hair to the WEST of the plane, which is the side the camera is on. Offset east, the
       * cap sits inside the solid it is meant to cap and is never seen — which is how the
       * first version shipped a section with no poché in it at all.
       */
      if (inside) child.position.setX(x - 0.006)
    })
  })

  return (
    <group ref={group}>
      {SOLIDS.map((solid) => (
        <mesh
          key={solid.id}
          position={[0, solid.position[1], solid.position[2]]}
          rotation={[0, -Math.PI / 2, 0]}
          visible={false}
        >
          <planeGeometry args={[solid.size[2], solid.size[1]]} />
          <meshBasicMaterial color="#f2ece0" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

/*
 * An orthographic zoom fixed in pixels frames a different amount of building at every width.
 * At 390 the plate was a close-up of one poché face filling the canvas. Fitting the zoom to
 * the canvas width keeps the same slice of world in frame on a phone and on a desk, which is
 * what a drawing at a stated scale means.
 */
const VIEW_W = 28
const VIEW_H = 13

function Fit() {
  const { camera, size } = useThree()
  useFrame(() => {
    const ortho = camera as THREE.OrthographicCamera
    // Whichever axis runs out first. Fitting width alone left the model small in a tall frame
    // on a phone and a close-up of one poché face when the zoom was fixed in pixels.
    const zoom = Math.min(size.width / VIEW_W, size.height / VIEW_H)
    if (Math.abs(ortho.zoom - zoom) > 0.01) {
      ortho.zoom = zoom
      ortho.updateProjectionMatrix()
    }
  })
  return null
}

function Scene({ cut, start }: { cut: React.RefObject<number>; start: number }) {
  // A value, not a ref: the plane object never changes identity, only its constant, and reading
  // a ref during render is both a lint error and the thing that breaks under memoisation.
  /*
   * The plane keeps what is east of the cut and the camera stands to the west: a section is a view
   * of the cut, seen from the part that was removed.
   */
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), -start), [start])
  const clip = useMemo(() => [plane], [plane])
  const marker = useRef<THREE.Mesh>(null)

  useFrame(() => {
    plane.constant = -cut.current
    marker.current?.position.setX(cut.current)
  })

  return (
    <>
      {/* Raking key so the cut faces separate from the elevation behind them. */}
      <directionalLight position={[-14, 16, 22]} intensity={2.6} color="#ffd9a8" />
      <directionalLight position={[16, 8, -14]} intensity={0.5} color="#7f9ed4" />
      <ambientLight intensity={0.45} />

      <group>
        {MASSING.map((volume) => (
          <mesh key={volume.id} position={[...volume.position]}>
            <boxGeometry args={[...volume.size]} />
            <meshStandardMaterial
              color={volume.glazing > 0.4 ? "#3a4049" : "#cfc8bb"}
              roughness={volume.glazing > 0.4 ? 0.2 : 0.95}
              metalness={volume.glazing > 0.4 ? 0.4 : 0.02}
              side={THREE.DoubleSide}
              clippingPlanes={clip}
            />
          </mesh>
        ))}
        {FINS.map((fin) => (
          <mesh key={fin.id} position={[...fin.position]}>
            <boxGeometry args={[...fin.size]} />
            <meshStandardMaterial color="#ddd6c8" roughness={0.9} side={THREE.DoubleSide} clippingPlanes={clip} />
          </mesh>
        ))}
        {/* The datum: the line everything in the issue is measured from. */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[34, 20]} />
          <meshStandardMaterial color="#201c15" roughness={1} clippingPlanes={clip} />
        </mesh>
      </group>

      <Poche cut={cut} />

      {/* Where the cut is, drawn as a cutting plane rather than implied by the absence of solid. */}
      <mesh ref={marker} position={[start, 4.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[11, 8]} />
        <meshBasicMaterial color="#e8a04a" transparent opacity={0.045} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

// The cut is a prop, so two articles can make two different arguments with the same plate.
export function SectionStudy({
  caption,
  plate,
  start = START,
  elevation = 7.4,
}: {
  caption: React.ReactNode
  plate: number
  start?: number
  /** Camera height. A cut through the plinth wants a lower eye than one through the screen. */
  elevation?: number
}) {
  const cut = useRef(start)
  const readout = useRef<HTMLSpanElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const surface = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const write = useCallback((next: number) => {
    cut.current = Math.max(MIN_X, Math.min(MAX_X, next))
    const pct = ((cut.current - MIN_X) / (MAX_X - MIN_X)) * 100
    track.current?.style.setProperty("--at", `${pct}%`)
    // The value a screen reader announces has to move with the drawing, and the drawing is
    // driven imperatively, so the attribute is written here rather than rendered.
    surface.current?.setAttribute("aria-valuenow", cut.current.toFixed(1))
    // The plate draws on demand: only a moved cut, a resize or the first frame costs a render.
    invalidate()
    if (readout.current) {
      // Metres east of the datum, which is the number a section mark would carry.
      readout.current.textContent = `${cut.current >= 0 ? "+" : "−"}${Math.abs(cut.current).toFixed(1)} m`
    }
  }, [])

  // The cut moves by keyboard too: half a metre per arrow, a tenth with Shift, Home and End at the ends.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.5
    const moves: Record<string, number | "min" | "max"> = {
      ArrowLeft: -step,
      ArrowDown: -step,
      ArrowRight: step,
      ArrowUp: step,
      PageDown: -step * 4,
      PageUp: step * 4,
      Home: "min",
      End: "max",
    }
    const move = moves[e.key]
    if (move === undefined) return
    e.preventDefault()
    write(move === "min" ? MIN_X : move === "max" ? MAX_X : cut.current + move)
  }

  useEffect(() => {
    write(start)
  }, [write, start])

  const fromX = (clientX: number, box: DOMRect) => MIN_X + ((clientX - box.left) / box.width) * (MAX_X - MIN_X)

  return (
    <PlateFrame plate={plate} type={PLATE_TITLES.section} caption={caption} hint="drag">
      <div
        ref={surface}
        role="slider"
        tabIndex={0}
        aria-label="Position of the section cut, in metres east of the datum"
        aria-valuemin={MIN_X}
        aria-valuemax={MAX_X}
        aria-valuenow={start}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="relative aspect-[16/9] w-full touch-none focus-visible:outline-sun"
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          write(fromX(e.clientX, e.currentTarget.getBoundingClientRect()))
        }}
        onPointerMove={(e) => {
          if (dragging.current) write(fromX(e.clientX, e.currentTarget.getBoundingClientRect()))
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
        onPointerCancel={() => {
          dragging.current = false
        }}
      >
        <Canvas
          dpr={[1, 1.75]}
          // Nothing moves unless the cut does, so nothing redraws unless it does. Drawn every frame,
          // a plate near the top of an article kept a phone's GPU — or a CPU without one — busy
          // for as long as the page was open.
          frameloop="demand"
          orthographic
          // Set here rather than mutating the renderer from an effect: useThree returns a hook
          // value, and assigning to it is both a lint error and an unnecessary round trip.
          gl={{ localClippingEnabled: true }}
          camera={{ position: [-26, elevation, 16], zoom: 34, near: -80, far: 160 }}
          onCreated={({ camera }) => camera.lookAt(0, 4.4, 0)}
        >
          <color attach="background" args={["#121109"]} />
          <Fit />
          <Scene cut={cut} start={start} />
        </Canvas>

        <div ref={track} className="pointer-events-none absolute inset-x-5 bottom-5">
          <div className="flex items-end justify-between pb-2">
            <span className="instrument">drag to move the cut</span>
            <span className="tnum font-mono text-xs text-sun-ink">
              <span ref={readout}>{`${start >= 0 ? "+" : "−"}${Math.abs(start).toFixed(1)} m`}</span>
            </span>
          </div>
          <div className="relative h-px w-full bg-rule-strong">
            <span className="absolute inset-y-0 left-0 bg-sun/60" style={{ width: "var(--at, 46%)" }} />
            <span
              className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-sun"
              style={{ left: "var(--at, 46%)" }}
            />
          </div>
        </div>
      </div>
    </PlateFrame>
  )
}
