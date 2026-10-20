"use client"

import { useSyncExternalStore } from "react"

import { PlateFrame } from "@/components/three/plates/PlateFrame"
import { PLATE_TITLES } from "@/lib/plates"
import model from "@/lib/ar-model.json"

/**
 * The plate that puts the building on your desk.
 *
 * The journal's argument in this issue is that an elevation cannot show what a fin is for. The
 * plates answer it as far as a screen can — the section cuts the screen, the cover rakes light
 * across it — and then run out, because the move the argument actually wants is walking ninety
 * degrees around the thing, which no drawing performs. So the last plate is the model itself, at
 * 1:50, standing on whatever you put it on.
 *
 * The geometry, the drawing on this plate and the figures beside it are all generated from
 * MASSING by scripts/build-ar.mjs. Nothing here is a second description of the building.
 */

const USDZ = "/ar/datum-massing.usdz"
const GLB = "/ar/datum-massing.glb"
const AXO = "/ar/datum-axonometric.svg"

/*
 * Quick Look is strict about its trigger: the anchor has to contain exactly one child and that
 * child has to be an <img> or a <picture>. Every label on this plate therefore sits outside the
 * anchor, and the drawing is the button.
 *   https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/
 *
 * allowsContentScaling=0 pins the model at 1:50. A model the viewer can pinch to any size has no
 * scale, and the scale is the whole reason to stand it on a table next to something known.
 */
const QUICK_LOOK = `${USDZ}#allowsContentScaling=0`

type Platform = "unknown" | "quicklook" | "sceneviewer" | "desktop"
type Target = { readonly platform: Platform; readonly href: string }

/*
 * Read once, through useSyncExternalStore rather than an effect.
 *
 * What the plate needs is a browser capability, and a static export has to ship one HTML file
 * for every visitor — so the value has to differ between the server render and the client. An
 * effect that called setState would do it, and the React Compiler rejects that for good reason:
 * it is a cascading render for a value that was knowable at the first client render. This is
 * the hook built for the case. The snapshot is cached at module scope because the store must
 * return a stable reference, and because the answer cannot change while the tab is open.
 */
const SERVER: Target = { platform: "unknown", href: QUICK_LOOK }

function detect(): Target {
  // Feature detection, not a user-agent string: Safari advertises Quick Look through relList,
  // which is also what WebKit's own documentation tells you to test.
  const probe = document.createElement("a")
  if (probe.relList?.supports?.("ar")) return { platform: "quicklook", href: QUICK_LOOK }

  if (/android/i.test(navigator.userAgent)) {
    const file = new URL(GLB, location.href).href
    const href =
      `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(file)}` +
      `&mode=ar_preferred&title=${encodeURIComponent("Cover study, 1:50")}` +
      `#Intent;scheme=https;package=com.google.android.googlequicksearchbox;` +
      `action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(location.href)};end;`
    return { platform: "sceneviewer", href }
  }

  return { platform: "desktop", href: QUICK_LOOK }
}

let cached: Target | null = null
const getSnapshot = (): Target => (cached ??= detect())
const getServerSnapshot = (): Target => SERVER
const subscribe = () => () => {}

function Drawing() {
  return (
    /* eslint-disable-next-line @next/next/no-img-element -- next/image cannot be the single
       <img> child AR Quick Look requires, and the source is a build-time SVG with no variants
       to optimise. */
    <img
      src={AXO}
      alt="Axonometric of the cover study, seen from the south-east"
      className="block w-full"
    />
  )
}

export function ArPlate({ plate }: { plate: number }) {
  const { platform, href } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const onDevice = platform === "quicklook" || platform === "sceneviewer"

  return (
    <PlateFrame
      plate={plate}
      type={PLATE_TITLES.ar}
      hint={onDevice ? "tap" : "scan"}
      caption={
        onDevice
          ? "Stand it on a table and walk around it. The surface it lands on is the datum — nothing in the model sits below the line everything in this issue is measured from."
          : "The model is built from the same array as every drawing in this issue. Scan the code to put it on your desk at 1:50; the plinth lands on the table, which is the datum."
      }
    >
      <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          {onDevice ? (
            <a rel={platform === "quicklook" ? "ar" : undefined} href={href} className="block">
              <Drawing />
            </a>
          ) : (
            <Drawing />
          )}
        </div>

        <div className="flex items-end gap-5 sm:flex-col sm:items-end">
          {platform !== "quicklook" && platform !== "sceneviewer" ? (
            <div className="text-fg-muted w-24 shrink-0 sm:w-28">
              {/* eslint-disable-next-line @next/next/no-img-element -- a build-time SVG that
                  inherits colour; next/image would rasterise it and break that. */}
              <img src="/ar/datum-qr.svg" alt={`Link to ${model.page}`} className="block w-full" />
            </div>
          ) : null}

          <dl className="instrument space-y-1 text-right">
            <div>
              <dt className="sr-only">Scale</dt>
              <dd>{model.scale}</dd>
            </div>
            <div>
              <dt className="sr-only">Printed size</dt>
              <dd className="tnum">
                {model.widthMm} × {model.heightMm} × {model.depthMm} mm
              </dd>
            </div>
            <div>
              <dt className="sr-only">Parts</dt>
              <dd className="tnum">{model.parts} parts</dd>
            </div>
          </dl>
        </div>
      </div>
    </PlateFrame>
  )
}
