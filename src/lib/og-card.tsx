import { ImageResponse } from "next/og"

/**
 * The share card a link preview shows: the journal's dark sheet, the topic in the sun colour,
 * the title large, and a drawn elevation of fins on the right — the same language as the plates.
 */
export function ogCard({ kicker, title, foot }: { kicker: string; title: string; foot: string }) {
  const fins = Array.from({ length: 9 }, (_, i) => i)
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#0e0e0d",
        color: "#ece8df",
        padding: 64,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 700, height: "100%" }}>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>Datum</div>
        <div
          style={{
            display: "flex",
            marginTop: 64,
            fontSize: 22,
            letterSpacing: 4,
            color: "#f2b45e",
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: title.length > 28 ? 64 : 76,
            lineHeight: 1.05,
            fontWeight: 600,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 22, color: "#a39c8e" }}>{foot}</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 110,
          width: 360,
          height: 420,
          display: "flex",
          border: "1px solid #3a3833",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            bottom: 70,
            height: 230,
            display: "flex",
            background: "#1b1a18",
            border: "1px solid #57534b",
          }}
        />
        {fins.map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 52 + i * 31,
              bottom: 70,
              width: 6,
              height: 250,
              background: "#d8d1c2",
              display: "flex",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 66,
            height: 3,
            background: "#f2b45e",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 46,
            top: 36,
            width: 44,
            height: 44,
            borderRadius: 22,
            background: "#f2b45e",
            display: "flex",
          }}
        />
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
