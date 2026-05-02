"use client";

import { motion } from "framer-motion";
import { Globe2, Calendar, DoorOpen } from "lucide-react";
import { useLang } from "./LangProvider";

const teaserIcons = [Globe2, Calendar, DoorOpen];

export function WorldVision() {
  const { t } = useLang();
  const w = t.world;

  return (
    <section className="py-24 relative z-10 border-t border-[var(--color-border)] overflow-hidden">
      <div className="absolute inset-0 -z-0 opacity-30">
        <div className="iso-grid" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <div className="inline-block pixel-font text-[10px] tracking-widest border border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)] px-3 py-1 mb-4 uppercase">
            {w.eyebrow}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold pixel-font uppercase text-white text-glow mb-4">
            {w.title}
          </h2>
          <p className="text-[#94a3b8] text-base md:text-lg max-w-2xl mx-auto">
            {w.sub}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="retro-window p-3 mb-10"
        >
          <WorldStrip />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {w.teasers.map((teaser, index) => {
            const Icon = teaserIcons[index] ?? Globe2;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="retro-window p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border border-[var(--color-accent)]/60 bg-[#050511] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="pixel-font text-sm uppercase text-white">
                    {teaser.title}
                  </h3>
                </div>
                <p className="text-[#94a3b8] text-sm leading-relaxed">
                  {teaser.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorldStrip() {
  const buildings = [
    { x: 5, w: 22, h: 36, color: "#1a0a2a", win: "#f0f" },
    { x: 32, w: 30, h: 50, color: "#0a1a2a", win: "#0ff" },
    { x: 67, w: 18, h: 30, color: "#2a1a0a", win: "#ffb86b" },
    { x: 90, w: 26, h: 44, color: "#0a2a1a", win: "#9fbf7f" },
    { x: 121, w: 20, h: 34, color: "#1a1a3a", win: "#a9f" },
    { x: 146, w: 28, h: 48, color: "#2a0a2a", win: "#fa0" },
    { x: 179, w: 16, h: 28, color: "#0a2a2a", win: "#9ff" },
    { x: 200, w: 24, h: 42, color: "#1a0a1a", win: "#fc9" },
    { x: 229, w: 22, h: 36, color: "#0a1a1a", win: "#0ff" },
    { x: 256, w: 20, h: 32, color: "#1a1a2a", win: "#f0f" },
    { x: 281, w: 28, h: 46, color: "#2a1a2a", win: "#ff9" },
    { x: 314, w: 18, h: 28, color: "#0a0a2a", win: "#0ff" },
  ];

  return (
    <svg
      viewBox="0 0 340 70"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      style={{
        imageRendering: "pixelated",
        width: "100%",
        height: "auto",
        display: "block",
      }}
    >
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050511" />
          <stop offset="100%" stopColor="#1a0a2a" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="340" height="70" fill="url(#sky)" />

      {/* Stars */}
      {[
        [12, 6],
        [40, 4],
        [78, 8],
        [110, 5],
        [150, 7],
        [190, 4],
        [220, 8],
        [260, 5],
        [300, 7],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1" height="1" fill="#fff" opacity="0.7" />
      ))}

      {/* Ground */}
      <rect x="0" y="64" width="340" height="6" fill="#000" />
      <rect x="0" y="63" width="340" height="1" fill="#0ff" opacity="0.4" />

      {buildings.map((b, i) => {
        const top = 64 - b.h;
        const cols = Math.max(2, Math.floor(b.w / 4));
        const rows = Math.max(2, Math.floor(b.h / 4));
        return (
          <g key={i}>
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={b.color} />
            <rect x={b.x} y={top} width={b.w} height={1} fill={b.win} opacity="0.5" />
            {Array.from({ length: rows - 1 }).map((_, r) =>
              Array.from({ length: cols - 1 }).map((_, c) => {
                const lit = (r + c + i) % 3 !== 0;
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={b.x + 2 + c * 4}
                    y={top + 2 + r * 4}
                    width="2"
                    height="2"
                    fill={b.win}
                    opacity={lit ? 0.85 : 0.15}
                  />
                );
              }),
            )}
          </g>
        );
      })}
    </svg>
  );
}
