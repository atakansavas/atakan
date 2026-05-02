"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { copy, type CopyShape, type Lang } from "../_lib/copy";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: CopyShape;
};

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "mesai_lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(STORAGE_KEY) as Lang | null)
        : null;
    if (saved === "tr" || saved === "en") {
      setLangState(saved);
    }
    setHydrated(true);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "tr" ? "en" : "tr");
  }, [lang, setLang]);

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, toggle, t: copy[lang] }),
    [lang, setLang, toggle],
  );

  return (
    <LangContext.Provider value={value}>
      <span data-mesai-hydrated={hydrated ? "true" : "false"} className="hidden" />
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used inside <LangProvider>");
  }
  return ctx;
}
