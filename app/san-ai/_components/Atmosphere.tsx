import { Starfield } from "./Starfield";

/**
 * Fixed atmospheric backdrop that lives behind every section (z-0). The hero
 * video sits above it in its own viewport, so this reads mainly through the
 * dark sections below — drifting glows, a twinkling starfield and film grain
 * that keep the navy from ever feeling flat.
 */
export function Atmosphere() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        className="atmo-glow atmo-glow-a"
        style={{
          top: "12%",
          left: "-8%",
          width: "42vw",
          height: "42vw",
          background:
            "radial-gradient(circle, rgba(94,164,143,0.2), transparent 70%)",
        }}
      />
      <div
        className="atmo-glow atmo-glow-b"
        style={{
          bottom: "6%",
          right: "-10%",
          width: "46vw",
          height: "46vw",
          background:
            "radial-gradient(circle, rgba(46,124,107,0.16), transparent 70%)",
        }}
      />
      <Starfield />
      <div className="atmo-grain" />
    </div>
  );
}
