"use client";

import { Avatar } from "./sprites";

export type OfficeTheme = "hacker" | "cozy" | "openplan";

const themes: Record<
  OfficeTheme,
  {
    floor: string;
    wall: string;
    accent: string;
    decor: string;
    glow: string;
    label: string;
  }
> = {
  hacker: {
    floor: "#0a0a18",
    wall: "#1a0a2a",
    accent: "#f0f",
    decor: "#0ff",
    glow: "rgba(255,0,255,0.25)",
    label: "HACKER DEN",
  },
  cozy: {
    floor: "#3a2a1a",
    wall: "#5a3a2a",
    accent: "#ffb86b",
    decor: "#9fbf7f",
    glow: "rgba(255,184,107,0.3)",
    label: "COZY STUDIO",
  },
  openplan: {
    floor: "#dcdce0",
    wall: "#f4f4f6",
    accent: "#888",
    decor: "#aaa",
    glow: "rgba(0,0,0,0.05)",
    label: "OPEN PLAN",
  },
};

type Props = {
  theme: OfficeTheme;
  team: string[];
  caption?: string;
  className?: string;
  showLabel?: boolean;
};

export function OfficeRoom({
  theme,
  team,
  caption,
  className = "",
  showLabel = true,
}: Props) {
  const t = themes[theme];
  const visibleTeam = team.slice(0, 6);
  const isLight = theme === "openplan";

  return (
    <div
      className={`mesai-room-frame relative w-full ${className}`}
      style={{ aspectRatio: "16 / 10" }}
      data-theme={theme}
    >
      <svg
        viewBox="0 0 160 100"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        style={{
          imageRendering: "pixelated",
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        {/* Wall */}
        <rect x="0" y="0" width="160" height="60" fill={t.wall} />
        {/* Floor */}
        <rect x="0" y="60" width="160" height="40" fill={t.floor} />
        {/* Floor stripes */}
        {[64, 72, 80, 88, 96].map((y) => (
          <rect
            key={y}
            x="0"
            y={y}
            width="160"
            height="1"
            fill={isLight ? "#c8c8cc" : "#000"}
            opacity={isLight ? 0.4 : 0.25}
          />
        ))}
        {/* Wall trim */}
        <rect x="0" y="58" width="160" height="2" fill={t.accent} opacity="0.5" />

        {/* Window on wall */}
        <g>
          <rect x="14" y="10" width="28" height="22" fill="#1a1a2a" />
          <rect x="16" y="12" width="24" height="18" fill={t.decor} opacity="0.45" />
          <rect x="27" y="12" width="2" height="18" fill="#3a3a3a" />
          <rect x="16" y="20" width="24" height="2" fill="#3a3a3a" />
          <rect x="20" y="14" width="1" height="1" fill="#fff" opacity="0.8" />
          <rect x="34" y="16" width="1" height="1" fill="#fff" opacity="0.6" />
        </g>

        {/* Wall art / sign */}
        <g>
          <rect x="120" y="14" width="26" height="14" fill={t.accent} opacity="0.18" />
          <rect x="120" y="14" width="26" height="14" fill="none" stroke={t.accent} strokeWidth="0.5" />
          <text
            x="133"
            y="22"
            fontFamily="monospace"
            fontSize="4"
            fill={t.accent}
            textAnchor="middle"
            fontWeight="bold"
          >
            MESAI
          </text>
          <text
            x="133"
            y="26"
            fontFamily="monospace"
            fontSize="2.5"
            fill={t.accent}
            textAnchor="middle"
            opacity="0.8"
          >
            OFFICE
          </text>
        </g>

        {/* Long desk */}
        <rect x="20" y="62" width="120" height="6" fill={isLight ? "#9a8a7a" : "#5a3a1a"} />
        <rect x="20" y="62" width="120" height="1" fill={isLight ? "#bca99a" : "#7a4a2a"} />
        {/* Desk legs */}
        <rect x="22" y="68" width="2" height="10" fill={isLight ? "#6a5a4a" : "#3a2a0a"} />
        <rect x="78" y="68" width="2" height="10" fill={isLight ? "#6a5a4a" : "#3a2a0a"} />
        <rect x="136" y="68" width="2" height="10" fill={isLight ? "#6a5a4a" : "#3a2a0a"} />

        {/* Monitors on desk */}
        {visibleTeam.slice(0, 4).map((_, i) => {
          const x = 28 + i * 28;
          return (
            <g key={`mon-${i}`}>
              <rect x={x} y="54" width="14" height="8" fill="#0a0a0a" />
              <rect x={x + 1} y="55" width="12" height="6" fill={t.accent} opacity="0.7" />
              <rect x={x + 5} y="62" width="4" height="2" fill="#0a0a0a" />
            </g>
          );
        })}

        {/* Plant in corner */}
        <g transform="translate(146, 68)">
          <rect x="1" y="14" width="8" height="6" fill="#7a3a1a" />
          <rect x="1" y="14" width="8" height="1" fill="#9a4a2a" />
          <rect x="4" y="2" width="2" height="12" fill="#1a4a1a" />
          <rect x="1" y="6" width="2" height="4" fill="#2a6a2a" />
          <rect x="7" y="4" width="2" height="4" fill="#2a6a2a" />
          <rect x="2" y="9" width="2" height="3" fill="#3a7a3a" />
          <rect x="6" y="9" width="2" height="3" fill="#3a7a3a" />
        </g>

        {/* Lamp */}
        <g transform="translate(2, 36)">
          <rect x="4" y="20" width="6" height="2" fill="#3a3a3a" />
          <rect x="6" y="6" width="2" height="14" fill="#5a5a5a" />
          <rect x="2" y="2" width="10" height="4" fill={t.accent} opacity="0.9" />
          <rect x="3" y="1" width="8" height="1" fill={t.accent} />
          <rect x="2" y="2" width="10" height="1" fill="#fff" opacity="0.4" />
          <circle cx="7" cy="8" r="6" fill={t.glow} />
        </g>
      </svg>

      {/* Avatars layered as DOM elements for crisper rendering at small sizes */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[18%] gap-[2.5%] px-[12%]">
        {visibleTeam.map((member, i) => (
          <div
            key={`${member}-${i}`}
            className="flex flex-col items-center"
            style={{ width: "12%" }}
            title={member}
          >
            <Avatar role={member} size={36} className="w-full h-auto" />
          </div>
        ))}
      </div>

      {showLabel && (
        <div className="absolute top-2 left-2 pixel-font text-[8px] uppercase tracking-widest border border-current px-1.5 py-0.5 bg-black/60 text-[var(--color-accent)]">
          {t.label}
        </div>
      )}

      {caption && (
        <div className="absolute bottom-1 right-2 pixel-font text-[8px] text-[var(--color-accent)]/70 uppercase tracking-widest">
          {caption}
        </div>
      )}
    </div>
  );
}
