"use client";

import { motion } from "framer-motion";
import { useLang } from "./LangProvider";

export function Hero() {
  const { t } = useLang();

  return (
    <section className="relative min-h-[100svh] flex items-center pt-14 overflow-hidden">
      {/* Cinematic backdrop plate — swap for a real Dalyan photo later */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 sanai-drift">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(1000px 800px at 20% 30%, rgba(111,174,159,0.20), transparent 60%), radial-gradient(900px 700px at 85% 20%, rgba(215,165,74,0.14), transparent 55%), radial-gradient(1100px 900px at 60% 120%, rgba(198,113,74,0.18), transparent 60%)",
            }}
          />
        </div>
        {/* Letterbox bars */}
        <div className="absolute inset-x-0 top-14 h-10 bg-gradient-to-b from-[#12140f] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#12140f] to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-5 w-full">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="sanai-label text-teal mb-6"
        >
          {t.hero.eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
          className="sanai-serif text-[clamp(2.6rem,8vw,6.2rem)] font-light leading-[0.98] tracking-[-0.02em] max-w-4xl"
        >
          {t.hero.headline}
          <br />
          <span className="italic text-gold">{t.hero.headlineAccent}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="mt-8 max-w-xl text-lg text-dim leading-relaxed"
        >
          {t.hero.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 flex items-center gap-3 sanai-label text-dim"
        >
          <span className="sanai-pulse">↓</span>
          <span>{t.hero.scroll}</span>
        </motion.div>
      </div>
    </section>
  );
}
