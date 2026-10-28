"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useRef } from "react"
import * as THREE from "three"

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

/** A slow drift so the scene is alive before anyone touches it, stopped under reduced motion. */
export function Camera({ pointer, still }: { pointer: React.RefObject<{ x: number; y: number }>; still: boolean }) {
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
     * sits above the model rather than across it.
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
