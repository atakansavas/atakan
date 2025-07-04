"use client";
import { div } from "framer-motion/client";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Code,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CVPage() {
  const personalInfo = {
    name: "Atakan Savas",
    title: "AI Solutions Architect & Full-Stack Developer",
    email: "info@benatakan.com",
    phone: "+90 535 279 73 92",
    location: "Ortaca, Muğla, Turkey",
    linkedin: "https://www.linkedin.com/in/hiata/",
    github: "https://github.com/atakansavas",
  };

  const summary = `Experienced AI Solutions Architect and Full-Stack Developer with over a decade of expertise in developing AI-powered solutions and modern web technologies. Currently leading a 3-person team achieving $1M ARR, with plans to reach $2M ARR by year-end. Specialized in large language models, voice AI agents, and process automation.`;

  const experience = [
    {
      title: "AI Solutions Architect & Full-Stack Developer",
      company: "Freelance / Independent",
      period: "2021 - Present",
      location: "Remote",
      description: [
        "Leading AI-powered solutions development and digital transformation initiatives",
        "Specialized in large language models, voice AI agents, and process automation",
        "Currently working with 3-person team achieving $1M ARR, targeting $2M ARR by end of year",
        "Built SuperSocialScore project for social media analytics",
        "Developed production-ready voice AI agents for customer service",
        "Transformed ERP support line with AI-powered automation",
      ],
      technologies: [
        "Next.js",
        "OpenAI",
        "LangChain",
        "Vector DBs",
        "ElevenLabs",
        "Voice AI",
        "Python",
        "React",
      ],
    },
    {
      title: "Full-Stack Developer",
      company: "Various Companies",
      period: "2017 - 2021",
      location: "Istanbul, Turkey",
      description: [
        "Developed enterprise-level web applications and SaaS platforms",
        "Focused on cloud architecture and distributed systems",
        "Built scalable solutions for various industries",
        "Implemented cloud-native architectures and microservices",
        "Developed RESTful APIs and GraphQL endpoints",
      ],
      technologies: [
        "React",
        "Node.js",
        "PostgreSQL",
        "AWS",
        "Docker",
        "GraphQL",
        "TypeScript",
      ],
    },
    {
      title: "Frontend Developer",
      company: "Web Development Agencies",
      period: "2013 - 2017",
      location: "Istanbul, Turkey",
      description: [
        "Started with jQuery and vanilla JavaScript, progressed through Angular.js to modern frameworks",
        "Developed responsive web applications and interactive user interfaces",
        "Implemented modern UI/UX patterns and optimized frontend performance",
        "Created cross-browser compatible solutions",
      ],
      technologies: [
        "JavaScript",
        "jQuery",
        "Angular.js",
        "HTML5/CSS3",
        "Responsive Design",
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

  const skills = {
    "Artificial Intelligence & ML": [
      "Large Language Models (GPT-3/4)",
      "Voice AI Agents",
      "Vector Databases",
      "Machine Learning Pipelines",
      "Computer Vision",
      "Natural Language Processing",
    ],
    "Frontend Development": [
      "JavaScript (ES6+)",
      "React & Next.js",
      "Vue.js",
      "TypeScript",
      "Angular",
      "jQuery",
    ],
    "Backend & Infrastructure": [
      "Node.js",
      "Python",
      "GraphQL",
      "REST APIs",
      "Microservices",
      "Docker/Kubernetes",
    ],
    "Database & Storage": [
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Elasticsearch",
      "Vector Stores",
      "AWS S3",
    ],
    "DevOps & Cloud": [
      "AWS Suite",
      "Google Cloud",
      "CI/CD Pipelines",
      "Infrastructure as Code",
      "Monitoring & Logging",
      "Serverless Architecture",
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="text-lg font-medium text-gray-900">
            Curriculum Vitae
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Image
                src="/cv.JPG"
                alt="Atakan Savas"
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {personalInfo.name}
              </h1>
              <p className="text-xl text-gray-600 mb-4">{personalInfo.title}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {personalInfo.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {personalInfo.phone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {personalInfo.location}
                </div>
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  <a
                    href={personalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Professional Experience
          </h2>

          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {exp.title}
                    </h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 md:mt-0">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {exp.period}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {exp.location}
                    </div>
                  </div>
                </div>

                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                  {exp.description.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Key Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
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
                <p className="text-gray-700 mb-3 text-sm">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs border border-gray-200"
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
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Project →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Technical Skills
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(skills).map(([category, skillList]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillList.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href={`mailto:${personalInfo.email}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
