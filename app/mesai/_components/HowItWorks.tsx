"use client";

import { motion } from "framer-motion";
import { TerminalSquare, ShieldAlert, Cpu } from "lucide-react";

const steps = [
  {
    title: "GÖREV PROTOKOLÜ (INIT)",
    description:
      "Telegram veya ClickUp'tan hedef sisteme girilir. Ana ajan (Chief) uyanır.",
    icon: TerminalSquare,
  },
  {
    title: "OTONOM DELEGASYON",
    description:
      "Alt-işlemler hesaplanır. Uzman ajanlar (Sub-agents) yaratılarak ağa yayılır.",
    icon: Cpu,
  },
  {
    title: "BİLDİRİM & ONAY (AUTH)",
    description:
      "Kritik sistem erişimlerinde (Dosya/Terminal) Telegram üzerinden acil onay istenir.",
    icon: ShieldAlert,
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
          <div className="flex-1 w-full">
            <h2 className="text-xl md:text-3xl font-bold mb-6 pixel-font uppercase text-[var(--color-accent)] text-glow">
              Operasyon Akışı
            </h2>
            <p className="text-[#94a3b8] text-lg mb-12">
              Hiyerarşik yapının arkasındaki çalışma algoritması: Tam otonomi,
              mutlak gözetim.
            </p>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--color-primary)] before:to-transparent">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.2 }}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-none border-2 border-[var(--color-primary)] bg-[#050511] shadow-[0_0_10px_var(--color-primary)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <step.icon className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>

                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] retro-window p-6 border-[var(--color-primary)]/30 hover:border-[var(--color-primary)] transition-colors">
                    <h3 className="text-lg font-bold mb-2 uppercase text-white">
                      {step.title}
                    </h3>
                    <p className="text-[#94a3b8] text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
