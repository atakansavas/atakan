"use client";

import { useLang } from "./LangProvider";

export function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1.5 sanai-label text-[11px]">
      <button
        type="button"
        onClick={() => setLang("tr")}
        className={`px-1 py-0.5 transition-colors ${
          lang === "tr" ? "text-white" : "text-white/40 hover:text-white"
        }`}
        aria-pressed={lang === "tr"}
      >
        TR
      </button>
      <span className="text-white/25">/</span>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-1 py-0.5 transition-colors ${
          lang === "en" ? "text-white" : "text-white/40 hover:text-white"
        }`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
