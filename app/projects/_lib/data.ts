// All editable content lives in `content.json`. This file only declares the
// types and derived helpers (timeline ordering, lookups, classifications).
// Edit `content.json` — do NOT edit data here.
import contentJson from "./content.json";
import type { Bilingual } from "./lang";

/* =============================================================
 * Types
 * ============================================================= */
export type Era = "genesis" | "agency" | "enterprise" | "drift" | "agentic";

export type MediaItem = {
  kind: "image" | "video";
  src: string;
  caption?: Bilingual;
};

export type EraInfo = {
  id: Era;
  range: [number, number];
  name: Bilingual;
  tagline: Bilingual;
  accent: string;
};

export type Experience = {
  id: string;
  start: number;
  end: number | "present";
  era: Era;
  company: Bilingual;
  role: Bilingual;
  location: Bilingual;
  story: Bilingual;
  bullets: Bilingual[];
  tech: string[];
  flagship?: boolean;
  media?: MediaItem[];
};

export type Project = {
  id: string;
  /** First year — when the project started (or its single moment) */
  year: number;
  yearLabel?: string;
  /** Optional last year. "present" means still alive today. Without endYear,
   *  the project is treated as a single-year moment. */
  endYear?: number | "present";
  era: Era;
  /** If set, this project sits under that experience's umbrella in the
   *  timeline (e.g. shipped during Improde tenure → parent="exp-improde"). */
  parentExperienceId?: string;
  title: string;
  subtitle: Bilingual;
  story: Bilingual;
  flagship?: boolean;
  tech?: string[];
  /** Free-form status — used for visual classification. Strings like
   *  "Yayında", "Live", "In production", "Üretimde", "Active", "Deployed"
   *  mark the project as currently alive → rendered as a flower in 3D. */
  status?: Bilingual;
  link?: string;
  github?: string;
  highlight?: Bilingual[];
  challenge?: Bilingual;
  takeaway?: Bilingual;
  media?: MediaItem[];
};

export type LifeChapter = {
  id: string;
  start: number;
  end: number | "present";
  /** Headline label, e.g. "İstanbul · Heybeliada" */
  label: Bilingual;
  /** Individual places visited / lived in during this chapter */
  places: string[];
  /** "settled" = a fixed home base, "nomad" = on the move,
   *  "milestone" = a single-year marker (e.g. first car) */
  kind: "settled" | "nomad" | "milestone";
  /** A line or two of context shown when this chapter is active */
  story: Bilingual;
  /** Hex color used for the bark ring + tag */
  accent: string;
  media?: MediaItem[];
};

/* =============================================================
 * Loaded content (from content.json)
 * ============================================================= */
type ContentShape = {
  eras: EraInfo[];
  experiences: Experience[];
  projects: Project[];
  lifeChapters: LifeChapter[];
};

const CONTENT = contentJson as unknown as ContentShape;

export const ERA_ORDER: Era[] = CONTENT.eras.map((e) => e.id);

/** ERAS as a Record<Era, EraInfo> for direct lookup by id */
export const ERAS: Record<Era, EraInfo> = CONTENT.eras.reduce(
  (acc, e) => {
    acc[e.id] = e;
    return acc;
  },
  {} as Record<Era, EraInfo>,
);

export const EXPERIENCES: Experience[] = CONTENT.experiences;
export const PROJECTS: Project[] = CONTENT.projects;
export const LIFE_CHAPTERS: LifeChapter[] = CONTENT.lifeChapters;

/* =============================================================
 * Live-project classification
 * ============================================================= */
const LIVE_STATUS_KEYWORDS = [
  "yayında",
  "yayinda",
  "live",
  "üretimde",
  "uretimde",
  "production",
  "active",
  "deployed",
  "geliştiriliyor",
  "gelistiriliyor",
  "in development",
];

/** A project counts as a "flower" (alive/blooming) when its status keyword
 *  matches one of the live keywords, OR when its endYear is "present". */
export function isProjectAlive(p: Project): boolean {
  if (p.endYear === "present") return true;
  if (!p.status) return false;
  const all = `${p.status.tr ?? ""} ${p.status.en ?? ""}`.toLowerCase();
  return LIVE_STATUS_KEYWORDS.some((k) => all.includes(k));
}

/* =============================================================
 * Year helpers
 * ============================================================= */
export const FIRST_YEAR_GLOBAL = ERAS.genesis.range[0];
export const LAST_YEAR_GLOBAL = ERAS.agentic.range[1];
export const YEAR_SPAN_GLOBAL = LAST_YEAR_GLOBAL - FIRST_YEAR_GLOBAL;

export function expEnd(exp: Experience): number {
  return exp.end === "present" ? LAST_YEAR_GLOBAL : exp.end;
}

export function activeExperiencesAtYear(year: number): Experience[] {
  return EXPERIENCES.filter((e) => year >= e.start && year <= expEnd(e));
}

/* =============================================================
 * Timeline ordering
 * ============================================================= */
export type TimelineItem =
  | { kind: "experience"; year: number; entry: Experience }
  | { kind: "project"; year: number; entry: Project };

function buildTimelineItems(): TimelineItem[] {
  const items: TimelineItem[] = [
    ...EXPERIENCES.map<TimelineItem>((e) => ({ kind: "experience", year: e.start, entry: e })),
    ...PROJECTS.map<TimelineItem>((p) => ({ kind: "project", year: p.year, entry: p })),
  ];
  items.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.kind !== b.kind) return a.kind === "experience" ? -1 : 1;
    return 0;
  });
  return items;
}

export const TIMELINE_ITEMS: TimelineItem[] = buildTimelineItems();
export const SORTED_PROJECTS = [...PROJECTS].sort((a, b) => b.year - a.year);
export const TIMELINE_PROJECTS = [...PROJECTS].sort((a, b) => a.year - b.year);

/* =============================================================
 * Cross-lookups
 * ============================================================= */
export function projectsForExperience(exp: Experience): Project[] {
  const end = expEnd(exp);
  return PROJECTS.filter((p) => {
    if (p.parentExperienceId === exp.id) return true;
    return p.year >= exp.start && p.year <= end;
  })
    .filter((p) => p.parentExperienceId === exp.id || !p.parentExperienceId)
    .sort((a, b) => a.year - b.year);
}

export function parentExperienceFor(project: Project): Experience | null {
  if (project.parentExperienceId) {
    return EXPERIENCES.find((e) => e.id === project.parentExperienceId) ?? null;
  }
  const candidate = EXPERIENCES.find(
    (e) => project.year >= e.start && project.year <= expEnd(e),
  );
  return candidate ?? null;
}

/** Find the LifeChapter that covers a given year.
 *  Boundaries are intentionally end-exclusive (a chapter "2020–2021" means
 *  Atakan was in that place during 2020; in 2021 he moved to the next one).
 *  When a year matches a chapter's start, that chapter wins (the move year). */
export function lifeChapterAtYear(year: number): LifeChapter | null {
  const starting = LIFE_CHAPTERS.find((c) => c.start === year);
  if (starting) return starting;
  for (const c of LIFE_CHAPTERS) {
    const end = c.end === "present" ? LAST_YEAR_GLOBAL : c.end;
    if (year >= c.start && year < end) return c;
  }
  return null;
}
