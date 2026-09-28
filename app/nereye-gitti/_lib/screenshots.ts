// App Store frames on the landing page, in App Store order (01–06).
//
// The frames come ready-made from the app repo (gidertakip
// docs/magaza/web/) and are published byte for byte by
// scripts/nereye-gitti-screenshots.mjs, which lists them in
// screenshots.generated.ts. Each frame already carries its headline, so it
// is never written over the image; titles and subtitles match the App Store
// frame texts, alt texts describe what each frame shows.

import { SCREENSHOT_FILES, type ScreenshotFiles } from "./screenshots.generated";

export type Screenshot = {
  title: string;
  subtitle: string;
  alt: string;
  files: ScreenshotFiles;
};

const CAPTIONS: readonly Omit<Screenshot, "files">[] = [
  {
    title: "Bas, çevir, bırak.",
    subtitle: "Gelir ya da gider, saniyeler içinde kayıtlı",
    alt: "Nereye Gitti Çark ekranı: çark basılı tutuluyor, Market dilimi seçili; sol yarıda gider, sağ yarıda gelir kategorileri",
  },
  {
    title: "Maaşa kadar ne kalır?",
    subtitle: "Pusula sonraki gelire kadar kalanı gösterir",
    alt: "Pusula bandı: sonraki gelire kadar 13.915 lira kalıyor; sonraki gelir 1 Ekim'de 72.500 liralık maaş",
  },
  {
    title: "Günü gelince sorar.",
    subtitle: "Ödedim ya da Yarın sor, tek dokunuşla",
    alt: "Ana ekranda vade bildirimi: Telefon, bugün, 3.125 lira, ödedin mi? sorusu ve Ödedim, Yarın sor seçenekleri",
  },
  {
    title: "Sıradaki ödeme hep önünde.",
    subtitle: "Ana ekranda Yaklaşan widget'ı ve kısayollar",
    alt: "Ana ekranda orta boy Yaklaşan widget'ı: bugün ödenecek Telefon, 3 gün sonra gelecek Maaş ve Çark, Gider, Gelir kısayolları",
  },
  {
    title: "Ayın tamamı tek ekranda.",
    subtitle: "Kayıtlar, planlar ve en dar gün",
    alt: "Eylül 2026 takvimi: işaretli günler, 30 Eylül'deki en dar gün kartı ve o günün planlı Aidat ödemesi",
  },
  {
    title: "Paran nereye gitti?",
    subtitle: "Kategori raporu ve aylık bütçe tavanı",
    alt: "Rapor ekranı: bu ayın gider kategorileri yüzdeleriyle, gelir kaynakları ve Kafe, Market, Yemek için aylık bütçe tavanları",
  },
];

if (SCREENSHOT_FILES.length !== CAPTIONS.length) {
  throw new Error("screenshots.generated.ts must list exactly six frames");
}

export const SCREENSHOTS: readonly Screenshot[] = CAPTIONS.map((c, i) => ({ ...c, files: SCREENSHOT_FILES[i] }));
