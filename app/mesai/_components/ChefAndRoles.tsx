"use client";

import { motion } from "framer-motion";
import {
  Code,
  Server,
  Palette,
  ClipboardList,
  Megaphone,
  Wrench,
  Search,
  Headset,
  Sparkles,
} from "lucide-react";
import { useLang } from "./LangProvider";
import { Avatar } from "./sprites";

const roleIcons: Record<string, typeof Code> = {
  frontend: Code,
  backend: Server,
  designer: Palette,
  pm: ClipboardList,
  marketer: Megaphone,
  qa: Wrench,
  researcher: Search,
  support: Headset,
};

export function ChefAndRoles() {
  const { t } = useLang();
  const c = t.chefRoles;

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
            {c.eyebrow}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold pixel-font uppercase text-white text-glow mb-4">
            {c.title}
          </h2>
          <p className="text-[#94a3b8] text-base md:text-lg max-w-2xl mx-auto">
            {c.sub}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 retro-window p-6 flex flex-col gap-5 self-start"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/60 p-2 shadow-[0_0_15px_rgba(255,0,255,0.3)]">
                <Avatar role="chef" withChefHat size={64} />
              </div>
              <div>
                <div className="pixel-font text-[10px] tracking-widest text-[var(--color-accent)]/70">
                  ROLE_001
                </div>
                <h3 className="pixel-font text-xl uppercase text-white text-glow-primary">
                  {c.chef.name}
                </h3>
                <p className="text-sm text-[#94a3b8] mt-1">{c.chef.role}</p>
              </div>
            </div>
            <p className="text-[#cbd5e1] text-sm leading-relaxed">
              {c.chef.desc}
            </p>
            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="pixel-font text-[10px] uppercase tracking-widest text-[var(--color-accent)]/70 mb-2">
                {c.chef.toolsTitle}
              </div>
              <div className="flex flex-wrap gap-2">
                {c.chef.tools.map((tool) => (
                  <span
                    key={tool}
                    className="mesai-role-chip pixel-font text-[10px] uppercase tracking-widest"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="pixel-font text-[10px] uppercase tracking-widest text-[var(--color-accent)]/70">
              {c.kitsTitle}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {c.kits.map((kit, index) => {
                const Icon = roleIcons[kit.id] ?? Code;
                return (
                  <motion.div
                    key={kit.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className="mesai-role-card retro-window p-3 flex flex-col items-center gap-2 cursor-crosshair"
                  >
                    <Avatar role={kit.id} size={40} />
                    <Icon className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <div className="pixel-font text-[10px] uppercase text-white tracking-wider text-center">
                      {kit.name}
                    </div>
                    <div className="text-[10px] text-[#94a3b8] text-center leading-tight">
                      {kit.desc}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="retro-window p-5 border border-dashed border-[var(--color-primary)]/60 bg-[var(--color-primary)]/5 flex items-start gap-4"
            >
              <div className="bg-[#050511] border border-[var(--color-primary)] p-2 shadow-[0_0_8px_rgba(255,0,255,0.5)]">
                <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div className="flex-1">
                <div className="pixel-font text-sm uppercase text-white mb-1">
                  {c.customTitle}
                </div>
                <p className="text-sm text-[#94a3b8] mb-2">{c.customDesc}</p>
                <code className="block bg-black/60 border border-[var(--color-border)] px-3 py-2 text-[11px] font-mono text-[var(--color-accent)]/90">
                  {c.customExample}
                </code>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
