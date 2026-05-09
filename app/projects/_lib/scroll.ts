"use client";

import { createContext, useContext, useRef } from "react";
import type { MutableRefObject } from "react";

export type ScrollState = {
  /** 0..1 normalized scroll progress through the timeline */
  progress: number;
  /** active item index in TIMELINE_ITEMS at the current progress */
  activeIndex: number;
  /** active era id */
  activeEra: string;
  /** "experience" | "project" — kind of the active TimelineItem */
  activeKind: "experience" | "project";
  /** id of the active item (e.g. "exp-improde" or "imarsorgulama") */
  activeId: string;
  /** if active is a project that has a parent experience, its id; else null */
  parentExperienceId: string | null;
  /** the active item's calendar year (for tagging in 3D) */
  activeYear: number;
};

export const ScrollRefContext = createContext<MutableRefObject<ScrollState> | null>(null);

export function useScrollRef() {
  return useContext(ScrollRefContext);
}

export function makeInitialScrollState(): ScrollState {
  return {
    progress: 0,
    activeIndex: 0,
    activeEra: "genesis",
    activeKind: "project",
    activeId: "",
    parentExperienceId: null,
    activeYear: 2003,
  };
}

export function useCreateScrollRef() {
  const ref = useRef<ScrollState>(makeInitialScrollState());
  return ref;
}
