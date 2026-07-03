"use client";

import { useEffect, useRef } from "react";

/**
 * A muted, looping section video that only loads and plays while near the
 * viewport. With several videos on one page this keeps the page light:
 * offscreen clips are paused and never fetched until needed.
 */
export function SectionVideo({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    let loaded = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!loaded) {
              video.src = src;
              video.load();
              loaded = true;
            }
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { rootMargin: "300px 0px", threshold: 0.01 },
    );

    io.observe(video);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
