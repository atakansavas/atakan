"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ERAS,
  ERA_ORDER,
  PROJECTS,
  isProjectAlive,
  parentExperienceFor,
} from "../_lib/data";
import type { Project, Era } from "../_lib/data";
import { pick, useLang } from "../_lib/lang";

const COPY = {
  title: { tr: "Tüm Projeler", en: "All Projects" },
  subtitle: {
    tr: "Dönem bazında gruplandı. Detayı için satıra dokun.",
    en: "Grouped by era. Tap a row to expand details.",
  },
  close: { tr: "Kapat", en: "Close" },
  searchPlaceholder: { tr: "Ara…", en: "Search…" },
  empty: { tr: "Eşleşen proje yok.", en: "No matching projects." },
  countSuffix: { tr: "proje", en: "projects" },
  live: { tr: "Yayında", en: "Live" },
  flagship: { tr: "Bayrak", en: "Flagship" },
  challenge: { tr: "Zorluk", en: "Challenge" },
  takeaway: { tr: "Çıkarım", en: "Takeaway" },
  highlight: { tr: "Notlar", en: "Notes" },
  open: { tr: "İncele", en: "Open" },
  source: { tr: "Kod", en: "Source" },
  presentLabel: { tr: "bugün", en: "present" },
  underHat: { tr: "Bu deneyim sırasında", en: "Under this experience" },
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ProjectsModal({ open, onClose }: Props) {
  const { lang } = useLang();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Reset transient state when the modal closes
  useEffect(() => {
    if (!open) {
      setExpandedId(null);
      setQuery("");
    }
  }, [open]);

  // ESC closes the modal; lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (p: Project): boolean => {
      if (!q) return true;
      const hay = [
        p.title,
        p.subtitle.tr,
        p.subtitle.en,
        p.story.tr,
        p.story.en,
        ...(p.tech ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    };

    const byEra: Record<Era, Project[]> = {} as Record<Era, Project[]>;
    for (const era of ERA_ORDER) byEra[era] = [];
    for (const p of PROJECTS) {
      if (matches(p)) byEra[p.era].push(p);
    }
    for (const era of ERA_ORDER) {
      byEra[era].sort((a, b) => a.year - b.year);
    }
    return byEra;
  }, [query]);

  const totalMatches = useMemo(
    () => ERA_ORDER.reduce((sum, e) => sum + grouped[e].length, 0),
    [grouped],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pmodal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={pick(COPY.title, lang)}
        >
          <motion.div
            className="pmodal"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="pmodal-head">
              <div>
                <div className="pmodal-eyebrow">{pick(COPY.title, lang)}</div>
                <div className="pmodal-sub">{pick(COPY.subtitle, lang)}</div>
              </div>
              <div className="pmodal-head-right">
                <input
                  className="pmodal-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={pick(COPY.searchPlaceholder, lang)}
                  aria-label={pick(COPY.searchPlaceholder, lang)}
                />
                <button
                  type="button"
                  className="pmodal-close"
                  onClick={onClose}
                  aria-label={pick(COPY.close, lang)}
                >
                  ×
                </button>
              </div>
            </header>

            <div className="pmodal-body">
              {totalMatches === 0 ? (
                <div className="pmodal-empty">{pick(COPY.empty, lang)}</div>
              ) : (
                ERA_ORDER.map((eraId) => {
                  const list = grouped[eraId];
                  if (list.length === 0) return null;
                  const era = ERAS[eraId];
                  return (
                    <section
                      key={eraId}
                      className="pmodal-era"
                      style={{ ["--era-accent" as string]: era.accent }}
                    >
                      <header className="pmodal-era-head">
                        <span className="pmodal-era-dot" />
                        <span className="pmodal-era-name">
                          {pick(era.name, lang)}
                        </span>
                        <span className="pmodal-era-range">
                          {era.range[0]}–{era.range[1]}
                        </span>
                        <span className="pmodal-era-count">
                          {list.length} {pick(COPY.countSuffix, lang)}
                        </span>
                      </header>
                      <ul className="pmodal-list">
                        {list.map((p) => (
                          <ProjectRow
                            key={p.id}
                            project={p}
                            expanded={expandedId === p.id}
                            onToggle={() =>
                              setExpandedId((cur) =>
                                cur === p.id ? null : p.id,
                              )
                            }
                          />
                        ))}
                      </ul>
                    </section>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProjectRow({
  project,
  expanded,
  onToggle,
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { lang } = useLang();
  const alive = isProjectAlive(project);
  const yearStr = `${project.yearLabel ?? project.year}${
    project.endYear
      ? `–${project.endYear === "present" ? pick(COPY.presentLabel, lang) : project.endYear}`
      : ""
  }`;

  return (
    <li className={`pmodal-row ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="pmodal-row-button"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="pmodal-row-year">{yearStr}</span>
        <span className="pmodal-row-main">
          <span className="pmodal-row-title">
            {project.title}
            {project.flagship && (
              <span className="pmodal-badge pmodal-badge-flag">
                {pick(COPY.flagship, lang)}
              </span>
            )}
            {alive && (
              <span className="pmodal-badge pmodal-badge-live">
                <span className="pmodal-live-dot" />
                {project.status ? pick(project.status, lang) : pick(COPY.live, lang)}
              </span>
            )}
          </span>
          <span className="pmodal-row-sub">{pick(project.subtitle, lang)}</span>
        </span>
        <span className="pmodal-row-chevron" aria-hidden>
          {expanded ? "−" : "+"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pmodal-row-detail-wrap"
          >
            <ProjectDetail project={project} />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function ProjectDetail({ project }: { project: Project }) {
  const { lang } = useLang();
  const parent = parentExperienceFor(project);
  return (
    <div className="pmodal-row-detail">
      {parent && (
        <div className="pmodal-detail-parent">
          <span className="pmodal-detail-parent-label">
            {pick(COPY.underHat, lang)}:
          </span>
          <span
            className="pmodal-detail-parent-value"
            style={{ ["--rail-color" as string]: ERAS[parent.era].accent }}
          >
            {pick(parent.role, lang)} · {pick(parent.company, lang)}
          </span>
        </div>
      )}
      <p className="pmodal-detail-story">{pick(project.story, lang)}</p>

      {project.challenge && (
        <div className="pmodal-detail-block">
          <div className="pmodal-detail-label">{pick(COPY.challenge, lang)}</div>
          <div className="pmodal-detail-text">{pick(project.challenge, lang)}</div>
        </div>
      )}
      {project.takeaway && (
        <div className="pmodal-detail-block">
          <div className="pmodal-detail-label">{pick(COPY.takeaway, lang)}</div>
          <div className="pmodal-detail-text">{pick(project.takeaway, lang)}</div>
        </div>
      )}
      {project.highlight && project.highlight.length > 0 && (
        <div className="pmodal-detail-block">
          <div className="pmodal-detail-label">{pick(COPY.highlight, lang)}</div>
          <ul className="pmodal-detail-list">
            {project.highlight.map((h, i) => (
              <li key={i}>{pick(h, lang)}</li>
            ))}
          </ul>
        </div>
      )}

      {project.tech && project.tech.length > 0 && (
        <div className="pmodal-detail-tech">
          {project.tech.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}

      {(project.link || project.github) && (
        <div className="pmodal-detail-actions">
          {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              {pick(COPY.open, lang)} ↗
            </a>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer">
              {pick(COPY.source, lang)} ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
