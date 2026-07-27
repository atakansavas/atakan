"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "./LangProvider";
import { Magnetic } from "./Magnetic";
import { ParallaxVideo } from "./ParallaxVideo";
import { SpotlightCard } from "./SpotlightCard";
import { TwoTone } from "./TwoTone";
import { reveal } from "../_lib/motion";
import { videos } from "../_lib/videos";

export function Place() {
  const { t } = useLang();

  return (
    <section
      id="nerede"
      className="relative z-10 scroll-mt-24 py-14 md:py-20 px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <motion.p {...reveal()} className="sanai-label text-[var(--sanai-su)] mb-5">
          {t.place.eyebrow}
        </motion.p>

        <motion.h2
          {...reveal(0.08)}
          className="sanai-serif text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em] max-w-3xl text-white"
        >
          <TwoTone text={t.place.title} />
        </motion.h2>

        {/* Featured cinematic plate — the real drone loop of the venue. The card
            overlays the video on desktop, drops below it on mobile so the copy
            never clips a short frame. The poster shows the valley still while the
            clip lazy-loads. */}
        <motion.div {...reveal(0.14)} className="relative mt-8">
          <div
            className="relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-video bg-cover bg-center"
            style={{ backgroundImage: "url(/san-ai/hero-poster.jpg)" }}
          >
            <ParallaxVideo src={videos.hero} className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
            <span className="absolute top-5 left-5 sanai-chip">
              {t.meta.location}
            </span>
          </div>

          <div className="mt-4 md:mt-0 md:absolute md:inset-x-0 md:bottom-0 md:p-8 lg:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
            <div className="liquid-glass rounded-2xl p-6 md:p-7 max-w-md">
              <div className="sanai-label text-white/50 mb-3">
                {t.place.cardLabel} · {t.meta.coords}
              </div>
              <p className="text-white text-sm md:text-base leading-relaxed">
                {t.place.sub}
              </p>
            </div>
            <Magnetic className="self-start md:self-auto">
              <a
                href="#invite"
                className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium inline-flex items-center gap-2"
              >
                {t.place.cta}
                <ArrowUpRight size={16} />
              </a>
            </Magnetic>
          </div>
        </motion.div>

        {/* Feature items — what the place actually offers. */}
        <div className="mt-8 md:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {t.place.features.map((f, i) => (
            <motion.div key={f.title} {...reveal(i * 0.07)} className="h-full">
              <SpotlightCard className="glass-panel p-5 md:p-6 h-full">
                <div className="sanai-label text-white/40 mb-3">{f.label}</div>
                <h3 className="sanai-serif text-lg text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        <motion.p {...reveal(0.1)} className="mt-6 sanai-label text-white/35">
          {t.place.note}
        </motion.p>
      </div>
    </section>
  );
}
