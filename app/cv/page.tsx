"use client";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Code,
  Download,
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  EXPERIENCES,
  PROJECTS,
  expEnd,
  type Experience,
  type Project,
} from "../projects/_lib/data";

const personalInfo = {
  name: "Atakan Savaş",
  title: "AI Solutions Architect · Full-Stack Engineer · CTO",
  email: "info@benatakan.com",
  phone: "+90 535 279 73 92",
  location: "Dalyan, Muğla, Türkiye",
  linkedin: "https://www.linkedin.com/in/hiata/",
  github: "https://github.com/atakansavas",
  website: "https://benatakan.com",
};

const summary = {
  intro:
    "AI Solutions Architect and Full-Stack Developer with 10+ years building production systems — from broadcast desktop apps and GIS platforms to microservices at scale and AI agent orchestration. Currently CTO of Khora Design Lab and co-founder of a stealth AI startup.",
  recent:
    "Over the past three years I have lived inside the AI shift: shipping voice agents that hold their own against humans, replacing entire support lines with LLM workflows, and prototyping autonomous multi-agent systems. Comfortable as a one-person product team or as the technical lead of a multidisciplinary group.",
  highlights: [
    "10+ years in software, 5+ in production AI/ML systems",
    "Shipped products to 1.3M+ users (Pluton), 90+ Lighthouse scores under load",
    "Cut ERP support operating costs by 60% with AI workflow redesign",
    "Built one-person products that ran for years, plus monoliths split into microservices for 10-person squads",
  ],
};

const techStack: Record<string, string[]> = {
  "AI & Agents": [
    "OpenAI",
    "Claude Agent SDK",
    "ElevenLabs",
    "Whisper / XTTS",
    "LangChain",
    "Vector DBs",
    "Vapi",
    "n8n",
  ],
  "Frontend & Mobile": [
    "Next.js 14/15",
    "React",
    "Vue.js / Nuxt.js",
    "React Native",
    "Expo",
    "TypeScript",
    "Tailwind",
    "Three.js",
  ],
  "Backend & Infra": [
    "Node.js",
    ".NET / .NET Core",
    "Python",
    "AWS Lambda / Serverless",
    "Vercel",
    "Railway",
    "Docker",
    "GitHub Actions",
  ],
  "Data & Messaging": [
    "PostgreSQL",
    "MSSQL",
    "MongoDB / DocumentDB",
    "Redis",
    "ElasticSearch",
    "RabbitMQ / Kafka",
    "Supabase",
    "MongoDB Atlas",
  ],
  "Architecture & Practice": [
    "DDD",
    "CQRS",
    "Mediator pattern",
    "Pipeline pattern",
    "Microservices",
    "Event-driven systems",
    "Agile / Scrum",
    "Technical leadership",
  ],
};

const skills: Record<string, string[]> = {
  "AI Engineering": [
    "Large Language Models (GPT-4, Claude)",
    "Voice AI agents (ElevenLabs, Vapi, Whisper)",
    "Multi-agent orchestration",
    "Vector search & RAG pipelines",
    "Prompt engineering & evaluation",
    "Telegram, WhatsApp Cloud API",
  ],
  "Product Engineering": [
    "End-to-end product lifecycle",
    "Monetization & subscription (RevenueCat, iyzico)",
    "SEO + SSR performance (90+ Lighthouse)",
    "Mobile UX (React Native + Expo)",
    "Marketplace mechanics",
    "Web3 (Optimism, Base, NFT minting)",
  ],
  "Backend & Architecture": [
    "REST + GraphQL APIs",
    "Microservices & serverless",
    "CQRS / DDD codebases",
    "Real-time pipelines (SignalR, sockets)",
    "GIS + geometric data (Cesium, GeoServer)",
    "CI/CD (Jenkins, Octopus, GitHub Actions)",
  ],
  "Leadership & Process": [
    "Technical strategy & roadmap",
    "Hiring and team composition",
    "Async distributed teams (5–10 people)",
    "Architecture decision records",
    "Cost discipline (soft cap / hard cap)",
    "Mentorship & code review culture",
  ],
};

const formatYears = (e: Experience) => {
  const end = e.end === "present" ? "Present" : e.end;
  return `${e.start} – ${end}`;
};

const formatProjectYears = (p: Project) => {
  if (p.yearLabel) return p.yearLabel;
  if (p.endYear === "present") return `${p.year} – Present`;
  if (p.endYear && p.endYear !== p.year) return `${p.year} – ${p.endYear}`;
  return String(p.year);
};

const expSortedDesc = [...EXPERIENCES].sort((a, b) => {
  const aEnd = expEnd(a);
  const bEnd = expEnd(b);
  if (aEnd !== bEnd) return bEnd - aEnd;
  return b.start - a.start;
});

// Featured projects — CV gets the flagship + alive set, newest first.
const featuredProjects = [...PROJECTS]
  .filter((p) => p.flagship || p.endYear === "present")
  .sort((a, b) => b.year - a.year);

export default function CVPage() {
  return (
    <>
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav,
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 1.4cm;
          }
          body {
            background: white !important;
            color: #111 !important;
            font-family: "Inter", "Helvetica", sans-serif !important;
            font-size: 10.5pt !important;
            line-height: 1.4 !important;
          }
          .cv-container {
            background: white !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .cv-card {
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin-bottom: 1.2em !important;
            page-break-inside: avoid !important;
          }
          .cv-section-title {
            font-size: 14pt !important;
            border-bottom: 2px solid #111 !important;
            padding-bottom: 0.25em !important;
            margin-bottom: 0.6em !important;
          }
          .cv-exp-item,
          .cv-proj-item {
            page-break-inside: avoid !important;
            margin-bottom: 1em !important;
          }
          .cv-photo {
            width: 90px !important;
            height: 90px !important;
            border: 1.5px solid #333 !important;
          }
          .cv-tag {
            background: #f3f3f3 !important;
            border: 1px solid #ccc !important;
            color: #333 !important;
            font-size: 8.5pt !important;
          }
          a {
            color: #1d4ed8 !important;
            text-decoration: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 cv-container">
        <nav className="bg-white border-b border-gray-200 px-4 py-3 no-print sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="text-sm font-medium text-gray-900">
              Curriculum Vitae
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/cv.pdf"
                download
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </a>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <header className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 cv-card">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Image
                  src="/ben.jpg"
                  alt="Atakan Savaş"
                  width={140}
                  height={140}
                  priority
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border border-gray-200 cv-photo"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
                  {personalInfo.name}
                </h1>
                <p className="text-lg text-gray-600 mt-1 mb-5">
                  {personalInfo.title}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{personalInfo.email}</span>
                  </a>
                  <a
                    href={`tel:${personalInfo.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{personalInfo.phone}</span>
                  </a>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{personalInfo.location}</span>
                  </div>
                  <a
                    href={personalInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span>benatakan.com</span>
                  </a>
                  <a
                    href={personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <Linkedin className="w-4 h-4 shrink-0" />
                    <span>linkedin.com/in/hiata</span>
                  </a>
                  <a
                    href={personalInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-blue-600"
                  >
                    <Github className="w-4 h-4 shrink-0" />
                    <span>github.com/atakansavas</span>
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* Summary */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-7 cv-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 cv-section-title">
              <Briefcase className="w-5 h-5" />
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">{summary.intro}</p>
            <p className="text-gray-700 leading-relaxed mb-5">
              {summary.recent}
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {summary.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <Star className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(techStack).map(([cat, list]) => (
                <div key={cat}>
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
                    {cat}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100 cv-tag"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Experience timeline */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-7 cv-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 cv-section-title">
              <Briefcase className="w-5 h-5" />
              Professional Experience
            </h2>

            <div className="space-y-8">
              {expSortedDesc.map((exp) => (
                <article
                  key={exp.id}
                  className="relative pl-5 border-l-2 border-gray-200 cv-exp-item"
                >
                  <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                  <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-1 mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {exp.role.en}
                        {exp.flagship && (
                          <span className="ml-2 text-amber-500 inline-block align-middle">
                            <Star className="w-3.5 h-3.5 inline" />
                          </span>
                        )}
                      </h3>
                      <p className="text-blue-600 font-medium text-sm">
                        {exp.company.en}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatYears(exp)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {exp.location.en}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mb-3 italic">
                    {exp.story.en}
                  </p>

                  <ul className="list-disc list-outside ml-5 text-sm text-gray-700 space-y-1 mb-3">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b.en}</li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1.5">
                    {exp.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] border border-gray-200 cv-tag"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Featured Projects */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-7 cv-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 cv-section-title">
              <Code className="w-5 h-5" />
              Featured Projects
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {featuredProjects.map((p) => (
                <article
                  key={p.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cv-proj-item"
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 leading-tight">
                        {p.title}
                        {p.flagship && (
                          <Star className="w-3.5 h-3.5 inline text-amber-500 ml-1.5 align-middle" />
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.subtitle.en}
                      </p>
                    </div>
                    {p.status && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-medium border border-green-100 shrink-0">
                        {p.status.en}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 font-mono mb-2">
                    {formatProjectYears(p)}
                  </p>

                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {p.story.en}
                  </p>

                  {p.highlight && p.highlight.length > 0 && (
                    <ul className="text-xs text-gray-600 space-y-0.5 mb-3 list-disc list-outside ml-4">
                      {p.highlight.map((h, i) => (
                        <li key={i}>{h.en}</li>
                      ))}
                    </ul>
                  )}

                  {p.takeaway && (
                    <p className="text-xs text-gray-600 italic mb-3 border-l-2 border-blue-200 pl-2">
                      “{p.takeaway.en}”
                    </p>
                  )}

                  {p.tech && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {p.tech.slice(0, 8).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] border border-gray-200 cv-tag"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {p.link && p.link.startsWith("http") && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                    >
                      <ExternalLink className="w-3 h-3" /> View project
                    </a>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                See the full 20-year timeline →
              </Link>
            </div>
          </section>

          {/* Skills */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-7 cv-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 cv-section-title">
              <GraduationCap className="w-5 h-5" />
              Skills & Practice
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(skills).map(([cat, list]) => (
                <div key={cat}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    {cat}
                  </h3>
                  <ul className="space-y-1">
                    {list.map((s) => (
                      <li
                        key={s}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-blue-500 mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-7 cv-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center cv-section-title">
              Let&apos;s talk
            </h2>
            <p className="text-center text-sm text-gray-600 mb-5 max-w-xl mx-auto">
              Currently leading technology at Khora Design Lab and co-building a
              stealth AI startup. Open to selected advisory, consulting, and
              technical leadership conversations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${personalInfo.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Mail className="w-4 h-4" /> Email
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
