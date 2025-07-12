"use client";
import { motion } from "framer-motion";
import { Code, Github, Play, Settings, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState("melodai");

  const projects = [
    {
      id: "melodai",
      title: "Melodai",
      subtitle: "Spotify Bağlantılı AI Müzik Uygulaması",
      description:
        "Spotify ile entegre, yapay zeka destekli mobil müzik uygulaması. AI ile liste oluşturma, şarkı hikayeleri çıkarma, müzik oyunları ve sanatçı falı bakma özellikleri.",
      image: "/logo.png", // Geçici olarak logo kullanıyoruz
      category: "AI & Müzik",
      status: "Geliştirme Aşamasında",
      technologies: [
        "React Native",
        "Expo",
        "Spotify API",
        "OpenAI",
        "Claude",
        "n8n",
        "MongoDB",
        "TypeScript",
      ],
      features: [
        "Spotify Hesap Entegrasyonu",
        "AI Destekli Playlist Oluşturma",
        "Şarkı Hikayeleri ve Analiz",
        "Müzik Temalı Oyunlar",
        "Sanatçı Falı ve Kehanetler",
        "Kişiselleştirilmiş Müzik Önerileri",
        "Sosyal Paylaşım Özellikleri",
        "Offline Dinleme Desteği",
      ],
      architecture: {
        frontend: "React Native & Expo ile cross-platform mobil uygulama",
        backend: "n8n ile otomatik iş akışları ve API entegrasyonu",
        ai: "OpenAI GPT-4 ve Claude ile müzik analizi ve içerik üretimi",
        music: "Spotify Web API ile müzik verileri ve kullanıcı profilleri",
        database: "MongoDB ile kullanıcı verileri ve AI analiz sonuçları",
        automation: "n8n ile Spotify ve AI servisleri arası otomasyon",
        deployment: "Expo ile mobil dağıtım ve App Store/Play Store",
      },
      prompts: [
        {
          title: "Playlist Oluşturma",
          description:
            "Kullanıcının ruh haline göre AI destekli playlist oluşturma",
          prompt:
            "Kullanıcının dinleme geçmişi ve mevcut ruh haline göre {duygu} temalı bir playlist oluştur. {tarz} müzik tarzında, {süre} dakikalık, {enerji_seviyesi} enerjili şarkılar seç. Her şarkı için kısa bir açıklama ekle.",
        },
        {
          title: "Şarkı Hikayesi Analizi",
          description: "Şarkı sözlerini analiz ederek hikaye ve anlam çıkarma",
          prompt:
            "Bu şarkı sözlerini analiz et: {şarkı_sözleri}. Şarkının hikayesini, duygusal temasını, sanatçının mesajını ve gizli anlamları çıkar. Kullanıcı dostu bir dille açıkla.",
        },
        {
          title: "Müzik Oyunu",
          description: "Şarkı bilgilerine dayalı eğlenceli oyunlar oluşturma",
          prompt:
            "Bu şarkı bilgileriyle eğlenceli bir oyun oluştur: {şarkı_bilgileri}. Şarkı adı tahmin etme, sanatçı bulma, yıl tahmin etme gibi farklı zorluk seviyelerinde sorular hazırla.",
        },
        {
          title: "Sanatçı Falı",
          description: "Müzik tercihlerine göre kişilik analizi ve kehanetler",
          prompt:
            "Kullanıcının müzik tercihlerini analiz et: {müzik_geçmişi}. Bu verilere dayanarak kişilik özelliklerini çıkar ve gelecekteki müzik keşifleri için kehanetler yap. Eğlenceli ve yaratıcı bir dille sun.",
        },
      ],
      demo: "https://melodai-demo.vercel.app",
      github: "https://github.com/benatakan/melodai",
      challenges: [
        "Spotify API rate limitleri ve kullanıcı yetkilendirmesi",
        "AI model entegrasyonu ve gerçek zamanlı yanıt süreleri",
        "Cross-platform mobil uygulama performansı",
        "Müzik verilerinin analizi ve anlamlı içerik üretimi",
        "Kullanıcı gizliliği ve veri güvenliği",
        "Offline çalışma ve senkronizasyon",
      ],
      solutions: [
        "n8n ile akıllı API yönetimi ve rate limiting",
        "Streaming API ve caching ile hızlı AI yanıtları",
        "Expo optimizasyonları ve native performans",
        "NLP ve müzik analizi algoritmaları",
        "End-to-end şifreleme ve GDPR uyumluluğu",
        "Local storage ve background sync",
      ],
    },
    {
      id: "ai-assistant",
      title: "AI Asistan Platformu",
      subtitle: "Sesli ve Yazılı AI Asistanlar",
      description: "İşletmeler için özelleştirilmiş AI asistan çözümleri",
      image: "/logo.png",
      category: "AI & Otomasyon",
      status: "Aktif",
      technologies: ["Next.js", "OpenAI", "ElevenLabs", "n8n", "MongoDB"],
      features: [
        "7/24 Sesli Destek",
        "Akıllı Chat Botları",
        "Çoklu Dil Desteği",
        "Kişiselleştirilmiş Yanıtlar",
      ],
      architecture: {
        frontend: "Next.js ile modern web arayüzü",
        backend: "API Routes ile serverless backend",
        ai: "OpenAI GPT-4 ile doğal dil işleme",
        voice: "ElevenLabs ile ses sentezi",
        automation: "n8n ile iş akışı otomasyonu",
        database: "MongoDB ile veri yönetimi",
      },
      prompts: [
        {
          title: "Müşteri Hizmetleri",
          description: "Müşteri sorularına yanıt verme",
          prompt:
            "Sen {şirket} şirketinin müşteri hizmetleri temsilcisisin. Müşterinin sorununu dinle ve profesyonel bir şekilde yardımcı ol.",
        },
      ],
      demo: "https://ai-assistant-demo.vercel.app",
      github: "https://github.com/benatakan/ai-assistant",
      challenges: [
        "Ses kalitesi ve doğal konuşma",
        "Gerçek zamanlı yanıt süreleri",
        "Çoklu dil desteği",
        "Güvenlik ve veri koruması",
      ],
      solutions: [
        "ElevenLabs ile yüksek kaliteli ses sentezi",
        "Streaming API ile hızlı yanıtlar",
        "i18n ile çoklu dil desteği",
        "End-to-end şifreleme ve GDPR uyumluluğu",
      ],
    },
  ];

  const selectedProjectData = projects.find((p) => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 w-full bg-white/90 backdrop-blur-lg z-50 border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <Image
                  src="/logo.png"
                  alt="Ben Atakan AI"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <div className="text-xl font-semibold text-gray-900">
                    Ben Atakan
                  </div>
                  <div className="text-xs text-gray-500 -mt-1">
                    AI Solutions
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/presentations"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sunumlar
              </Link>
              <Link
                href="/booking"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Randevu Ayarla
              </Link>
              <Link
                href="/cv"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                CV
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Projelerim
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Yapay zeka ve modern teknolojilerle geliştirdiğim projeler. Her
              proje, gerçek dünya problemlerini çözmek için tasarlandı.
            </p>
          </motion.div>

          {/* Project Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedProject === project.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {project.title}
              </button>
            ))}
          </motion.div>

          {/* Project Details */}
          {selectedProjectData && (
            <motion.div
              key={selectedProject}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid lg:grid-cols-2 gap-12"
            >
              {/* Project Info */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      {selectedProjectData.category}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                      {selectedProjectData.status}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedProjectData.title}
                  </h2>
                  <p className="text-xl text-gray-600 mb-4">
                    {selectedProjectData.subtitle}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedProjectData.description}
                  </p>
                </div>

                {/* Technologies */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Kullanılan Teknolojiler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProjectData.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Özellikler
                  </h3>
                  <ul className="space-y-2">
                    {selectedProjectData.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Links */}
                <div className="flex gap-4">
                  {selectedProjectData.demo && (
                    <a
                      href={selectedProjectData.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Demo İzle
                    </a>
                  )}
                  {selectedProjectData.github && (
                    <a
                      href={selectedProjectData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Project Image */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <Image
                    src={selectedProjectData.image}
                    alt={selectedProjectData.title}
                    width={500}
                    height={300}
                    className="w-full h-64 object-cover rounded-xl mb-6"
                  />

                  {/* Architecture */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Proje Mimarisi
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(selectedProjectData.architecture).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-start"
                          >
                            <span className="text-sm font-medium text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="text-sm text-gray-800 text-right max-w-xs">
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Prompts Section */}
          {selectedProjectData && selectedProjectData.prompts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                AI Prompt&apos;ları
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedProjectData.prompts.map((prompt, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {prompt.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{prompt.description}</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 font-mono">
                        {prompt.prompt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Challenges & Solutions */}
          {selectedProjectData && selectedProjectData.challenges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 grid md:grid-cols-2 gap-8"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-orange-500" />
                  Karşılaşılan Zorluklar
                </h3>
                <ul className="space-y-3">
                  {selectedProjectData.challenges.map((challenge, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-green-500" />
                  Çözümler
                </h3>
                <ul className="space-y-3">
                  {selectedProjectData.solutions.map((solution, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Image
                  src="/logo.png"
                  alt="Ben Atakan AI"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <div className="text-2xl font-semibold text-gray-900">
                  Ben Atakan
                </div>
              </div>
              <p className="text-gray-600">İşinize Yapay Zeka Desteği Alın</p>
            </div>

            <div className="pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                © 2025 BenAtakan.com - Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
