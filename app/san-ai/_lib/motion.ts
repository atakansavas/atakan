// Shared scroll-reveal for the sections: a small lift paired with a soft
// blur-in, so content settles into focus rather than sliding a long distance.
const EASE = [0.22, 1, 0.36, 1] as const;

export function reveal(delay = 0) {
  return {
    initial: { opacity: 0, y: 14, filter: "blur(10px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, margin: "-80px" } as const,
    transition: { duration: 0.65, delay, ease: EASE },
  };
}
