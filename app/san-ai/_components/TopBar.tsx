"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";
import { LangToggle } from "./LangToggle";

export function TopBar() {
  const { t } = useLang();

  return (
    <div className="fixed top-0 inset-x-0 z-50 border-b border-[var(--sanai-line)] bg-[#12140f]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="sanai-label text-dim hover:text-[var(--sanai-sand)] transition-colors"
        >
          {t.nav.back}
        </Link>
        <div className="flex items-center gap-2">
          <span className="sanai-wordmark text-[var(--sanai-sand)] text-base tracking-wide">
            {t.nav.wordmark}
          </span>
          <span className="sanai-label text-teal hidden sm:inline">
            {t.nav.tag}
          </span>
        </div>
        <LangToggle />
      </div>
    </div>
  );
}
