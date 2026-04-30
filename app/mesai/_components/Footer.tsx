export function Footer() {
  return (
    <footer className="border-t border-[var(--color-primary)]/30 bg-[#020205] pt-16 pb-8 relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-3">
          <h3 className="text-xl md:text-2xl font-bold pixel-font text-[var(--color-primary)] text-glow-primary uppercase">
            MESAI OS
          </h3>
          <p className="text-[#94a3b8] text-sm max-w-sm font-mono">
            &gt; Otonom ajan orkestrasyon ağı.
            <br />
            &gt; Terminal beklemede...
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-[#94a3b8] flex flex-col md:flex-row justify-between items-center gap-4 font-mono">
          <p>COPYRIGHT © 2026 MESAI NETWORK. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-2 pixel-font text-[10px] border border-[var(--color-accent)] px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <span className="w-2 h-2 bg-[var(--color-accent)] animate-blink shadow-[0_0_5px_var(--color-accent)]" />
            SYSTEM ONLINE
          </div>
        </div>
      </div>
    </footer>
  );
}
