/**
 * Builds the AR models at build time, from the same array the drawings read.
 *
 * The point of generating rather than hand-exporting: a change to MASSING reaches the cover, the
 * section, the elevation, the dimensions in the prose and the thing you put on your desk in one
 * move. A model exported once by hand would be the one drawing in the set allowed to drift, and
 * it would drift silently, because nobody re-checks a binary.
 *
 * Both exporters run in plain Node. USDZExporter has no DOM dependency at all; GLTFExporter asks
 * for FileReader, which Node does not have, so a small shim over Blob stands in for it — the
 * exporter only ever calls readAsArrayBuffer and readAsDataURL.
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

/** The surface GLTFExporter actually uses. Node has Blob; it does not have FileReader. */
class NodeFileReader {
  constructor() {
    this.result = null
    this.onload = null
    this.onloadend = null
    this.onerror = null
  }
  #done() {
    this.onload?.({ target: this })
    this.onloadend?.({ target: this })
  }
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(
      (b) => {
        this.result = b
        this.#done()
      },
      (e) => this.onerror?.(e),
    )
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then(
      (b) => {
        const type = blob.type || "application/octet-stream"
        this.result = `data:${type};base64,${Buffer.from(b).toString("base64")}`
        this.#done()
      },
      (e) => this.onerror?.(e),
    )
  }
}
globalThis.FileReader ??= NodeFileReader

const THREE = await import("three")
const { USDZExporter } = await import("three/examples/jsm/exporters/USDZExporter.js")
const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js")
const QRCode = (await import("qrcode")).default

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const { MASSING, FINS } = await import(path.join(root, "src/lib/massing.ts"))

/**
 * 1:50, which is the scale this building would be modelled at for a design review, and which
 * puts it at roughly 305mm across — a desk object rather than something you back into.
 * Quick Look is told not to let the viewer rescale it, because a model you can pinch to any size
 * cannot be read against a scale bar, and the scale is the argument.
 */
export const SCALE_DENOMINATOR = 50

const CONCRETE = { color: 0xcfc8bb, roughness: 0.95, metalness: 0.02 }
const GLASS = { color: 0x3a4049, roughness: 0.2, metalness: 0.4 }
const FIN = { color: 0xddd6c8, roughness: 0.9, metalness: 0.0 }

function buildScene() {
  const scene = new THREE.Scene()

  // Every volume keeps its own material instance: a shared one would be fine for rendering but
  // exports as a single binding, and Quick Look's material list is something a reader can open.
  for (const volume of MASSING) {
    const spec = volume.glazing > 0.4 ? GLASS : CONCRETE
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(...volume.size),
      new THREE.MeshStandardMaterial(spec),
    )
    mesh.position.set(...volume.position)
    mesh.name = volume.id
    scene.add(mesh)
  }

  for (const fin of FINS) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(...fin.size),
      new THREE.MeshStandardMaterial(FIN),
    )
    mesh.position.set(...fin.position)
    mesh.name = fin.id
    scene.add(mesh)
  }

  /*
   * The model is scaled about the origin, and the origin is the datum — the plinth spans 0 to
   * 0.9m, so nothing sits below y=0. Placed in a room, the surface it lands on becomes the line
   * everything in the issue is measured from, which is the one piece of the journal's argument
   * that only works at full size in a real room.
   */
  const group = new THREE.Group()
  group.name = "datum-massing"
  group.scale.setScalar(1 / SCALE_DENOMINATOR)
  while (scene.children.length) group.add(scene.children[0])

  const out = new THREE.Scene()
  out.add(group)
  return out
}

const scene = buildScene()

const box = new THREE.Box3().setFromObject(scene)
const size = box.getSize(new THREE.Vector3())
const mm = (n) => Math.round(n * 1000)

const outDir = path.join(root, "public/ar")
await mkdir(outDir, { recursive: true })

/*
 * The axonometric, drawn at build time from the same array.
 *
 * It exists because AR Quick Look will only launch from an anchor containing exactly one <img>
 * or <picture> — so the trigger has to be a picture, and a generic "View in AR" badge would be
 * the one piece of art in the issue that was not a drawing of this building. An axonometric is
 * also the projection the set was missing: the elevation flattens the fins and the section cuts
 * them, and neither shows the massing as an object, which is the thing you are being invited to
 * put on a table.
 *
 * Viewed from the south-east and above, so the fin screen (south) and the stair tower (east)
 * both read. The elevation flattens the fins and the section cuts them; neither shows the
 * massing as an object, which is the thing you are being invited to put on a table.
 *
 * Hidden surfaces are resolved by ordering the boxes, not by sorting faces on their centroids.
 * Centroids were the first attempt and they are wrong for exactly this model: the slab's south
 * face is eleven metres across, so its centre sits further from the viewer than a fin standing
 * in front of its western end, and the slab painted over nine of the fourteen blades. For
 * axis-aligned boxes the test is exact instead — A hides B when A is wholly east, wholly above,
 * or wholly south of B — and the result is a partial order a topological sort can draw.
 */
const COS30 = Math.cos(Math.PI / 6)
const SIN30 = Math.sin(Math.PI / 6)

const project = (x, y, z) => [(x - z) * COS30, (x + z) * SIN30 - y]

function bounds(part) {
  const min = part.position.map((c, i) => c - part.size[i] / 2)
  const max = part.position.map((c, i) => c + part.size[i] / 2)

  // The screen footprint of a box is a hexagon; its bounding rectangle is enough to answer the
  // only question asked of it, which is whether two boxes can possibly overlap on the sheet.
  const xs = []
  const ys = []
  for (const x of [min[0], max[0]])
    for (const y of [min[1], max[1]])
      for (const z of [min[2], max[2]]) {
        const [sx, sy] = project(x, y, z)
        xs.push(sx)
        ys.push(sy)
      }
  return {
    min,
    max,
    screen: { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) },
  }
}

/** True when a is entirely in front of b along one axis, for a view from (+x, +y, +z). */
const inFront = (a, b) => [0, 1, 2].some((i) => a.min[i] >= b.max[i] - 1e-9)

/*
 * Two boxes that do not share screen space do not need an order, and giving them one is what
 * made the first version cycle: the tower is east of the cantilever and the cantilever is above
 * the podium and the podium is south of the tower, so three boxes that never overlap on the
 * sheet demanded to be drawn in front of each other. Seventeen of nineteen boxes ended up in
 * that knot. The constraint only means anything where one box can actually cover another.
 */
const overlaps = (a, b) =>
  a.screen.x0 < b.screen.x1 - 1e-9 &&
  b.screen.x0 < a.screen.x1 - 1e-9 &&
  a.screen.y0 < b.screen.y1 - 1e-9 &&
  b.screen.y0 < a.screen.y1 - 1e-9

function orderBoxes(parts) {
  const boxed = parts.map((part) => ({ part, ...bounds(part) }))

  // Edges run back -> front, so a box is only drawn once everything it hides is down.
  const behind = boxed.map(() => [])
  const indegree = boxed.map(() => 0)
  for (let a = 0; a < boxed.length; a++) {
    for (let b = 0; b < boxed.length; b++) {
      if (a !== b && overlaps(boxed[a], boxed[b]) && inFront(boxed[a], boxed[b])) {
        behind[b].push(a)
        indegree[a]++
      }
    }
  }

  // Depth is the tiebreak among boxes the test cannot separate, which keeps the output stable
  // and gives something defensible for any pair that genuinely interpenetrates.
  const depth = (i) => boxed[i].min.reduce((s, v, k) => s + v + boxed[i].max[k], 0)
  const ready = boxed.map((_, i) => i).filter((i) => indegree[i] === 0)
  const order = []
  while (ready.length) {
    ready.sort((x, y) => depth(x) - depth(y))
    const i = ready.shift()
    order.push(i)
    for (const j of behind[i]) if (--indegree[j] === 0) ready.push(j)
  }

  if (order.length !== boxed.length) {
    throw new Error(
      `axonometric: ${boxed.length - order.length} of ${boxed.length} boxes form an occlusion ` +
        `cycle and cannot be drawn back-to-front`,
    )
  }
  return order.map((i) => boxed[i].part)
}

function axonometricSvg() {
  const parts = orderBoxes([
    ...MASSING.map((v) => ({ ...v, kind: v.glazing > 0.4 ? "glass" : "mass" })),
    ...FINS.map((f) => ({ ...f, kind: "fin" })),
  ])

  // Flat values rather than a lit render: a drawing reads by value, and these are the same three
  // steps the plates use — lit top, mid south, shaded east.
  const FILL = {
    mass: { top: "#d8d1c3", south: "#b4ac9c", east: "#8d8678" },
    glass: { top: "#555c66", south: "#3a4049", east: "#2b3038" },
    fin: { top: "#e4ddcf", south: "#c6bfb0", east: "#9a9384" },
  }

  const polys = []
  for (const part of parts) {
    const [px, py, pz] = part.position
    const [w, h, d] = part.size
    const x0 = px - w / 2, x1 = px + w / 2
    const y0 = py - h / 2, y1 = py + h / 2
    const z0 = pz - d / 2, z1 = pz + d / 2

    // Only the three faces turned toward the viewer: top, east, south.
    const quads = {
      top: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]],
      east: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]],
      south: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
    }
    for (const [face, pts] of Object.entries(quads)) {
      polys.push({ face, kind: part.kind, pts: pts.map(([x, y, z]) => project(x, y, z)) })
    }
  }

  const xs = polys.flatMap((f) => f.pts.map((p) => p[0]))
  const ys = polys.flatMap((f) => f.pts.map((p) => p[1]))
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const pad = 0.6

  const body = polys
    .map((f) => {
      const d = f.pts.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(" ")
      return `<polygon points="${d}" fill="${FILL[f.kind][f.face]}"/>`
    })
    .join("")

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(minX - pad).toFixed(3)} ${(minY - pad).toFixed(3)} ` +
    `${(maxX - minX + pad * 2).toFixed(3)} ${(maxY - minY + pad * 2).toFixed(3)}" ` +
    `role="img" aria-label="Axonometric of the cover study, seen from the south-east">` +
    `<g stroke="#1a1710" stroke-width="0.035" stroke-linejoin="round">${body}</g></svg>\n`
  )
}

await writeFile(path.join(outDir, "datum-axonometric.svg"), axonometricSvg())

/*
 * The desktop fallback, drawn rather than disabled.
 *
 * A greyed-out "AR not available on this device" is the usual answer and it is the wrong one:
 * the reader has a phone in their pocket and the whole invitation is to pick it up. The code is
 * encoded at build time into flat SVG rectangles — no runtime library, no third-party image
 * service, nothing that can be down — which also means it belongs to the sheet rather than
 * sitting on it as a foreign object.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://datum-journal-62n.pages.dev").replace(/\/$/, "")
/*
 * No trailing slash. The static export serves the canonical page at /slug and answers /slug/
 * with a 308, so a code encoding the slashed form sends every phone through a redirect to
 * reach a page that was one request away.
 */
const AR_PAGE = `${SITE_URL}/what-the-fins-are-for`

const qr = QRCode.create(AR_PAGE, { errorCorrectionLevel: "M" })
const qrSize = qr.modules.size

/*
 * Four modules of quiet zone and dark-on-light, both of which the first version got wrong.
 *
 * The code was emitted at exactly its module size with fill="currentColor", so it inherited the
 * page's muted grey and sat on the black sheet with no margin: light modules on a dark ground,
 * touching the edge. The quiet zone is in the specification rather than a stylistic margin, and
 * dark-on-light is the polarity scanners are built around; inverted codes are widely but not
 * universally read.
 *
 * Worth being exact about what proves this, because the obvious check does not. qa/ar.mjs
 * decodes the rendered code and that is useful — it is how we know the code carries the right
 * URL — but jsQR reads the broken version too, with no margin, inverted, and with the sheet in
 * frame. A decode is therefore evidence the payload is right and no evidence at all that a
 * camera would scan it. The structure is asserted directly instead, where a regression has
 * something to fail against.
 */
const QUIET = 4
const qrExtent = qrSize + QUIET * 2
const cells = []
for (let y = 0; y < qrSize; y++) {
  for (let x = 0; x < qrSize; x++) {
    if (qr.modules.get(x, y)) {
      cells.push(`<rect x="${x + QUIET}" y="${y + QUIET}" width="1" height="1"/>`)
    }
  }
}
await writeFile(
  path.join(outDir, "datum-qr.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qrExtent} ${qrExtent}" ` +
    `shape-rendering="crispEdges" role="img" aria-label="Link to this article">` +
    `<rect width="${qrExtent}" height="${qrExtent}" fill="#e8e3d7"/>` +
    `<g fill="#15130d">${cells.join("")}</g></svg>\n`,
)

/*
 * USDZExporter stamps every zip entry with the time of the build, so each build rewrote a model
 * that had not changed. Pinning the stamps to 1980-01-01 makes the file a function of the scene.
 */
function pinZipTimes(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let end = bytes.byteLength - 22
  while (end > 0 && view.getUint32(end, true) !== 0x06054b50) end--
  let entry = view.getUint32(end + 16, true)
  for (let i = view.getUint16(end + 10, true); i > 0; i--) {
    const local = view.getUint32(entry + 42, true)
    view.setUint32(entry + 12, 0x00210000, true) // central record: time 00:00, date 1980-01-01
    view.setUint32(local + 10, 0x00210000, true) // local header: the same
    entry += 46 + view.getUint16(entry + 28, true) + view.getUint16(entry + 30, true) + view.getUint16(entry + 32, true)
  }
  return bytes
}

const usdz = pinZipTimes(await new USDZExporter().parseAsync(scene))
await writeFile(path.join(outDir, "datum-massing.usdz"), Buffer.from(usdz))

const glb = await new GLTFExporter().parseAsync(scene, { binary: true })
await writeFile(path.join(outDir, "datum-massing.glb"), Buffer.from(glb))

/*
 * The printed size is written next to the model rather than typed into the copy, for the same
 * reason every other number here is: it is a consequence of MASSING and the scale, and the
 * moment it is a string it is free to be wrong.
 */
await writeFile(
  path.join(root, "src/lib/ar-model.json"),
  JSON.stringify(
    {
      scale: `1:${SCALE_DENOMINATOR}`,
      page: AR_PAGE,
      qrModules: qrSize,
      qrQuietZone: QUIET,
      widthMm: mm(size.x),
      heightMm: mm(size.y),
      depthMm: mm(size.z),
      parts: MASSING.length + FINS.length,
      usdzBytes: usdz.byteLength,
      glbBytes: glb.byteLength,
    },
    null,
    2,
  ) + "\n",
)

console.log(
  `ar: 1:${SCALE_DENOMINATOR} — ${mm(size.x)}×${mm(size.y)}×${mm(size.z)} mm, ` +
    `${MASSING.length + FINS.length} parca · usdz ${(usdz.byteLength / 1024).toFixed(0)}kb · ` +
    `glb ${(glb.byteLength / 1024).toFixed(0)}kb`,
)
