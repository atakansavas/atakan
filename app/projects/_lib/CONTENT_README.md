# `content.json` — /projects sayfasının içerik dosyası

`/projects` sayfasında görünen **tüm metin, yıl, etiket ve teknik içerik** bu
JSON dosyasında. `data.ts` bu JSON'u import edip tip-cast ediyor; sayfayı çizen
diğer her şey yardımcı fonksiyonlar (sıralama, lookup) içeriyor.

> Düzenlemek için: `content.json`'u açıp değer değiştir → kaydet → sayfayı
> yenile. Format değişmediği sürece sayfa anında yansır.

---

## Üst seviye yapı

```jsonc
{
  "eras":         [ ... 6 dönem ... ],
  "experiences":  [ ... LinkedIn iş deneyimleri ... ],
  "projects":     [ ... ürünler/projeler ... ],
  "lifeChapters": [ ... yaşam dönemleri (yer/şehir) ... ]
}
```

Her bölüm bir dizidir. **Sırası önemli değil** — sayfa yıllara göre sıralar.

---

## Ortak alanlar

### Bilingual metin
İki dilli alanlar her zaman şu şekildedir:
```json
{ "tr": "Türkçe metin", "en": "English text" }
```
İkisinden birini boş bırakırsan diğeri kullanılır.

### Yıl
- `start`, `end`, `year`, `endYear` → sayı (örn `2018`)
- `end` veya `endYear` için `"present"` yazarsan "hala devam ediyor" anlamına gelir

### Era ID'leri
`era` alanı her yerde aşağıdakilerden biri olmalı (yenisi eklemek için
`eras` dizisine de eklemen lazım):

`genesis | agency | enterprise | drift | agentic`

---

## `eras` — Dönem renkleri ve etiketleri

```jsonc
{
  "id": "enterprise",                  // ID — diğer alanlar buna referans verir
  "range": [2018, 2022],               // Bu dönemin yıl aralığı
  "name": { "tr": "Kurumsal", "en": "Enterprise" },
  "tagline": { "tr": "Kariyer.net…", "en": "Kariyer.net…" },
  "accent": "#a78bfa"                  // Hex — gövde rengi, marker rengi, vb.
}
```

Yeni dönem eklemek istersen:
1. `eras` dizisine yukarıdaki shape'te yeni bir nesne ekle
2. `Era` type'ında ID'yi listele (`app/projects/_lib/data.ts`'te)
3. Tüm experience/project'lerin `era` alanı ya yeni ID'yi ya da eskileri
   kullanmalı

---

## `experiences` — LinkedIn iş deneyimleri (ana dallar)

```jsonc
{
  "id": "exp-kariyer-spec",            // benzersiz slug
  "start": 2018,
  "end": 2020,                         // veya "present"
  "era": "enterprise",
  "company":  { "tr": "Kariyer.net", "en": "Kariyer.net" },
  "role":     { "tr": "Software Development Specialist", "en": "Software Development Specialist" },
  "location": { "tr": "İstanbul, Türkiye", "en": "Istanbul, Türkiye" },
  "story":    { "tr": "…", "en": "…" },
  "bullets": [
    { "tr": "C# ile…", "en": "Built…" },
    { "tr": "ATS taşıma…", "en": "ATS migration…" }
  ],
  "tech": [".NET Core", "C#", "MSSQL"],
  "flagship": true,                    // büyük başlık + ana totem
  "media": [                           // OPSİYONEL — ileride foto/video
    { "kind": "image", "src": "/media/kariyernet-1.jpg", "caption": { "tr": "…", "en": "…" } }
  ]
}
```

3D'de büyük bir **dal** olarak çıkar. Ucunda parlayan tomurcuk vardır.
Dal uzunluğu = tenür süresi.

---

## `projects` — Ürünler/projeler (yapraklar / çiçekler / filizler)

```jsonc
{
  "id": "bozcaada",
  "year": 2022,
  "endYear": "present",                // veya 2024 gibi sayı, ya da hiç yazma
  "era": "drift",
  "parentExperienceId": "exp-debite",  // bu varsa proje o dalın yaprağı olur
                                       // boş bırakırsan gövdeden filiz çıkar
  "title": "Bozcaada App",
  "subtitle": { "tr": "…", "en": "…" },
  "story":    { "tr": "…", "en": "…" },
  "tech": ["React Native", "Expo"],
  "status": { "tr": "Yayında", "en": "Live" }, // canlı/yayında ise çiçek olur
  "link": "https://www.bozcaada.app/",
  "github": "https://github.com/…",
  "flagship": false,
  "challenge": { "tr": "…", "en": "…" },
  "takeaway": { "tr": "…", "en": "…" },
  "highlight": [
    { "tr": "12k MAU", "en": "12k MAU" }
  ],
  "media": [
    { "kind": "image", "src": "/media/bozcaada-1.jpg" },
    { "kind": "video", "src": "/media/bozcaada-tour.mp4" }
  ]
}
```

### Görsel kuralı
- `status.tr/en` içinde **`Yayında / Live / In production / Üretimde / Active /
  Deployed / Geliştiriliyor / In development`** geçiyorsa **çiçek**
  (parlak 12-yüzlü). `endYear: "present"` de aynısını yapar.
- `parentExperienceId` **boşsa** → gövdeden çıkan **filiz** (kişisel/erken iş).
- Diğer her durum → klasik **yaprak**.

`yearLabel` (opsiyonel) — yıl yerine "~2005" gibi bir etiket göstermek için.

---

## `lifeChapters` — Yaşam dönemleri (gövdeyi saran halkalar)

```jsonc
{
  "id": "lc-istanbul-heybeliada",
  "start": 2021,
  "end": 2023,                         // veya "present"
  "label": { "tr": "İstanbul · Heybeliada", "en": "Istanbul · Heybeliada Island" },
  "places": ["İstanbul", "Heybeliada"],
  "kind": "settled",                   // "settled" | "nomad"
  "story": { "tr": "…", "en": "…" },
  "accent": "#a78bfa",
  "media": [ … ]
}
```

3D'de gövdeye yapışan **renkli halka** + yan tarafta **şehir tag'i** olarak
görünür. Story-card'da aktif yıla denk gelen chapter "📍 O ZAMANLAR: …"
chip'i olarak çıkar.

### Yıl semantiği
Aralıklar **end-exclusive** yorumlanır: `start: 2020, end: 2021` → 2020 yılı
boyunca; 2021'de bir sonraki chapter'a geçilmiş sayılır.

---

## Media (foto/video) — Henüz arayüze çıkmadı

`media: MediaItem[]` alanı tüm experience, project ve lifeChapter'larda
opsiyonel. Format:
```json
{ "kind": "image" | "video", "src": "/media/…", "caption": { "tr": "…", "en": "…" } }
```

Görseller `public/media/` altına konursa `src: "/media/dosya.jpg"` çalışır.
Galeri arayüzü ileride eklenecek; şimdilik veriyi koymak ileride otomatik
yansır.

---

## Hata ayıklama

- JSON içinde **virgül hatası, kapanmamış parantez** → sayfa açılmaz, dev
  console hata verir. JSON validator (örn. https://jsonlint.com) kullan.
- Era ID yanlış yazılırsa (örn. `"enterpise"`) tip kontrolü yakalar; `npm run
  build` patlar.
- `parentExperienceId` mevcut bir experience'a eşleşmiyorsa proje gövdeden
  filiz olarak görünür (sessizce fallback).

---

## Hangi alanı nerede gör

| Alan | Nerede görünür |
|---|---|
| `era.tagline` | Sol-altta era info kutusunda |
| `experience.role/company/location` | Story-card subtitle |
| `experience.bullets` | Story-card "Sorumluluklar & Çıktılar" bloğu |
| `project.title` | Story-card büyük başlık |
| `project.subtitle` | Story-card alt başlık |
| `project.story` | Story-card body metni |
| `project.status` | Çiçek/yaprak ayrımına etki, story-card'da görünmez |
| `project.tech` | Story-card alt rozetler |
| `project.link/github` | Story-card alt eylem linkleri |
| `lifeChapter.label` | 3D halka tag'i + story-card "O ZAMANLAR" chip'i |
| `lifeChapter.story` | (Henüz UI'da yok, ileride detay panelinde görünecek) |
