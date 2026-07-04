"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "./LangProvider";
import { SectionVideo } from "./SectionVideo";
import { SpotlightCard } from "./SpotlightCard";
import { TwoTone } from "./TwoTone";
import { reveal } from "../_lib/motion";
import { videos } from "../_lib/videos";

const CHANNEL_VIDEOS = [
  videos.feedInstagram,
  videos.feedTiktok,
  videos.feedYoutube,
];

export function Feed() {
  const { t } = useLang();

  return (
    <section
      id="akis"
      className="relative z-10 scroll-mt-24 py-24 md:py-36 px-6 overflow-hidden"
    >
      <div className="relative max-w-6xl mx-auto">
        <motion.div {...reveal()}>
          <p className="sanai-label text-[var(--sanai-su)] mb-6">{t.feed.eyebrow}</p>
          <div className="flex items-end justify-between gap-6">
            <h2 className="sanai-serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.02em] max-w-2xl text-white">
              <TwoTone text={t.feed.title} />
            </h2>
            <span className="sanai-label text-white/40 hidden md:block shrink-0">
              {t.feed.aside}
            </span>
          </div>
          <p className="mt-6 text-lg text-white/60 leading-relaxed max-w-xl">
            {t.feed.sub}
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.feed.channels.map((c, i) => (
            <motion.div
              key={c.platform}
              {...reveal(i * 0.1)}
              className="h-full"
            >
              <SpotlightCard className="liquid-glass rounded-3xl group h-full">
                <div className="relative aspect-video overflow-hidden">
                  <SectionVideo
                    src={CHANNEL_VIDEOS[i]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-4 right-4 sanai-chip">
                    {t.feed.soon}
                  </span>
                </div>
                <div className="p-6 md:p-7">
                  <div className="flex items-center justify-between mb-3">
                    <span className="sanai-label text-white/40">
                      {c.handle}
                    </span>
                    <span className="liquid-glass rounded-full p-2 inline-flex text-[var(--sanai-su)] transition-transform duration-300 group-hover:rotate-45">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                  <h3 className="sanai-serif text-xl md:text-2xl text-white mb-2 tracking-tight">
                    {c.platform}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
