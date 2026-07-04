"use client";

import { useLang } from "./LangProvider";

/**
 * A slow, seamless horizontal marquee of keywords — an editorial band that
 * carries motion between the calmer sections. Pauses on hover.
 */
export function Marquee() {
  const { t } = useLang();
  const doubled = [...t.marquee, ...t.marquee];

  return (
    <div className="marquee-wrap relative z-10 overflow-hidden py-10 md:py-14">
      {/* soft hairlines that fade out at the ends instead of hard borders */}
      <div className="sanai-rule absolute inset-x-0 top-0" />
      <div className="sanai-rule absolute inset-x-0 bottom-0" />
      <div className="marquee">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="sanai-serif text-2xl md:text-4xl text-white/60 px-6 md:px-10 whitespace-nowrap">
              {item}
            </span>
            <span className="text-white/20 text-sm">✦</span>
          </span>
        ))}
      </div>
      {/* horizontal edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 md:w-48 bg-gradient-to-r from-[var(--sanai-navy)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 md:w-48 bg-gradient-to-l from-[var(--sanai-navy)] to-transparent" />
    </div>
  );
}
