"use client";

import { motion } from "framer-motion";
import { Activity, Brain, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function Chart1() {
  const [animateChart, setAnimateChart] = useState(false);

  // Mock data for AI performance
  const chartData = [
    { month: "Ocak", performance: 75, efficiency: 60 },
    { month: "Şubat", performance: 82, efficiency: 68 },
    { month: "Mart", performance: 78, efficiency: 75 },
    { month: "Nisan", performance: 85, efficiency: 80 },
    { month: "Mayıs", performance: 92, efficiency: 88 },
    { month: "Haziran", performance: 95, efficiency: 93 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setAnimateChart(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.performance, d.efficiency))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-gray-100 h-96"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center"
          >
            <Brain className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              AI Performans Analizi
            </h3>
            <p className="text-sm text-gray-500">Son 6 aylık trend</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+18%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between space-x-2 px-4">
          {chartData.map((data, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 flex-1"
            >
              {/* Bars */}
              <div className="relative flex space-x-1 items-end h-48 w-full justify-center">
                {/* Performance Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={
                    animateChart
                      ? { height: `${(data.performance / maxValue) * 100}%` }
                      : { height: 0 }
                  }
                  transition={{
                    delay: index * 0.1,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="w-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group"
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Performans: {data.performance}%
                  </div>
                </motion.div>

                {/* Efficiency Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={
                    animateChart
                      ? { height: `${(data.efficiency / maxValue) * 100}%` }
                      : { height: 0 }
                  }
                  transition={{
                    delay: index * 0.1 + 0.2,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="w-4 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg relative group"
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Verimlilik: {data.efficiency}%
                  </div>
                </motion.div>
              </div>

              {/* Month Label */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="text-xs text-gray-600 font-medium"
              >
                {data.month}
              </motion.span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
          <span className="text-sm text-gray-600">AI Performansı</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
          <span className="text-sm text-gray-600">Sistem Verimliliği</span>
        </div>
      </div>

      {/* Live indicator */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-6 right-6 flex items-center space-x-2"
      >
        <Activity className="w-4 h-4 text-green-500" />
        <span className="text-xs text-green-600 font-medium">Canlı</span>
      </motion.div>
    </motion.div>
  );
}
