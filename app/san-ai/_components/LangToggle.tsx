"use client";

import { useLang } from "./LangProvider";

export function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 sanai-label text-[10px]">
      <button
        type="button"
        onClick={() => setLang("tr")}
        className={`px-1.5 py-0.5 rounded transition-colors ${
          lang === "tr" ? "text-teal" : "text-dim hover:text-[var(--sanai-sand)]"
        }`}
        aria-pressed={lang === "tr"}
      >
        TR
      </button>
      <span className="text-dim opacity-40">/</span>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-1.5 py-0.5 rounded transition-colors ${
          lang === "en" ? "text-teal" : "text-dim hover:text-[var(--sanai-sand)]"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
