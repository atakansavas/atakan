"use client";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  Database,
  ExternalLink,
  Mail,
  MessageCircle,
  Mic,
  MicIcon,
  Phone,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function HomePage() {
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    message: "",
  });

  const services = [
    {
      icon: <Bot className="w-8 h-8 text-blue-600" />,
      title: "Sesli & Yazılı Yapay Zekâ Asistanları",
      description:
        "7/24 çalışan AI asistanları ile müşterilerinize kesintisiz hizmet sunun",
      features: [
        "7/24 Sesli Destek",
        "Akıllı Chat Botları",
        "Çoklu Dil Desteği",
        "Kişiselleştirilmiş Yanıtlar",
      ],
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      title: "Süreç Otomasyonu & Entegrasyonlar",
      description:
        "İş süreçlerinizi otomatikleştirerek zaman kazanın ve verimliliği artırın",
      features: [
        "Form Otomasyonu",
        "Randevu Sistemleri",
        "Email Marketing",
        "Workflow Yönetimi",
      ],
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-pink-600" />,
      title: "n8n ile Özel Akışlar",
      description:
        "Tüm sistemlerinizi birbirine bağlayarak akıllı otomasyon zincirleri oluşturun",
      features: [
        "Sistem Entegrasyonları",
        "Veri Senkronizasyonu",
        "API Bağlantıları",
        "Özel Akış Tasarımı",
      ],
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
      title: "Web Scraping & Veri Analitiği",
      description:
        "Web&apos;den otomatik veri toplama ve akıllı analiz raporları",
      features: [
        "Otomatik Veri Toplama",
        "Pazar Araştırması",
        "Rekabet Analizi",
        "Raporlama Sistemleri",
      ],
    },
    {
      icon: <Database className="w-8 h-8 text-indigo-600" />,
      title: "CRM Servisleri",
      description:
        "Müşteri ilişkilerinizi AI destekli CRM sistemleriyle güçlendirin",
      features: [
        "CRM Entegrasyonu",
        "Müşteri Takibi",
        "Satış Pipeline Yönetimi",
        "Otomatik Raporlama",
      ],
    },
  ];

  const techStack = [
    "Next.js",
    "MongoDB",
    "OpenAI",
    "ElevenLabs",
    "TailwindCSS",
    "Firebase",
    "n8n",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    alert("Mesajınız alındı! En kısa sürede size dönüş yapacağım.");
    setFormData({ name: "", email: "", service: "", message: "" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/projects"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Projeler
              </a>
              <a
                href="/presentations"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sunumlar
              </a>
              <a
                href="/booking"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Randevu Ayarla
              </a>
              <a
                href="/cv"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                CV
              </a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
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

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1
                className="text-5xl md:text-7xl font-bold mb-6"
                style={{ color: "var(--text-primary)" }}
              >
                İşinize
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Yapay Zeka Desteği
                </span>
                <br />
                Alın
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
                AI destekli çözümlerle işletmenizi geleceğe taşıyın. Sesli
                asistanlardan süreç otomasyonuna kadar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/booking"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  Randevu Al
                  <Calendar className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="/login"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/90 text-gray-800 rounded-full font-semibold flex items-center justify-center gap-2 backdrop-blur-lg border border-gray-200 hover:bg-white/100 transition-all"
                >
                  AI Dashboard
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              AI Çözümlerimiz
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              İşletmenizi yapay zeka ile güçlendiren kapsamlı çözümler
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl backdrop-blur-lg border shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: "var(--gradient-card)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div className="mb-6">{service.icon}</div>
                <h3
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Assistant Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              AI Asistanımıza Sorun
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Sesli olarak ihtiyaçlarınızı anlayıp size yapay zeka destekli
              çözümler önerebilir.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold flex items-center justify-center gap-3 mx-auto shadow-lg hover:shadow-xl transition-all text-lg"
            >
              <Mic className="w-6 h-6" />
              AI Asistanı Başlat
            </motion.button>
          </motion.div>
        </div>

        {/* Floating Voice Assistant Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsVoiceAssistantOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-40 flex items-center justify-center"
        >
          <MicIcon className="w-6 h-6" />
        </motion.button>

        {/* Voice Assistant Modal */}
        {isVoiceAssistantOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">AI Asistan</h3>
                <button
                  onClick={() => setIsVoiceAssistantOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 mb-4">
                  AI asistanımız şu anda geliştirme aşamasında. Yakında sesli
                  olarak size yapay zeka desteği sağlayabilecek!
                </p>
                <p className="text-sm text-gray-500">
                  Şimdilik aşağıdaki iletişim formunu kullanabilirsiniz.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-8"
              style={{ color: "var(--text-primary)" }}
            >
              Hakkımda
            </h2>
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-gray-100">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Ben <strong>Atakan Savaş</strong>. İşletmelere yapay zeka
                desteği sağlayan bir AI uzmanıyım. Sesli asistanlardan süreç
                otomasyonuna kadar geniş bir yelpazede AI çözümleri
                geliştiriyorum.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Full-stack developer olarak Next.js, MongoDB, OpenAI, CRM
                sistemleri, n8n gibi teknolojilerle işletmelerin yapay zeka
                dönüşümüne öncülük ediyorum. MyBulut, PlutonAI gibi başarılı AI
                projelerinin kurucusuyum.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                {[
                  "AI Development",
                  "OpenAI",
                  "CRM Sistemleri",
                  "n8n",
                  "Next.js",
                  "MongoDB",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              İletişim
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              AI projeleriniz hakkında konuşalım
            </p>
            <motion.a
              href="/booking"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all mb-8"
            >
              <Calendar className="w-5 h-5" />
              Hızlı Randevu Al
            </motion.a>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-gray-100"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İsim
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hangi AI çözümü ilginizi çekiyor?
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seçiniz</option>
                    <option value="ai-assistant">Yapay Zeka Asistanları</option>
                    <option value="automation">Süreç Otomasyonu</option>
                    <option value="n8n">n8n Akışları</option>
                    <option value="scraping">Web Scraping</option>
                    <option value="crm">CRM Entegrasyonu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesaj
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Gönder
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                    <p className="text-gray-600">Hızlı iletişim</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/905352797392"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 transition-colors flex items-center gap-2"
                >
                  WhatsApp&apos;ta yazın
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Telegram</h3>
                    <p className="text-gray-600">Direkt mesaj</p>
                  </div>
                </div>
                <a
                  href="https://t.me/benatakanai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
                >
                  Telegram&apos;da yazın
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">E-posta</h3>
                    <p className="text-gray-600">Detaylı görüşme</p>
                  </div>
                </div>
                <a
                  href="mailto:info@benatakan.com"
                  className="text-purple-600 hover:text-purple-700 transition-colors"
                >
                  info@benatakan.com
                </a>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Instagram</h3>
                    <p className="text-gray-600">Güncel projeler</p>
                  </div>
                </div>
                <a
                  href="https://instagram.com/sv.herbokolog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-2"
                >
                  @sv.herbokolog
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
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
                <div
                  className="text-2xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Ben Atakan
                </div>
              </div>
              <p className="text-gray-600">İşinize Yapay Zeka Desteği Alın</p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-4">Built with:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <a
                  href="/projects"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Projeler
                </a>
                <a
                  href="/presentations"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Sunumlar
                </a>
                <a
                  href="/booking"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Randevu
                </a>
                <a
                  href="/cv"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  CV
                </a>
              </div>
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
