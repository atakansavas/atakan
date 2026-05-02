"use client";

import { motion } from "framer-motion";
import { useLang } from "./LangProvider";
import { OfficeRoom } from "./OfficeRoom";

export function Hero() {
  const { t } = useLang();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-12 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden perspective-[1000px] z-0">
        <div className="iso-grid opacity-30" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 max-w-2xl text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-[#12142b] border border-[var(--color-primary)] mb-8"
            style={{ boxShadow: "2px 2px 0px rgba(255, 0, 255, 0.4)" }}
          >
            <div className="w-2 h-2 bg-[var(--color-accent)] animate-blink" />
            <span className="pixel-font text-[10px] sm:text-xs text-[var(--color-accent)] uppercase tracking-widest text-glow">
              {t.nav.version}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-4xl font-normal tracking-tight mb-6 uppercase pixel-font leading-tight"
          >
            <span className="text-white text-glow">{t.hero.headlineTop}</span>
            <br />
            <span className="text-[var(--color-primary)] text-glow-primary">
              {t.hero.headlineBottom}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-[#94a3b8] max-w-xl leading-relaxed font-medium mb-8"
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#waitlist"
              className="retro-btn retro-btn-primary px-5 py-3 inline-flex items-center gap-2"
            >
              {t.hero.ctaPrimary} →
            </a>
            <a
              href="#concept"
              className="retro-btn px-5 py-3 inline-flex items-center gap-2"
            >
              {t.hero.ctaSecondary}
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex-1 w-full max-w-[560px] relative"
        >
          <div className="retro-window">
            <div className="retro-window-header">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span className="ml-2 pixel-font text-[10px] text-[var(--color-accent)] opacity-80">
                mesai/office.live
              </span>
            </div>
            <div className="bg-[#030308] p-3">
              <OfficeRoom
                theme="hacker"
                team={["Chef", "Frontend", "Designer", "Marketer"]}
                caption={t.hero.sceneCaption}
              />
              <div className="mt-3 grid grid-cols-4 gap-2 pixel-font text-[8px] uppercase tracking-widest text-center">
                {[
                  t.hero.sceneRoleChef,
                  t.hero.sceneRoleFrontend,
                  t.hero.sceneRoleDesigner,
                  t.hero.sceneRoleMarketer,
                ].map((label, i) => (
                  <div
                    key={i}
                    className="border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 py-1 text-[var(--color-accent)]"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="retro-window absolute -bottom-6 -left-6 w-[180px] hidden md:block animate-float"
            style={{ animationDelay: "1s" }}
          >
            <div className="retro-window-header justify-between">
              <span className="pixel-font text-[8px] text-white">
                Cost · Today
              </span>
              <span className="w-2 h-2 bg-[var(--color-accent)] animate-blink" />
            </div>
            <div className="p-3 bg-[#0a0b1a] flex flex-col gap-2">
              <div className="flex justify-between items-center pixel-font text-[10px]">
                <span className="text-gray-400">Daily Cap</span>
                <span className="text-[var(--color-accent)]">$5.00</span>
              </div>
              <div className="w-full h-2 bg-gray-800 border border-gray-700">
                <div className="w-[45%] h-full bg-[var(--color-primary)]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
