"use client";

import { motion } from "framer-motion";
import { Network, Mic, Activity, HardDrive } from "lucide-react";

const features = [
  {
    icon: Network,
    title: "MİMARİ HİYERARŞİ",
    description:
      "Chief ajanlar görevleri böler, specialist ajanları yaratır ve tam yetkiyle çalıştırır. Askeri düzende bir ağ mimarisi.",
    color: "var(--color-primary)",
  },
  {
    icon: Mic,
    title: "SES & TELEGRAM",
    description:
      "Sesli notları anlayan (Whisper) ve size sesli dönen (XTTS v2) Telegram orkestrasyonu. Sisteme cepten sızın.",
    color: "var(--color-accent)",
  },
  {
    icon: Activity,
    title: "MALİYET KONTROLÜ",
    description:
      "Soft ve hard cap limitleri ile otonom ajanların cüzdanınızı tüketmesini engelleyin. Kesin ve acımasız bütçe takibi.",
    color: "#ff0055",
  },
  {
    icon: HardDrive,
    title: "MCP SİSTEM ERİŞİMİ",
    description:
      "Terminal, web arama ve dosya sistemlerine ClickUp entegre, Model Context Protocol destekli tam erişim.",
    color: "#00ff00",
  },
];

export function Features() {
  return (
    <section className="py-24 relative z-10 border-y border-[var(--color-border)] bg-[#050511]/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-xl md:text-3xl font-bold mb-4 pixel-font uppercase text-white">
            Sistem Özellikleri
          </h2>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6 shadow-[0_0_10px_var(--color-primary)]" />
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
            Geleneksel botları unutun. Mesai, yetkilendirilmiş ajanlarla
            donatılmış bir dijital ajanstır.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="retro-window p-8 group hover:-translate-y-1 hover:translate-x-1 transition-transform"
              style={{
                boxShadow: `4px 4px 0px ${feature.color}`,
                borderColor: feature.color,
              }}
            >
              <div
                className="retro-window-header absolute top-0 left-0 right-0 h-6 border-b"
                style={{
                  borderColor: feature.color,
                  background: `${feature.color}20`,
                }}
              >
                <span
                  className="pixel-font text-[10px] ml-2"
                  style={{ color: feature.color }}
                >
                  MODÜL_0{index + 1}
                </span>
              </div>
              <div className="mt-6 flex flex-col items-start">
                <div
                  className="w-12 h-12 mb-6 border-2 flex items-center justify-center bg-black/50"
                  style={{ borderColor: feature.color }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wider text-white">
                  {feature.title}
                </h3>
                <p className="text-[#94a3b8] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
