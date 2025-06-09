"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Info,
  Search,
} from "lucide-react";
import { useState } from "react";

interface LogEntry {
  id: string;
  date: string;
  time: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  description: string;
  user?: string;
}

export default function LogList() {
  const [filter, setFilter] = useState<
    "all" | "success" | "warning" | "info" | "error"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock log data
  const logs: LogEntry[] = [
    {
      id: "1",
      date: "05.06.2025",
      time: "14:32",
      type: "success",
      title: "AI Raporu Oluşturuldu",
      description:
        "Aylık performans raporu başarıyla oluşturuldu ve e-posta ile gönderildi.",
      user: "Atakan",
    },
    {
      id: "2",
      date: "05.06.2025",
      time: "12:15",
      type: "info",
      title: "Kullanıcı Girişi",
      description: "Dashboard'a başarılı giriş yapıldı.",
      user: "Atakan",
    },
    {
      id: "3",
      date: "04.06.2025",
      time: "16:45",
      type: "success",
      title: "Otomasyon Tamamlandı",
      description:
        "Müşteri e-posta kampanyası otomatik olarak gönderildi (152 alıcı).",
    },
    {
      id: "4",
      date: "04.06.2025",
      time: "09:30",
      type: "warning",
      title: "API Yanıt Süresi Yavaş",
      description:
        "OpenAI API yanıt süresi ortalamanın üzerinde (2.3s). İzleme devam ediyor.",
    },
    {
      id: "5",
      date: "03.06.2025",
      time: "11:20",
      type: "success",
      title: "Web Scraping Tamamlandı",
      description:
        "Rakip analizi için 47 web sitesinden veri toplama işlemi tamamlandı.",
    },
    {
      id: "6",
      date: "03.06.2025",
      time: "08:15",
      type: "info",
      title: "Sistem Güncellendi",
      description: "AI modeli v2.1.3 güncellemesi başarıyla uygulandı.",
    },
    {
      id: "7",
      date: "02.06.2025",
      time: "15:50",
      type: "error",
      title: "Entegrasyon Hatası",
      description:
        "Logo ERP bağlantısında geçici sorun yaşandı. Otomatik yeniden bağlantı sağlandı.",
    },
    {
      id: "8",
      date: "02.06.2025",
      time: "13:25",
      type: "success",
      title: "n8n Workflow Çalıştı",
      description: "Otomatik müşteri takip workflow'u başarıyla çalıştırıldı.",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "all" || log.type === filter;
    const matchesSearch =
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center"
          >
            <FileText className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Son Aktiviteler
            </h3>
            <p className="text-sm text-gray-500">Sistem ve kullanıcı logları</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center space-x-2 text-green-600"
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Canlı</span>
          </motion.div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Aktivite ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) =>
              setFilter(
                e.target.value as
                  | "all"
                  | "success"
                  | "warning"
                  | "info"
                  | "error"
              )
            }
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="all">Tümü</option>
            <option value="success">Başarılı</option>
            <option value="warning">Uyarı</option>
            <option value="error">Hata</option>
            <option value="info">Bilgi</option>
          </select>
        </div>
      </div>

      {/* Log List */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {filteredLogs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.01, y: -2 }}
            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${getTypeColor(
              log.type
            )}`}
          >
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">{getTypeIcon(log.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {log.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{log.date}</span>
                    <span>•</span>
                    <span>{log.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  {log.description}
                </p>
                {log.user && (
                  <div className="inline-flex items-center px-2 py-1 bg-white/60 rounded-lg">
                    <span className="text-xs text-gray-600 font-medium">
                      {log.user}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600"
      >
        <span>Toplam {filteredLogs.length} aktivite</span>
        <span>Son güncelleme: az önce</span>
      </motion.div>
    </motion.div>
  );
}
