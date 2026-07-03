"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SectionVideo } from "./SectionVideo";

/**
 * A framed section video that drifts vertically as it scrolls through the
 * viewport, giving the clip a sense of depth (like looking through a window).
 * The inner layer is oversized so the drift never reveals an edge.
 */
export function ParallaxVideo({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-[-12%]">
        <SectionVideo src={src} className="w-full h-full object-cover" />
      </motion.div>
    </div>
  );
}
