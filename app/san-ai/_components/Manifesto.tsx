"use client";

import { motion } from "framer-motion";
import { useLang } from "./LangProvider";
import { SpotlightCard } from "./SpotlightCard";
import { TwoTone } from "./TwoTone";
import { reveal } from "../_lib/motion";

export function Manifesto() {
  const { t } = useLang();

  return (
    <section
      id="manifesto"
      className="relative z-10 scroll-mt-24 pt-32 md:pt-44 pb-24 md:pb-28 px-6 overflow-hidden"
    >
      {/* Subtle glow so the section lifts out of the hero */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.04)_0%,_transparent_65%)]" />

      <div className="relative max-w-5xl mx-auto">
        <motion.p {...reveal()} className="sanai-label text-[var(--sanai-su)] mb-8">
          {t.manifesto.eyebrow}
        </motion.p>

        <motion.h2
          {...reveal(0.08)}
          className="sanai-serif text-[clamp(2.4rem,6vw,5rem)] leading-[1.05] tracking-[-0.02em] max-w-4xl text-white"
        >
          <TwoTone text={t.manifesto.title} />
        </motion.h2>

        <motion.p
          {...reveal(0.16)}
          className="mt-8 max-w-2xl text-lg text-white/60 leading-relaxed"
        >
          {t.manifesto.lead}
        </motion.p>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {t.manifesto.beliefs.map((b, i) => (
            <motion.div key={b.title} {...reveal(i * 0.08)} className="h-full">
              <SpotlightCard className="liquid-glass rounded-3xl p-8 h-full">
                <span
                  aria-hidden
                  className="ghost-index absolute -top-3 right-4 text-[6rem] md:text-[8rem]"
                >
                  {i + 1}
                </span>
                <div className="sanai-label text-white/45 mb-6">0{i + 1}</div>
                <h3 className="sanai-serif text-2xl text-white mb-2">
                  {b.title}
                </h3>
                <p className="text-white/55 leading-relaxed">{b.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        <p className="mt-12 sanai-serif sanai-serif-italic text-2xl text-white/60">
          {t.manifesto.signature}
        </p>
      </div>
    </section>
  );
}
