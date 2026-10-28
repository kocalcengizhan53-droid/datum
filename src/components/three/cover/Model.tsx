"use client"

import { Sparkles } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

import { FINS, MASSING, sunColour as sunColourAt, sunPosition } from "@/lib/massing"

/** The one light that matters. It also writes the hour's colour for the sky and the sun path. */
export function Sun({ hour, colour }: { hour: React.RefObject<number>; colour: React.RefObject<THREE.Color> }) {
  const light = useRef<THREE.DirectionalLight>(null)

  useFrame(() => {
    const l = light.current
    if (!l) return
    const h = hour.current
    l.position.set(...sunPosition(h))
    // Brighter at the ends of the day than the article plates' sun: on the cover a low sun has to
    // light the paving well enough for the long shadow to read against it.
    const t = Math.max(0, Math.min(1, (h - 6) / 12))
    l.intensity = 1.5 + Math.sin(t * Math.PI) * 2.1
    colour.current.set(sunColourAt(h))
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
      shadow-camera-left={-30}
      shadow-camera-right={30}
      shadow-camera-top={30}
      shadow-camera-bottom={-30}
      shadow-camera-near={1}
      shadow-camera-far={90}
    />
  )
}

/**
 * Dust in the light shafts, so the sun reads as a volume and not only where it lands. Densest
 * when the light rakes through the fins at either end of the day, almost gone at noon.
 */
export function Air({ hour }: { hour: React.RefObject<number> }) {
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
        count={260}
        scale={[15, 7, 7]}
        position={[-2.4, 3.9, 3.2]}
        size={2.2}
        speed={0.14}
        opacity={0.55}
        color="#fff0d0"
      />
    </group>
  )
}

/*
 * Pale concrete and dark glass on warm paving: the sun paints the lit faces gold and the sky
 * fills the shadows blue, which is what makes the shadow — the subject — legible at a glance.
 */
export function Massing() {
  return (
    <group>
      {MASSING.map((volume) => (
        <mesh key={volume.id} position={[...volume.position]} castShadow receiveShadow>
          <boxGeometry args={[...volume.size]} />
          {volume.glazing > 0.4 ? (
            // Glass that reflects the sky it stands in, rather than a black box.
            <meshStandardMaterial color="#5b7088" roughness={0.12} metalness={0.35} envMapIntensity={2.2} />
          ) : (
            <meshStandardMaterial color="#dcd6ca" roughness={0.9} metalness={0.02} />
          )}
        </mesh>
      ))}
      {FINS.map((fin) => (
        <mesh key={fin.id} position={[...fin.position]} castShadow receiveShadow>
          <boxGeometry args={[...fin.size]} />
          <meshStandardMaterial color="#e6e0d3" roughness={0.85} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[80, 64]} />
        <meshStandardMaterial color="#aaa293" roughness={1} />
      </mesh>
      {/* The site grid at two metres, the scale every shadow on the ground can be read against. */}
      <gridHelper
        args={[52, 26, "#6c6354", "#7d7464"]}
        position={[0, 0.01, 0]}
        material-transparent
        material-opacity={0.4}
      />
    </group>
  )
}

/*
 * The neighbourhood, in the white card of a site model: a terrace to the north-west, a block
 * across the street to the east, trees along the west walk. Kept
 * outside the plan of the sunlight study and low enough that the building is still the thing
 * casting the shadow that matters; the fog takes the far ones.
 */
const BLOCKS: readonly { p: [number, number, number]; s: [number, number, number] }[] = [
  { p: [-30, 1.6, -26], s: [16, 3.2, 8] },
  { p: [-12, 1.3, -32], s: [12, 2.6, 7] },
  { p: [6, 2, -34], s: [12, 4, 8] },
  { p: [34, 1.5, -18], s: [8, 3, 16] },
  { p: [-36, 1.4, 2], s: [8, 2.8, 12] },
]
const TREES: readonly [number, number, number][] = [
  [-13.5, 0, -6],
  [-14.2, 0, -1.5],
  [-13.8, 0, 3.4],
  [-14.6, 0, 8.2],
  [9.5, 0, -8.5],
  [13, 0, -6.5],
]

export function Context() {
  return (
    <group>
      {BLOCKS.map((b, i) => (
        <mesh key={i} position={b.p} castShadow receiveShadow>
          <boxGeometry args={b.s} />
          <meshStandardMaterial color="#cfc8ba" roughness={0.95} />
        </mesh>
      ))}
      {TREES.map(([x, , z], i) => {
        const h = 3.6 + ((i * 37) % 10) / 10
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, h * 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.13, h * 0.6, 6]} />
              <meshStandardMaterial color="#6f6252" roughness={1} />
            </mesh>
            <mesh position={[0, h * 0.72, 0]} castShadow receiveShadow>
              <icosahedronGeometry args={[1.25 + (i % 3) * 0.15, 0]} />
              <meshStandardMaterial color="#9aa784" roughness={0.9} flatShading />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
