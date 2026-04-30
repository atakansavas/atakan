"use client";

import { motion } from "framer-motion";

const technologies = [
  { name: "Next.js 15", type: "SYS_CORE" },
  { name: "PostgreSQL & Drizzle", type: "DB_MATRIX" },
  { name: "Claude Agent SDK", type: "AI_BRAIN" },
  { name: "XTTS v2 & Whisper", type: "VOICE_MOD" },
  { name: "Telegraf", type: "COMMS_LINK" },
  { name: "Tailwind CSS", type: "VISUAL_HUD" },
];

export function TechStack() {
  return (
    <section className="py-24 relative z-10 border-y border-[var(--color-border)] bg-[#050511]/90 backdrop-blur-md">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-12 pixel-font uppercase text-[var(--color-accent)] text-glow">
          [ Sistem Altyapısı ]
        </h2>

        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="px-6 py-4 border border-[var(--color-primary)]/40 bg-black/50 hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)] transition-colors flex flex-col items-center justify-center gap-2 cursor-crosshair shadow-[0_0_15px_rgba(255,0,255,0.1)] hover:shadow-[0_0_20px_rgba(255,0,255,0.3)]"
            >
              <span className="font-bold text-white tracking-wide uppercase">
                {tech.name}
              </span>
              <div className="h-px w-full bg-[var(--color-border)] opacity-50" />
              <span className="text-[10px] text-[var(--color-accent)] pixel-font uppercase tracking-widest">
                {tech.type}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
