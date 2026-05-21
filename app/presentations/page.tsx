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
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14 max-w-3xl mx-auto"
      >
        <div className="font-mono-display inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-400/20 text-[10px] uppercase tracking-[0.32em] mb-6">
          <FileText className="w-3 h-3" />
          {cards.length} presentation{cards.length === 1 ? "" : "s"}
        </div>
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.04em] leading-[0.95] bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent mb-6">
          Sunumlar
        </h1>
        <p className="font-display text-base sm:text-lg md:text-xl text-gray-300/90 leading-relaxed font-light">
          Yapay zeka ile satış, destek ve operasyon dönüşümleri üzerine
          işletmelere hazırladığım sunumlar. Tamamı PDF formatında,
          indirilebilir ve sahaya gitmeden önce ekibinizle paylaşılabilir.
        </p>
        <p className="font-mono-display mt-5 text-[11px] uppercase tracking-[0.32em] text-blue-300/70">
          slide · share · iterate
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {cards.map((p, i) => (
            <motion.article
              key={p.file}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group relative bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-end gap-1 font-mono-display text-[10px] uppercase tracking-[0.18em] text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> {p.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Languages className="w-3 h-3" /> {p.language}
                  </span>
                </div>
              </div>

              <h2 className="font-display text-xl font-semibold text-white mb-1 leading-tight tracking-tight">
                {p.title}
              </h2>
              <p className="font-mono-display text-[10px] uppercase tracking-[0.24em] text-blue-300/90 mb-4">
                {p.subtitle}
              </p>

              <p className="text-sm text-gray-300/90 leading-relaxed mb-4">
                {p.description}
              </p>

              <div className="flex items-start gap-2 text-xs text-gray-400 mb-4">
                <Users className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{p.audience}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {p.topics.map((t) => (
                  <span
                    key={t}
                    className="font-mono-display px-2 py-0.5 bg-white/5 text-gray-300 rounded-full text-[10px] uppercase tracking-[0.12em] border border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="font-mono-display text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  {formatSize(p.size)}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={p.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-200 bg-blue-500/15 border border-blue-400/20 rounded-lg hover:bg-blue-500/25 hover:border-blue-400/40 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Görüntüle
                  </a>
                  <a
                    href={p.path}
                    download
                    className="font-display inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> İndir
                  </a>
                </div>
              </div>

              <ArrowUpRight className="absolute top-6 right-6 w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.article>
          ))}
        </div>
      )}

      {!loading && cards.length === 0 && (
        <div className="text-center py-16 max-w-md mx-auto">
          <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="font-display text-gray-400">
            Henüz sunum yüklenmemiş.
          </p>
        </div>
      )}

      <div className="mt-16 max-w-2xl mx-auto text-center">
        <p className="text-sm text-gray-400">
          Sunum içerikleri canlı olarak güncellenir. Sizin sektörünüze özel bir
          sunum ister misiniz?{" "}
          <a
            href="mailto:info@benatakan.com"
            className="text-blue-300 hover:text-blue-200 font-medium underline decoration-blue-400/30 underline-offset-4"
          >
            info@benatakan.com
          </a>
        </p>
      </div>
    </div>
  );
}
