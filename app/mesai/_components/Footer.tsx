"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";
import { LangToggle } from "./LangToggle";

export function Footer() {
  const { t } = useLang();
  const f = t.footer;

  return (
    <footer className="border-t border-[var(--color-primary)]/30 bg-[#020205] pt-16 pb-8 relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-3">
          <h3 className="text-xl md:text-2xl font-bold pixel-font text-[var(--color-primary)] text-glow-primary uppercase">
            {f.tag}
          </h3>
          <div className="pixel-font text-[10px] uppercase tracking-widest border border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-3 py-1">
            {f.status}
          </div>
          <p className="text-[#94a3b8] text-sm max-w-sm font-mono">
            {f.lines.map((line, i) => (
              <span key={i}>
                {line}
                {i < f.lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <span className="pixel-font text-[10px] uppercase tracking-widest text-[var(--color-accent)]/70">
            {f.socials}
          </span>
          <div className="flex items-center gap-3 pixel-font text-[10px] uppercase tracking-widest">
            <a
              href="https://discord.gg/"
              target="_blank"
              rel="noreferrer"
              className="text-white hover:text-[var(--color-accent)] transition-colors"
            >
              Discord
            </a>
            <span className="text-[var(--color-accent)]/30">/</span>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              className="text-white hover:text-[var(--color-accent)] transition-colors"
            >
              Twitter
            </a>
            <span className="text-[var(--color-accent)]/30">/</span>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="text-white hover:text-[var(--color-accent)] transition-colors"
            >
              GitHub
            </a>
          </div>
          <Link
            href="/"
            className="pixel-font text-[10px] uppercase tracking-widest text-[var(--color-accent)] hover:text-white border border-[var(--color-accent)]/40 px-3 py-1 transition-colors"
          >
            ← {f.backToPortfolio}
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-[#94a3b8] flex flex-col md:flex-row justify-between items-center gap-4 font-mono">
          <p>{f.copyright}</p>
          <LangToggle />
          <div className="flex items-center gap-2 pixel-font text-[10px] border border-[var(--color-accent)] px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <span className="w-2 h-2 bg-[var(--color-accent)] animate-blink shadow-[0_0_5px_var(--color-accent)]" />
            SYSTEM ONLINE
          </div>
        </div>
      </div>
    </footer>
  );
}
