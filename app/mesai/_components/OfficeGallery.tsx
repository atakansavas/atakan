"use client";

import { motion } from "framer-motion";
import { useLang } from "./LangProvider";
import { OfficeRoom, type OfficeTheme } from "./OfficeRoom";

export function OfficeGallery() {
  const { t } = useLang();
  const g = t.gallery;

  return (
    <section className="py-24 relative z-10 border-t border-[var(--color-border)]">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <div className="pixel-font text-[10px] tracking-widest text-[var(--color-accent)]/80 mb-3">
            {g.eyebrow}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold pixel-font uppercase text-white text-glow mb-4">
            {g.title}
          </h2>
          <p className="text-[#94a3b8] text-base md:text-lg max-w-2xl mx-auto">
            {g.sub}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {g.offices.map((office, i) => (
            <motion.article
              key={office.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="mesai-gallery-card retro-window p-3 flex flex-col gap-3"
            >
              <OfficeRoom
                theme={office.theme as OfficeTheme}
                team={office.team}
                showLabel={false}
              />
              <div className="px-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="pixel-font text-sm uppercase text-white leading-tight">
                    {office.name}
                  </h3>
                  <span className="pixel-font text-[10px] text-[var(--color-accent)]/70">
                    {office.owner}
                  </span>
                </div>
                <p className="text-[13px] text-[#94a3b8] leading-relaxed">
                  {office.note}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {office.team.map((member, idx) => (
                    <span
                      key={idx}
                      className="mesai-role-chip pixel-font text-[9px] uppercase tracking-widest"
                    >
                      {member}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  disabled
                  title={g.soon}
                  className="mt-2 retro-btn px-3 py-2 text-[10px] cursor-not-allowed opacity-70 flex items-center justify-center gap-2"
                >
                  {g.copyTeam}
                  <span className="pixel-font text-[8px] border border-[var(--color-accent)]/60 px-1 py-0.5">
                    {g.soon}
                  </span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
