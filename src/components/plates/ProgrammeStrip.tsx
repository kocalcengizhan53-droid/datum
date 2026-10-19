"use client"

import { useState } from "react"

import { PlateFrame } from "@/components/three/plates/PlateFrame"
import { ATTEMPTS, type Phase } from "@/data/reuse"

/**
 * The programme, on one week axis.
 *
 * The article gives the reader fourteen weeks against three and stops there. Put all four
 * durations on a shared axis and what the piece actually found becomes visible: the bar
 * everyone argues about — characterisation — is the shortest one on the sheet, and the bar
 * nobody counts in a programme, nine months of agreeing a testing regime, is longer than
 * everything else together.
 *
 * The switch is the article's whole intervention. Move the paperwork and sixty tonnes becomes
 * nothing, with the engineering, the testing and the carbon case unchanged in both states.
 */

const WEEKS_MAX = Math.max(...ATTEMPTS.flatMap((a) => a.phases.map((p) => p.weeks)))
const TICKS = [0, 10, 20, 30, 40]

function Bar({ phase, index, selected, onSelect }: { phase: Phase; index: number; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="group grid w-full min-h-11 grid-cols-[9.5rem_1fr_3.5rem] items-center gap-3 text-left sm:grid-cols-[12rem_1fr_4rem]"
    >
      <span className={`text-xs ${selected ? "text-fg" : "text-fg-faint"} group-hover:text-fg-muted`}>
        {phase.label}
      </span>
      <span className="relative block h-3">
        <span className="bg-rule absolute inset-x-0 top-1/2 h-px" />
        <span
          /* Drawn, not grown: the bar extends from the axis origin in the sheet's own idiom,
             and each one starts a beat after the last so the comparison arrives in order. */
          className={`draw-x absolute top-1/2 block h-[3px] origin-left -translate-y-1/2 ${
            selected ? "bg-sun" : phase.onCriticalPath ? "bg-fg-muted" : "bg-fg-faint/50"
          }`}
          style={{ width: `${(phase.weeks / WEEKS_MAX) * 100}%`, animationDelay: `${index * 90}ms` }}
        />
      </span>
      <span className={`tnum text-right font-mono text-xs ${selected ? "text-sun-ink" : "text-fg-muted"}`}>
        {phase.weeks} w
      </span>
    </button>
  )
}

export function ProgrammeStrip({ plate }: { plate: number }) {
  const [attemptId, setAttemptId] = useState<"before" | "after">("before")
  const [phaseId, setPhaseId] = useState("consent")
  const attempt = ATTEMPTS.find((a) => a.id === attemptId) ?? ATTEMPTS[0]
  const phase = attempt.phases.find((p) => p.id === phaseId) ?? attempt.phases[0]

  return (
    <PlateFrame plate={plate} type="programme · weeks" hint="move the paperwork" caption={phase.note}>
      <div className="space-y-5 p-5">
        <div role="group" aria-label="When the paperwork happened" className="flex flex-wrap gap-x-6 gap-y-2">
          {ATTEMPTS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAttemptId(a.id)}
              aria-pressed={a.id === attemptId}
              className={`instrument min-h-11 border-b pb-1 ${
                a.id === attemptId ? "border-sun text-sun-ink" : "border-transparent hover:text-fg-muted"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {attempt.phases.map((p, i) => (
            <Bar key={p.id} phase={p} index={i} selected={p.id === phase.id} onSelect={() => setPhaseId(p.id)} />
          ))}

          {/* The axis, under the bars it measures. */}
          <div className="grid grid-cols-[9.5rem_1fr_3.5rem] gap-3 pt-1 sm:grid-cols-[12rem_1fr_4rem]">
            <span />
            <span className="relative block">
              <span className="bg-rule-strong block h-px w-full" />
              {TICKS.map((t) => (
                <span key={t} className="absolute top-0 flex flex-col items-center" style={{ left: `${(t / WEEKS_MAX) * 100}%` }}>
                  <span className="bg-rule-strong block h-1 w-px" />
                  <span className="instrument tnum mt-0.5">{t}</span>
                </span>
              ))}
            </span>
            <span />
          </div>
        </div>

        <dl className="border-rule grid gap-4 border-t pt-4 sm:grid-cols-3">
          <div>
            <dt className="instrument">Released for reuse</dt>
            <dd className="tnum mt-1 font-mono text-sm">
              <span className={attempt.tonnesReleased ? "text-sun-ink" : "text-fg-faint"}>
                {attempt.tonnesReleased}
              </span>{" "}
              <span className="text-fg-faint">tonnes</span>
            </dd>
          </div>
          <div>
            <dt className="instrument">Testing</dt>
            <dd className="tnum mt-1 font-mono text-sm">
              £{attempt.testingCostGbp.toLocaleString("en-GB")}
            </dd>
          </div>
          <div>
            {/* Stated in both states because it is the same in both states, which is the
                finding: the thing that changed was not the carbon. */}
            <dt className="instrument">Embodied carbon case</dt>
            <dd className="mt-1 text-sm">Identical</dd>
          </div>
        </dl>
      </div>
    </PlateFrame>
  )
}
