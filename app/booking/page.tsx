"use client";
import { Conversation } from "@/components/Conversation";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, CheckCircle, Clock, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function BookingPage() {
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value));
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailValid) {
      setEmailSubmitted(true);
    }
  };

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
              Randevu Al
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  x: [0, 30, 0],
                  y: [0, -30, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20"
                style={{ background: "var(--gradient-primary)" }}
              />
              <motion.div
                animate={{
                  x: [0, -40, 0],
                  y: [0, 40, 0],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-40 right-20 w-48 h-48 rounded-full opacity-15"
                style={{ background: "var(--accent-blue)" }}
              />
            </div>

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-full border border-gray-200 mb-8">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    AI Destekli Randevu Sistemi
                  </span>
                </div>

                <h1
                  className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AI Sesli Asistanı
                  </span>
                  <br />
                  ile Randevu Alın
                </h1>

                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
                  Yapay zeka destekli sesli asistanımız, ihtiyaçlarınızı
                  anlayarak size en uygun AI çözümlerini önerir ve randevunuzu
                  otomatik olarak planlar.
                </p>

                {/* Email Collection or Conversation */}
                {!emailSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md mx-auto"
                  >
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-gray-200">
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <Mail className="w-8 h-8 text-white" />
                        </div>

                        <div className="text-center">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            E-posta Adresiniz
                          </h3>
                          <p className="text-sm text-gray-600">
                            Sesli görüşmeyi başlatmak için e-posta adresinizi
                            girin
                          </p>
                        </div>

                        <form
                          onSubmit={handleEmailSubmit}
                          className="w-full space-y-4"
                        >
                          <div className="relative">
                            <input
                              type="email"
                              value={email}
                              onChange={handleEmailChange}
                              placeholder="ornek@email.com"
                              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                                email && !isEmailValid
                                  ? "border-red-300 focus:border-red-500"
                                  : isEmailValid
                                  ? "border-green-300 focus:border-green-500"
                                  : "border-gray-200 focus:border-blue-500"
                              } focus:outline-none focus:ring-0`}
                              required
                            />
                            {email && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center ${
                                  isEmailValid ? "bg-green-500" : "bg-red-500"
                                }`}
                              >
                                <CheckCircle className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </div>

                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={!isEmailValid}
                            className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                              isEmailValid
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Devam Et
                            <Clock className="w-5 h-5" />
                          </motion.button>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl mx-auto"
                  >
                    <Conversation email={email} />
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>
        </div>
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
