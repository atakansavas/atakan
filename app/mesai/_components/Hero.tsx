"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
      {/* 3D Isometric Background representing the "Pixel Office" Floor */}
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
            <span className="pixel-font text-xs text-[var(--color-accent)] uppercase tracking-widest text-glow">
              &gt; SYS.BOOT: MESAI v1.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-4xl font-normal tracking-tight mb-6 uppercase pixel-font leading-tight"
          >
            <span className="text-white text-glow">OTONOM</span> <br />
            <span className="text-[var(--color-primary)] text-glow-primary">
              PİKSEL AJANSINIZ
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#94a3b8] max-w-xl leading-relaxed font-medium"
          >
            Mesai, kompleks iş akışlarını parçalara bölen, hiyerarşik AI
            ajanları üreten ve operasyonları Telegram üzerinden raporlayan
            terminal-tabanlı orkestrasyon merkezidir.
          </motion.p>
        </div>

        {/* Right side floating terminal/office representation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 w-full relative h-[400px] lg:h-[500px]"
        >
          {/* Main Terminal Window */}
          <div
            className="retro-window absolute right-0 top-1/2 -translate-y-1/2 w-full max-w-[500px] z-20 animate-float"
            style={{ animationDelay: "0s" }}
          >
            <div className="retro-window-header">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span className="ml-2 pixel-font text-[10px] text-[var(--color-accent)] opacity-80">
                mesai/chief_agent.exe
              </span>
            </div>
            <div className="p-6 bg-[#030308] min-h-[250px] font-mono text-sm text-[#0f0]">
              <div className="mb-2 opacity-70">
                Initializing Chief Agent... OK
              </div>
              <div className="mb-2 opacity-70">
                Connecting to Telegram... OK
              </div>
              <div className="mb-2 text-[var(--color-accent)]">
                &gt; Incoming task: &quot;Build Landing Page&quot;
              </div>
              <div className="mb-2 opacity-70">Spawning sub-agents:</div>
              <div className="mb-1 pl-4 opacity-70">
                ├── [design-specialist] ...
              </div>
              <div className="mb-4 pl-4 opacity-70">
                └── [code-specialist] ...
              </div>
              <div className="flex items-center gap-2 text-[var(--color-primary)]">
                <span>[system] Mesai online</span>
                <span className="w-2 h-4 bg-[var(--color-primary)] animate-blink inline-block" />
              </div>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div
            className="retro-window absolute left-0 bottom-10 w-[200px] z-30 animate-float"
            style={{ animationDelay: "1s" }}
          >
            <div className="retro-window-header justify-between">
              <span className="pixel-font text-[8px] text-white">
                Cost Tracker
              </span>
              <Cpu className="w-3 h-3 text-[var(--color-primary)]" />
            </div>
            <div className="p-4 bg-[#0a0b1a] flex flex-col gap-2">
              <div className="flex justify-between items-center pixel-font text-xs">
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
