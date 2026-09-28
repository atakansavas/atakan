// App Store screenshots for the landing page, in story order.
//
// Screenshots are not ready yet (gidertakip docs/magaza/ekran-goruntuleri/
// final/ and ham/ are empty), so every `image` is null and the page shows
// grey 1320:2868 placeholders. When they arrive, export AVIF + WebP at
// 360/720/1080 px wide as `${base}-${width}.${ext}` under
// public/nereye-gitti/ekranlar/ and fill in `image`; check `alt` against
// what each image really shows.

export type Screenshot = {
  title: string;
  subtitle: string;
  alt: string;
  image: { base: string; widths: readonly number[] } | null;
};

export const SCREENSHOTS: readonly Screenshot[] = [
  {
    title: "Bas, çevir, bırak.",
    subtitle: "Gelir ya da gider, saniyeler içinde kayıtlı",
    alt: "Nereye Gitti Çark ekranı: bir gider dilimi seçili, altında bugünün kayıtları",
    image: null,
  },
  {
    title: "Maaşa kadar ne kalır?",
    subtitle: "Pusula en dar günü önceden gösterir",
    alt: "Pusula bandı: sonraki gelire kadar kalan tutar ve en dar gün",
    image: null,
  },
  {
    title: "Günü gelince sorar.",
    subtitle: "Ödedim ya da Yarın sor, tek dokunuşla",
    alt: "Kilit ekranında vade bildirimi: Ödedim ve Yarın sor düğmeleri",
    image: null,
  },
  {
    title: "Kilit ekranından kaydet.",
    subtitle: "Widget'lar ve iOS 18 kontrolleri",
    alt: "Kilit ekranında Nereye Gitti widget'ları ve ana ekranda Yaklaşan widget'ı",
    image: null,
  },
  {
    title: "Ayın tamamı tek ekranda.",
    subtitle: "Kayıtlar, planlar ve en dar gün",
    alt: "Takvim ekranı: işaretli günler ve seçili günün listesi",
    image: null,
  },
  {
    title: "Paran nereye gitti?",
    subtitle: "Kategori raporu ve aylık bütçe tavanı",
    alt: "Rapor ekranı: bu ayın kategori çubukları ve bir bütçe tavanı",
    image: null,
  },
];
