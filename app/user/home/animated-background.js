"use client"

// Architectural vertical bars — abstract, minimal, varying heights.
// They rise from the BOTTOM of the section into the deep-blue zone.
// Heights are set so the shorter bars still sit fully inside the blue area.
const bars = [
  { left: "1%", width: 36, height: "40%", blur: 7 },
  { left: "5%", width: 26, height: "62%", blur: 5 },
  { left: "9.5%", width: 48, height: "35%", blur: 9 },
  { left: "14%", width: 32, height: "75%", blur: 6 },
  { left: "18.5%", width: 42, height: "50%", blur: 8 },
  { left: "23%", width: 28, height: "68%", blur: 5 },
  { left: "27.5%", width: 52, height: "43%", blur: 10 },
  { left: "32%", width: 38, height: "82%", blur: 7 },
  { left: "37%", width: 58, height: "58%", blur: 12 },
  { left: "42%", width: 44, height: "90%", blur: 8 },
  { left: "47.5%", width: 66, height: "72%", blur: 13 },
  { left: "53%", width: 46, height: "88%", blur: 9 },
  { left: "58%", width: 56, height: "60%", blur: 11 },
  { left: "63%", width: 34, height: "78%", blur: 6 },
  { left: "67.5%", width: 50, height: "46%", blur: 9 },
  { left: "72%", width: 30, height: "70%", blur: 5 },
  { left: "76.5%", width: 44, height: "38%", blur: 8 },
  { left: "81%", width: 36, height: "65%", blur: 7 },
  { left: "85.5%", width: 52, height: "54%", blur: 9 },
  { left: "90%", width: 28, height: "74%", blur: 5 },
  { left: "94.5%", width: 40, height: "42%", blur: 7 },
]

export function AnimatedBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      style={{
        maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 100%)",
      }}
    >
      {/* ── Vertical architectural bars ──────────────────────────────── */}
      {/* Visible as light glass columns against the deep blue zone      */}
      {bars.map((bar, i) => (
        <div
          key={i}
          className="absolute bottom-0"
          style={{
            left: bar.left,
            width: bar.width,
            height: bar.height,
            borderRadius: `${bar.width / 2}px ${bar.width / 2}px 0 0`,
            // Bars are white/light-blue sheens — 8-14% opacity at base,
            // fading to transparent at the top for the soft "glass pillar" look
            background:
              "linear-gradient(to top, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.13) 30%, rgba(255,255,255,0.05) 65%, transparent 100%)",
            filter: `blur(${bar.blur}px)`,
          }}
        />
      ))}

      {/* ── V-shape radial convergence ───────────────────────────────── */}
      {/* Bright white-centre radial anchored below bottom-centre,       */}
      {/* creates the triangular depth pull visible in getpin.ai         */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "75%",
          background:
            "radial-gradient(ellipse 60% 80% at 50% 115%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.14) 28%, rgba(255,255,255,0.04) 52%, transparent 68%)",
        }}
      />

      {/* ── Top white wash — text area stays clean white ─────────────── */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "22%",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, transparent 100%)",
        }}
      />

    </div>
  )
}