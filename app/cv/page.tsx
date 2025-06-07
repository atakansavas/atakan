"use client";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Image from "next/image";

export default function CVPage() {
  const experiences = [
    {
      title: "AI Solutions Specialist",
      company: "Ben Atakan AI",
      period: "2022 - Devam Ediyor",
      description:
        "İşletmelere yapay zeka desteği sağlayan AI çözümleri ve dijital dönüşüm projeleri geliştirme.",
      skills: ["Next.js", "OpenAI", "n8n", "MongoDB", "ElevenLabs"],
    },
    {
      title: "Full-Stack Developer",
      company: "MyBulut",
      period: "2021 - 2022",
      description:
        "Bulut tabanlı SaaS çözümleri ve kurumsal yazılım geliştirme.",
      skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    },
    {
      title: "Frontend Developer",
      company: "PlutonAI",
      period: "2020 - 2021",
      description:
        "AI destekli web uygulamaları ve kullanıcı arayüzü geliştirme.",
      skills: ["Vue.js", "TypeScript", "Firebase"],
    },
  ];

  const skills = [
    {
      category: "AI & Automation",
      items: ["OpenAI API", "ElevenLabs", "n8n", "Logo ERP", "AI Development"],
    },
    {
      category: "Frontend",
      items: ["Next.js", "React", "Vue.js", "TypeScript", "TailwindCSS"],
    },
    {
      category: "Backend",
      items: ["Node.js", "MongoDB", "PostgreSQL", "Firebase"],
    },
    { category: "Tools", items: ["Git", "Docker", "AWS", "Vercel"] },
  ];

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
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Ana Sayfaya Dön
            </motion.a>
            <div
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Hakkımda / Özgeçmiş
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="relative mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-xl border-4 border-white"
              >
                <Image
                  src="/cv.JPG"
                  alt="Atakan Savaş"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Atakan Savaş
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              AI Solutions Specialist & Full-Stack Developer
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                İstanbul, Türkiye
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                info@benatakan.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +90 535 279 73 92
              </div>
            </div>
          </motion.div>

          {/* About */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2
                className="text-2xl font-semibold mb-6 flex items-center gap-3"
                style={{ color: "var(--text-primary)" }}
              >
                <Award className="w-6 h-6 text-blue-600" />
                Hakkımda
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                İşletmelere yapay zeka desteği sağlayan bir AI uzmanıyım. Sesli
                asistanlardan süreç otomasyonuna kadar geniş bir yelpazede AI
                çözümleri geliştiriyorum. &quot;İşinize yapay zeka desteği
                alın&quot; mottosuyla hareket ediyorum.
              </p>
              <p className="text-gray-700 leading-relaxed">
                OpenAI, ElevenLabs, n8n gibi modern AI teknolojileriyle müşteri
                hizmetlerinden süreç otomasyonuna kadar geniş bir yelpazede
                projeler hayata geçiriyorum. MyBulut ve PlutonAI gibi başarılı
                AI projelerinin kurucusuyum.
              </p>
            </div>
          </motion.section>

          {/* Experience */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2
              className="text-2xl font-semibold mb-8 flex items-center gap-3"
              style={{ color: "var(--text-primary)" }}
            >
              <Briefcase className="w-6 h-6 text-purple-600" />
              İş Deneyimi
            </h2>
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {exp.title}
                      </h3>
                      <p className="text-blue-600 font-medium">{exp.company}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-2 md:mt-0">
                      <Calendar className="w-4 h-4" />
                      {exp.period}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{exp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Skills */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2
              className="text-2xl font-semibold mb-8 flex items-center gap-3"
              style={{ color: "var(--text-primary)" }}
            >
              <GraduationCap className="w-6 h-6 text-green-600" />
              Teknik Yetenekler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skillGroup, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {skillGroup.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Contact Links */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2
                className="text-2xl font-semibold mb-6"
                style={{ color: "var(--text-primary)" }}
              >
                İletişim
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.a
                  href="https://github.com/atakansavas"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </motion.a>
                <motion.a
                  href="https://www.linkedin.com/in/hiata/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </motion.a>
                <motion.a
                  href="mailto:info@benatakan.com"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all"
                >
                  <Mail className="w-5 h-5" />
                  E-posta
                </motion.a>
                <motion.a
                  href="https://t.me/benatakanai"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  Telegram
                </motion.a>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
