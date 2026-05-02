"use client";

import { motion } from "framer-motion";
import { Inbox, ChefHat, Users, Eye } from "lucide-react";
import { useLang } from "./LangProvider";

const icons = [Inbox, ChefHat, Users, Eye];

export function Concept() {
  const { t } = useLang();

  return (
    <section id="concept" className="py-24 relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <div className="pixel-font text-[10px] tracking-widest text-[var(--color-accent)]/80 mb-3">
            {t.concept.eyebrow}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold pixel-font uppercase text-white text-glow mb-4">
            {t.concept.title}
          </h2>
          <p className="text-[#94a3b8] text-base md:text-lg max-w-2xl mx-auto">
            {t.concept.sub}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {t.concept.steps.map((step, index) => {
            const Icon = icons[index] ?? Inbox;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="mesai-step retro-window p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="pixel-font text-[10px] text-[var(--color-accent)] tracking-widest">
                    /{step.tag}
                  </span>
                  <div className="w-9 h-9 border border-[var(--color-primary)]/60 bg-[#050511] flex items-center justify-center shadow-[0_0_8px_rgba(255,0,255,0.5)]">
                    <Icon className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                </div>
                <h3 className="pixel-font text-sm uppercase text-white leading-snug">
                  {step.title}
                </h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
