"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Clock,
  Database,
  Mic,
  Shield,
  TrendingUp,
  Users,
  Volume2,
  Zap,
} from "lucide-react";
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
  const [currentTime, setCurrentTime] = useState(new Date());

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

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
        <motion.div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-600 text-lg"
          >
            AI Sistemleri Yükleniyor...
          </motion.p>
        </motion.div>
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

      {/* Main Content - Full Width */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6"
        >
          {[
            {
              icon: Activity,
              label: "AI Engine",
              value: "98.7%",
              color: "text-green-600 bg-green-50",
            },
            {
              icon: Users,
              label: "Aktif Kullanıcı",
              value: "2,847",
              color: "text-blue-600 bg-blue-50",
            },
            {
              icon: TrendingUp,
              label: "Performans",
              value: "+23%",
              color: "text-purple-600 bg-purple-50",
            },
            {
              icon: Clock,
              label: "Uptime",
              value: "99.9%",
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              icon: Zap,
              label: "İşlem/sn",
              value: "1.2K",
              color: "text-orange-600 bg-orange-50",
            },
            {
              icon: Shield,
              label: "Güvenlik",
              value: "Aktif",
              color: "text-indigo-600 bg-indigo-50",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-gray-100 text-center"
            >
              <div
                className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Database className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <motion.h1
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl md:text-5xl font-bold mb-2"
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
                      AI raporların ve sistem analizlerin hazır. Bu ay
                      performansın harika görünüyor!
                    </motion.p>
                  </div>
                </div>

                {/* Current Time & Status */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{currentTime.toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 bg-green-500 rounded-full"
                    />
                    <span>Tüm sistemler aktif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>47 rapor oluşturuldu</span>
                  </div>
                </div>
              </div>

              {/* Voice Controls */}
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={speakWelcome}
                  disabled={isSpeaking}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${
                    isSpeaking
                      ? "bg-green-100 text-green-600 ring-2 ring-green-300"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </motion.button>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {isSpeaking ? "Konuşuyor..." : "Sesli özet"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isSpeaking ? "Lütfen bekleyin" : "Butona tıkla"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Chart1 />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Chart2 />
          </motion.div>
        </div>

        {/* Activity Logs */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <LogList />
        </motion.div>

        {/* Bottom Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {[
            { label: "Toplam Rapor", value: "47", color: "blue", trend: "+5" },
            { label: "Bu Ay", value: "8", color: "green", trend: "+2" },
            {
              label: "Otomatik İşlem",
              value: "156",
              color: "purple",
              trend: "+12",
            },
            {
              label: "Zaman Tasarrufu",
              value: "23h",
              color: "pink",
              trend: "+4h",
            },
            {
              label: "API Çağrısı",
              value: "2.4K",
              color: "indigo",
              trend: "+340",
            },
            {
              label: "Başarı Oranı",
              value: "97%",
              color: "emerald",
              trend: "+2%",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-gray-100 text-center relative overflow-hidden group"
            >
              {/* Hover effect */}
              <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`text-2xl font-bold ${
                      stat.color === "blue"
                        ? "text-blue-600"
                        : stat.color === "green"
                        ? "text-green-600"
                        : stat.color === "purple"
                        ? "text-purple-600"
                        : stat.color === "pink"
                        ? "text-pink-600"
                        : stat.color === "indigo"
                        ? "text-indigo-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                    {stat.trend}
                  </div>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
