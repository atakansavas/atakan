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
        className="text-center mb-8"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <FileText className="w-8 h-8 text-white" />
        </motion.div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Sunumlar
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Yapay zeka ve dijital dönüşüm konularında hazırladığım sunumlara
          buradan erişebilirsiniz. Tüm sunumlar PDF formatında ve ücretsiz
          olarak indirilebilir.
        </p>
      </motion.div>

      {/* Presentations List */}
      <PresentationList />
    </>
  );
}
