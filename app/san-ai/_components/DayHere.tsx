"use client";

import { motion } from "framer-motion";
import { useLang } from "./LangProvider";

export function DayHere() {
  const { t } = useLang();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-5">
        <p className="sanai-label text-teal mb-6">{t.day.eyebrow}</p>
        <h2 className="sanai-serif text-[clamp(1.8rem,4vw,3rem)] font-light leading-tight max-w-2xl">
          {t.day.title}
        </h2>
        <p className="mt-6 text-lg text-dim leading-relaxed max-w-xl">
          {t.day.sub}
        </p>

        <div className="mt-14 relative">
          {/* Vertical river-line down the timeline */}
          <div
            className="absolute left-[68px] sm:left-[84px] top-2 bottom-2 w-px"
            style={{
              background:
                "linear-gradient(180deg, transparent, var(--sanai-teal), var(--sanai-clay), transparent)",
              opacity: 0.5,
            }}
          />
          <div className="space-y-10">
            {t.day.blocks.map((b, i) => (
              <motion.div
                key={b.time}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="relative flex gap-6 sm:gap-10 items-start"
              >
                <div className="sanai-label text-gold w-[52px] sm:w-[68px] shrink-0 pt-1 text-right">
                  {b.time}
                </div>
                <span className="absolute left-[64px] sm:left-[80px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--sanai-teal)] ring-4 ring-[#12140f]" />
                <div className="pl-6 sm:pl-8">
                  <h3 className="sanai-serif text-xl">{b.title}</h3>
                  <p className="text-dim leading-relaxed mt-1">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
