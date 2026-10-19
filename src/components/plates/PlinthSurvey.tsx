"use client"

import { useState } from "react"

import { PlateFrame } from "@/components/three/plates/PlateFrame"
import { CLUSTER_BAND_MM, PLINTHS } from "@/data/plinths"
import { COVER_HEIGHT_MM, MODE, SURVEY } from "@/lib/survey"

/**
 * Eleven buildings, measured.
 *
 * "Cluster hard" is the load-bearing phrase in this article and it is an adjective. On an axis
 * it is a measurement: nine of the eleven stand inside a 50 mm band, two are alone at either
 * end, and the cover study's own plinth lands inside the band with them. The sentence asserts a
 * distribution; the drawing shows that it is not a distribution at all, it is a default with
 * two exceptions.
 *
 * The second row is the finding the article states and nobody draws — when the height first
 * appears in a file. Eight of the eleven already have it before the first client workshop, so
 * the marks pile up before the project has a brief.
 */

const AXIS_MIN = 500
const AXIS_MAX = 1500
const ax = (mm: number) => ((mm - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100
const TICKS = [500, 750, 1000, 1250, 1500]

const STAGES = ["pre-workshop", "workshop-to-planning", "unknown"] as const
const STAGE_LABEL: Record<(typeof STAGES)[number], string> = {
  "pre-workshop": "Before the first workshop",
  "workshop-to-planning": "Workshop to planning",
  unknown: "No earlier file",
}

const RAMP_LABEL = { front: "along the front", side: "down the side", lift: "a platform lift" }

export function PlinthSurvey({ plate }: { plate: number }) {
  const [id, setId] = useState(PLINTHS[0].id)
  const selected = PLINTHS.find((p) => p.id === id) ?? PLINTHS[0]

  return (
    <PlateFrame
      plate={plate}
      type={`survey · ${SURVEY.total} buildings`}
      hint="press a building"
      caption={`Building ${selected.id}, completed ${selected.completed}. ${selected.heightMm} mm, for ${selected.reason}. The height is already in the model ${STAGE_LABEL[selected.earliest].toLowerCase()}. Ramp ${RAMP_LABEL[selected.ramp]}${selected.rampAddedAfterPlanning ? ", added after planning" : ""}.`}
    >
      <div className="space-y-7 p-5">
        <div>
          <p className="instrument pb-5">Floor above ground, millimetres</p>

          <div className="relative h-24">
            {/* The band the article means by "cluster hard", drawn so the claim is checkable. */}
            <span
              aria-hidden="true"
              className="bg-sun/8 absolute inset-y-0 block"
              style={{
                left: `${ax(MODE.centre - CLUSTER_BAND_MM)}%`,
                width: `${ax(AXIS_MIN + CLUSTER_BAND_MM * 2)}%`,
              }}
            />

            {PLINTHS.map((p, i) => {
              const on = p.id === selected.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setId(p.id)}
                  aria-pressed={on}
                  aria-label={`Building ${p.id}, ${p.heightMm} millimetres`}
                  className="group absolute bottom-0 block h-full w-6 -translate-x-1/2 cursor-pointer"
                  style={{ left: `${ax(p.heightMm)}%` }}
                >
                  <span
                    className={`draw-y absolute bottom-0 left-1/2 block w-px origin-bottom ${
                      on ? "bg-sun" : "bg-fg-muted group-hover:bg-fg"
                    }`}
                    style={{ height: "100%", animationDelay: `${i * 60}ms` }}
                  />
                  <span
                    className={`absolute left-1/2 size-1.5 -translate-x-1/2 rotate-45 ${
                      on ? "bg-sun" : "bg-fg-muted group-hover:bg-fg"
                    }`}
                    style={{ top: 0 }}
                  />
                </button>
              )
            })}

            {/* The cover study, as a datum through the survey it belongs to. */}
            <span
              aria-hidden="true"
              className="border-sun/50 absolute inset-y-0 block border-l border-dashed"
              style={{ left: `${ax(COVER_HEIGHT_MM)}%` }}
            />
          </div>

          <div className="relative mt-1">
            <span className="bg-rule-strong block h-px w-full" />
            {TICKS.map((t) => (
              <span key={t} className="absolute top-0 flex flex-col items-center -translate-x-1/2" style={{ left: `${ax(t)}%` }}>
                <span className="bg-rule-strong block h-1.5 w-px" />
                <span className="instrument tnum mt-1">{t}</span>
              </span>
            ))}
          </div>

          <p className="instrument text-sun-ink/70 pt-7">
            {SURVEY.clustered} of {SURVEY.total} inside {CLUSTER_BAND_MM * 2} mm
          </p>
        </div>

        <div className="border-rule border-t pt-5">
          <p className="instrument pb-4">Earliest model in which the height already appears</p>
          <div className="space-y-2">
            {STAGES.map((stage) => {
              const rows = PLINTHS.filter((p) => p.earliest === stage)
              return (
                <div key={stage} className="grid grid-cols-[11rem_1fr_2rem] items-center gap-3">
                  <span className="text-fg-faint text-xs">{STAGE_LABEL[stage]}</span>
                  <span className="flex gap-1">
                    {rows.map((p) => (
                      <span
                        key={p.id}
                        className={`block h-3 w-3 ${p.id === selected.id ? "bg-sun" : "bg-fg-muted/45"}`}
                      />
                    ))}
                  </span>
                  <span className="instrument tnum text-right">{rows.length}</span>
                </div>
              )
            })}
          </div>
          {/* The row the article says is empty in all eleven cases. Drawn empty. */}
          <div className="grid grid-cols-[11rem_1fr_2rem] items-center gap-3 pt-3">
            <span className="text-fg-faint text-xs">A recorded reason</span>
            <span className="bg-rule block h-px" />
            <span className="instrument tnum text-right">0</span>
          </div>
        </div>
      </div>
    </PlateFrame>
  )
}
