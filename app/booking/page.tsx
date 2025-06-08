"use client";
import { Conversation } from "@/components/Conversation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  CheckCircle,
  Clock,
  Headphones,
  MessageSquare,
  Mic,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState("");

  const services = [
    {
      id: "voice-assistant",
      title: "Sesli AI Asistan",
      description: "7/24 çalışan sesli yapay zeka asistanı",
      icon: <Headphones className="w-8 h-8" />,
      duration: "30 dk",
      color: "from-blue-500 to-purple-600",
    },
    {
      id: "automation",
      title: "Süreç Otomasyonu",
      description: "İş süreçlerinizi otomatikleştirin",
      icon: <Zap className="w-8 h-8" />,
      duration: "45 dk",
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "integration",
      title: "Sistem Entegrasyonu",
      description: "Mevcut sistemlerinizle AI entegrasyonu",
      icon: <MessageSquare className="w-8 h-8" />,
      duration: "60 dk",
      color: "from-pink-500 to-red-600",
    },
    {
      id: "consultation",
      title: "AI Danışmanlığı",
      description: "Kapsamlı AI strateji danışmanlığı",
      icon: <Users className="w-8 h-8" />,
      duration: "90 dk",
      color: "from-indigo-500 to-blue-600",
    },
  ];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  return (
    <div
      className="min-h-screen"
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
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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

        <div className="max-w-4xl mx-auto relative z-10 text-center">
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
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Sesli Asistanı
              </span>
              <br />
              ile Randevu Alın
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Yapay zeka destekli sesli asistanımız, ihtiyaçlarınızı anlayarak
              size en uygun AI çözümlerini önerir ve randevunuzu otomatik olarak
              planlar.
            </p>

            <Conversation />
          </motion.div>
        </div>
      </section>

      {/* Service Selection */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Hangi Konuda Destek İstiyorsunuz?
            </h2>
            <p className="text-xl text-gray-600">
              AI asistanımız size uygun çözümü bulmak için hangi alanda desteğe
              ihtiyacınız olduğunu bilmek istiyor
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => handleServiceSelect(service.id)}
                className={`p-8 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${
                  selectedService === service.id
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-gray-200 bg-white/80 hover:border-gray-300"
                } backdrop-blur-lg`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-r ${service.color} text-white`}
                  >
                    {service.icon}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </div>
                </div>

                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>

                {selectedService === service.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-blue-600"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Seçildi</span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Hemen AI Desteği Alın</h2>
            <p className="text-xl mb-8 opacity-90">
              Sesli asistanımız 7/24 aktif! Şimdi konuşmaya başlayın.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all"
            >
              <Mic className="w-5 h-5" />
              Sesli Asistanı Başlat
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
