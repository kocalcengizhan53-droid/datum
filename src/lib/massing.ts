/**
 * The massing study the cover scene renders.
 *
 * Written as data rather than drawn in JSX so the same composition can be measured in a test,
 * re-lit at a different hour, and later exported to glTF for the "view in your room" button
 * without any of those reading geometry out of a component tree.
 *
 * The proportions are a real building type — a civic block with a raised plinth, a long slab and
 * a service tower — because an abstract pile of cubes lights like an abstract pile of cubes. What
 * makes a light study worth looking at is the recognisable thing casting the shadow.
 */

export type Volume = {
  readonly id: string
  /** Centre position in metres: x east, y up, z south. */
  readonly position: readonly [number, number, number]
  readonly size: readonly [number, number, number]
  /** 0 is raw concrete, 1 is glazing. Drives roughness and how much light it bounces. */
  readonly glazing: number
  readonly label: string
}

export const MASSING: readonly Volume[] = [
  { id: "plinth", position: [0, 0.45, 0], size: [15.5, 0.9, 9.4], glazing: 0, label: "Plinth, raised above the datum" },
  { id: "slab", position: [-1.6, 3.3, 0], size: [11.4, 4.8, 7.2], glazing: 0.35, label: "Reading room, four bays" },
  { id: "tower", position: [5.9, 5.2, -1.1], size: [3.2, 8.6, 3.2], glazing: 0.1, label: "Stair and services" },
  { id: "cantilever", position: [-6.1, 6.2, 1.5], size: [6.4, 1.3, 4.6], glazing: 0.55, label: "Cantilevered study, projecting west" },
  { id: "podium", position: [-1.2, 1.35, 5.4], size: [8.2, 0.9, 2.2], glazing: 0, label: "Entrance steps" },
]

/** Vertical fins along the south face. They exist to make the raking light legible. */
/*
 * The fin screen stands off the south face rather than being buried in it.
 *
 * The blades were centred at z 3.72, which put their back faces 140mm inside a glazing line at
 * 3.60 — so the article's "520 deep" described the blade while the building only showed 380 of
 * it, and the axonometric could not resolve which was in front of which because the two solids
 * interpenetrated. A brise-soleil is fixed to the facade, not sunk into it: the back face now
 * sits on the glazing line and the quoted depth is the projection you would actually measure.
 */
const FIN_DEPTH = 0.52
const SOUTH_FACE = 3.6

export const FINS = Array.from({ length: 14 }, (_, i) => ({
  id: `fin-${i}`,
  position: [-7.0 + i * 0.82, 3.4, SOUTH_FACE + FIN_DEPTH / 2] as const,
  size: [0.14, 4.6, FIN_DEPTH] as const,
}))

export const GROUND_SIZE = 46

/**
 * The sun's position for a given hour, as a unit-ish vector scaled to a distance.
 *
 * A simple arc rather than real solar geometry: the scene is a study, and an accurate azimuth for
 * an unstated latitude would be precision nobody can check in service of realism nobody asked
 * for. What matters is that low sun rakes and high sun flattens, which this does.
 */
export function sunPosition(hour: number, distance = 34): [number, number, number] {
  const t = Math.max(0, Math.min(1, (hour - 6) / 12))
  const angle = t * Math.PI
  return [
    Math.cos(angle) * distance * -1,
    Math.max(0.08, Math.sin(angle)) * distance * 0.72,
    Math.cos(angle * 0.6) * distance * 0.34 + distance * 0.22,
  ]
}

/** Warm at the ends of the day, neutral at noon. */
export function sunColour(hour: number): string {
  const t = Math.max(0, Math.min(1, (hour - 6) / 12))
  const noon = 1 - Math.abs(t - 0.5) * 2
  const warmth = 1 - noon
  const r = 1
  const g = 0.74 + noon * 0.2
  const b = 0.48 + noon * 0.42 - warmth * 0.08
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(Math.max(0, b) * 255)})`
}

export function sunIntensity(hour: number): number {
  const t = Math.max(0, Math.min(1, (hour - 6) / 12))
  return 0.55 + Math.sin(t * Math.PI) * 2.45
}

export function hourLabel(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
