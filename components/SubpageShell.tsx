"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

// Reusable dark-themed shell shared by /cv, /presentations and other
// content subpages. Visual language mirrors the homepage (animated
// gradient grid, drifting particles, glass nav, mobile pill nav) and
// the typography vocabulary from /projects (Bricolage display for
// headings, JetBrains mono-display for eyebrows and labels).
//
// Convenience: keeps a single source of truth for the nav, active
// state, mobile menu and bottom pill. Subpages just supply an
// `eyebrow` for the breadcrumb label and the page content.

type NavLink = { href: string; label: string; soon?: boolean };
type PillLink = {
  href: string;
  label: string;
  title: string;
  color: string;
  soon?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: "/projects", label: "Projects" },
  { href: "/mesai", label: "Mesai" },
  { href: "/presentations", label: "Presentations" },
  { href: "/cv", label: "CV" },
];

const PILL_LINKS: PillLink[] = [
  { href: "/projects", label: "P", title: "Projects", color: "bg-blue-500/80 hover:bg-blue-400" },
  { href: "/mesai", label: "M", title: "Mesai", color: "bg-fuchsia-500/80 hover:bg-fuchsia-400" },
  { href: "/presentations", label: "S", title: "Presentations", color: "bg-purple-500/80 hover:bg-purple-400" },
  { href: "/cv", label: "CV", title: "CV", color: "bg-pink-500/80 hover:bg-pink-400" },
];

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
};

export type SubpageShellProps = {
  children: ReactNode;
  /** Short uppercase breadcrumb label shown next to the brand (e.g. "CV", "Sunumlar"). */
  eyebrow?: string;
  /** Render drifting particles in the background. Disable for very dense pages. */
  particles?: boolean;
  /** Particle count when particles are enabled. Defaults to a calmer 32. */
  particleCount?: number;
};

export function SubpageShell({
  children,
  eyebrow,
  particles = true,
  particleCount = 32,
}: SubpageShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [particleList, setParticleList] = useState<Particle[]>([]);

  useEffect(() => {
    if (!particles) {
      setParticleList([]);
      return;
    }
    setParticleList(
      Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 25 + 15,
        delay: Math.random() * 5,
      })),
    );
  }, [particles, particleCount]);

  // Close mobile menu when navigating to a new route.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden relative">
      {/* Animated background — identical visual language to the home page */}
      <div className="fixed inset-0 pointer-events-none print:hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />

        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "60px 60px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {particleList.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.4) 50%, transparent 100%)",
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, -10, 0],
              opacity: [0.1, 0.7, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}

        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.4) 30%, transparent 70%)",
            top: "-20%",
            left: "-20%",
            filter: "blur(60px)",
          }}
          animate={{ x: [0, 100, -50, 0], y: [0, -50, 30, 0], scale: [1, 1.2, 0.8, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.4) 30%, transparent 70%)",
            bottom: "-10%",
            right: "-10%",
            filter: "blur(80px)",
          }}
          animate={{ x: [0, -80, 40, 0], y: [0, 40, -20, 0], scale: [1, 0.8, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Sticky glass nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="no-print fixed top-0 w-full bg-black/20 backdrop-blur-xl z-50 border-b border-gray-800/30 print:hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/ben.jpg"
                alt="Ben Atakan"
                width={32}
                height={32}
                className="rounded-full object-cover w-8 h-8 border border-white/10 group-hover:border-white/25 transition-colors"
              />
              <div className="min-w-0">
                <div className="font-display text-lg font-semibold text-white tracking-tight leading-none">
                  Ben Atakan
                </div>
                <div className="font-mono-display text-[10px] uppercase tracking-[0.18em] text-gray-400 mt-1">
                  {eyebrow ?? "Software Developer"}
                </div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-7 text-sm">
              {NAV_LINKS.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-display group inline-flex items-center gap-2 transition-colors duration-300 ${
                      active
                        ? "text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    <span className="font-medium relative">
                      {item.label}
                      {active && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute left-0 right-0 -bottom-1.5 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                        />
                      )}
                    </span>
                    {item.soon && (
                      <span className="font-mono-display text-[9px] uppercase tracking-[0.18em] border border-amber-400/40 text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                        soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <motion.button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-gray-700/30 text-white"
              onClick={() => setMobileMenuOpen((v) => !v)}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-gray-700/30 z-40"
              >
                <div className="px-4 py-6 space-y-2">
                  {NAV_LINKS.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== "/" && pathname?.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`font-display flex items-center justify-between transition-colors duration-300 py-2 px-4 rounded-lg ${
                          active
                            ? "text-white bg-white/10"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        {item.soon && (
                          <span className="font-mono-display text-[9px] uppercase tracking-[0.18em] border border-amber-400/40 text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                            soon
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Page content */}
      <main className="relative z-10 pt-24 pb-24 md:pb-12">{children}</main>

      {/* Mobile bottom pill nav */}
      <motion.div
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 no-print print:hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-black/40 backdrop-blur-xl rounded-full border border-gray-700/30">
          {PILL_LINKS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.title}
                aria-current={active ? "page" : undefined}
                className={`relative w-9 h-9 rounded-full ${item.color} transition-all duration-300 flex items-center justify-center hover:scale-110 ${
                  active ? "ring-2 ring-white/70 ring-offset-2 ring-offset-black/40" : ""
                }`}
              >
                <span className="font-display text-xs text-white font-semibold">
                  {item.label}
                </span>
                {item.soon && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 border border-gray-950" />
                )}
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default SubpageShell;
