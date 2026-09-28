// App Store screenshots for the landing page, in story order.
//
// Images come from scripts/nereye-gitti-screenshots.mjs (AVIF + WebP at
// 360/720/1080 px, listed in screenshots.generated.ts). Until the frames
// exist in gidertakip docs/magaza/ekran-goruntuleri/{final,ham}/, `image` is
// null and the page shows grey 1320:2868 placeholders. When they arrive,
// run the script and check each `alt` against what the image really shows.

import { SCREENSHOT_IMAGES } from "./screenshots.generated";

export type Screenshot = {
  title: string;
  subtitle: string;
  alt: string;
  image: { base: string; widths: readonly number[] } | null;
};

const CAPTIONS: readonly Omit<Screenshot, "image">[] = [
  {
    title: "Bas, çevir, bırak.",
    subtitle: "Gelir ya da gider, saniyeler içinde kayıtlı",
    alt: "Nereye Gitti Çark ekranı: bir gider dilimi seçili, altında bugünün kayıtları",
  },
  {
    title: "Maaşa kadar ne kalır?",
    subtitle: "Pusula en dar günü önceden gösterir",
    alt: "Pusula bandı: sonraki gelire kadar kalan tutar ve en dar gün",
  },
  {
    title: "Günü gelince sorar.",
    subtitle: "Ödedim ya da Yarın sor, tek dokunuşla",
    alt: "Kilit ekranında vade bildirimi: Ödedim ve Yarın sor düğmeleri",
  },
  {
    title: "Kilit ekranından kaydet.",
    subtitle: "Widget'lar ve iOS 18 kontrolleri",
    alt: "Kilit ekranında Nereye Gitti widget'ları ve ana ekranda Yaklaşan widget'ı",
  },
  {
    title: "Ayın tamamı tek ekranda.",
    subtitle: "Kayıtlar, planlar ve en dar gün",
    alt: "Takvim ekranı: işaretli günler ve seçili günün listesi",
  },
  {
    title: "Paran nereye gitti?",
    subtitle: "Kategori raporu ve aylık bütçe tavanı",
    alt: "Rapor ekranı: bu ayın kategori çubukları ve bir bütçe tavanı",
  },
];

export const SCREENSHOTS: readonly Screenshot[] = CAPTIONS.map((c, i) => ({
  ...c,
  image: SCREENSHOT_IMAGES[i] ?? null,
}));
