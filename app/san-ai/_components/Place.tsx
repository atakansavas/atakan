"use client";

import { motion } from "framer-motion";
import { useLang } from "./LangProvider";

export function Place() {
  const { t } = useLang();

  return (
    <section className="relative py-24 sm:py-32 bg-[var(--sanai-bg-soft)]/40">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="sanai-label text-teal mb-6">{t.place.eyebrow}</p>
            <h2 className="sanai-serif text-[clamp(1.8rem,4vw,3rem)] font-light leading-tight">
              {t.place.title}
            </h2>
            <p className="mt-6 text-lg text-dim leading-relaxed max-w-xl">
              {t.place.sub}
            </p>
          </div>

          {/* Large cinematic photo plate — swap for a real Dalyan photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9 }}
            className="sanai-plate aspect-[4/3] w-full"
            data-caption={t.hero.plateCaption}
          >
            <div className="topo" />
          </motion.div>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.place.features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="sanai-panel sanai-card p-6"
            >
              <div className="sanai-label text-clay mb-4">{f.label}</div>
              <h3 className="sanai-serif text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-dim leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 sanai-label text-dim opacity-70">{t.place.note}</p>
      </div>
    </section>
  );
}
