"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

import { skyColours, sunPosition } from "@/lib/massing"

/**
 * A dome painted from the hour: zenith to horizon, with the sun's glow and disc where the light
 * actually comes from. The fog takes the horizon colour, so the ground runs out into the sky
 * instead of stopping at an edge.
 */

const vertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColour;
  varying vec3 vDir;
  void main() {
    vec3 dir = normalize(vDir);
    float up = clamp(dir.y, 0.0, 1.0);
    vec3 sky = mix(uHorizon, uZenith, pow(up, 0.55));
    float toSun = max(dot(dir, uSunDir), 0.0);
    sky += uSunColour * (pow(toSun, 8.0) * 0.22 + pow(toSun, 90.0) * 0.6);
    sky = mix(sky, uSunColour * 1.6, smoothstep(0.9994, 0.9997, toSun));
    gl_FragColor = vec4(sky, 1.0);
    #include <colorspace_fragment>
  }
`

export function Sky({ hour, sunColour }: { hour: React.RefObject<number>; sunColour: React.RefObject<THREE.Color> }) {
  const { scene } = useThree()
  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3() },
      uSunColour: { value: new THREE.Color() },
    }),
    [],
  )
  const last = useRef(Number.NaN)

  useFrame(() => {
    const h = hour.current
    if (h === last.current) return
    last.current = h
    const { zenith, horizon } = skyColours(h)
    uniforms.uZenith.value.setRGB(...zenith, THREE.SRGBColorSpace)
    uniforms.uHorizon.value.setRGB(...horizon, THREE.SRGBColorSpace)
    uniforms.uSunDir.value.set(...sunPosition(h)).normalize()
    uniforms.uSunColour.value.copy(sunColour.current)
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(uniforms.uHorizon.value)
  })

  return (
    <mesh scale={90} renderOrder={-1}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
      />
    </mesh>
  )
}
