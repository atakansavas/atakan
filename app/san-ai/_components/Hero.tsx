"use client";

import { useEffect, useRef } from "react";
import { useLang } from "./LangProvider";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export function Hero() {
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Nudge playback in case the browser hesitates on autoplay after hydration.
  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section
      id="top"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
    >
      {/* Fullscreen looping video — the sole source of visual depth. The whole
          layer is masked at the bottom so the hero dissolves into the navy /
          starfield below instead of ending on a hard edge. */}
      <div
        className="absolute inset-0 z-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)",
        }}
      >
        <div className="absolute inset-0 bg-[var(--sanai-navy)]" />
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        {/* Legibility + blend into the navy sections below */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,26,42,0.5) 0%, rgba(0,26,42,0.12) 30%, rgba(0,26,42,0.32) 66%, var(--sanai-navy) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(125% 90% at 50% 42%, transparent 38%, rgba(0,18,30,0.5) 100%)",
          }}
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center pt-24 pb-28">
        <p className="animate-fade-rise sanai-label text-[var(--sanai-su-soft)] mb-7">
          {t.hero.eyebrow}
        </p>

        <h1 className="animate-fade-rise-delay sanai-serif text-[clamp(2.7rem,8.5vw,7rem)] leading-[0.92] tracking-[-0.03em] text-white">
          {t.hero.headline}
          <br />
          <em className="not-italic text-[var(--sanai-su-soft)]">
            {t.hero.headlineAccent}
          </em>
        </h1>

        <p className="animate-fade-rise-delay-2 mt-8 mx-auto max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
          {t.hero.sub}
        </p>

        <div className="animate-fade-rise-delay-3 mt-12">
          <a
            href="#manifesto"
            className="liquid-glass rounded-full px-12 py-4 text-base text-white inline-flex items-center"
          >
            {t.hero.cta}
          </a>
        </div>
      </div>

      {/* Cinematic HUD line */}
      <div className="absolute bottom-6 inset-x-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between sanai-label text-white/45">
          <span className="hidden sm:inline">{t.meta.coords} · DALYAN</span>
          <a
            href="#manifesto"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <span>{t.hero.scroll}</span>
            <span className="sanai-bob not-italic">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
