"use client";

import { ERAS, ERA_ORDER } from "../_lib/data";
import type { Era } from "../_lib/data";
import { pick, useLang } from "../_lib/lang";

type Props = {
  visible: boolean;
  activeEra: Era;
  onJump: (eraIdx: number) => void;
};

export function EraRail({ visible, activeEra, onJump }: Props) {
  const { lang } = useLang();
  return (
    <nav
      className={`era-rail ${visible ? "is-visible" : ""}`}
      aria-label={lang === "tr" ? "Dönem seçici" : "Era jump"}
    >
      <ul className="era-rail-list">
        {ERA_ORDER.map((id, i) => {
          const era = ERAS[id];
          const isActive = id === activeEra;
          return (
            <li
              key={id}
              className={`era-rail-item ${isActive ? "is-active" : ""}`}
              style={{ ["--rail-accent" as string]: era.accent }}
            >
              <button
                type="button"
                className="era-rail-btn"
                onClick={() => onJump(i)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${pick(era.name, lang)} (${era.range[0]}–${era.range[1]})`}
              >
                <span className="era-rail-dot" />
                <span className="era-rail-label">
                  <span className="era-rail-name">{pick(era.name, lang)}</span>
                  <span className="era-rail-range">
                    {era.range[0]}–{era.range[1]}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
