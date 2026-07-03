"use client";

import { motion } from "framer-motion";
import { useLang } from "./LangProvider";

export function Manifesto() {
  const { t } = useLang();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-5">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="sanai-label text-clay mb-8"
        >
          {t.manifesto.eyebrow}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="sanai-serif text-[clamp(1.9rem,4.5vw,3.4rem)] font-light leading-tight max-w-3xl"
        >
          {t.manifesto.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-8 max-w-2xl text-lg text-dim leading-relaxed"
        >
          {t.manifesto.lead}
        </motion.p>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--sanai-line)] rounded-2xl overflow-hidden">
          {t.manifesto.beliefs.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="sanai-card bg-[var(--sanai-bg-soft)] p-8"
            >
              <div className="sanai-label text-teal mb-4">0{i + 1}</div>
              <h3 className="sanai-serif text-xl mb-2">{b.title}</h3>
              <p className="text-dim leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 sanai-serif italic text-xl text-gold">
          {t.manifesto.signature}
        </p>
      </div>
    </section>
  );
}
