"use client"

/*
 * react-hooks/immutability is off for this file.
 *
 * The rule forbids mutating a value returned from a hook. three.js objects exist to be mutated
 * every frame — that is what useFrame is for — and the rule has no model of a render loop
 * running outside React's. The hazard it actually guards against is reading or writing such a
 * value during render, and nothing here does: the plane is constructed once in a useMemo and
 * touched only inside the frame callback.
 */
/* eslint-disable react-hooks/immutability */

import { Canvas, useFrame } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

import { PlateFrame } from "@/components/three/plates/PlateFrame"
import { FINS, MASSING } from "@/lib/massing"

/**
 * The same building, cut.
 *
 * The cover is a perspective view with a sun you move; this is an orthographic section with a
 * plane you move, which is the other half of how a model is actually interrogated. Making them
 * visually distinct was deliberate: a second perspective render of the same massing would read
 * as the same illustration twice.
 *
 * Capping a clipped solid properly needs stencil work. Here the materials are double-sided
 * instead, so a cut volume shows its inside faces — which is exactly what a sectional model
 * looks like in a studio, and costs one flag rather than a second render pass.
 */

const MIN_X = -9.5
const MAX_X = 8.2
const START = -1.4

function Scene({ cut }: { cut: React.RefObject<number> }) {
  // A value, not a ref: the plane object never changes identity, only its constant, and reading
  // a ref during render is both a lint error and the thing that breaks under memoisation.
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), -START), [])
  const clip = useMemo(() => [plane], [plane])
  const marker = useRef<THREE.Mesh>(null)

  useFrame(() => {
    plane.constant = cut.current
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
            <meshStandardMaterial
              color="#ddd6c8"
              roughness={0.9}
              side={THREE.DoubleSide}
              clippingPlanes={clip}
            />
          </mesh>
        ))}
        {/* The datum: the line everything in the issue is measured from. */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[34, 20]} />
          <meshStandardMaterial color="#201c15" roughness={1} clippingPlanes={clip} />
        </mesh>
      </group>

      {/* Where the cut is, drawn as a cutting plane rather than implied by the absence of solid. */}
      <mesh ref={marker} position={[START, 5.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[18, 13]} />
        <meshBasicMaterial color="#e8a04a" transparent opacity={0.07} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

export function SectionStudy({ caption, plate }: { caption: React.ReactNode; plate: number }) {
  const cut = useRef(START)
  const readout = useRef<HTMLSpanElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const write = useCallback((next: number) => {
    cut.current = Math.max(MIN_X, Math.min(MAX_X, next))
    const pct = ((cut.current - MIN_X) / (MAX_X - MIN_X)) * 100
    track.current?.style.setProperty("--at", `${pct}%`)
    if (readout.current) {
      // Metres east of the datum, which is the number a section mark would carry.
      readout.current.textContent = `${cut.current >= 0 ? "+" : "−"}${Math.abs(cut.current).toFixed(1)} m`
    }
  }, [])

  useEffect(() => {
    write(START)
  }, [write])

  const fromX = (clientX: number, box: DOMRect) =>
    MIN_X + ((clientX - box.left) / box.width) * (MAX_X - MIN_X)

  return (
    <PlateFrame plate={plate} type="section · the cut moves" caption={caption} hint="drag">
      <div
        className="relative aspect-[16/9] w-full touch-none"
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
          orthographic
          // Set here rather than mutating the renderer from an effect: useThree returns a hook
          // value, and assigning to it is both a lint error and an unnecessary round trip.
          gl={{ localClippingEnabled: true }}
          camera={{ position: [-26, 7.4, 16], zoom: 34, near: -80, far: 160 }}
          onCreated={({ camera }) => camera.lookAt(0, 4.4, 0)}
        >
          <color attach="background" args={["#121109"]} />
          <Scene cut={cut} />
        </Canvas>

        <div ref={track} className="pointer-events-none absolute inset-x-5 bottom-5">
          <div className="flex items-end justify-between pb-2">
            <span className="instrument">drag to move the cut</span>
            <span className="tnum text-sun-ink font-mono text-xs">
              <span ref={readout}>−1.4 m</span>
            </span>
          </div>
          <div className="bg-rule-strong relative h-px w-full">
            <span className="bg-sun/60 absolute inset-y-0 left-0" style={{ width: "var(--at, 46%)" }} />
            <span
              className="bg-sun absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45"
              style={{ left: "var(--at, 46%)" }}
            />
          </div>
        </div>
      </div>
    </PlateFrame>
  )
}
