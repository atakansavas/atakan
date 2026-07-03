"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLang } from "./LangProvider";

export function UnderTheRoof() {
  const { t } = useLang();

  return (
    <section className="relative py-24 sm:py-32 bg-[var(--sanai-bg-soft)]/40">
      <div className="max-w-6xl mx-auto px-5">
        <p className="sanai-label text-clay mb-6">{t.roof.eyebrow}</p>
        <h2 className="sanai-serif text-[clamp(1.8rem,4vw,3rem)] font-light leading-tight">
          {t.roof.title}
        </h2>
        <p className="mt-6 text-lg text-dim leading-relaxed max-w-xl">
          {t.roof.sub}
        </p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.roof.projects.map((p, i) => {
            const inner = (
              <>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="sanai-label text-teal">{p.kind}</span>
                  <span className="sanai-label text-dim opacity-70 text-[9px]">
                    {p.status}
                  </span>
                </div>
                <h3 className="sanai-serif text-2xl mb-3">{p.name}</h3>
                <p className="text-sm text-dim leading-relaxed">{p.desc}</p>
                {p.href && (
                  <span className="mt-5 inline-flex items-center gap-1.5 sanai-label text-gold">
                    {p.name} →
                  </span>
                )}
              </>
            );

            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                {p.href ? (
                  <Link
                    href={p.href}
                    className="sanai-panel sanai-card p-8 h-full flex flex-col block"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="sanai-panel p-8 h-full flex flex-col opacity-80">
                    {inner}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 sanai-serif italic text-lg text-dim">{t.roof.note}</p>
      </div>
    </section>
  );
}
