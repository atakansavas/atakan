"use client";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  // Generate floating particles for background animation
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 25 + 15,
    delay: Math.random() * 5,
  }));

  // Generate flowing lines for geometric patterns
  const lines = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    rotation: i * 45,
    delay: i * 0.5,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* Complex Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />

        {/* Animated grid overlay */}
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

        {/* Floating particles */}
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

        {/* Large flowing orbs */}
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

        {/* Geometric flowing lines */}
        {lines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute w-full h-px opacity-10"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.8) 50%, transparent 100%)",
              top: "50%",
              transformOrigin: "center",
              transform: `rotate(${line.rotation}deg)`,
            }}
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: line.delay,
            }}
          />
        ))}

        {/* Pulsing center highlight */}
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

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full bg-black/20 backdrop-blur-xl z-50 border-b border-gray-800/30"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Ben Atakan"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div>
                <div className="text-lg font-semibold text-white">
                  Ben Atakan
                </div>
                <div className="text-xs text-gray-400">Software Developer</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a
                href="/projects"
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                Projects
              </a>
              <a
                href="/presentations"
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                Presentations
              </a>
              <a
                href="/cv"
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                CV
              </a>
              <a
                href="/booking"
                className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
              >
                Booking
              </a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1
              className="text-6xl md:text-8xl font-light mb-8 tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              Ben Atakan
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            >
              Software developer, product builder, and performance enthusiast.
            </motion.p>
          </motion.div>
        </div>
      </main>

      {/* Contact - Bottom */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
      >
        <a
          href="mailto:info@benatakan.com"
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-lg border border-gray-700/30 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group"
        >
          <Mail className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-sm">info@benatakan.com</span>
        </a>
      </motion.div>

      {/* Mobile Navigation Menu Indicator */}
      <motion.div
        className="md:hidden fixed bottom-8 right-6 z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="flex flex-col gap-2">
          <a
            href="/projects"
            className="w-2 h-2 rounded-full bg-blue-500/60 hover:bg-blue-400 transition-colors"
          ></a>
          <a
            href="/presentations"
            className="w-2 h-2 rounded-full bg-purple-500/60 hover:bg-purple-400 transition-colors"
          ></a>
          <a
            href="/cv"
            className="w-2 h-2 rounded-full bg-pink-500/60 hover:bg-pink-400 transition-colors"
          ></a>
          <a
            href="/booking"
            className="w-2 h-2 rounded-full bg-cyan-500/60 hover:bg-cyan-400 transition-colors"
          ></a>
        </div>
      </motion.div>
    </div>
  );
}
