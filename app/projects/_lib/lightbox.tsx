"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Bilingual } from "./lang";

type AssetItem = {
  src: string;
  caption?: Bilingual;
  era?: string;
};

type LightboxContextValue = {
  open: (item: AssetItem) => void;
  close: () => void;
  current: AssetItem | null;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<AssetItem | null>(null);

  const open = useCallback((item: AssetItem) => setCurrent(item), []);
  const close = useCallback(() => setCurrent(null), []);

  // ESC closes the lightbox; lock body scroll while open so the page can't
  // jump under the photo.
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCurrent(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [current]);

  return (
    <LightboxContext.Provider value={{ open, close, current }}>
      {children}
    </LightboxContext.Provider>
  );
}

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used inside LightboxProvider");
  return ctx;
}
