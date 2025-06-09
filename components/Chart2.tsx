"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Chart2() {
  const [animateChart, setAnimateChart] = useState(false);

  // Mock data for user satisfaction
  const chartData = [
    { week: "Hf 1", satisfaction: 4.2, users: 120 },
    { week: "Hf 2", satisfaction: 4.5, users: 145 },
    { week: "Hf 3", satisfaction: 4.3, users: 138 },
    { week: "Hf 4", satisfaction: 4.7, users: 162 },
    { week: "Hf 5", satisfaction: 4.8, users: 178 },
    { week: "Hf 6", satisfaction: 4.9, users: 195 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setAnimateChart(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const maxSatisfaction = 5;

  // Generate SVG path for satisfaction line
  const generatePath = () => {
    const width = 400;
    const height = 180;
    const padding = 40;

    return chartData
      .map((point, index) => {
        const x =
          padding + (index * (width - 2 * padding)) / (chartData.length - 1);
        const y =
          height -
          padding -
          (point.satisfaction / maxSatisfaction) * (height - 2 * padding);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-gray-100 h-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center"
          >
            <Heart className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Kullanıcı Memnuniyeti
            </h3>
            <p className="text-sm text-gray-500">Son 6 haftalık trend</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-pink-600">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">4.9/5</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-56">
        {/* SVG Line Chart */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180">
          {/* Grid Lines */}
          <defs>
            <linearGradient
              id="satisfactionGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[1, 2, 3, 4, 5].map((value) => (
            <line
              key={value}
              x1="40"
              y1={180 - 40 - (value / maxSatisfaction) * (180 - 80)}
              x2="360"
              y2={180 - 40 - (value / maxSatisfaction) * (180 - 80)}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          {/* Main line */}
          <motion.path
            d={generatePath()}
            fill="none"
            stroke="url(#satisfactionGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={animateChart ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Data points */}
          {chartData.map((point, index) => {
            const x = 40 + (index * (400 - 80)) / (chartData.length - 1);
            const y =
              180 - 40 - (point.satisfaction / maxSatisfaction) * (180 - 80);

            return (
              <motion.g key={index}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r="0"
                  fill="url(#satisfactionGradient)"
                  initial={{ r: 0 }}
                  animate={animateChart ? { r: 6 } : { r: 0 }}
                  transition={{ delay: index * 0.2 + 1, duration: 0.3 }}
                />
                <motion.circle
                  cx={x}
                  cy={y}
                  r="0"
                  fill="white"
                  initial={{ r: 0 }}
                  animate={animateChart ? { r: 3 } : { r: 0 }}
                  transition={{ delay: index * 0.2 + 1.1, duration: 0.3 }}
                />
              </motion.g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
          {chartData.map((point, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 1.5 }}
              className="text-xs text-gray-600 font-medium"
            >
              {point.week}
            </motion.span>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-10">
          {[5, 4, 3, 2, 1].map((value) => (
            <motion.span
              key={value}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: value * 0.1 + 1 }}
              className="text-xs text-gray-600 font-medium"
            >
              {value}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex items-center justify-between mt-4 space-x-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2 }}
          className="flex-1 bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-3"
        >
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-pink-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {chartData[chartData.length - 1].users}
              </p>
              <p className="text-xs text-gray-600">Aktif Kullanıcı</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2 }}
          className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-3"
        >
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">+16%</p>
              <p className="text-xs text-gray-600">Memnuniyet Artışı</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
