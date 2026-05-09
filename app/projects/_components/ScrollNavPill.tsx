"use client";

import { useLang } from "../_lib/lang";

type Props = {
  visible: boolean;
  activeIdx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export function ScrollNavPill({ visible, activeIdx, total, onPrev, onNext }: Props) {
  const { lang } = useLang();
  const atStart = activeIdx <= 0;
  const atEnd = activeIdx >= total - 1;
  return (
    <div className={`scroll-nav-pill ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <button
        type="button"
        className="snp-btn"
        onClick={onPrev}
        disabled={atStart}
        aria-label={lang === "tr" ? "Önceki" : "Previous"}
        title={lang === "tr" ? "Önceki  (↑)" : "Previous  (↑)"}
      >
        ↑
      </button>
      <div className="snp-meter" aria-label={`${activeIdx + 1} / ${total}`}>
        <span className="snp-current">{String(activeIdx + 1).padStart(2, "0")}</span>
        <span className="snp-divider">/</span>
        <span className="snp-total">{String(total).padStart(2, "0")}</span>
      </div>
      <button
        type="button"
        className="snp-btn snp-btn-primary"
        onClick={onNext}
        disabled={atEnd}
        aria-label={lang === "tr" ? "Sonraki" : "Next"}
        title={lang === "tr" ? "Sonraki  (↓ / Boşluk)" : "Next  (↓ / Space)"}
      >
        ↓
      </button>
      <span className="snp-hint">
        {lang === "tr" ? "↑ ↓ veya Boşluk ile gez" : "Navigate with ↑ ↓ or Space"}
      </span>
    </div>
  );
}
