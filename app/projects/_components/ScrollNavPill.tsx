"use client";

import { useLang } from "../_lib/lang";

type Props = {
  visible: boolean;
  activeIdx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
};

export function ScrollNavPill({
  visible,
  activeIdx,
  total,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: Props) {
  const { lang } = useLang();
  const atStart = activeIdx <= 0;
  const atEnd = activeIdx >= total - 1;
  return (
    <div className={`scroll-nav-pill ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <div className="snp-group" role="group" aria-label={lang === "tr" ? "Yakınlaştır" : "Zoom"}>
        <button
          type="button"
          className="snp-btn snp-btn-sm"
          onClick={onZoomOut}
          aria-label={lang === "tr" ? "Uzaklaştır" : "Zoom out"}
          title={lang === "tr" ? "Uzaklaştır  ( − )" : "Zoom out  ( − )"}
        >
          −
        </button>
        <button
          type="button"
          className="snp-btn snp-btn-sm snp-btn-reset"
          onClick={onZoomReset}
          aria-label={lang === "tr" ? "Yakınlaştırmayı sıfırla" : "Reset zoom"}
          title={lang === "tr" ? "Sıfırla  ( 0 )" : "Reset  ( 0 )"}
        >
          ⤢
        </button>
        <button
          type="button"
          className="snp-btn snp-btn-sm"
          onClick={onZoomIn}
          aria-label={lang === "tr" ? "Yakınlaştır" : "Zoom in"}
          title={lang === "tr" ? "Yakınlaştır  ( + )" : "Zoom in  ( + )"}
        >
          +
        </button>
      </div>
      <div className="snp-sep" aria-hidden />
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
        {lang === "tr"
          ? "↑ ↓ ile gez · + − ile yakınlaştır"
          : "↑ ↓ to navigate · + − to zoom"}
      </span>
    </div>
  );
}
