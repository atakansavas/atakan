import type { SVGProps } from "react";

type Palette = {
  primary: string;
  accent: string;
  skin: string;
  body: string;
  hair: string;
  shadow: string;
};

const palettes: Record<string, Palette> = {
  chef: {
    primary: "#fff",
    accent: "#f0f",
    skin: "#f4c89a",
    body: "#fff",
    hair: "#222",
    shadow: "rgba(0,0,0,0.4)",
  },
  frontend: {
    primary: "#0ff",
    accent: "#0ff",
    skin: "#f4c89a",
    body: "#0a3a4a",
    hair: "#1a1a2e",
    shadow: "rgba(0,0,0,0.4)",
  },
  backend: {
    primary: "#9f7",
    accent: "#9f7",
    skin: "#d2a276",
    body: "#1f3a1f",
    hair: "#1a1a1a",
    shadow: "rgba(0,0,0,0.4)",
  },
  designer: {
    primary: "#f9a",
    accent: "#f9a",
    skin: "#f4c89a",
    body: "#5a1a3a",
    hair: "#3a1a1a",
    shadow: "rgba(0,0,0,0.4)",
  },
  pm: {
    primary: "#ff9",
    accent: "#ff9",
    skin: "#d2a276",
    body: "#3a3a1a",
    hair: "#2a2a1a",
    shadow: "rgba(0,0,0,0.4)",
  },
  marketer: {
    primary: "#fa0",
    accent: "#fa0",
    skin: "#f4c89a",
    body: "#4a2a0a",
    hair: "#2a1a0a",
    shadow: "rgba(0,0,0,0.4)",
  },
  qa: {
    primary: "#a9f",
    accent: "#a9f",
    skin: "#d2a276",
    body: "#1a1a4a",
    hair: "#1a1a2a",
    shadow: "rgba(0,0,0,0.4)",
  },
  researcher: {
    primary: "#9ff",
    accent: "#9ff",
    skin: "#f4c89a",
    body: "#0a4a4a",
    hair: "#1a1a1a",
    shadow: "rgba(0,0,0,0.4)",
  },
  support: {
    primary: "#fc9",
    accent: "#fc9",
    skin: "#d2a276",
    body: "#4a3a1a",
    hair: "#2a2a1a",
    shadow: "rgba(0,0,0,0.4)",
  },
  custom: {
    primary: "#bbb",
    accent: "#fff",
    skin: "#f4c89a",
    body: "#3a3a3a",
    hair: "#1a1a1a",
    shadow: "rgba(0,0,0,0.4)",
  },
};

export type SpriteRole = keyof typeof palettes;

export function getRolePalette(role: string): Palette {
  const key = role.toLowerCase();
  return palettes[key] ?? palettes.custom;
}

type AvatarProps = SVGProps<SVGSVGElement> & {
  role: string;
  size?: number;
  withChefHat?: boolean;
};

export function Avatar({
  role,
  size = 48,
  withChefHat,
  ...rest
}: AvatarProps) {
  const p = getRolePalette(role);
  const isChef = withChefHat ?? role.toLowerCase() === "chef";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
      {...rest}
    >
      {/* Shadow */}
      <rect x="3" y="14" width="10" height="1" fill={p.shadow} />
      {/* Body */}
      <rect x="4" y="9" width="8" height="5" fill={p.body} />
      {/* Body accent stripe */}
      <rect x="7" y="10" width="2" height="1" fill={p.accent} opacity="0.8" />
      {/* Neck */}
      <rect x="7" y="8" width="2" height="1" fill={p.skin} />
      {/* Head */}
      <rect x="5" y="4" width="6" height="5" fill={p.skin} />
      {/* Hair */}
      <rect x="5" y="3" width="6" height="2" fill={p.hair} />
      <rect x="4" y="4" width="1" height="2" fill={p.hair} />
      <rect x="11" y="4" width="1" height="2" fill={p.hair} />
      {/* Eyes */}
      <rect x="6" y="6" width="1" height="1" fill="#000" />
      <rect x="9" y="6" width="1" height="1" fill="#000" />
      {/* Mouth */}
      <rect x="7" y="8" width="2" height="0.5" fill="#000" opacity="0.5" />
      {/* Chef hat */}
      {isChef && (
        <>
          <rect x="4" y="1" width="8" height="2" fill="#fff" />
          <rect x="3" y="2" width="1" height="1" fill="#fff" />
          <rect x="12" y="2" width="1" height="1" fill="#fff" />
          <rect x="5" y="0" width="6" height="1" fill="#fff" />
          <rect x="4" y="3" width="8" height="1" fill="#eee" />
        </>
      )}
    </svg>
  );
}

export function Desk({ size = 64, accent = "#0ff" }: { size?: number; accent?: string }) {
  return (
    <svg
      width={size}
      height={(size * 12) / 32}
      viewBox="0 0 32 12"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="0" y="2" width="32" height="3" fill="#5a3a1a" />
      <rect x="0" y="2" width="32" height="1" fill="#7a4a2a" />
      <rect x="2" y="5" width="2" height="6" fill="#3a2a0a" />
      <rect x="28" y="5" width="2" height="6" fill="#3a2a0a" />
      {/* Monitor */}
      <rect x="11" y="0" width="10" height="2" fill="#0a0a0a" />
      <rect x="12" y="-1" width="8" height="2" fill="#0a0a0a" />
      <rect x="13" y="0" width="6" height="1" fill={accent} opacity="0.7" />
    </svg>
  );
}

export function Plant({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 16"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Pot */}
      <rect x="3" y="11" width="6" height="4" fill="#7a3a1a" />
      <rect x="3" y="11" width="6" height="1" fill="#9a4a2a" />
      {/* Leaves */}
      <rect x="5" y="2" width="2" height="9" fill="#1a4a1a" />
      <rect x="2" y="5" width="2" height="3" fill="#2a6a2a" />
      <rect x="8" y="4" width="2" height="3" fill="#2a6a2a" />
      <rect x="3" y="7" width="2" height="3" fill="#3a7a3a" />
      <rect x="7" y="7" width="2" height="3" fill="#3a7a3a" />
    </svg>
  );
}

export function Lamp({ size = 24, glow = "#ff9" }: { size?: number; glow?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 16"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Base */}
      <rect x="4" y="14" width="4" height="2" fill="#3a3a3a" />
      {/* Stem */}
      <rect x="5" y="6" width="2" height="8" fill="#5a5a5a" />
      {/* Shade */}
      <rect x="2" y="2" width="8" height="4" fill={glow} />
      <rect x="3" y="1" width="6" height="1" fill={glow} />
      <rect x="2" y="2" width="8" height="1" fill="#fff" opacity="0.5" />
    </svg>
  );
}

export function Window({
  size = 64,
  paint = "#0ff",
}: {
  size?: number;
  paint?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
    >
      <rect x="0" y="0" width="16" height="16" fill="#1a1a2a" />
      <rect x="1" y="1" width="14" height="14" fill={paint} opacity="0.3" />
      <rect x="7" y="1" width="2" height="14" fill="#3a3a3a" />
      <rect x="1" y="7" width="14" height="2" fill="#3a3a3a" />
      {/* Stars / dots */}
      <rect x="3" y="3" width="1" height="1" fill="#fff" opacity="0.8" />
      <rect x="11" y="4" width="1" height="1" fill="#fff" opacity="0.6" />
      <rect x="5" y="11" width="1" height="1" fill="#fff" opacity="0.5" />
    </svg>
  );
}
