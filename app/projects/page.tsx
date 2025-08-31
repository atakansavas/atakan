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
      subtitle: "Spotify-Connected AI Music Application",
      description:
        "Spotify-integrated, AI-powered mobile music application. Features include AI playlist creation, song story extraction, music games, and artist fortune telling.",
      image: "/logo.png", // Geçici olarak logo kullanıyoruz
      category: "AI & Music",
      status: "In Development",
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
        "Spotify Account Integration",
        "AI-Powered Playlist Creation",
        "Song Stories and Analysis",
        "Music-Themed Games",
        "Artist Fortune and Predictions",
        "Personalized Music Recommendations",
        "Social Sharing Features",
        "Offline Listening Support",
      ],
      architecture: {
        frontend: "Cross-platform mobile application with React Native & Expo",
        backend: "Automated workflows and API integration with n8n",
        ai: "Music analysis and content generation with OpenAI GPT-4 and Claude",
        music: "Music data and user profiles via Spotify Web API",
        database: "User data and AI analysis results with MongoDB",
        automation: "Automation between Spotify and AI services with n8n",
        deployment: "Mobile deployment with Expo to App Store/Play Store",
      },
      prompts: [
        {
          title: "Playlist Creation",
          description: "AI-powered playlist creation based on user's mood",
          prompt:
            "Create a {emotion}-themed playlist based on the user's listening history and current mood. Select {style} music style, {duration} minutes long, {energy_level} energy songs. Add a brief description for each song.",
        },
        {
          title: "Song Story Analysis",
          description: "Extract stories and meaning by analyzing song lyrics",
          prompt:
            "Analyze these song lyrics: {song_lyrics}. Extract the song's story, emotional themes, artist's message, and hidden meanings. Explain in a user-friendly language.",
        },
        {
          title: "Music Game",
          description: "Create fun games based on song information",
          prompt:
            "Create a fun game with this song information: {song_info}. Prepare questions at different difficulty levels such as guessing song names, finding artists, and predicting years.",
        },
        {
          title: "Artist Fortune",
          description:
            "Personality analysis and predictions based on music preferences",
          prompt:
            "Analyze the user's music preferences: {music_history}. Based on this data, extract personality traits and make predictions for future music discoveries. Present in a fun and creative language.",
        },
      ],
      demo: "https://melodai-demo.vercel.app",
      github: "https://github.com/benatakan/melodai",
      challenges: [
        "Spotify API rate limits and user authorization",
        "AI model integration and real-time response times",
        "Cross-platform mobile application performance",
        "Music data analysis and meaningful content generation",
        "User privacy and data security",
        "Offline functionality and synchronization",
      ],
      solutions: [
        "Smart API management and rate limiting with n8n",
        "Fast AI responses with streaming API and caching",
        "Expo optimizations and native performance",
        "NLP and music analysis algorithms",
        "End-to-end encryption and GDPR compliance",
        "Local storage and background sync",
      ],
    },
    {
      id: "ai-assistant",
      title: "AI Assistant Platform",
      subtitle: "Voice and Text AI Assistants",
      description: "Customized AI assistant solutions for businesses",
      image: "/logo.png",
      category: "AI & Automation",
      status: "Active",
      technologies: ["Next.js", "OpenAI", "ElevenLabs", "n8n", "MongoDB"],
      features: [
        "24/7 Voice Support",
        "Smart Chat Bots",
        "Multi-language Support",
        "Personalized Responses",
      ],
      architecture: {
        frontend: "Modern web interface with Next.js",
        backend: "Serverless backend with API Routes",
        ai: "Natural language processing with OpenAI GPT-4",
        voice: "Voice synthesis with ElevenLabs",
        automation: "Workflow automation with n8n",
        database: "Data management with MongoDB",
      },
      prompts: [
        {
          title: "Customer Service",
          description: "Responding to customer inquiries",
          prompt:
            "You are a customer service representative for {company}. Listen to the customer's problem and help them professionally.",
        },
      ],
      demo: "https://ai-assistant-demo.vercel.app",
      github: "https://github.com/benatakan/ai-assistant",
      challenges: [
        "Voice quality and natural speech",
        "Real-time response times",
        "Multi-language support",
        "Security and data protection",
      ],
      solutions: [
        "High-quality voice synthesis with ElevenLabs",
        "Fast responses with streaming API",
        "Multi-language support with i18n",
        "End-to-end encryption and GDPR compliance",
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
                Home
              </Link>
              <Link
                href="/presentations"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Presentations
              </Link>
              <Link
                href="/booking"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Book Appointment
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
              My Projects
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Projects developed with artificial intelligence and modern
              technologies. Each project is designed to solve real-world
              problems.
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
                    Technologies Used
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
                    Features
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
                      Watch Demo
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
                      Project Architecture
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
                AI Prompts
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
                  Challenges Faced
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
                  Solutions
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
              <p className="text-gray-600">Get AI Support for Your Business</p>
            </div>

            <div className="pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                © 2025 BenAtakan.com - All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
