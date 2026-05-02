"use client";

import { motion } from "framer-motion";
import { useLang } from "./LangProvider";
import { OfficeRoom, type OfficeTheme } from "./OfficeRoom";

export function OfficeDesign() {
  const { t } = useLang();
  const d = t.officeDesign;

  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <div className="pixel-font text-[10px] tracking-widest text-[var(--color-accent)]/80 mb-3">
            {d.eyebrow}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold pixel-font uppercase text-white text-glow mb-4">
            {d.title}
          </h2>
          <p className="text-[#94a3b8] text-base md:text-lg max-w-2xl mx-auto">
            {d.sub}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {d.themes.map((theme, i) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="retro-window p-3 flex flex-col gap-3"
            >
              <OfficeRoom
                theme={theme.id as OfficeTheme}
                team={["Chef", "Frontend", "Designer"]}
                showLabel={false}
              />
              <div className="px-2 pt-1 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="pixel-font text-sm uppercase text-white">
                    {theme.name}
                  </h3>
                  <span className="pixel-font text-[8px] text-[var(--color-accent)]/70 uppercase">
                    {theme.tagline}
                  </span>
                </div>
                <p className="text-[13px] text-[#94a3b8] leading-relaxed">
                  {theme.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[#94a3b8] text-sm mt-8 pixel-font tracking-wider uppercase opacity-70">
          {`// ${d.hint}`}
        </p>
      </div>
    </section>
  );
}
