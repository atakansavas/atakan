export type PresentationMeta = {
  /** Filename (must match the file in /public/presentation) */
  file: string;
  title: string;
  subtitle: string;
  description: string;
  audience: string;
  language: "TR" | "EN" | "TR+EN";
  date: string;
  topics: string[];
};

export const PRESENTATIONS: PresentationMeta[] = [
  {
    file: "Satış - Destek Senaryosu .pdf",
    title: "Satış & Destek Senaryosu",
    subtitle: "AI ile satış ve destek hattının dönüşümü",
    description:
      "Bir işletmenin satış ve müşteri destek süreçlerinin sesli AI ajanları ile nasıl otomatize edilebileceğini anlatan uçtan uca senaryo. Müşteri yolculuğu, eskalasyon akışı, insan-makine devir teslim noktaları ve ölçülebilir KPI'lar.",
    audience: "İşletme sahipleri, satış ve müşteri operasyonları liderleri",
    language: "TR",
    date: "2025",
    topics: ["Voice AI", "ElevenLabs", "Satış otomasyonu", "Süreç tasarımı"],
  },
  {
    file: "Örnek Maliyet.pdf",
    title: "Örnek Maliyet Modeli",
    subtitle: "AI altyapısının gerçek maliyet kalemleri",
    description:
      "Sesli ajan, LLM çağrıları, hosting ve operasyon kalemleri için somut bir bütçe örneği. Pilot, üretim ve ölçek aşamalarındaki maliyet farkları; soft cap / hard cap disiplini; aylık çalışan eşdeğeri karşılaştırması.",
    audience: "Karar vericiler, finans ekipleri",
    language: "TR",
    date: "2025",
    topics: ["Bütçe", "ROI", "Token ekonomisi", "Operasyon"],
  },
];
