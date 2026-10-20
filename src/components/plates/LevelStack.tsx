"use client"

import { useState } from "react"

import { PlateFrame } from "@/components/three/plates/PlateFrame"
import { PLATE_TITLES } from "@/lib/plates"
import { BENCHMARK_AOD, LEVELS, OWNERS, type Level } from "@/data/levels"

/**
 * The level schedule, with a movable zero.
 *
 * The article claims that four parties on one project each measure from somewhere else, and
 * that the datum decides which questions are free and which are effortful. No paragraph
 * demonstrates that; you have to watch the numbers move. Press a level and the schedule
 * re-bases on it — the one you chose reads ±0.000, everything above turns positive, everything
 * below negative, and the ordnance column stays put, because it is the only level nobody on the
 * project chose.
 *
 * The first version put each label at its own true height and was unreadable: six of the seven
 * levels live inside the first metre, so the labels sat on top of each other. That crowding is
 * the article's point — "out by the depth of a screed" — so it is kept, on the scale bar, where
 * it belongs. The schedule beside it is evenly spaced and leadered across, which is how a
 * drawing has always handled levels too close together to annotate in place.
 *
 * Levels come from src/data/levels.ts, which reads from MASSING the ones the model already
 * knows.
 */

const SPAN = { low: -0.35, high: 6.05 }
/** Percentage down the plate for a height in metres. */
const fy = (h: number) => 100 - ((h - SPAN.low) / (SPAN.high - SPAN.low)) * 100

/** Metres, signed, written the way a level on a drawing is written. */
function signed(metres: number) {
  const sign = metres > 0.0005 ? "+" : metres < -0.0005 ? "−" : "±"
  return `${sign}${Math.abs(metres).toFixed(3)}`
}

const BAR_X = 11
const BAR_RIGHT = 16
const ROW_X = 27
const rowY = (i: number, n: number) => ((i + 0.5) / n) * 100

/**
 * Highest first, which is how a level schedule is written and, more to the point, the only
 * order whose leaders do not cross. Listed low-to-high against a bar that runs high-to-low,
 * every leader had to pass through every other one and the left of the plate became a thicket.
 */
const ORDERED = [...LEVELS].sort((a, b) => b.height - a.height)

function Leaders({ zeroId }: { zeroId: string }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      /* The box is not square and the coordinates are percentages of each axis independently,
         which is the only way two different vertical mappings can share one drawing. Strokes
         would be scaled into wedges by that, so they opt out of the transform. */
      preserveAspectRatio="none"
    >
      {ORDERED.map((level, i) => {
        const from = fy(level.height)
        const to = rowY(i, ORDERED.length)
        const active = level.id === zeroId
        return (
          <polyline
            key={level.id}
            /* A diagonal leader with a short horizontal into the text, which is what a leader
               is. Routed orthogonally through a shared midpoint they all shared one vertical
               and the plate grew an accidental rectangle down its middle. */
            points={`${BAR_RIGHT},${from} ${ROW_X - 5},${to} ${ROW_X - 1},${to}`}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeWidth={1}
            className={active ? "stroke-sun" : "stroke-rule"}
          />
        )
      })}
    </svg>
  )
}

function Row({
  level,
  zero,
  onPick,
  index,
  count,
}: {
  level: Level
  zero: Level
  onPick: (id: string) => void
  index: number
  count: number
}) {
  const active = level.id === zero.id
  return (
    <button
      type="button"
      onClick={() => onPick(level.id)}
      aria-pressed={active}
      /* min-h-11 is the 44px floor for a finger. Measured at 390px the rows came out between
         19 and 36 pixels tall, which is a row you can read and cannot reliably hit. */
      className="group absolute flex min-h-11 -translate-y-1/2 cursor-pointer items-center text-left"
      style={{ top: `${rowY(index, count)}%`, left: `${ROW_X}%`, right: 0 }}
    >
      <span className="flex w-full items-baseline gap-3">
        <span className={`tnum shrink-0 font-mono text-xs ${active ? "text-sun-ink" : "text-fg-muted"}`}>
          {signed(level.height - zero.height)}
        </span>
        <span className={`text-xs ${active ? "text-fg" : "text-fg-faint"} group-hover:text-fg-muted`}>
          {level.label}
        </span>
        <span className="bg-rule hidden h-px flex-1 self-center sm:block" />
        <span className="instrument hidden shrink-0 sm:block">{OWNERS[level.owner]}</span>
      </span>
    </button>
  )
}

const FFL = LEVELS.find((l) => l.id === "ffl")!.height
const SSL = LEVELS.find((l) => l.id === "ssl")!.height

export function LevelStack({ plate }: { plate: number }) {
  const [zeroId, setZeroId] = useState("datum")
  const zero = LEVELS.find((l) => l.id === zeroId) ?? LEVELS[0]

  return (
    <PlateFrame
      plate={plate}
      type={PLATE_TITLES.levels}
      hint="press a level"
      caption={zero.note}
    >
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_14rem] lg:items-start">
        <div className="relative h-[24rem]">
          <Leaders zeroId={zeroId} />

          {/* Ground as a material, not another agreement: the one thing on the plate that was
              there before the project. */}
          <span
            aria-hidden="true"
            className="bg-fg/5 absolute block"
            style={{ left: 0, right: `${100 - BAR_RIGHT}%`, top: `${fy(-0.12)}%`, bottom: 0 }}
          />

          {/* The scale bar, true to height, where the crowding is legible as crowding. */}
          <span
            aria-hidden="true"
            className="bg-rule absolute block w-px"
            style={{ left: `${BAR_X}%`, top: 0, bottom: 0 }}
          />
          {LEVELS.map((level) => (
            <span
              key={level.id}
              aria-hidden="true"
              className={`draw-x absolute block h-px origin-left ${level.id === zeroId ? "bg-sun" : "bg-rule-strong"}`}
              style={{
                left: `${BAR_X - 3}%`,
                width: `${BAR_RIGHT - BAR_X + 3}%`,
                top: `${fy(level.height)}%`,
              }}
            />
          ))}

          {/*
            The screed, dimensioned on the bar.
            The article's failure is a drainage invert set from the slab against a threshold set
            from the floor, and the distance between those two is this: a gap you cannot see at
            this scale unless it is called out, which is exactly why the mistake is possible.
          */}
          <span
            aria-hidden="true"
            className="bg-sun/45 absolute block w-px"
            style={{
              left: `${BAR_X - 3}%`,
              top: `${fy(FFL)}%`,
              height: `${fy(SSL) - fy(FFL)}%`,
            }}
          />
          {/*
            Left of the bar, in the only part of the plate the leaders never cross — and only
            where there is room for it. At 390px that strip is about 37px wide and the label is
            55, so it clipped to "50 MM". The schedule still carries the figure on phones: the
            two rows it dimensions are adjacent and read +0.900 against +0.750.
          */}
          <span
            className="instrument text-sun-ink/70 absolute hidden whitespace-nowrap text-right sm:block"
            style={{
              right: `${100 - BAR_X + 4}%`,
              top: `${(fy(FFL) + fy(SSL)) / 2}%`,
              transform: "translateY(-50%)",
            }}
          >
            {Math.round((FFL - SSL) * 1000)} mm
          </span>

          {ORDERED.map((level, i) => (
            <Row
              key={level.id}
              level={level}
              zero={zero}
              onPick={setZeroId}
              index={i}
              count={ORDERED.length}
            />
          ))}
        </div>

        <dl className="border-rule space-y-3 border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
          <div>
            <dt className="instrument">Zero</dt>
            <dd className="mt-1 text-sm">{zero.label}</dd>
          </div>
          <div>
            <dt className="instrument">Owned by</dt>
            <dd className="mt-1 text-sm">{OWNERS[zero.owner]}</dd>
          </div>
          <div>
            {/* The control column: the only figure that does not move when the project changes
                its mind, which is why infrastructure engineers insist on it and nobody else
                quotes it. */}
            <dt className="instrument">Above ordnance datum</dt>
            <dd className="tnum mt-1 font-mono text-sm">
              {(BENCHMARK_AOD + zero.height).toFixed(3)} m
            </dd>
          </div>
        </dl>
      </div>
    </PlateFrame>
  )
}
