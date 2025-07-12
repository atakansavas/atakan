"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PresentationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--gradient-background)" }}
    >
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full bg-white/90 backdrop-blur-lg z-50 border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <Image
                  src="/logo.png"
                  alt="Ben Atakan AI"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <div
                    className="text-xl font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Ben Atakan
                  </div>
                  <div className="text-xs text-gray-500 -mt-1">
                    AI Solutions
                  </div>
                </div>
              </motion.div>
            </Link>
            <div
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Sunumlar
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Image
                  src="/logo.png"
                  alt="Ben Atakan AI"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <div
                  className="text-2xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Ben Atakan
                </div>
              </div>
              <p className="text-gray-600">İşinize Yapay Zeka Desteği Alın</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Ana Sayfa
              </Link>
              <Link
                href="/projects"
                className="hover:text-blue-600 transition-colors"
              >
                Projeler
              </Link>
              <Link
                href="/presentations"
                className="hover:text-blue-600 transition-colors"
              >
                Sunumlar
              </Link>
              <Link
                href="/booking"
                className="hover:text-blue-600 transition-colors"
              >
                Randevu
              </Link>
              <Link
                href="/cv"
                className="hover:text-blue-600 transition-colors"
              >
                CV
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
