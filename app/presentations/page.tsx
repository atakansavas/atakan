"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Calendar,
  Download,
  Eye,
  FileText,
  Languages,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PRESENTATIONS, type PresentationMeta } from "./_data";

type FileInfo = {
  name: string;
  path: string;
  size: number;
};

type Card = PresentationMeta & { path: string; size: number };

const formatSize = (bytes: number) => {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

export default function PresentationsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/presentations")
      .then((r) => r.json())
      .then((files: FileInfo[]) => {
        const merged: Card[] = PRESENTATIONS.map((meta) => {
          const f = files.find((x) => x.name === meta.file);
          return {
            ...meta,
            path: f?.path ?? `/presentation/${encodeURIComponent(meta.file)}`,
            size: f?.size ?? 0,
          };
        });
        setCards(merged);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 px-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium mb-4">
          <FileText className="w-3.5 h-3.5" />
          {cards.length} presentation{cards.length === 1 ? "" : "s"}
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-3">
          Sunumlar
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Yapay zeka ile satış, destek ve operasyon dönüşümleri üzerine
          işletmelere hazırladığım sunumlar. Tamamı PDF formatında, indirilebilir
          ve sahaya gitmeden önce ekibinizle paylaşılabilir.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto px-4">
          {cards.map((p, i) => (
            <motion.article
              key={p.file}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-end gap-1 text-[11px] text-gray-500 font-mono">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {p.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Languages className="w-3 h-3" /> {p.language}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">
                {p.title}
              </h2>
              <p className="text-sm text-blue-600 mb-3">{p.subtitle}</p>

              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {p.description}
              </p>

              <div className="flex items-start gap-2 text-xs text-gray-500 mb-4">
                <Users className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{p.audience}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {p.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[11px] border border-gray-200"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 font-mono">
                  {formatSize(p.size)}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={p.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Görüntüle
                  </a>
                  <a
                    href={p.path}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> İndir
                  </a>
                </div>
              </div>

              <ArrowUpRight className="absolute top-6 right-6 w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.article>
          ))}
        </div>
      )}

      {!loading && cards.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Henüz sunum yüklenmemiş.</p>
        </div>
      )}

      <div className="mt-12 max-w-2xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-500">
          Sunum içerikleri canlı olarak güncellenir. Sizin sektörünüze özel bir
          sunum ister misiniz?{" "}
          <a
            href="mailto:info@benatakan.com"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            info@benatakan.com
          </a>
        </p>
      </div>
    </>
  );
}
