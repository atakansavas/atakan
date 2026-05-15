"use client";

import Link from "next/link";
import { LangToggle } from "./LangToggle";

export function TopBar() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 border-b border-[var(--color-primary)]/30 bg-[#020205]/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="pixel-font text-[10px] uppercase tracking-widest text-[var(--color-accent)] hover:text-white transition-colors"
        >
          ← Atakan
        </Link>
        <span className="pixel-font text-[10px] uppercase tracking-widest text-[var(--color-primary)] text-glow-primary hidden sm:inline">
          MESAI · v0.1
        </span>
        <LangToggle />
      </div>
    </div>
  );
}
