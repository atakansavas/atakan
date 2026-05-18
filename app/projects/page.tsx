"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ERAS, ERA_ORDER } from "./_lib/data";
import type { Era } from "./_lib/data";
import { LangProvider } from "./_lib/lang";
import { LightboxProvider } from "./_lib/lightbox";
import {
  AssetLightbox,
  ProjectsHero,
  ProjectsOutro,
  TimelineOverlay,
} from "./_components/Overlay";
import { ProjectsNav } from "./_components/Nav";
import { ScrollNavPill } from "./_components/ScrollNavPill";
import { EraRail } from "./_components/EraRail";
import "./projects.css";

const Scene = dynamic(() => import("./_components/Scene"), {
  ssr: false,
  loading: () => null,
});

// Era-paginated scroll: each era is ONE viewport tall, so a single
// mouse-wheel impulse maps cleanly to the next era. The wheel-impulse
// hijack below makes this even crisper — one wheel turn / one touch
// swipe = one era advance, with no "in-between" scroll drift.
const ERA_VH = 100;
const HERO_VH = 100;
const OUTRO_VH = 90;

const STOPS_COUNT = 1 + ERA_ORDER.length + 1; // hero + N eras + outro

// Dispatch helper for camera zoom — Scene.tsx listens for these events
// and dollies the camera along its current target→camera vector.
type ProjectsZoomDetail =
  | { mode: "step"; factor: number }
  | { mode: "reset" }
  | { mode: "wheel"; deltaY: number };
const fireZoom = (detail: ProjectsZoomDetail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("projects-zoom", { detail }));
};
const ZOOM_STEP_IN = 0.82; // each press multiplies distance by this
const ZOOM_STEP_OUT = 1.22;

export default function ProjectsPage() {
  return (
    <LangProvider>
      <LightboxProvider>
        <ProjectsExperience />
        <AssetLightbox />
      </LightboxProvider>
    </LangProvider>
  );
}

function ProjectsExperience() {
  const scrollRef = useRef({
    progress: 0,
    activeIndex: 0,
    activeEra: ERA_ORDER[0] as Era,
    activeKind: "experience" as "experience" | "project",
    activeId: "",
    parentExperienceId: null as string | null,
    activeYear: ERAS[ERA_ORDER[0]].range[0],
  });
  const [activeEra, setActiveEra] = useState<Era>(ERA_ORDER[0]);
  const [phase, setPhase] = useState<"hero" | "timeline" | "outro">("hero");
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [outroOpacity, setOutroOpacity] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  // Shared programmatic-scroll flag so the snap-on-idle effect can skip
  // its work while we're already gliding to a known stop (button click,
  // arrow key, era rail jump). Avoids snapping back mid-flight.
  const programmaticScrollRef = useRef(false);
  const programmaticScrollUntilRef = useRef(0);

  const totalHeightVh = HERO_VH + ERA_ORDER.length * ERA_VH + OUTRO_VH;

  // Compute the scrollY that centers a given stop in the viewport. Stop 0 is
  // the hero (top of page); stops 1..N are the era anchors; the last stop
  // sits inside the outro.
  const scrollYForStop = useMemo(
    () => (idx: number) => {
      const winH = typeof window !== "undefined" ? window.innerHeight : 800;
      const heroPx = (HERO_VH / 100) * winH;
      const eraPx = (ERA_VH / 100) * winH;
      const outroPx = (OUTRO_VH / 100) * winH;
      if (idx <= 0) return 0;
      if (idx >= STOPS_COUNT - 1) {
        // Park inside the outro so it's clearly visible
        return heroPx + ERA_ORDER.length * eraPx + outroPx * 0.4;
      }
      const eraIdx = idx - 1; // 0..N-1
      // Center the era's slot in the viewport
      return heroPx + eraIdx * eraPx + eraPx * 0.5 - winH * 0.5;
    },
    [],
  );

  // Smooth-scroll via requestAnimationFrame so we get reliable behaviour
  // across browsers + don't fight Chrome's css `scroll-behavior: smooth`,
  // which has been observed to silently stall under some embeds.
  const tweenRafRef = useRef<number | null>(null);
  const cancelTween = () => {
    if (tweenRafRef.current != null) {
      cancelAnimationFrame(tweenRafRef.current);
      tweenRafRef.current = null;
    }
  };
  const tweenScrollTo = useMemo(
    () => (targetY: number, durationMs: number) => {
      cancelTween();
      const startY = window.scrollY;
      const distance = targetY - startY;
      if (Math.abs(distance) < 1) return;
      const start = performance.now();
      // ease-in-out quint — slower start + soft landing reads as cinematic
      // rather than snappy.
      const ease = (t: number) =>
        t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        // Force instant scroll per frame so the global CSS
        // `scroll-behavior: smooth` doesn't queue its own animation on top
        // of ours and stall the tween.
        window.scrollTo({
          top: startY + distance * ease(t),
          behavior: "instant" as ScrollBehavior,
        });
        if (t < 1) {
          tweenRafRef.current = requestAnimationFrame(step);
        } else {
          tweenRafRef.current = null;
          programmaticScrollRef.current = false;
        }
      };
      tweenRafRef.current = requestAnimationFrame(step);
    },
    [],
  );

  const scrollToIdx = useMemo(
    () => (idx: number) => {
      const target = scrollYForStop(Math.max(0, Math.min(STOPS_COUNT - 1, idx)));
      const distance = Math.abs(window.scrollY - target);
      // A bit longer + scaled so longer jumps feel weighty (genesis →
      // agentic shouldn't be the same speed as adjacent stops).
      const duration = Math.min(1200, Math.max(420, distance * 0.36));
      programmaticScrollRef.current = true;
      programmaticScrollUntilRef.current = performance.now() + duration + 200;
      tweenScrollTo(target, duration);
    },
    [scrollYForStop, tweenScrollTo],
  );

  // Wheel-impulse hijack: turn the page into a one-wheel = one-era
  // carousel. Each meaningful wheel impulse (or touch swipe) advances or
  // retreats the active stop by exactly one.
  //
  // Trackpad inertia handling: a single physical swipe on a Mac trackpad
  // emits dozens of decaying wheel events over ~600ms. We accept the
  // first impulse, then suppress further events until they fall below a
  // "quiet" delta AND have stopped arriving for a short window. This
  // gives a snappier feel than a fixed cooldown while still preventing
  // a single swipe from flying across multiple eras.
  //
  // Cmd/Ctrl+wheel (and pinch-to-zoom which the OS reports as ctrlKey
  // wheel) is routed to the 3D camera zoom instead of era navigation.
  useEffect(() => {
    let lastImpulseAt = 0;
    let lastWheelAt = 0;
    let inertiaLock = false;
    let touchStartY: number | null = null;
    let pinchStartDist: number | null = null;
    const HARD_COOLDOWN = 380; // ms — minimum gap between accepted impulses
    const QUIET_DELTA = 4; // wheel events smaller than this count as inertia
    const QUIET_WINDOW = 90; // ms of "no real wheel" needed to re-arm
    const WHEEL_THRESHOLD = 10; // ignore micro-wheel events entirely
    const SWIPE_THRESHOLD = 38; // px

    const advance = (dir: 1 | -1) => {
      const now = performance.now();
      if (now - lastImpulseAt < HARD_COOLDOWN) return false;
      lastImpulseAt = now;
      const cur = scrollRef.current.activeIndex;
      const next = Math.max(0, Math.min(STOPS_COUNT - 1, cur + dir));
      if (next === cur) return false;
      scrollToIdx(next);
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      // Cmd/Ctrl+wheel = camera zoom (this is also what macOS pinch-
      // to-zoom synthesises). Stop the browser from page-zooming.
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        fireZoom({ mode: "wheel", deltaY: e.deltaY });
        return;
      }
      const now = performance.now();
      const abs = Math.abs(e.deltaY);
      if (abs < WHEEL_THRESHOLD) {
        lastWheelAt = now;
        return;
      }
      // If we're mid-inertia from the last accepted swipe, eat the event
      // until the trackpad quiets down again.
      if (inertiaLock) {
        if (abs < QUIET_DELTA && now - lastWheelAt > QUIET_WINDOW) {
          inertiaLock = false;
        } else {
          lastWheelAt = now;
          e.preventDefault();
          return;
        }
      }
      lastWheelAt = now;
      if (advance(e.deltaY > 0 ? 1 : -1)) {
        inertiaLock = true;
        e.preventDefault();
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        pinchStartDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        touchStartY = null;
        return;
      }
      touchStartY = e.touches[0]?.clientY ?? null;
      pinchStartDist = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStartDist != null) {
        const [a, b] = [e.touches[0], e.touches[1]];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const ratio = d / pinchStartDist;
        if (Math.abs(1 - ratio) > 0.02) {
          fireZoom({ mode: "step", factor: 1 / ratio });
          pinchStartDist = d;
          e.preventDefault();
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (pinchStartDist != null) {
        pinchStartDist = null;
        return;
      }
      if (touchStartY == null) return;
      const endY = e.changedTouches[0]?.clientY ?? touchStartY;
      const dy = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;
      advance(dy > 0 ? 1 : -1);
    };

    // wheel needs passive:false to preventDefault and stop the native
    // scrollbar from also drifting on the same gesture
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [scrollToIdx]);

  // Fallback snap: if the user drags the scrollbar directly or lands on
  // an off-stop position (e.g. via deep link), gently snap back to the
  // nearest era after a brief pause. Much shorter delay than before
  // since most navigation now goes through the wheel-impulse path.
  useEffect(() => {
    let snapTimer: ReturnType<typeof setTimeout> | null = null;
    let isSnapping = false;
    let snapReleaseTimer: ReturnType<typeof setTimeout> | null = null;

    const armSnap = () => {
      if (isSnapping) return;
      if (
        programmaticScrollRef.current &&
        performance.now() < programmaticScrollUntilRef.current
      ) {
        return;
      }
      programmaticScrollRef.current = false;
      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        const cur = scrollRef.current.activeIndex;
        const targetY = scrollYForStop(cur);
        const delta = Math.abs(window.scrollY - targetY);
        if (delta > 24 && cur > 0 && cur < STOPS_COUNT - 1) {
          isSnapping = true;
          const duration = Math.min(700, Math.max(280, delta * 0.3));
          programmaticScrollRef.current = true;
          programmaticScrollUntilRef.current =
            performance.now() + duration + 200;
          tweenScrollTo(targetY, duration);
          if (snapReleaseTimer) clearTimeout(snapReleaseTimer);
          snapReleaseTimer = setTimeout(() => {
            isSnapping = false;
          }, duration + 100);
        }
      }, 200);
    };

    window.addEventListener("scroll", armSnap, { passive: true });
    window.addEventListener("keyup", armSnap);
    return () => {
      window.removeEventListener("scroll", armSnap);
      window.removeEventListener("keyup", armSnap);
      if (snapTimer) clearTimeout(snapTimer);
      if (snapReleaseTimer) clearTimeout(snapReleaseTimer);
    };
  }, [scrollYForStop, tweenScrollTo]);

  useEffect(() => {
    const compute = () => {
      const winH = window.innerHeight;
      const scrollY = window.scrollY;

      const heroPx = (HERO_VH / 100) * winH;
      const outroPx = (OUTRO_VH / 100) * winH;
      const totalScrollPx = (totalHeightVh / 100) * winH - winH;
      const timelineLength = totalScrollPx - heroPx - outroPx;

      const rawProgress = (scrollY - heroPx) / Math.max(1, timelineLength);
      const progress = Math.max(0, Math.min(1, rawProgress));

      // Map progress → era index + inner-stop progress
      const eraCount = ERA_ORDER.length;
      const eraFloat = progress * eraCount;
      let eraIdx = Math.floor(eraFloat);
      if (eraIdx >= eraCount) eraIdx = eraCount - 1;
      if (eraIdx < 0) eraIdx = 0;
      const innerT = Math.max(0, Math.min(1, eraFloat - eraIdx));
      const eraId = ERA_ORDER[eraIdx];
      const era = ERAS[eraId];
      const eraSpan = Math.max(1, era.range[1] - era.range[0]);
      const activeYear = era.range[0] + innerT * eraSpan;

      // hero fade based on first viewport of scroll
      const heroFade = Math.max(0, 1 - scrollY / Math.max(1, heroPx * 0.7));
      setHeroOpacity(heroFade);

      // outro fades in over the last viewport of scroll
      const outroStart = heroPx + timelineLength + 1;
      const outroFade = Math.max(
        0,
        Math.min(1, (scrollY - outroStart) / Math.max(1, outroPx * 0.7)),
      );
      setOutroOpacity(outroFade);

      let nextPhase: "hero" | "timeline" | "outro";
      if (heroFade > 0.05) nextPhase = "hero";
      else if (outroFade > 0.5) nextPhase = "outro";
      else nextPhase = "timeline";

      // Stop index for nav pill (hero=0, eras=1..N, outro=N+1)
      let stopIdx: number;
      if (nextPhase === "hero") stopIdx = 0;
      else if (nextPhase === "outro") stopIdx = STOPS_COUNT - 1;
      else stopIdx = 1 + eraIdx;

      scrollRef.current.progress = progress;
      scrollRef.current.activeIndex = stopIdx;
      scrollRef.current.activeEra = eraId;
      // Era stops don't highlight a single item; clear the per-item fields.
      scrollRef.current.activeKind = "experience";
      scrollRef.current.activeId = "";
      scrollRef.current.parentExperienceId = null;
      scrollRef.current.activeYear = activeYear;

      setPhase((prev) => (prev === nextPhase ? prev : nextPhase));
      setActiveEra((prev) => (prev === eraId ? prev : eraId));
      setActiveIdx((prev) => (prev === stopIdx ? prev : stopIdx));
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [totalHeightVh]);

  // Keyboard navigation: ↑/↓/Space/PageUp/PageDown/Home/End jump between stops.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }
      const last = STOPS_COUNT - 1;
      const cur = scrollRef.current.activeIndex;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          scrollToIdx(Math.min(last, cur + 1));
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          scrollToIdx(Math.max(0, cur - 1));
          break;
        case "Home":
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          break;
        case "End":
          e.preventDefault();
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
          break;
        case "+":
        case "=":
          e.preventDefault();
          fireZoom({ mode: "step", factor: ZOOM_STEP_IN });
          break;
        case "-":
        case "_":
          e.preventDefault();
          fireZoom({ mode: "step", factor: ZOOM_STEP_OUT });
          break;
        case "0":
          e.preventDefault();
          fireZoom({ mode: "reset" });
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollToIdx]);

  return (
    <div className={`projects-root era-${activeEra} phase-${phase}`}>
      <ProjectsNav />

      <div className="projects-canvas-wrap" aria-hidden>
        <Scene scrollRef={scrollRef} />
      </div>

      <ProjectsHero opacity={heroOpacity} />

      {/* Timeline overlay UI — visible only during timeline phase */}
      <TimelineOverlay scrollRef={scrollRef} visible={phase === "timeline"} />

      {/* Vertical era jump rail — click to teleport between eras */}
      <EraRail
        visible={phase === "timeline"}
        activeEra={activeEra}
        onJump={(eraIdx) => scrollToIdx(1 + eraIdx)}
      />

      {/* Floating prev/next pill — auto-help for scroll */}
      <ScrollNavPill
        visible={phase === "timeline"}
        activeIdx={activeIdx}
        total={STOPS_COUNT}
        onPrev={() => scrollToIdx(activeIdx - 1)}
        onNext={() => scrollToIdx(activeIdx + 1)}
        onZoomIn={() => fireZoom({ mode: "step", factor: ZOOM_STEP_IN })}
        onZoomOut={() => fireZoom({ mode: "step", factor: ZOOM_STEP_OUT })}
        onZoomReset={() => fireZoom({ mode: "reset" })}
      />

      {/* Outro / contact card — fades in at the end of the journey */}
      <ProjectsOutro opacity={outroOpacity} />

      {/* Spacer that creates scroll length so the camera & UI can travel */}
      <div
        className="projects-spacer"
        style={{ height: `${totalHeightVh}vh` }}
        aria-hidden
      />
    </div>
  );
}
