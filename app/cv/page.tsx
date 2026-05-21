"use client";
import {
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
import { SubpageShell } from "../../components/SubpageShell";
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

// Reusable bits ------------------------------------------------------------

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2 className="cv-section-title font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-6 flex items-center gap-3">
      {Icon && (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 text-blue-300">
          <Icon className="w-4 h-4" />
        </span>
      )}
      <span>{children}</span>
    </h2>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`cv-card bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

export default function CVPage() {
  return (
    <SubpageShell eyebrow="Curriculum Vitae" particleCount={20}>
      {/* Print stylesheet — keeps the existing white-paper PDF export.
          The shell's animated background and nav are hidden via .no-print
          + print:hidden classes already, so the CV prints cleanly. */}
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
          html,
          body {
            background: white !important;
            color: #111 !important;
            font-family: "Inter", "Helvetica", sans-serif !important;
            font-size: 10.5pt !important;
            line-height: 1.4 !important;
          }
          main {
            padding: 0 !important;
          }
          .cv-container {
            background: white !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .cv-card {
            background: white !important;
            backdrop-filter: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin-bottom: 1.2em !important;
            page-break-inside: avoid !important;
            color: #111 !important;
          }
          .cv-card * {
            color: #111 !important;
            -webkit-text-fill-color: initial !important;
            background: transparent !important;
            text-shadow: none !important;
          }
          .cv-section-title {
            font-size: 14pt !important;
            border-bottom: 2px solid #111 !important;
            padding-bottom: 0.25em !important;
            margin-bottom: 0.6em !important;
            color: #111 !important;
          }
          .cv-section-title svg,
          .cv-section-title span > span {
            display: none !important;
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
            filter: none !important;
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 cv-container">
        {/* Header — photo + identity + contacts */}
        <Card>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 flex justify-center md:block">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-2xl" />
                <Image
                  src="/ben.jpg"
                  alt="Atakan Savaş"
                  width={160}
                  height={160}
                  priority
                  className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border border-white/15 shadow-xl cv-photo"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono-display text-[10px] uppercase tracking-[0.32em] text-blue-300/80 mb-3">
                Curriculum Vitae · 2026
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.04em] leading-[0.95] bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
                {personalInfo.name}
              </h1>
              <p className="font-display text-base sm:text-lg text-gray-300 mt-3 mb-6 font-light">
                {personalInfo.title}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-gray-300">
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0 text-blue-300/70" />
                  <span className="truncate">{personalInfo.email}</span>
                </a>
                <a
                  href={`tel:${personalInfo.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 text-blue-300/70" />
                  <span>{personalInfo.phone}</span>
                </a>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0 text-blue-300/70" />
                  <span>{personalInfo.location}</span>
                </div>
                <a
                  href={personalInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 shrink-0 text-blue-300/70" />
                  <span>benatakan.com</span>
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors"
                >
                  <Linkedin className="w-4 h-4 shrink-0 text-blue-300/70" />
                  <span>linkedin.com/in/hiata</span>
                </a>
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-300 transition-colors"
                >
                  <Github className="w-4 h-4 shrink-0 text-blue-300/70" />
                  <span>github.com/atakansavas</span>
                </a>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 no-print">
                <a
                  href="/cv.pdf"
                  download
                  className="font-display inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-4 h-4" /> PDF indir
                </a>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="font-display inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 border border-white/15 rounded-lg hover:bg-white/15 transition-colors"
                >
                  Yazdır
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card>
          <SectionTitle icon={Briefcase}>Professional Summary</SectionTitle>
          <p className="text-gray-300/95 leading-relaxed mb-3">
            {summary.intro}
          </p>
          <p className="text-gray-300/95 leading-relaxed mb-6">
            {summary.recent}
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
            {summary.highlights.map((h) => (
              <li
                key={h}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <Star className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(techStack).map(([cat, list]) => (
              <div key={cat}>
                <h3 className="font-mono-display text-[10px] uppercase tracking-[0.24em] text-blue-300/80 mb-3">
                  {cat}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((t) => (
                    <span
                      key={t}
                      className="font-mono-display px-2 py-0.5 bg-blue-500/10 text-blue-200 rounded text-[10px] uppercase tracking-[0.08em] border border-blue-400/20 cv-tag"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Experience timeline */}
        <Card>
          <SectionTitle icon={Briefcase}>Professional Experience</SectionTitle>

          <div className="space-y-8">
            {expSortedDesc.map((exp) => (
              <article
                key={exp.id}
                className="relative pl-6 border-l border-white/15 cv-exp-item"
              >
                <span className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-blue-400 ring-4 ring-gray-950/80 shadow-[0_0_12px_rgba(96,165,250,0.6)]" />
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white tracking-tight">
                      {exp.role.en}
                      {exp.flagship && (
                        <span className="ml-2 text-amber-400 inline-block align-middle">
                          <Star className="w-3.5 h-3.5 inline" />
                        </span>
                      )}
                    </h3>
                    <p className="font-display text-sm text-blue-300 font-medium">
                      {exp.company.en}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 font-mono-display text-[10px] uppercase tracking-[0.18em] text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> {formatYears(exp)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {exp.location.en}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-300/95 leading-relaxed mb-3 italic">
                  {exp.story.en}
                </p>

                <ul className="list-disc list-outside ml-5 text-sm text-gray-300 space-y-1 mb-3 marker:text-blue-400/60">
                  {exp.bullets.map((b, i) => (
                    <li key={i}>{b.en}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5">
                  {exp.tech.map((t) => (
                    <span
                      key={t}
                      className="font-mono-display px-2 py-0.5 bg-white/5 text-gray-300 rounded text-[10px] uppercase tracking-[0.08em] border border-white/10 cv-tag"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Card>

        {/* Featured Projects */}
        <Card>
          <SectionTitle icon={Code}>Featured Projects</SectionTitle>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {featuredProjects.map((p) => (
              <article
                key={p.id}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:bg-white/[0.06] hover:border-white/20 transition-all cv-proj-item"
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold text-white leading-tight tracking-tight">
                      {p.title}
                      {p.flagship && (
                        <Star className="w-3.5 h-3.5 inline text-amber-400 ml-1.5 align-middle" />
                      )}
                    </h3>
                    <p className="font-mono-display text-[10px] uppercase tracking-[0.18em] text-blue-300/90 mt-1">
                      {p.subtitle.en}
                    </p>
                  </div>
                  {p.status && (
                    <span className="font-mono-display px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-full text-[9px] uppercase tracking-[0.18em] border border-emerald-400/20 shrink-0">
                      {p.status.en}
                    </span>
                  )}
                </div>

                <p className="font-mono-display text-[10px] uppercase tracking-[0.24em] text-gray-500 mb-3">
                  {formatProjectYears(p)}
                </p>

                <p className="text-sm text-gray-300/95 leading-relaxed mb-3">
                  {p.story.en}
                </p>

                {p.highlight && p.highlight.length > 0 && (
                  <ul className="text-xs text-gray-400 space-y-0.5 mb-3 list-disc list-outside ml-4 marker:text-blue-400/60">
                    {p.highlight.map((h, i) => (
                      <li key={i}>{h.en}</li>
                    ))}
                  </ul>
                )}

                {p.takeaway && (
                  <p className="text-xs text-gray-300 italic mb-3 border-l-2 border-blue-400/40 pl-2.5">
                    &ldquo;{p.takeaway.en}&rdquo;
                  </p>
                )}

                {p.tech && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.tech.slice(0, 8).map((t) => (
                      <span
                        key={t}
                        className="font-mono-display px-1.5 py-0.5 bg-white/5 text-gray-400 rounded text-[10px] uppercase tracking-[0.08em] border border-white/10 cv-tag"
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
                    className="font-display inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 text-xs font-medium"
                  >
                    <ExternalLink className="w-3 h-3" /> View project
                  </a>
                )}
              </article>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <Link
              href="/projects"
              className="font-display inline-flex items-center gap-1.5 text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
            >
              See the full 20-year timeline →
            </Link>
          </div>
        </Card>

        {/* Skills */}
        <Card>
          <SectionTitle icon={GraduationCap}>Skills &amp; Practice</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(skills).map(([cat, list]) => (
              <div key={cat}>
                <h3 className="font-mono-display text-[10px] uppercase tracking-[0.24em] text-blue-300/80 mb-3">
                  {cat}
                </h3>
                <ul className="space-y-1.5">
                  {list.map((s) => (
                    <li
                      key={s}
                      className="text-sm text-gray-300 flex items-start gap-2.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 shrink-0 shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact CTA */}
        <Card className="text-center">
          <p className="font-mono-display text-[10px] uppercase tracking-[0.32em] text-blue-300/80 mb-3">
            Let&apos;s talk
          </p>
          <h2 className="cv-section-title font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4">
            Ready to ship together?
          </h2>
          <p className="text-sm text-gray-300 mb-6 max-w-xl mx-auto leading-relaxed">
            Currently leading technology at Khora Design Lab and co-building a
            stealth AI startup. Open to selected advisory, consulting, and
            technical leadership conversations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${personalInfo.email}`}
              className="font-display inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4" /> Email
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display inline-flex items-center gap-2 px-4 py-2 bg-blue-500/15 text-blue-200 border border-blue-400/20 rounded-lg hover:bg-blue-500/25 transition-colors text-sm font-medium"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/15 rounded-lg hover:bg-white/15 transition-colors text-sm font-medium"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>
        </Card>
      </div>
    </SubpageShell>
  );
}
