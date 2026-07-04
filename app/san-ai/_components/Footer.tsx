"use client";

import { motion } from "framer-motion";
import { Globe, Instagram, Twitter } from "lucide-react";
import Link from "next/link";
import { useLang } from "./LangProvider";
import { Magnetic } from "./Magnetic";
import { Mark } from "./Mark";
import { SectionVideo } from "./SectionVideo";
import { reveal } from "../_lib/motion";
import { videos } from "../_lib/videos";

const socials = [
  { icon: Instagram, href: "#akis", label: "Instagram" },
  { icon: Twitter, href: "#akis", label: "X" },
  { icon: Globe, href: "/", label: "Atakan" },
];

/**
 * Merged closing CTA + site footer over a full-bleed cinematic clip. The scrim
 * keeps the video visible behind the call-to-action, then deepens toward the
 * bottom so the footer meta stays legible.
 */
export function Footer() {
  const { t } = useLang();

  return (
    <footer
      id="invite"
      className="relative z-10 scroll-mt-24 overflow-hidden"
    >
      {/* Background clip + scrim — the whole layer is masked so the video
          dissolves into the navy (and starfield) above instead of showing a
          hard top edge, then deepens toward the footer meta below. */}
      <div
        className="absolute inset-0 z-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, #000 16%, #000 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, #000 16%, #000 100%)",
        }}
      >
        <SectionVideo
          src={videos.rhythm}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,22,34,0.3) 0%, rgba(0,20,32,0.4) 42%, rgba(0,17,27,0.8) 80%, rgba(0,14,22,0.95) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 70% at 50% 40%, transparent 48%, rgba(0,15,24,0.5) 100%)",
          }}
        />
      </div>

      {/* CTA */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6 pt-32 md:pt-48 pb-20 md:pb-28">
        <motion.p {...reveal()} className="sanai-label text-[var(--sanai-su)] mb-7">
          {t.invite.eyebrow}
        </motion.p>
        <motion.h2
          {...reveal(0.08)}
          className="sanai-serif text-[clamp(2.6rem,7vw,5rem)] leading-[1] tracking-[-0.03em] text-white"
        >
          {t.invite.title}
        </motion.h2>
        <p className="mt-7 text-lg text-white/75 leading-relaxed max-w-xl mx-auto">
          {t.invite.sub}
        </p>

        <div className="mt-11 flex justify-center">
          <Magnetic strength={0.4}>
            <a
              href={`mailto:${t.invite.email}`}
              className="liquid-glass rounded-full px-10 py-4 text-base text-white inline-flex items-center gap-2"
            >
              {t.invite.emailLabel} · {t.invite.email}
            </a>
          </Magnetic>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          {socials.map(({ icon: Icon, href, label }) => (
            <Magnetic key={label} strength={0.5}>
              <Link
                href={href}
                aria-label={label}
                className="liquid-glass rounded-full p-4 text-white/80 hover:text-white transition-colors"
              >
                <Icon size={20} />
              </Link>
            </Magnetic>
          ))}
        </div>
      </div>

      {/* Footer meta */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 pt-12 pb-14 border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div>
            <div className="flex items-center gap-3 text-white">
              <Mark className="h-8 w-8 shrink-0 text-[var(--sanai-su)]" />
              <span className="sanai-wordmark text-3xl">
                {t.footer.wordmark}
                <sup className="ml-0.5 align-super text-[0.42em] text-white/50">
                  ®
                </sup>
              </span>
            </div>
            <div className="sanai-label text-white/50 mt-3">{t.footer.tag}</div>
            <div className="mt-6 space-y-1.5">
              {t.footer.lines.map((line) => (
                <p
                  key={line}
                  className="sanai-serif sanai-serif-italic text-lg text-white/60"
                >
                  {line.replace(/^>\s*/, "")}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-3">
            <Link
              href="/"
              className="sanai-label text-white/65 hover:text-white transition-colors"
            >
              {t.invite.backToPortfolio}
            </Link>
            <span className="sanai-label text-white/40">{t.footer.madeIn}</span>
          </div>
        </div>

        <div className="sanai-rule my-10" />

        <div className="flex items-center justify-between sanai-label text-white/40">
          <span>{t.footer.copyright}</span>
          <span>{t.meta.coords}</span>
        </div>
      </div>
    </footer>
  );
}
