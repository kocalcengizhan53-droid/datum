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
      <Sparkles count={260} scale={[15, 7, 7]} position={[-2.4, 3.9, 3.2]} size={2.2} speed={0.14} opacity={0.55} color="#fff0d0" />
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
        <meshStandardMaterial color="#9a8f7c" roughness={1} />
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
