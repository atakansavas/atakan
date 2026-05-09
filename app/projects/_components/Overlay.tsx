"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ERAS,
  ERA_ORDER,
  EXPERIENCES,
  PROJECTS,
  activeExperiencesAtYear,
  isProjectAlive,
  lifeChapterAtYear,
  parentExperienceFor,
  projectsForExperience,
} from "../_lib/data";
import type { Experience, LifeChapter, Project, Era } from "../_lib/data";
import { pick, useLang } from "../_lib/lang";
import { useLightbox } from "../_lib/lightbox";
import type { ScrollState } from "../_lib/scroll";

const COPY = {
  hero: {
    eyebrow: { tr: "Atakan Savaş · Kariyer Arşivi", en: "Atakan Savaş · Career Archive" },
    nameLine1: { tr: "Ben", en: "I'm" },
    nameLine2: { tr: "Atakan.", en: "Atakan." },
    subtitle: {
      tr: "2010 yılında Türk Telekom stajyeri olarak başladım. 2026'da Khora Design Lab'in CTO'su ve gizli bir girişimde kurucu ortağım.",
      en: "Started as a Türk Telekom intern in 2010. In 2026 I'm CTO at Khora Design Lab and co-founder of a stealth startup.",
    },
    pitch: {
      tr: "Aşağıda 16 yıllık yolculuğun her durağı, hangi takımda ne ürettiysem.",
      en: "Below: every stop of a 16-year journey, what I shipped, in which team.",
    },
    cue: { tr: "İlk satıra in", en: "Scroll to the first line" },
    metricYears: { tr: "yıl", en: "years" },
    metricCompanies: { tr: "şirket", en: "companies" },
    metricProjects: { tr: "proje", en: "projects" },
    metricEras: { tr: "dönem", en: "eras" },
  },
  flagship: { tr: "Bayrak Proje", en: "Flagship" },
  story: { tr: "Hikâye", en: "Story" },
  challenge: { tr: "Zorluk", en: "Challenge" },
  takeaway: { tr: "Çıkarım", en: "Takeaway" },
  highlight: { tr: "Notlar", en: "Notes" },
  open: { tr: "İncele", en: "Open" },
  source: { tr: "Kod", en: "Source" },
  marquee: {
    tr: [
      "2010 → 2026",
      "İstanbul · İzmir · Londra · Muğla",
      "Türk Telekom",
      "XeusMedia",
      "Improde",
      "Kariyer.net",
      "Debite",
      "Khora Design Lab",
      "Stealth Startup",
      "$1M ARR hedefinde",
    ],
    en: [
      "2010 → 2026",
      "Istanbul · Izmir · London · Muğla",
      "Türk Telekom",
      "XeusMedia",
      "Improde",
      "Kariyer.net",
      "Debite",
      "Khora Design Lab",
      "Stealth Startup",
      "Targeting $1M ARR",
    ],
  },
  ongoing: { tr: "Devam eden", en: "Ongoing" },
  presentLabel: { tr: "bugün", en: "present" },
  ongoingPanelTitle: { tr: "Atakan şu an", en: "Atakan right now" },
  experience: { tr: "Deneyim", en: "Experience" },
  during: { tr: "Bu projenin yaşandığı dönemde", en: "While this project was alive" },
  workKind: { tr: "İş Deneyimi", en: "Work Experience" },
  projectKind: { tr: "Proje", en: "Project" },
  parallel: { tr: "Bu dönemde paralelde", en: "Parallel work in this period" },
  underHat: { tr: "Bu deneyim sırasında", en: "Under this experience" },
  responsibilities: { tr: "Sorumluluklar & Çıktılar", en: "Responsibilities & Outputs" },
  techStack: { tr: "Teknoloji", en: "Tech stack" },
  whereLabel: { tr: "O zamanlar", en: "Around then I was" },
  eraExperiences: { tr: "Bu dönemdeki deneyimler", en: "Experiences in this era" },
  eraProjects: { tr: "Bu dönemdeki projeler", en: "Projects in this era" },
  eraEmpty: { tr: "Bu dönemde kayıt yok.", en: "No records in this era." },
  liveBadge: { tr: "Yayında", en: "Live" },
  countSuffix: { tr: "kayıt", en: "items" },
  panelCollapse: { tr: "Paneli gizle", en: "Hide panel" },
  panelExpand: { tr: "Paneli aç", en: "Show panel" },
  outro: {
    eyebrow: { tr: "Sayfanın sonu, hikâyenin değil", en: "End of the page, not the story" },
    title: { tr: "Şu an buradayım.", en: "This is where I am now." },
    subtitle: {
      tr: "Khora Design Lab'da CTO; gizli bir girişimde kurucu ortağım. Yeni bir ürünün ilk satırını birlikte yazmaya açığım.",
      en: "CTO at Khora Design Lab and co-founder of a stealth startup. Open to writing the first line of a new product with you.",
    },
    contactLabel: { tr: "Konuşalım", en: "Let's talk" },
    emailLabel: { tr: "E-posta", en: "Email" },
    linkedinLabel: { tr: "LinkedIn", en: "LinkedIn" },
    githubLabel: { tr: "GitHub", en: "GitHub" },
    bookLabel: { tr: "Toplantı ayarla", en: "Book a call" },
    backToTop: { tr: "Başa dön", en: "Back to top" },
  },
};

type Props = {
  scrollRef: React.MutableRefObject<ScrollState>;
  visible: boolean;
};

export function TimelineOverlay({ scrollRef, visible }: Props) {
  const { lang } = useLang();
  const [activeEra, setActiveEraLocal] = useState<Era>(ERA_ORDER[0]);
  const [activeYear, setActiveYear] = useState(ERAS[ERA_ORDER[0]].range[0]);
  const [activeExp, setActiveExp] = useState<Experience[]>([]);
  const rafRef = useRef<number | null>(null);

  // Panel visibility — split into a user preference (toggled by the chevron
  // button) and an era-transition flag. The card slides off-screen on era
  // change so the diorama gets a beat to land before the new content drops
  // in. Effective: open only when the user wants it AND we're not in the
  // 2-second handover gap.
  const [userPanelOpen, setUserPanelOpen] = useState(true);
  const [eraTransitioning, setEraTransitioning] = useState(false);
  const lastEraRef = useRef<Era>(ERA_ORDER[0]);
  useEffect(() => {
    if (activeEra === lastEraRef.current) return;
    lastEraRef.current = activeEra;
    // Only run the slide-out/in dance if the user hasn't already hidden it
    // — they'd just see nothing change otherwise, which is confusing.
    if (!userPanelOpen) return;
    setEraTransitioning(true);
    const t = window.setTimeout(() => setEraTransitioning(false), 2000);
    return () => window.clearTimeout(t);
  }, [activeEra, userPanelOpen]);
  const panelOpen = userPanelOpen && !eraTransitioning;

  // Mirror scroll-ref into React state. We track the active era (for the
  // story-card content) and the active year (so the life-chapter chip stays
  // accurate as the year drifts smoothly within an era stop).
  useEffect(() => {
    let lastEra: Era | null = null;
    let lastYearBucket = -1;

    const sync = () => {
      const era = scrollRef.current.activeEra as Era;
      const year = scrollRef.current.activeYear;
      if (era !== lastEra) {
        lastEra = era;
        setActiveEraLocal(era);
      }
      // Year drives the life-chapter chip + active experience panel; bucket
      // by integer year to avoid render thrash.
      const yb = Math.round(year);
      if (yb !== lastYearBucket) {
        lastYearBucket = yb;
        setActiveYear(yb);
        const exps = activeExperiencesAtYear(yb);
        setActiveExp((prev) => {
          if (prev.length === exps.length && prev.every((e, i) => e.id === exps[i].id)) return prev;
          return exps;
        });
      }
    };

    const tick = () => {
      sync();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [scrollRef]);

  const era = ERAS[activeEra];
  const yearStr = `${era.range[0]}–${era.range[1]}`;

  return (
    <>
      <div
        className={`year-ticker ${visible ? "is-visible" : ""} kind-era`}
        aria-hidden
      >
        <div className="year-big" aria-label={yearStr}>
          {yearStr.split("").map((ch, i) => (
            <FlipChar key={`${i}-${ch}`} ch={ch} />
          ))}
        </div>
        <div className="era-name">{pick(era.name, lang)}</div>
        <div className="era-tag">{pick(era.tagline, lang)}</div>
      </div>

      <ActiveExperiencePanel visible={visible} experiences={activeExp} />

      <article
        className={`story-card story-card-era ${visible ? "is-visible" : ""} ${
          panelOpen ? "" : "is-collapsed"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`era:${activeEra}`}
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { staggerChildren: 0.04, delayChildren: 0.03 } },
              exit: { opacity: 0, y: -8, transition: { duration: 0.14 } },
            }}
          >
            <EraCard era={era} year={activeYear} />
          </motion.div>
        </AnimatePresence>
      </article>

      {/* Toggle button — own fixed-position element so it's always reachable
       *  regardless of whether the card has slid out. Big enough to read at
       *  a glance and labeled with intent text + a directional arrow. */}
      {visible && (
        <button
          type="button"
          className={`panel-toggle ${panelOpen ? "is-open" : "is-closed"}`}
          aria-expanded={panelOpen}
          aria-label={pick(panelOpen ? COPY.panelCollapse : COPY.panelExpand, lang)}
          title={pick(panelOpen ? COPY.panelCollapse : COPY.panelExpand, lang)}
          onClick={() => setUserPanelOpen((v) => !v)}
        >
          <span className="panel-toggle-arrow" aria-hidden>
            {panelOpen ? "›" : "‹"}
          </span>
          <span className="panel-toggle-label">
            {lang === "tr" ? (panelOpen ? "GİZLE" : "DETAY") : panelOpen ? "HIDE" : "DETAILS"}
          </span>
        </button>
      )}

      <NextEraHint visible={visible} activeEra={activeEra} />
    </>
  );
}

/* ===== Next-era idle hint =====
 * After ~4s of no scroll on a stop, gently nudges the user toward the next
 * era. Hides as soon as the user moves. Skips the last era (no "next").
 */
function NextEraHint({
  visible,
  activeEra,
}: {
  visible: boolean;
  activeEra: Era;
}) {
  const { lang } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    const arm = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setShow(true), 4500);
    };
    const reset = () => {
      setShow(false);
      arm();
    };
    arm();
    window.addEventListener("scroll", reset, { passive: true });
    window.addEventListener("wheel", reset, { passive: true });
    window.addEventListener("touchstart", reset, { passive: true });
    window.addEventListener("keydown", reset);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", reset);
      window.removeEventListener("wheel", reset);
      window.removeEventListener("touchstart", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [visible, activeEra]);

  const idx = ERA_ORDER.indexOf(activeEra);
  const nextId = idx >= 0 && idx < ERA_ORDER.length - 1 ? ERA_ORDER[idx + 1] : null;
  if (!nextId) return null;
  const next = ERAS[nextId];
  return (
    <div
      className={`next-era-hint ${show ? "is-visible" : ""}`}
      aria-hidden={!show}
      style={{ ["--era-accent" as string]: next.accent }}
    >
      <span className="neh-label">
        {lang === "tr" ? "Sonraki dönem" : "Next era"}
      </span>
      <span className="neh-name">{pick(next.name, lang)}</span>
      <span className="neh-arrow">↓</span>
    </div>
  );
}

function initialsOf(name: string): string {
  // Strip parentheses and grab initials of up to two words
  const cleaned = name.replace(/\([^)]*\)/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/* ===== Era summary card — replaces per-record cards in macro-stop scroll =====
 * Shows the era header + a clickable list of all experiences and projects
 * belonging to the era. Tapping a row expands its full detail inline.
 * Only one row is open at a time so the card stays scannable.
 */
function EraCard({ era, year }: { era: import("../_lib/data").EraInfo; year: number }) {
  const { lang } = useLang();
  const chapter = lifeChapterAtYear(year);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const experiences = useMemo(
    () => EXPERIENCES.filter((e) => e.era === era.id).sort((a, b) => a.start - b.start),
    [era.id],
  );
  const projects = useMemo(
    () => PROJECTS.filter((p) => p.era === era.id).sort((a, b) => a.year - b.year),
    [era.id],
  );

  // Reset expansion when era changes
  useEffect(() => {
    setExpandedKey(null);
  }, [era.id]);

  const totalCount = experiences.length + projects.length;

  return (
    <>
      <motion.header className="era-card-head" variants={STAGGER_ITEM}>
        <span
          className="era-card-eyebrow"
          style={{ ["--era-accent" as string]: era.accent }}
        >
          <span className="era-card-eyebrow-dot" />
          {era.range[0]}–{era.range[1]}
          <span className="era-card-eyebrow-sep">·</span>
          <span className="era-card-eyebrow-count">
            {totalCount} {pick(COPY.countSuffix, lang)}
          </span>
        </span>
        <h2 className="era-card-title">{pick(era.name, lang)}</h2>
        <p className="era-card-tagline">{pick(era.tagline, lang)}</p>
      </motion.header>

      {chapter && (
        <motion.div variants={STAGGER_ITEM}>
          <LifeChapterChip chapter={chapter} />
        </motion.div>
      )}

      {totalCount === 0 && (
        <motion.div className="era-card-empty" variants={STAGGER_ITEM}>
          {pick(COPY.eraEmpty, lang)}
        </motion.div>
      )}

      {experiences.length > 0 && (
        <motion.section className="era-card-section" variants={STAGGER_ITEM}>
          <div className="era-card-section-head">
            <span>{pick(COPY.eraExperiences, lang)}</span>
            <span className="era-card-count">
              {experiences.length} {pick(COPY.countSuffix, lang)}
            </span>
          </div>
          <ul className="era-card-list">
            {experiences.map((exp) => {
              const key = `exp:${exp.id}`;
              return (
                <EraExpRow
                  key={key}
                  exp={exp}
                  expanded={expandedKey === key}
                  onToggle={() =>
                    setExpandedKey((cur) => (cur === key ? null : key))
                  }
                />
              );
            })}
          </ul>
        </motion.section>
      )}

      {projects.length > 0 && (
        <motion.section className="era-card-section" variants={STAGGER_ITEM}>
          <div className="era-card-section-head">
            <span>{pick(COPY.eraProjects, lang)}</span>
            <span className="era-card-count">
              {projects.length} {pick(COPY.countSuffix, lang)}
            </span>
          </div>
          <ul className="era-card-list">
            {projects.map((p) => {
              const key = `prj:${p.id}`;
              return (
                <EraProjectRow
                  key={key}
                  project={p}
                  expanded={expandedKey === key}
                  onToggle={() =>
                    setExpandedKey((cur) => (cur === key ? null : key))
                  }
                />
              );
            })}
          </ul>
        </motion.section>
      )}
    </>
  );
}

function EraExpRow({
  exp,
  expanded,
  onToggle,
}: {
  exp: Experience;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { lang } = useLang();
  const endLabel = exp.end === "present" ? pick(COPY.presentLabel, lang) : exp.end;
  return (
    <li className={`era-card-row ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="era-card-row-button"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="era-card-row-year">
          {exp.start}–{endLabel}
        </span>
        <span className="era-card-row-main">
          <span className="era-card-row-title">
            {pick(exp.role, lang)}
            {exp.flagship && (
              <span className="era-card-badge era-card-badge-flag">
                {pick(COPY.flagship, lang)}
              </span>
            )}
          </span>
          <span className="era-card-row-sub">
            {pick(exp.company, lang)}
          </span>
        </span>
        <span className="era-card-row-chevron" aria-hidden>
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
            className="era-card-detail-wrap"
          >
            <motion.div
              className="era-card-detail"
              initial="hidden"
              animate="show"
            >
              <ExperienceCard exp={exp} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function EraProjectRow({
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
    <li className={`era-card-row ${expanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="era-card-row-button"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="era-card-row-year">{yearStr}</span>
        <span className="era-card-row-main">
          <span className="era-card-row-title">
            {project.title}
            {project.flagship && (
              <span className="era-card-badge era-card-badge-flag">
                {pick(COPY.flagship, lang)}
              </span>
            )}
            {alive && (
              <span className="era-card-badge era-card-badge-live">
                <span className="era-card-live-dot" />
                {project.status ? pick(project.status, lang) : pick(COPY.liveBadge, lang)}
              </span>
            )}
          </span>
          <span className="era-card-row-sub">{pick(project.subtitle, lang)}</span>
        </span>
        <span className="era-card-row-chevron" aria-hidden>
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
            className="era-card-detail-wrap"
          >
            <motion.div
              className="era-card-detail"
              initial="hidden"
              animate="show"
            >
              <ProjectCard project={project} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/* ===== Experience story card ===== */
function ExperienceCard({ exp }: { exp: Experience }) {
  const { lang } = useLang();
  const era = ERAS[exp.era];
  const projects = projectsForExperience(exp);
  const endLabel = exp.end === "present" ? COPY.presentLabel : { tr: String(exp.end), en: String(exp.end) };
  // For experiences we show the chapter that overlaps the start year.
  const chapter = lifeChapterAtYear(exp.start);
  return (
    <>
      <motion.div className="kind-chip" variants={STAGGER_ITEM}>
        <span className="dot" />
        {pick(COPY.workKind, lang)}
      </motion.div>
      <motion.header className="story-head" variants={STAGGER_ITEM}>
        <span className="story-year">
          {exp.start}–{pick(endLabel, lang)} · {pick(era.name, lang)}
        </span>
        {exp.flagship && <span className="story-flag">{pick(COPY.flagship, lang)}</span>}
      </motion.header>
      <motion.h2 className="story-title" variants={STAGGER_ITEM}>{pick(exp.role, lang)}</motion.h2>
      <motion.div className="story-sub-row" variants={STAGGER_ITEM}>
        <span className="story-company">
          <span className="company-mark" aria-hidden>{initialsOf(pick(exp.company, lang))}</span>
          {pick(exp.company, lang)}
        </span>
        <span className="story-location" aria-label={pick(exp.location, lang)}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {pick(exp.location, lang)}
        </span>
      </motion.div>
      {chapter && (
        <motion.div variants={STAGGER_ITEM}>
          <LifeChapterChip chapter={chapter} />
        </motion.div>
      )}
      <motion.p className="story-body" variants={STAGGER_ITEM}>{pick(exp.story, lang)}</motion.p>

      <motion.div className="deep-block" variants={STAGGER_ITEM}>
        <div className="label">{pick(COPY.responsibilities, lang)}</div>
        <ul style={{ display: "grid", gap: 4, paddingLeft: 16, listStyle: "square" }}>
          {exp.bullets.map((b, i) => (
            <li key={i} className="text">{pick(b, lang)}</li>
          ))}
        </ul>
      </motion.div>

      {exp.tech.length > 0 && (
        <motion.div className="story-tech" variants={STAGGER_ITEM}>
          {exp.tech.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </motion.div>
      )}

      {projects.length > 0 && (
        <motion.div className="deep-block deep-block-list" variants={STAGGER_ITEM}>
          <div className="label">{pick(COPY.underHat, lang)}</div>
          <ul className="parallel-projects">
            {projects.map((p) => (
              <li key={p.id}>
                <span className="pp-year">{p.year}</span>
                <span className="pp-title">{p.title}</span>
                <span className="pp-sub">{pick(p.subtitle, lang)}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </>
  );
}

/* ===== Project story card ===== */
function ProjectCard({ project }: { project: Project }) {
  const { lang } = useLang();
  const era = ERAS[project.era];
  const parent = parentExperienceFor(project);
  const chapter = lifeChapterAtYear(project.year);
  return (
    <>
      <motion.div className="kind-chip kind-chip-project" variants={STAGGER_ITEM}>
        <span className="dot" />
        {pick(COPY.projectKind, lang)}
      </motion.div>
      {parent && (
        <motion.div className="under-hat" variants={STAGGER_ITEM}>
          <span className="uh-label">{pick(COPY.underHat, lang)}:</span>
          <span className="uh-role" style={{ ["--rail-color" as string]: ERAS[parent.era].accent }}>
            {pick(parent.role, lang)} <em>· {pick(parent.company, lang)}</em>
          </span>
        </motion.div>
      )}
      <motion.header className="story-head" variants={STAGGER_ITEM}>
        <span className="story-year">
          {project.yearLabel ?? project.year}
          {project.endYear ? `–${project.endYear === "present" ? pick(COPY.presentLabel, lang) : project.endYear}` : ""}
          {" · "}
          {pick(era.name, lang)}
        </span>
        {project.flagship && <span className="story-flag">{pick(COPY.flagship, lang)}</span>}
      </motion.header>
      <motion.h2 className="story-title" variants={STAGGER_ITEM}>{project.title}</motion.h2>
      <motion.p className="story-sub" variants={STAGGER_ITEM}>{pick(project.subtitle, lang)}</motion.p>
      {chapter && (
        <motion.div variants={STAGGER_ITEM}>
          <LifeChapterChip chapter={chapter} />
        </motion.div>
      )}
      <motion.p className="story-body" variants={STAGGER_ITEM}>{pick(project.story, lang)}</motion.p>

      {project.challenge && (
        <motion.div className="deep-block" variants={STAGGER_ITEM}>
          <div className="label">{pick(COPY.challenge, lang)}</div>
          <div className="text">{pick(project.challenge, lang)}</div>
        </motion.div>
      )}
      {project.takeaway && (
        <motion.div className="deep-block" variants={STAGGER_ITEM}>
          <div className="label">{pick(COPY.takeaway, lang)}</div>
          <div className="text">{pick(project.takeaway, lang)}</div>
        </motion.div>
      )}
      {project.highlight && project.highlight.length > 0 && (
        <motion.div className="deep-block" variants={STAGGER_ITEM}>
          <div className="label">{pick(COPY.highlight, lang)}</div>
          <ul style={{ display: "grid", gap: 4, paddingLeft: 16, listStyle: "square" }}>
            {project.highlight.map((h, i) => (
              <li key={i} className="text">{pick(h, lang)}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {project.tech && project.tech.length > 0 && (
        <motion.div className="story-tech" variants={STAGGER_ITEM}>
          {project.tech.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </motion.div>
      )}

      {(project.link || project.github) && (
        <motion.div className="story-actions" variants={STAGGER_ITEM}>
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
        </motion.div>
      )}
    </>
  );
}

export function ProjectsHero({ opacity = 1 }: { opacity?: number }) {
  const { lang } = useLang();
  const yearsActive = new Date().getFullYear() - EXPERIENCES[0].start;
  const distinctCompanies = new Set(EXPERIENCES.map((e) => e.company.en)).size;
  const projectsCount = PROJECTS.length;
  const erasCount = ERA_ORDER.length;

  return (
    <section
      className="projects-hero"
      aria-label="intro"
      style={{ opacity, transform: `translateY(${(1 - opacity) * -16}px)`, transition: "opacity 200ms ease-out, transform 200ms ease-out" }}
    >
      {/* Veil sits between the canvas and the hero copy. Without it, the
       *  brightened Genesis diorama (peach sky + lit signs) bleeds straight
       *  through and clashes with the title. The radial gradient keeps the
       *  centre readable while letting the world breathe at the edges. */}
      <div className="hero-veil" aria-hidden />
      <div className="hero-stage">
        <motion.div
          className="hero-portrait"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-portrait-glow" aria-hidden />
          <Image
            src="/ben.jpg"
            alt="Atakan Savaş"
            width={220}
            height={220}
            priority
            className="hero-portrait-img"
          />
          <div className="hero-portrait-frame" aria-hidden />
        </motion.div>

        <div className="hero-copy">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-eyebrow font-mono-display"
          >
            <span className="hero-eyebrow-dot" />
            {pick(COPY.hero.eyebrow, lang)}
          </motion.div>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <span className="hero-title-prefix">{pick(COPY.hero.nameLine1, lang)}</span>
            <span className="hero-title-name">{pick(COPY.hero.nameLine2, lang)}</span>
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.25 }}
          >
            {pick(COPY.hero.subtitle, lang)}
          </motion.p>
          <motion.p
            className="hero-pitch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
          >
            {pick(COPY.hero.pitch, lang)}
          </motion.p>

          <motion.div
            className="hero-metrics"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <HeroMetric value={yearsActive} label={pick(COPY.hero.metricYears, lang)} />
            <HeroMetric value={distinctCompanies} label={pick(COPY.hero.metricCompanies, lang)} />
            <HeroMetric value={projectsCount} label={pick(COPY.hero.metricProjects, lang)} />
            <HeroMetric value={erasCount} label={pick(COPY.hero.metricEras, lang)} />
          </motion.div>

          <motion.a
            className="scroll-cue"
            href="#first"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: window.innerHeight * 1.05, behavior: "smooth" });
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <span className="dot" />
            {pick(COPY.hero.cue, lang)}
            <span className="arrow">→</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}

/* ===== Outro / contact card at the end of the journey ===== */
export function ProjectsOutro({ opacity = 0 }: { opacity?: number }) {
  const { lang } = useLang();
  const visible = opacity > 0.05;
  return (
    <section
      className={`projects-outro ${visible ? "is-visible" : ""}`}
      aria-label="contact"
      style={{
        opacity,
        transform: `translateY(${(1 - opacity) * 24}px)`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="outro-stage">
        <div className="outro-portrait">
          <Image
            src="/ben.jpg"
            alt="Atakan Savaş"
            width={120}
            height={120}
            className="outro-portrait-img"
          />
        </div>
        <div className="outro-copy">
          <div className="outro-eyebrow">{pick(COPY.outro.eyebrow, lang)}</div>
          <h2 className="outro-title">{pick(COPY.outro.title, lang)}</h2>
          <p className="outro-subtitle">{pick(COPY.outro.subtitle, lang)}</p>

          <div className="outro-actions">
            <a
              href="mailto:info@benatakan.com"
              className="outro-action outro-action-primary"
            >
              <span className="oa-glyph">✉</span>
              <span className="oa-text">
                <span className="oa-label">{pick(COPY.outro.contactLabel, lang)}</span>
                <span className="oa-value">info@benatakan.com</span>
              </span>
            </a>
            <a
              href="https://www.linkedin.com/in/hiata/"
              target="_blank"
              rel="noopener noreferrer"
              className="outro-action"
            >
              <span className="oa-glyph">in</span>
              <span className="oa-text">
                <span className="oa-label">{pick(COPY.outro.linkedinLabel, lang)}</span>
                <span className="oa-value">/in/hiata</span>
              </span>
            </a>
            <a
              href="https://github.com/atakansavas"
              target="_blank"
              rel="noopener noreferrer"
              className="outro-action"
            >
              <span className="oa-glyph">{`</>`}</span>
              <span className="oa-text">
                <span className="oa-label">{pick(COPY.outro.githubLabel, lang)}</span>
                <span className="oa-value">/atakansavas</span>
              </span>
            </a>
            <a href="/booking" className="outro-action">
              <span className="oa-glyph">⏱</span>
              <span className="oa-text">
                <span className="oa-label">{pick(COPY.outro.bookLabel, lang)}</span>
                <span className="oa-value">benatakan.com/booking</span>
              </span>
            </a>
          </div>

          <button
            type="button"
            className="outro-back"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑ {pick(COPY.outro.backToTop, lang)}
          </button>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ value, label }: { value: number; label: string }) {
  return (
    <div className="hero-metric">
      <div className="hero-metric-value">{value}</div>
      <div className="hero-metric-label">{label}</div>
    </div>
  );
}

/* ===== Stagger variant for story-card content ===== */
const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

/* ===== Year ticker per-character flip ===== */
function FlipChar({ ch }: { ch: string }) {
  return (
    <span className="flip-char" aria-hidden>
      <span className="flip-char-base">{ch === " " ? " " : ch}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={ch || "_"}
          className="flip-char-overlay"
          initial={{ y: "0.45em", opacity: 0, rotateX: -50 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: "-0.45em", opacity: 0, rotateX: 50 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}


/* ===== Side panel listing currently-active experiences ===== */
function ActiveExperiencePanel({
  visible,
  experiences,
}: {
  visible: boolean;
  experiences: Experience[];
}) {
  const { lang } = useLang();
  return (
    <div
      className={`active-exp-panel ${visible && experiences.length > 0 ? "is-visible" : ""}`}
      aria-hidden
    >
      <div className="aep-head">
        <span className="aep-dot" />
        <span>{pick(COPY.ongoingPanelTitle, lang)}</span>
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        {experiences.map((exp) => {
          const era = ERAS[exp.era];
          const endLabel = exp.end === "present" ? pick(COPY.presentLabel, lang) : exp.end;
          return (
            <motion.div
              key={exp.id}
              layout
              initial={{ opacity: 0, x: -16, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: -16, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="aep-row"
              style={{ ["--rail-color" as string]: era.accent, overflow: "hidden" }}
            >
              <div className="aep-row-bar" />
              <div>
                <div className="aep-role">{pick(exp.role, lang)}</div>
                <div className="aep-company">
                  {pick(exp.company, lang)}{" "}
                  <span className="aep-period">
                    · {exp.start}–{endLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ===== Life-chapter chip — "o zamanlar X şehrindeydim" =====
 * Shown inside experience and project story cards so the reader always
 * knows where Atakan was physically when he shipped this thing.
 */
function LifeChapterChip({ chapter }: { chapter: LifeChapter }) {
  const { lang } = useLang();
  const endStr = chapter.end === "present" ? pick(COPY.presentLabel, lang) : chapter.end;
  return (
    <div
      className="life-chip"
      style={{ ["--lc-color" as string]: chapter.accent }}
    >
      <span className="lc-icon" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </span>
      <span className="lc-where">{pick(COPY.whereLabel, lang)}:</span>
      <span className="lc-place">{pick(chapter.label, lang)}</span>
      <span className="lc-range">
        · {chapter.start}–{endStr}
      </span>
    </div>
  );
}

/* ===== Asset lightbox =====
 * Full-screen photo viewer that fades in when the user clicks an in-world
 * framed photo (cocuk.JPG, old.JPG, …). Subtle: era-tinted backdrop, soft
 * caption strip below, ESC or click-outside to dismiss.
 */
export function AssetLightbox() {
  const { lang } = useLang();
  const { current, close } = useLightbox();
  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="asset-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="asset-lightbox-frame"
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 6 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="asset-lightbox-close"
              onClick={close}
              aria-label={lang === "tr" ? "Kapat" : "Close"}
            >
              ×
            </button>
            <img
              className="asset-lightbox-img"
              src={current.src}
              alt={current.caption ? pick(current.caption, lang) : ""}
              draggable={false}
            />
            {current.caption && (
              <div className="asset-lightbox-caption">
                {pick(current.caption, lang)}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
