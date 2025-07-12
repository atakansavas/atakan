"use client";
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
    <>
      {/* Print Styles */}
      <style jsx global>{`
        /* Print-specific styles */
        @media print {
          /* Reset all print styles */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }

          /* Hide navigation and non-essential elements */
          nav,
          .no-print {
            display: none !important;
          }

          /* Page setup */
          @page {
            size: A4 portrait !important;
            margin: 1.5cm !important;
            orphans: 3 !important;
            widows: 3 !important;
          }

          /* Body and container styles */
          body {
            background: white !important;
            color: black !important;
            font-family: "Times New Roman", serif !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
          }

          /* Main container */
          .cv-container {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Header section */
          .cv-header {
            page-break-after: avoid !important;
            margin-bottom: 1.5em !important;
            padding: 0 !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }

          .cv-photo {
            width: 100px !important;
            height: 100px !important;
            border: 2px solid #333 !important;
            border-radius: 0 !important;
            margin: 0 0 1em 0 !important;
          }

          .cv-name {
            font-size: 24pt !important;
            font-weight: bold !important;
            color: #000 !important;
            margin: 0 0 0.3em 0 !important;
            line-height: 1.2 !important;
          }

          .cv-title {
            font-size: 14pt !important;
            color: #333 !important;
            margin: 0 0 1em 0 !important;
            font-weight: normal !important;
          }

          .cv-contact-info {
            font-size: 10pt !important;
            color: #555 !important;
            margin: 0 !important;
          }

          .cv-contact-item {
            margin: 0.2em 0 !important;
            display: inline-block !important;
            margin-right: 2em !important;
          }

          /* Section headers */
          .cv-section {
            page-break-inside: avoid !important;
            margin-bottom: 1.5em !important;
            padding: 0 !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }

          .cv-section-title {
            font-size: 16pt !important;
            font-weight: bold !important;
            color: #000 !important;
            margin: 0 0 1em 0 !important;
            padding-bottom: 0.3em !important;
            border-bottom: 2px solid #333 !important;
            page-break-after: avoid !important;
          }

          /* Experience items */
          .cv-experience-item {
            page-break-inside: avoid !important;
            margin-bottom: 1.5em !important;
            padding-left: 1em !important;
            border-left: 3px solid #333 !important;
          }

          .cv-experience-header {
            margin-bottom: 0.8em !important;
          }

          .cv-experience-title {
            font-size: 12pt !important;
            font-weight: bold !important;
            color: #000 !important;
            margin: 0 !important;
          }

          .cv-experience-company {
            font-size: 11pt !important;
            color: #333 !important;
            font-weight: bold !important;
            margin: 0.2em 0 !important;
          }

          .cv-experience-meta {
            font-size: 10pt !important;
            color: #666 !important;
            margin: 0.2em 0 !important;
          }

          .cv-experience-description {
            font-size: 10pt !important;
            color: #333 !important;
            margin: 0.8em 0 !important;
          }

          .cv-experience-description li {
            margin: 0.3em 0 !important;
            line-height: 1.3 !important;
          }

          .cv-technologies {
            margin-top: 0.8em !important;
          }

          .cv-tech-tag {
            background: #f5f5f5 !important;
            color: #333 !important;
            padding: 0.2em 0.5em !important;
            border: 1px solid #ccc !important;
            border-radius: 0 !important;
            font-size: 9pt !important;
            margin: 0.2em 0.3em 0.2em 0 !important;
            display: inline-block !important;
          }

          /* Projects section */
          .cv-projects-grid {
            display: block !important;
          }

          .cv-project-item {
            page-break-inside: avoid !important;
            margin-bottom: 1.2em !important;
            padding: 0.8em !important;
            border: 1px solid #ccc !important;
            border-radius: 0 !important;
            background: #fafafa !important;
          }

          .cv-project-header {
            margin-bottom: 0.5em !important;
          }

          .cv-project-title {
            font-size: 11pt !important;
            font-weight: bold !important;
            color: #000 !important;
            margin: 0 !important;
          }

          .cv-project-status {
            font-size: 8pt !important;
            padding: 0.2em 0.4em !important;
            border-radius: 0 !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
          }

          .cv-project-status.active {
            background: #e8f5e8 !important;
            color: #2d5a2d !important;
            border: 1px solid #b8d4b8 !important;
          }

          .cv-project-status.production {
            background: #e8f0f8 !important;
            color: #2d4a5a !important;
            border: 1px solid #b8c8d4 !important;
          }

          .cv-project-status.deployed {
            background: #f0f0f0 !important;
            color: #4a4a4a !important;
            border: 1px solid #d0d0d0 !important;
          }

          .cv-project-description {
            font-size: 9pt !important;
            color: #333 !important;
            margin: 0.5em 0 !important;
            line-height: 1.3 !important;
          }

          .cv-project-tech {
            margin: 0.5em 0 !important;
          }

          .cv-project-tech-tag {
            background: #f0f0f0 !important;
            color: #555 !important;
            padding: 0.1em 0.3em !important;
            border: 1px solid #ddd !important;
            border-radius: 0 !important;
            font-size: 8pt !important;
            margin: 0.1em 0.2em 0.1em 0 !important;
            display: inline-block !important;
          }

          /* Skills section */
          .cv-skills-grid {
            display: block !important;
          }

          .cv-skill-category {
            page-break-inside: avoid !important;
            margin-bottom: 1.2em !important;
          }

          .cv-skill-category-title {
            font-size: 12pt !important;
            font-weight: bold !important;
            color: #000 !important;
            margin: 0 0 0.5em 0 !important;
            border-bottom: 1px solid #ccc !important;
            padding-bottom: 0.2em !important;
          }

          .cv-skill-tags {
            margin: 0.5em 0 !important;
          }

          .cv-skill-tag {
            background: #f5f5f5 !important;
            color: #333 !important;
            padding: 0.2em 0.5em !important;
            border: 1px solid #ccc !important;
            border-radius: 0 !important;
            font-size: 9pt !important;
            margin: 0.2em 0.3em 0.2em 0 !important;
            display: inline-block !important;
          }

          /* Contact section */
          .cv-contact-section {
            page-break-before: avoid !important;
            margin-top: 1.5em !important;
            padding: 0 !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }

          .cv-contact-title {
            font-size: 14pt !important;
            font-weight: bold !important;
            color: #000 !important;
            margin: 0 0 1em 0 !important;
            text-align: center !important;
          }

          .cv-contact-links {
            text-align: center !important;
          }

          .cv-contact-link {
            display: inline-block !important;
            margin: 0.5em 1em !important;
            padding: 0.5em 1em !important;
            border: 1px solid #333 !important;
            border-radius: 0 !important;
            text-decoration: none !important;
            color: #333 !important;
            font-size: 10pt !important;
            background: white !important;
            font-weight: normal !important;
          }

          /* Utility classes */
          .print-break-before {
            page-break-before: always !important;
          }

          .print-break-after {
            page-break-after: always !important;
          }

          .print-break-inside-avoid {
            page-break-inside: avoid !important;
          }

          /* Hide external links in print */
          .cv-contact-link[href^="http"] {
            display: none !important;
          }

          /* Ensure proper spacing */
          p,
          ul,
          ol {
            margin: 0.5em 0 !important;
          }

          ul,
          ol {
            padding-left: 1.5em !important;
          }

          li {
            margin: 0.2em 0 !important;
          }

          /* Force background colors and borders to print */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        /* Screen-specific styles */
        @media screen {
          .cv-container {
            min-height: 100vh;
            background: #f8f9fa;
          }

          .cv-section {
            transition: all 0.3s ease;
          }

          .cv-section:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .cv-tech-tag:hover,
          .cv-skill-tag:hover {
            background: #e3f2fd;
            border-color: #2196f3;
          }
        }

        /* Responsive design for different screen sizes */
        @media (max-width: 768px) {
          .cv-header {
            text-align: center;
          }

          .cv-contact-info {
            justify-content: center;
          }

          .cv-experience-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .cv-experience-meta {
            margin-top: 0.5em;
          }
        }

        @media (max-width: 480px) {
          .cv-name {
            font-size: 1.8rem;
          }

          .cv-title {
            font-size: 1.1rem;
          }

          .cv-section-title {
            font-size: 1.3rem;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 cv-container">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 px-4 py-3 no-print">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 cv-header">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Image
                  src="/cv.JPG"
                  alt="Atakan Savas"
                  width={120}
                  height={120}
                  className="rounded-lg object-cover cv-photo"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 cv-name">
                  {personalInfo.name}
                </h1>
                <p className="text-xl text-gray-600 mb-4 cv-title">
                  {personalInfo.title}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 cv-contact-info">
                  <div className="flex items-center gap-2 cv-contact-item">
                    <Mail className="w-4 h-4" />
                    {personalInfo.email}
                  </div>
                  <div className="flex items-center gap-2 cv-contact-item">
                    <Phone className="w-4 h-4" />
                    {personalInfo.phone}
                  </div>
                  <div className="flex items-center gap-2 cv-contact-item">
                    <MapPin className="w-4 h-4" />
                    {personalInfo.location}
                  </div>
                  <div className="flex items-center gap-2 cv-contact-item">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 cv-section">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2 cv-section-title">
              <Briefcase className="w-5 h-5" />
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{summary}</p>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 cv-section">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2 cv-section-title">
              <Briefcase className="w-5 h-5" />
              Professional Experience
            </h2>

            <div className="space-y-8">
              {experience.map((exp, index) => (
                <div key={index} className="cv-experience-item">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 cv-experience-header">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 cv-experience-title">
                        {exp.title}
                      </h3>
                      <p className="text-blue-600 font-medium cv-experience-company">
                        {exp.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 md:mt-0 cv-experience-meta">
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

                  <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4 cv-experience-description">
                    {exp.description.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 cv-technologies">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200 cv-tech-tag"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 cv-section">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2 cv-section-title">
              <Code className="w-5 h-5" />
              Key Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 cv-projects-grid">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 cv-project-item"
                >
                  <div className="flex justify-between items-start mb-3 cv-project-header">
                    <h3 className="text-lg font-semibold text-gray-900 cv-project-title">
                      {project.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium cv-project-status ${
                        project.status === "Active"
                          ? "bg-green-100 text-green-700 active"
                          : project.status === "Production"
                          ? "bg-blue-100 text-blue-700 production"
                          : "bg-gray-100 text-gray-700 deployed"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3 text-sm cv-project-description">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3 cv-project-tech">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs border border-gray-200 cv-project-tech-tag"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 cv-section">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2 cv-section-title">
              <GraduationCap className="w-5 h-5" />
              Technical Skills
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 cv-skills-grid">
              {Object.entries(skills).map(([category, skillList]) => (
                <div key={category} className="cv-skill-category">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 cv-skill-category-title">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2 cv-skill-tags">
                    {skillList.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200 cv-skill-tag"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cv-contact-section">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 cv-contact-title">
              Contact Information
            </h2>
            <div className="flex flex-wrap gap-4 cv-contact-links">
              <a
                href={`mailto:${personalInfo.email}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cv-contact-link"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors cv-contact-link"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cv-contact-link"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
