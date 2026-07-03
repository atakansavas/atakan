"use client";

import { motion } from "framer-motion";
import { useLang } from "./LangProvider";

export function Feed() {
  const { t } = useLang();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-5">
        <p className="sanai-label text-teal mb-6">{t.feed.eyebrow}</p>
        <h2 className="sanai-serif text-[clamp(1.8rem,4vw,3rem)] font-light leading-tight max-w-2xl">
          {t.feed.title}
        </h2>
        <p className="mt-6 text-lg text-dim leading-relaxed max-w-xl">
          {t.feed.sub}
        </p>

        {/* Channel cards — handles + embeds drop in once channels go live */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {t.feed.channels.map((c, i) => (
            <motion.div
              key={c.platform}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="sanai-panel sanai-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="sanai-serif text-lg">{c.platform}</span>
                <span className="sanai-label text-gold text-[9px] px-2 py-0.5 rounded-full border border-[var(--sanai-line)]">
                  {t.feed.soon}
                </span>
              </div>
              {/* Placeholder feed frame — swap for embedded posts later */}
              <div
                className="sanai-plate aspect-square w-full"
                data-caption={c.handle}
              >
                <div className="topo" />
              </div>
              <p className="mt-4 sanai-label text-dim opacity-70">{c.status}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
