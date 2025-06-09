"use client";

import { motion } from "framer-motion";
import { Mic, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Chart1 from "../../components/Chart1";
import Chart2 from "../../components/Chart2";
import Header from "../../components/Header";
import LogList from "../../components/LogList";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem("isAuthenticated");
    const userEmail = localStorage.getItem("userEmail");

    if (authStatus === "true") {
      setIsAuthenticated(true);
      if (userEmail) {
        const name = userEmail.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    } else {
      router.push("/login");
    }

    setIsLoading(false);
  }, [router]);

  // Voice synthesis function (using Web Speech API)
  const speakWelcome = () => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(
        `Hoş geldin ${userName}! AI Dashboard'ına başarıyla giriş yaptın. Performans raporların hazır.`
      );
      utterance.lang = "tr-TR";
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--gradient-background)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--gradient-background)" }}
    >
      {/* Header */}
      <Header userName={userName} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Hoş geldin, {userName}! 👋
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-600"
                >
                  AI raporların ve sistem analizlerin hazır. Bu ay performansın
                  harika görünüyor!
                </motion.p>
              </div>

              {/* Voice Controls */}
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={speakWelcome}
                  disabled={isSpeaking}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    isSpeaking
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </motion.button>

                <div className="hidden sm:block text-right">
                  <p className="text-sm text-gray-600">
                    {isSpeaking ? "Konuşuyor..." : "Sesli özet"}
                  </p>
                  <p className="text-xs text-gray-500">Butona tıkla</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Chart1 />
          <Chart2 />
        </div>

        {/* Activity Logs */}
        <LogList />

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Toplam Rapor", value: "47", color: "blue" },
            { label: "Bu Ay", value: "8", color: "green" },
            { label: "Otomatik İşlem", value: "156", color: "purple" },
            { label: "Zaman Tasarrufu", value: "23h", color: "pink" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-gray-100 text-center"
            >
              <div
                className={`text-2xl font-bold mb-1 ${
                  stat.color === "blue"
                    ? "text-blue-600"
                    : stat.color === "green"
                    ? "text-green-600"
                    : stat.color === "purple"
                    ? "text-purple-600"
                    : "text-pink-600"
                }`}
              >
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
