"use client";

import { motion } from "framer-motion";
import { Wallet, Plug, ShieldCheck, GitFork } from "lucide-react";
import { useLang } from "./LangProvider";

const philosophyIcons = [Wallet, Plug, ShieldCheck, GitFork];

export function TechStack() {
  const { t } = useLang();
  const tech = t.tech;

  return (
    <section className="py-24 relative z-10 border-y border-[var(--color-border)] bg-[#050511]/90 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <div className="pixel-font text-[10px] tracking-widest text-[var(--color-accent)]/80 mb-3">
            {tech.eyebrow}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold pixel-font uppercase text-white text-glow mb-3">
            {tech.title}
          </h2>
          <p className="text-[#94a3b8] text-base max-w-2xl mx-auto">
            {tech.sub}
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {tech.techs.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="px-5 py-3 border border-[var(--color-primary)]/40 bg-black/50 hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)] transition-colors flex flex-col items-center justify-center gap-2 cursor-crosshair shadow-[0_0_15px_rgba(255,0,255,0.1)] hover:shadow-[0_0_20px_rgba(255,0,255,0.3)]"
            >
              <span className="font-bold text-white tracking-wide uppercase text-sm">
                {item.name}
              </span>
              <div className="h-px w-full bg-[var(--color-border)] opacity-50" />
              <span className="text-[10px] text-[var(--color-accent)] pixel-font uppercase tracking-widest">
                {item.type}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-8">
          <span className="pixel-font text-[10px] uppercase tracking-widest text-[var(--color-accent)]/80">
            {`// ${tech.philosophyTitle}`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tech.philosophy.map((p, index) => {
            const Icon = philosophyIcons[index] ?? Wallet;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="retro-window p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[var(--color-accent)]" />
                  <h3 className="pixel-font text-xs uppercase text-white">
                    {p.title}
                  </h3>
                </div>
                <p className="text-[#94a3b8] text-[13px] leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
