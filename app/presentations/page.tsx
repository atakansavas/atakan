"use client";

import PresentationList from "@/components/PresentationList";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function PresentationsPage() {
  return (
    <>
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8 px-4"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
        >
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </motion.div>
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Presentations
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          Access my presentations on artificial intelligence and digital
          transformation topics. All presentations are available in PDF format
          and can be downloaded for free.
        </p>
      </motion.div>

      {/* Presentations List */}
      <PresentationList />
    </>
  );
}
