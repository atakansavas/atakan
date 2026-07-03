"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import { LangToggle } from "./LangToggle";

export function TopBar() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t.nav.back.replace("← ", ""), href: "/" },
    { label: t.nav.links.manifesto, href: "#manifesto" },
    { label: t.nav.links.place, href: "#nerede" },
    { label: t.nav.links.feed, href: "#akis" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "bg-[var(--sanai-navy-deep)]/70 backdrop-blur-xl border-b border-[var(--sanai-line-soft)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link
          href="#top"
          className="sanai-wordmark text-2xl sm:text-[1.7rem] tracking-tight text-white hover:opacity-80 transition-opacity"
        >
          {t.nav.wordmark}
          <sup className="ml-0.5 align-super text-[0.5em] text-muted">®</sup>
        </Link>

        {/* Section links */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                i === 0
                  ? "text-white/90 hover:text-white"
                  : "text-muted hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-3 sm:gap-4">
          <LangToggle />
          <a
            href="#invite"
            className="liquid-glass rounded-full px-5 py-2 text-sm text-white hidden sm:inline-flex"
          >
            {t.nav.cta}
          </a>
        </div>
      </nav>
    </header>
  );
}
