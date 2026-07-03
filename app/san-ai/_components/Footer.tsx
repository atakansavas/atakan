"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="relative border-t border-[var(--sanai-line)] bg-[var(--sanai-bg-soft)]/50">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <div className="sanai-wordmark text-2xl tracking-wide">
              {t.footer.wordmark}
            </div>
            <div className="sanai-label text-teal mt-2">{t.footer.tag}</div>
            <div className="mt-6 space-y-1 font-[family-name:var(--font-jetbrains-mono)] text-sm text-dim">
              {t.footer.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-3">
            <Link
              href="/"
              className="sanai-label text-dim hover:text-[var(--sanai-sand)] transition-colors"
            >
              {t.invite.backToPortfolio}
            </Link>
            <span className="sanai-label text-dim opacity-60">{t.footer.madeIn}</span>
          </div>
        </div>

        <div className="sanai-rule my-10" />

        <div className="flex items-center justify-between sanai-label text-dim opacity-60">
          <span>{t.footer.copyright}</span>
          <span>{t.meta.coords}</span>
        </div>
      </div>
    </footer>
  );
}
