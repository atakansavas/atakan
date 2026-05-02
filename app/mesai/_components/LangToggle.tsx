"use client";

import { useLang } from "./LangProvider";

export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();

  return (
    <div
      className={`inline-flex items-center gap-2 pixel-font text-[10px] uppercase tracking-widest ${className}`}
    >
      <span className="text-[var(--color-accent)]/70">[{t.footer.langLabel}]</span>
      <div className="flex border border-[var(--color-accent)]/40">
        <button
          type="button"
          onClick={() => setLang("tr")}
          className={`px-2 py-1 transition-colors ${
            lang === "tr"
              ? "bg-[var(--color-accent)] text-black"
              : "text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
          }`}
          aria-pressed={lang === "tr"}
        >
          TR
        </button>
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`px-2 py-1 transition-colors border-l border-[var(--color-accent)]/40 ${
            lang === "en"
              ? "bg-[var(--color-accent)] text-black"
              : "text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
          }`}
          aria-pressed={lang === "en"}
        >
          EN
        </button>
      </div>
    </div>
  );
}
