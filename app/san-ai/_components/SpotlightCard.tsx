"use client";

import { useRef, type ReactNode } from "react";

/**
 * Wraps a glass card and tracks the pointer to drive a soft radial highlight
 * plus a thin top edge that sweeps in on hover. The highlight sits behind the
 * content so text stays crisp.
 */
export function SpotlightCard({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={`spotlight-card relative overflow-hidden ${className}`}
    >
      <div className="spotlight-glow pointer-events-none absolute inset-0" />
      <div className="spotlight-edge" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
