"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useReducer, useState, type FormEvent } from "react";
import { useLang } from "./LangProvider";
import { OfficeRoom, type OfficeTheme } from "./OfficeRoom";

type Stage = 1 | 2 | 3 | "done";

type State = {
  stage: Stage;
  theme: OfficeTheme | null;
  kitId: string | null;
  email: string;
  queue: number | null;
  error: string | null;
};

type Action =
  | { type: "set-theme"; theme: OfficeTheme }
  | { type: "set-kit"; kitId: string }
  | { type: "set-email"; email: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "submit-success"; queue: number }
  | { type: "submit-error"; error: string }
  | { type: "reset" };

const initial: State = {
  stage: 1,
  theme: null,
  kitId: null,
  email: "",
  queue: null,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set-theme":
      return { ...state, theme: action.theme };
    case "set-kit":
      return { ...state, kitId: action.kitId };
    case "set-email":
      return { ...state, email: action.email, error: null };
    case "next":
      if (state.stage === 1 && state.theme) return { ...state, stage: 2 };
      if (state.stage === 2 && state.kitId) return { ...state, stage: 3 };
      return state;
    case "back":
      if (state.stage === 2) return { ...state, stage: 1 };
      if (state.stage === 3) return { ...state, stage: 2 };
      return state;
    case "submit-success":
      return { ...state, stage: "done", queue: action.queue, error: null };
    case "submit-error":
      return { ...state, error: action.error };
    case "reset":
      return initial;
    default:
      return state;
  }
}

const STORAGE_KEY = "mesai_waitlist";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InteractiveWaitlist() {
  const { t } = useLang();
  const w = t.waitlist;
  const [state, dispatch] = useReducer(reducer, initial);
  const [submitting, setSubmitting] = useState(false);

  const stageNumber = state.stage === "done" ? 3 : state.stage;

  const selectedKit = w.kits.find((k) => k.id === state.kitId);
  const previewTeam = selectedKit?.team ?? ["Chef"];
  const previewTheme = state.theme ?? "hacker";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(state.email)) {
      dispatch({ type: "submit-error", error: w.errorEmail });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/mesai/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: state.theme,
          kitId: state.kitId,
          email: state.email,
        }),
      });
      if (!res.ok) throw new Error("server");
      const data = (await res.json()) as { queue?: number };
      const queue = data.queue ?? Math.floor(Math.random() * 800) + 100;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            theme: state.theme,
            kitId: state.kitId,
            email: state.email,
            queue,
          }),
        );
      }
      dispatch({ type: "submit-success", queue });
    } catch {
      dispatch({ type: "submit-error", error: w.errorGeneric });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="waitlist"
      className="py-24 relative z-10 border-t border-[var(--color-border)]"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="pixel-font text-[10px] tracking-widest text-[var(--color-accent)]/80 mb-3">
            {w.eyebrow}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold pixel-font uppercase text-white text-glow mb-4">
            {w.title}
          </h2>
          <p className="text-[#94a3b8] text-base md:text-lg max-w-xl mx-auto">
            {w.sub}
          </p>
        </motion.div>

        <div className="retro-window">
          <div className="retro-window-header">
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
            <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span className="ml-2 pixel-font text-[10px] text-[var(--color-accent)] opacity-80">
              mesai/waitlist.exe
            </span>
            <span className="ml-auto pixel-font text-[10px] text-[var(--color-accent)]">
              {w.step} {stageNumber} {w.of} 3
            </span>
          </div>

          <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5">
              <OfficeRoom
                theme={previewTheme}
                team={state.stage === "done" ? previewTeam : (state.kitId ? previewTeam : ["Chef"]) }
              />
              <p className="pixel-font text-[10px] uppercase tracking-widest text-[var(--color-accent)]/70 mt-3 text-center">
                {"// preview"}
              </p>
            </div>

            <div className="md:col-span-7">
              <AnimatePresence mode="wait">
                {state.stage === 1 && (
                  <motion.div
                    key="stage-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="mesai-waitlist-stage flex flex-col gap-4"
                  >
                    <div>
                      <h3 className="pixel-font text-base uppercase text-white mb-1">
                        {w.stage1Title}
                      </h3>
                      <p className="text-sm text-[#94a3b8]">{w.stage1Hint}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {t.officeDesign.themes.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: "set-theme",
                              theme: theme.id as OfficeTheme,
                            })
                          }
                          className={`retro-window p-3 flex flex-col items-start gap-1 text-left transition-colors ${
                            state.theme === theme.id
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                              : "hover:border-[var(--color-accent)]"
                          }`}
                        >
                          <span className="pixel-font text-xs uppercase text-white">
                            {theme.name}
                          </span>
                          <span className="pixel-font text-[9px] text-[var(--color-accent)]/70">
                            {theme.tagline}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        disabled={!state.theme}
                        onClick={() => dispatch({ type: "next" })}
                        className="retro-btn retro-btn-primary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {w.next} →
                      </button>
                    </div>
                  </motion.div>
                )}

                {state.stage === 2 && (
                  <motion.div
                    key="stage-2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="mesai-waitlist-stage flex flex-col gap-4"
                  >
                    <div>
                      <h3 className="pixel-font text-base uppercase text-white mb-1">
                        {w.stage2Title}
                      </h3>
                      <p className="text-sm text-[#94a3b8]">{w.stage2Hint}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {w.kits.map((kit) => (
                        <button
                          key={kit.id}
                          type="button"
                          onClick={() =>
                            dispatch({ type: "set-kit", kitId: kit.id })
                          }
                          className={`retro-window p-3 flex flex-col gap-2 text-left transition-colors ${
                            state.kitId === kit.id
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                              : "hover:border-[var(--color-accent)]"
                          }`}
                        >
                          <span className="pixel-font text-xs uppercase text-white">
                            {kit.name}
                          </span>
                          <span className="text-[12px] text-[#94a3b8]">
                            {kit.desc}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {kit.team.map((m, idx) => (
                              <span
                                key={idx}
                                className="mesai-role-chip pixel-font text-[9px] uppercase tracking-widest"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "back" })}
                        className="retro-btn px-4 py-2"
                      >
                        ← {w.back}
                      </button>
                      <button
                        type="button"
                        disabled={!state.kitId}
                        onClick={() => dispatch({ type: "next" })}
                        className="retro-btn retro-btn-primary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {w.next} →
                      </button>
                    </div>
                  </motion.div>
                )}

                {state.stage === 3 && (
                  <motion.form
                    key="stage-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={onSubmit}
                    className="mesai-waitlist-stage flex flex-col gap-4"
                  >
                    <div>
                      <h3 className="pixel-font text-base uppercase text-white mb-1">
                        {w.stage3Title}
                      </h3>
                      <p className="text-sm text-[#94a3b8]">{w.stage3Hint}</p>
                    </div>
                    <input
                      type="email"
                      value={state.email}
                      onChange={(e) =>
                        dispatch({ type: "set-email", email: e.target.value })
                      }
                      placeholder={w.emailPlaceholder}
                      className="bg-[#050511] border border-[var(--color-accent)]/40 px-3 py-3 font-mono text-sm text-white outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_8px_rgba(255,0,255,0.4)]"
                      autoComplete="email"
                      required
                    />
                    {state.error && (
                      <p className="pixel-font text-[10px] text-red-400 uppercase tracking-widest">
                        ! {state.error}
                      </p>
                    )}
                    <div className="flex justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "back" })}
                        className="retro-btn px-4 py-2"
                      >
                        ← {w.back}
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="retro-btn retro-btn-primary px-4 py-2 disabled:opacity-50"
                      >
                        {submitting ? "..." : `${w.submit} →`}
                      </button>
                    </div>
                  </motion.form>
                )}

                {state.stage === "done" && (
                  <motion.div
                    key="stage-done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col gap-4 items-start"
                  >
                    <div className="pixel-font text-[10px] uppercase tracking-widest border border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1">
                      {"// FOUNDING TENANT"}
                    </div>
                    <h3 className="pixel-font text-lg md:text-xl uppercase text-white text-glow-primary leading-tight">
                      {w.successTitle}
                    </h3>
                    <p className="text-[#94a3b8] text-sm">{w.successLine1}</p>
                    <p className="text-[#94a3b8] text-sm">{w.successLine2}</p>
                    <div className="border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5 px-4 py-3 flex items-center justify-between w-full">
                      <span className="pixel-font text-[10px] uppercase tracking-widest text-[var(--color-accent)]/80">
                        {w.successQueue}
                      </span>
                      <span className="pixel-font text-lg text-[var(--color-accent)] text-glow">
                        #{state.queue}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "reset" })}
                      className="retro-btn px-4 py-2"
                    >
                      ↺ {w.buildAnother}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
