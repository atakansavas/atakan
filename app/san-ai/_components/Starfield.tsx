"use client";

import { useEffect, useState } from "react";

/**
 * A pure-CSS starfield: two layers of box-shadow dots that gently twinkle.
 * No canvas — keeps the paint cheap and plays nicely with screenshotting.
 * Stars are generated once on the client to avoid hydration mismatch.
 */
function buildShadow(count: number, bright: boolean) {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2200);
    const y = Math.floor(Math.random() * 1500);
    const alpha = bright ? 0.85 : 0.45;
    parts.push(`${x}px ${y}px 0 0 rgba(200,220,255,${alpha})`);
  }
  return parts.join(", ");
}

export function Starfield() {
  const [layers, setLayers] = useState<{ near: string; far: string }>({
    near: "",
    far: "",
  });

  useEffect(() => {
    setLayers({ near: buildShadow(90, true), far: buildShadow(130, false) });
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="starfield starfield-far" style={{ boxShadow: layers.far }} />
      <div
        className="starfield starfield-near"
        style={{ boxShadow: layers.near }}
      />
    </div>
  );
}
