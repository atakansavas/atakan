/**
 * Renders a heading with an optional two-tone accent. The copy string uses a
 * single "|" to mark where the muted italic accent begins:
 *   "Every town has its |workshop quarter."
 * Everything before "|" stays solid white; everything after renders as an
 * italic, muted continuation — the signature move from the section brief.
 */
export function TwoTone({ text }: { text: string }) {
  const [head, ...rest] = text.split("|");
  const tail = rest.join("|");
  return (
    <>
      {head}
      {tail && (
        <em className="sanai-serif-italic text-white/50">{tail}</em>
      )}
    </>
  );
}
