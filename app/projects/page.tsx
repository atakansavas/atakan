"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ERAS, ERA_ORDER } from "./_lib/data";
import type { Era } from "./_lib/data";
import { LangProvider } from "./_lib/lang";
import { ProjectsHero, ProjectsOutro, TimelineOverlay } from "./_components/Overlay";
import { ProjectsNav } from "./_components/Nav";
import { ScrollNavPill } from "./_components/ScrollNavPill";
import { EraRail } from "./_components/EraRail";
import "./projects.css";

const Scene = dynamic(() => import("./_components/Scene"), {
  ssr: false,
  loading: () => null,
});

// Era-paginated scroll: each era is one "stop" of fixed height. The user
// scrolls through 7 macro-positions: hero → 5 eras → outro. Within an era
// stop the activeYear interpolates from era.start to era.end so the 3D
// camera still drifts gently while the era's content sits on the right.
const ERA_VH = 220;
const HERO_VH = 100;
const OUTRO_VH = 90;

const STOPS_COUNT = 1 + ERA_ORDER.length + 1; // hero + N eras + outro

export default function ProjectsPage() {
  return (
    <LangProvider>
      <ProjectsExperience />
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
      const duration = Math.min(1500, Math.max(560, distance * 0.42));
      programmaticScrollRef.current = true;
      programmaticScrollUntilRef.current = performance.now() + duration + 200;
      tweenScrollTo(target, duration);
    },
    [scrollYForStop, tweenScrollTo],
  );

  // Snap to the nearest stop once the user pauses scrolling. Tolerance keeps
  // us from snapping while the user is mid-gesture or actively scrolling.
  // We only arm the snap timer in response to *user* scroll input (wheel/
  // touch/key), never on programmatic `scrollTo` calls — that prevents the
  // snap from interrupting button/era-rail jumps and from snap-fighting
  // itself when its own scroll triggers a scroll event.
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
          const duration = Math.min(800, Math.max(360, delta * 0.32));
          programmaticScrollRef.current = true;
          programmaticScrollUntilRef.current =
            performance.now() + duration + 200;
          tweenScrollTo(targetY, duration);
          if (snapReleaseTimer) clearTimeout(snapReleaseTimer);
          snapReleaseTimer = setTimeout(() => {
            isSnapping = false;
          }, duration + 100);
        }
      }, 420);
    };

    window.addEventListener("wheel", armSnap, { passive: true });
    window.addEventListener("touchend", armSnap, { passive: true });
    window.addEventListener("keyup", armSnap);
    return () => {
      window.removeEventListener("wheel", armSnap);
      window.removeEventListener("touchend", armSnap);
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
