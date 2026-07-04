"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A thin reading-progress line pinned to the very top. Driven purely by a
 * spring over scroll progress (transform only, so it stays cheap).
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-transparent via-[var(--sanai-su)] to-[var(--sanai-su-soft)]"
    />
  );
}
