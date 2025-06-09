"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Info,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function LogList() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock activity data
  const activities = [
    {
      id: 1,
      type: "success",
      time: "2 dakika önce",
      title: "AI Rapor Oluşturuldu",
      description:
        "Aylık performans raporu başarıyla oluşturuldu ve kullanıcıya gönderildi.",
      user: "Sistem",
    },
    {
      id: 2,
      type: "info",
      time: "5 dakika önce",
      title: "Otomatik Yedekleme",
      description: "Veritabanı yedekleme işlemi başarıyla tamamlandı.",
      user: "Sistem",
    },
    {
      id: 3,
      type: "warning",
      time: "12 dakika önce",
      title: "Yüksek CPU Kullanımı",
      description:
        "Sunucu CPU kullanımı %85'e ulaştı. Sistem performansı izleniyor.",
      user: "Monitoring",
    },
    {
      id: 4,
      type: "success",
      time: "18 dakika önce",
      title: "API Entegrasyonu",
      description: "CRM API bağlantısı başarıyla kuruldu ve test edildi.",
      user: "DevOps",
    },
    {
      id: 5,
      type: "error",
      time: "25 dakika önce",
      title: "Entegrasyon Hatası",
      description:
        "Logo ERP bağlantısında geçici sorun yaşandı. Otomatik yeniden bağlantı sağlandı.",
      user: "Sistem",
    },
    {
      id: 6,
      type: "info",
      time: "32 dakika önce",
      title: "Kullanıcı Girişi",
      description: "Yeni kullanıcı sisteme giriş yaptı.",
      user: "Auth System",
    },
    {
      id: 7,
      type: "success",
      time: "45 dakika önce",
      title: "Veri Senkronizasyonu",
      description: "Tüm modüller arası veri senkronizasyonu tamamlandı.",
      user: "Sistem",
    },
    {
      id: 8,
      type: "warning",
      time: "1 saat önce",
      title: "Disk Alanı Uyarısı",
      description: "Sunucu disk kullanımı %78'e ulaştı. Temizlik önerilir.",
      user: "Monitoring",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
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

  const filteredActivities = activities.filter((activity) => {
    const matchesFilter = filter === "all" || activity.type === filter;
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterCounts = {
    all: activities.length,
    success: activities.filter((a) => a.type === "success").length,
    warning: activities.filter((a) => a.type === "warning").length,
    error: activities.filter((a) => a.type === "error").length,
    info: activities.filter((a) => a.type === "info").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-gray-100"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center"
          >
            <Activity className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Sistem Aktiviteleri
            </h3>
            <p className="text-sm text-gray-500">
              Son aktiviteler ve sistem logları
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-green-500 rounded-full"
          />
          <span className="text-sm text-green-600 font-medium">
            Canlı İzleme
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Aktivitelerde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {[
            { key: "all", label: "Tümü", color: "bg-gray-100 text-gray-700" },
            {
              key: "success",
              label: "Başarılı",
              color: "bg-green-100 text-green-700",
            },
            {
              key: "warning",
              label: "Uyarı",
              color: "bg-yellow-100 text-yellow-700",
            },
            { key: "error", label: "Hata", color: "bg-red-100 text-red-700" },
            { key: "info", label: "Bilgi", color: "bg-blue-100 text-blue-700" },
          ].map((filterOption) => (
            <motion.button
              key={filterOption.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(filterOption.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === filterOption.key
                  ? filterOption.color + " ring-2 ring-offset-1 ring-current"
                  : "bg-gray-50 text-gray-600 hover:" + filterOption.color
              }`}
            >
              {filterOption.label} (
              {filterCounts[filterOption.key as keyof typeof filterCounts]})
            </motion.button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Arama kriterlerine uygun aktivite bulunamadı.
            </p>
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className={`p-4 rounded-2xl border transition-all duration-300 ${getBgColor(
                activity.type
              )} hover:shadow-md`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{getIcon(activity.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{activity.time}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {activity.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Kaynak: {activity.user}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Detaylar →
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Toplam {filteredActivities.length} aktivite gösteriliyor</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Tüm logları görüntüle
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
