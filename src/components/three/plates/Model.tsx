"use client"

import { Edges } from "@react-three/drei"
import * as THREE from "three"

import { FINS, MASSING } from "@/lib/massing"

/**
 * The building, once.
 *
 * Every plate draws the same volumes from the same array — only the camera, the light and the
 * clipping change. That is what makes it a drawing set rather than four illustrations: an
 * elevation and a section that disagreed about where the tower is would be worse than having
 * neither.
 */
export function Model({
  clip,
  palette = "render",
  only,
}: {
  clip?: THREE.Plane[]
  /** `render` is lit massing; `line` is the flat, even fill a drawing is inked in. */
  palette?: "render" | "line"
  /** Draw a single volume alone, for a detail plate. */
  only?: string
}) {
  const concrete = palette === "line" ? "#d7d1c4" : "#c3bcae"
  const glass = palette === "line" ? "#8d9299" : "#333942"
  const rough = palette === "line" ? 1 : 0.9

  /*
   * The line palette gets lines.
   *
   * It was flat fills and nothing else, so the elevation read as a bar-chart silhouette — one
   * value for the whole building and no edge anywhere. An elevation is linework with fill
   * behind it; without the line it is a shadow of the drawing it is meant to be. drei's Edges
   * draws the geometry's own outline, so the weight comes from the same boxes as the fill and
   * cannot disagree with it.
   */
  const inked = palette === "line"
  const volumes = only ? MASSING.filter((v) => v.id === only) : MASSING
  const fins = only ? (only === "slab" ? FINS : []) : FINS

  return (
    <group>
      {volumes.map((volume) => (
        <mesh key={volume.id} position={[...volume.position]} castShadow receiveShadow>
          <boxGeometry args={[...volume.size]} />
          <meshStandardMaterial
            color={volume.glazing > 0.4 ? glass : concrete}
            roughness={volume.glazing > 0.4 ? (palette === "line" ? 1 : 0.18) : rough}
            metalness={volume.glazing > 0.4 && palette === "render" ? 0.45 : 0}
            side={clip ? THREE.DoubleSide : THREE.FrontSide}
            clippingPlanes={clip}
          />
          {inked ? <Edges linewidth={1} threshold={14} color="#2b2720" /> : null}
        </mesh>
      ))}
      {fins.map((fin) => (
        <mesh key={fin.id} position={[...fin.position]} castShadow receiveShadow>
          <boxGeometry args={[...fin.size]} />
          <meshStandardMaterial
            color={palette === "line" ? "#e3ddd0" : "#cec8ba"}
            roughness={rough}
            side={clip ? THREE.DoubleSide : THREE.FrontSide}
            clippingPlanes={clip}
          />
          {inked ? <Edges linewidth={1} threshold={14} color="#2b2720" /> : null}
        </mesh>
      ))}
    </group>
  )
}
