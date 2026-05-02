"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
};

const NAV_LINKS = [
  { href: "/projects", label: "Projects", soon: true },
  { href: "/mesai", label: "Mesai" },
  { href: "/presentations", label: "Presentations" },
  { href: "/cv", label: "CV" },
];

const PILL_LINKS = [
  { href: "/projects", label: "P", title: "Projects · Coming soon", color: "bg-blue-500/80 hover:bg-blue-400", soon: true },
  { href: "/mesai", label: "M", title: "Mesai", color: "bg-fuchsia-500/80 hover:bg-fuchsia-400" },
  { href: "/presentations", label: "S", title: "Presentations", color: "bg-purple-500/80 hover:bg-purple-400" },
  { href: "/cv", label: "CV", title: "CV", color: "bg-pink-500/80 hover:bg-pink-400" },
];

const lines = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  rotation: i * 45,
  delay: i * 0.4,
}));

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 25 + 15,
        delay: Math.random() * 5,
      })),
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
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
          animate={{
            backgroundPosition: ["0px 0px", "60px 60px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.4) 50%, transparent 100%)`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, -10, 0],
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
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
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
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
          animate={{
            x: [0, -80, 40, 0],
            y: [0, 40, -20, 0],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full bg-black/20 backdrop-blur-xl z-50 border-b border-gray-800/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Ben Atakan"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div>
                <div className="font-display text-lg font-semibold text-white tracking-tight">
                  Ben Atakan
                </div>
                <div className="font-mono-display text-[10px] uppercase tracking-[0.18em] text-gray-400">
                  Software Developer
                </div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-7 text-sm">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-display group inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300"
                >
                  <span className="font-medium">{item.label}</span>
                  {item.soon && (
                    <span className="font-mono-display text-[9px] uppercase tracking-[0.18em] border border-amber-400/40 text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                      soon
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <motion.button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-gray-700/30 text-white"
              onClick={() => setMobileMenuOpen((v) => !v)}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
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
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="font-display flex items-center justify-between text-gray-300 hover:text-white transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="font-medium">{item.label}</span>
                      {item.soon && (
                        <span className="font-mono-display text-[9px] uppercase tracking-[0.18em] border border-amber-400/40 text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                          soon
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <main className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="mb-8 sm:mb-10 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-2xl" />
                <Image
                  src="/ben.jpg"
                  alt="Atakan"
                  width={160}
                  height={160}
                  priority
                  className="relative rounded-full border border-white/10 shadow-xl object-cover w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40"
                />

                {/* Geometric lines emanating from BELOW the portrait */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 w-screen max-w-none h-0"
                >
                  {lines.map((line) => (
                    <motion.span
                      key={line.id}
                      className="absolute left-0 right-0 top-0 block h-px"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(96, 165, 250, 0.7) 50%, transparent 100%)",
                        transformOrigin: "50% 50%",
                        transform: `rotate(${line.rotation}deg)`,
                      }}
                      animate={{
                        scaleX: [0, 1, 0],
                        opacity: [0, 0.35, 0],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: line.delay,
                      }}
                    />
                  ))}
                  <motion.span
                    className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 block w-1.5 h-1.5 rounded-full bg-blue-400"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.6, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.h1
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[7.5rem] font-semibold mb-5 sm:mb-7 tracking-[-0.04em] leading-[0.95] bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              Ben Atakan
            </motion.h1>

            <motion.p
              className="font-display text-lg sm:text-xl md:text-2xl text-gray-300/90 max-w-2xl mx-auto leading-relaxed mb-3 px-4 font-light"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: "easeOut" }}
            >
              Software developer, product builder, and performance enthusiast.
            </motion.p>

            <motion.p
              className="font-mono-display text-[11px] sm:text-xs uppercase tracking-[0.32em] text-blue-300/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              ship · learn · iterate
            </motion.p>
          </motion.div>
        </div>
      </main>

      <motion.div
        className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
      >
        <a
          href="mailto:info@benatakan.com"
          className="font-mono-display inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/5 backdrop-blur-lg border border-gray-700/30 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group"
        >
          <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xs sm:text-sm tracking-wide">info@benatakan.com</span>
        </a>
      </motion.div>

      <motion.div
        className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-black/30 backdrop-blur-xl rounded-full border border-gray-700/30">
          {PILL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className={`relative w-9 h-9 rounded-full ${item.color} transition-all duration-300 flex items-center justify-center hover:scale-110`}
            >
              <span className="font-display text-xs text-white font-semibold">
                {item.label}
              </span>
              {item.soon && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 border border-gray-950" />
              )}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
