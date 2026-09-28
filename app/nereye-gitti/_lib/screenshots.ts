// App Store screenshots for the landing page, in App Store order.
//
// The frames come ready-made from the app repo (gidertakip
// docs/magaza/web/, sources in .../ekran-goruntuleri/final/): each already
// carries its headline, so the page shows them as they are and puts the
// headline in `alt` and the figcaption. scripts/nereye-gitti-screenshots.mjs
// copies them (660/1320 px WebP + 660 px JPEG fallback) and lists them in
// screenshots.generated.ts. Until that list is filled, grey placeholders
// stand in.

import { SCREENSHOT_IMAGES } from "./screenshots.generated";

export type Screenshot = {
  title: string;
  subtitle: string;
  /** What the frame shows, after its headline. */
  alt: string;
  image: string | null;
};

const CAPTIONS: readonly Omit<Screenshot, "image">[] = [
  {
    title: "Bas, çevir, bırak.",
    subtitle: "Gelir ya da gider, saniyeler içinde kayıtlı",
    alt: "Nereye Gitti Çark ekranı: çark basılı tutuluyor, Market dilimi seçili",
  },
  {
    title: "Maaşa kadar ne kalır?",
    subtitle: "Pusula sonraki gelire kadar kalanı gösterir",
    alt: "Pusula bandı: sonraki gelire kadar 13.915 lira kalıyor, sonraki gelir 1 Ekim'de maaş",
  },
  {
    title: "Günü gelince sorar.",
    subtitle: "Ödedim ya da Yarın sor, tek dokunuşla",
    alt: 'Vade bildirimi "Telefon · bugün, ödedin mi?" ve Ödedim, Yarın sor seçenekleri',
  },
  {
    title: "Sıradaki ödeme hep önünde.",
    subtitle: "Ana ekranda Yaklaşan widget'ı ve kısayollar",
    alt: "Ana ekranda Yaklaşan widget'ı: bugünkü ödeme, 3 gün sonraki maaş ve Çark, Gider, Gelir kısayolları",
  },
  {
    title: "Ayın tamamı tek ekranda.",
    subtitle: "Kayıtlar, planlar ve en dar gün",
    alt: "Takvim ekranı: işaretli günler, en dar gün kartı ve seçili günün planı",
  },
  {
    title: "Paran nereye gitti?",
    subtitle: "Kategori raporu ve aylık bütçe tavanı",
    alt: "Rapor ekranı: bu ayın kategori çubukları ve aylık bütçe tavanları",
  },
];

export const SCREENSHOTS: readonly Screenshot[] = CAPTIONS.map((c, i) => ({
  ...c,
  image: SCREENSHOT_IMAGES[i] ?? null,
}));
