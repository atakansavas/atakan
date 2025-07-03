"use client";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  Code,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Rocket,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";

export default function CVPage() {
  const experiences = [
    {
      title: "AI Solutions Architect & Full-Stack Developer",
      company: "Freelance / Independent",
      period: "2021 - Present",
      description:
        "Leading AI-powered solutions development and digital transformation initiatives. Specialized in large language models, voice AI agents, and process automation. Currently working with 3-person team achieving $1M ARR, targeting $2M ARR by end of year.",
      skills: [
        "Next.js",
        "OpenAI",
        "LangChain",
        "Vector DBs",
        "ElevenLabs",
        "Voice AI",
      ],
      achievements: [
        "Built SuperSocialScore project for social media analytics",
        "Developed production-ready voice AI agents",
        "Achieved $1M ARR with small team",
        "ERP support line transformation with AI",
      ],
    },
    {
      title: "Full-Stack Developer",
      company: "Various Companies",
      period: "2017 - 2021",
      description:
        "Developed enterprise-level web applications and SaaS platforms. Focused on cloud architecture and distributed systems. Worked on scalable solutions for various industries.",
      skills: ["React", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL"],
      achievements: [
        "Built scalable SaaS platforms",
        "Implemented cloud-native architectures",
        "Developed RESTful APIs and microservices",
      ],
    },
    {
      title: "Frontend Developer",
      company: "Web Development Agencies",
      period: "2013 - 2017",
      description:
        "Started with jQuery and vanilla JavaScript, progressed through Angular.js to modern frameworks. Developed responsive web applications and interactive user interfaces.",
      skills: [
        "JavaScript",
        "jQuery",
        "Angular.js",
        "HTML5/CSS3",
        "Responsive Design",
      ],
      achievements: [
        "Created responsive web applications",
        "Implemented modern UI/UX patterns",
        "Optimized frontend performance",
      ],
    },
  ];

  const projects = [
    {
      title: "SuperSocialScore",
      description:
        "Social media analytics platform for comprehensive social media scoring and insights",
      technologies: [
        "Next.js",
        "AI Analytics",
        "Social Media APIs",
        "Real-time Data",
      ],
      link: "https://lnkd.in/dqYRe4mC",
      status: "Active",
    },
    {
      title: "Voice AI Agents",
      description:
        "Production-ready voice AI agents for customer service and support automation",
      technologies: ["ElevenLabs", "OpenAI", "Voice Processing", "NLP"],
      status: "Production",
    },
    {
      title: "ERP AI Support System",
      description:
        "AI-powered ERP support line transformation for automated customer assistance",
      technologies: ["AI Chatbots", "ERP Integration", "Process Automation"],
      status: "Deployed",
    },
  ];

  const skills = [
    {
      category: "Artificial Intelligence & Machine Learning",
      description:
        "Comprehensive experience in developing AI solutions using the latest technologies",
      items: [
        "Large Language Models (GPT-3/4)",
        "Voice AI Agents",
        "Vector Databases",
        "Machine Learning Pipelines",
        "Computer Vision",
        "Natural Language Processing",
      ],
    },
    {
      category: "Frontend Development",
      description:
        "Progressive expertise in frontend technologies from vanilla JS to modern frameworks",
      items: [
        "JavaScript (ES6+)",
        "React & Next.js",
        "Vue.js",
        "TypeScript",
        "Angular",
        "jQuery",
      ],
    },
    {
      category: "Backend & Infrastructure",
      description:
        "Comprehensive backend development and cloud infrastructure expertise",
      items: [
        "Node.js",
        "Python",
        "GraphQL",
        "REST APIs",
        "Microservices",
        "Docker/Kubernetes",
      ],
    },
    {
      category: "Database & Storage",
      description:
        "Experience with various database paradigms and storage solutions",
      items: [
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "Elasticsearch",
        "Vector Stores",
        "AWS S3",
      ],
    },
    {
      category: "DevOps & Cloud",
      description: "Cloud platform expertise and modern deployment practices",
      items: [
        "AWS Suite",
        "Google Cloud",
        "CI/CD Pipelines",
        "Infrastructure as Code",
        "Monitoring & Logging",
        "Serverless Architecture",
      ],
    },
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
              Back to Home
            </motion.a>
            <div
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              About / CV
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
                  alt="Atakan Savas"
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
              Atakan Savas
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              AI Solutions Architect & Full-Stack Developer
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ortaca, Muğla, Turkey
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
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <Users className="w-4 h-4" />
                1K+ followers
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="w-4 h-4" />
                $1M ARR achieved
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <Rocket className="w-4 h-4" />
                Targeting $2M ARR
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
                About Me
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                I&apos;m passionate about new technologies, new places,
                generative AI, and lots of code. With over a decade of
                experience, I specialize in AI-powered solutions and modern web
                technologies. My journey started with vanilla JavaScript and
                evolved through various frameworks to today&apos;s AI-focused
                development environment.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                I&apos;ve mastered developing AI-powered solutions using
                cutting-edge technologies like OpenAI, LangChain, and various ML
                frameworks. My expertise spans from frontend development to
                cloud architecture, with a focus on creating scalable and
                innovative solutions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Currently leading a 3-person team that has achieved $1M ARR,
                with ambitious plans to reach $2M ARR by the end of the year.
                I&apos;m building the future of AI-powered applications and
                digital transformation solutions.
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
              Professional Experience
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
                      {exp.company && (
                        <p className="text-blue-600 font-medium">
                          {exp.company}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-2 md:mt-0">
                      <Calendar className="w-4 h-4" />
                      {exp.period}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{exp.description}</p>
                  {exp.achievements && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Key Achievements:
                      </h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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

          {/* Projects */}
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
              <Code className="w-6 h-6 text-green-600" />
              Featured Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {project.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : project.status === "Production"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      View Project
                    </a>
                  )}
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
              Technical Expertise
            </h2>
            <div className="grid grid-cols-1 gap-6">
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
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {skillGroup.category}
                  </h3>
                  <p className="text-gray-600 mb-4">{skillGroup.description}</p>
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
                Get In Touch
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
                  Email
                </motion.a>
                <motion.a
                  href="https://t.me/benatakanai"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
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
