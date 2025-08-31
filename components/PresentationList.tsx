"use client";

import { motion } from "framer-motion";
import { Calendar, Download, Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface Presentation {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}

export default function PresentationList() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch presentations from the API
    fetch("/api/presentations")
      .then((res) => res.json())
      .then((data) => {
        // Modify the data to set all dates to 2 days ago
        const modifiedData = data.map((presentation: Presentation) => ({
          ...presentation,
          lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        }));
        setPresentations(modifiedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching presentations:", error);
        setLoading(false);
      });
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-gray-100 mx-4"
    >
      {/* Header */}
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center"
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </motion.div>
        <div>
          <h3
            className="text-base sm:text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Presentations
          </h3>
          <p className="text-xs sm:text-sm text-gray-500">
            You can access all presentation files here
          </p>
        </div>
      </div>

      {/* Presentations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {presentations.map((presentation, index) => (
          <motion.div
            key={presentation.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-lg transition-all"
          >
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {presentation.name}
                </h4>
                <div className="mt-1 sm:mt-2 space-y-1">
                  <p className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(presentation.lastModified)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(presentation.size)}
                  </p>
                </div>
                <div className="mt-2 sm:mt-3 flex space-x-1 sm:space-x-2">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={presentation.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md sm:rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">View</span>
                    <span className="sm:hidden">View</span>
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={presentation.path}
                    download
                    className="flex-1 inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md sm:rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">DL</span>
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {presentations.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No presentation files found yet.</p>
        </div>
      )}
    </motion.div>
  );
}
