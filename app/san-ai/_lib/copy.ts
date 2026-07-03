export type Lang = "tr" | "en";

type Belief = { title: string; desc: string };
type Feature = { label: string; title: string; desc: string };
type DayBlock = { time: string; title: string; desc: string };
type RoofProject = {
  name: string;
  kind: string;
  desc: string;
  href?: string;
  status: string;
};
type Channel = { platform: string; handle: string; status: string };

export type CopyShape = {
  meta: { location: string; coords: string };
  nav: { wordmark: string; tag: string; back: string };
  hero: {
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    sub: string;
    scroll: string;
    plateCaption: string;
  };
  manifesto: {
    eyebrow: string;
    title: string;
    lead: string;
    beliefs: Belief[];
    signature: string;
  };
  place: {
    eyebrow: string;
    title: string;
    sub: string;
    features: Feature[];
    note: string;
  };
  day: {
    eyebrow: string;
    title: string;
    sub: string;
    blocks: DayBlock[];
  };
  roof: {
    eyebrow: string;
    title: string;
    sub: string;
    projects: RoofProject[];
    note: string;
  };
  feed: {
    eyebrow: string;
    title: string;
    sub: string;
    channels: Channel[];
    soon: string;
  };
  invite: {
    eyebrow: string;
    title: string;
    sub: string;
    emailLabel: string;
    email: string;
    followLabel: string;
    backToPortfolio: string;
  };
  footer: {
    wordmark: string;
    tag: string;
    lines: string[];
    madeIn: string;
    copyright: string;
    langLabel: string;
  };
};

export const copy: Record<Lang, CopyShape> = {
  tr: {
    meta: {
      location: "Dalyan · Muğla · Türkiye",
      coords: "36°49′K 28°38′D",
    },
    nav: {
      wordmark: "SAN·AI",
      tag: "yazılım evi",
      back: "← Atakan",
    },
    hero: {
      eyebrow: "DALYAN · MUĞLA — TATLI SUYUN DENİZE KARIŞTIĞI YER",
      headline: "Yapay zeka çağının",
      headlineAccent: "sanayisi.",
      sub: "Doğanın içinde, köyün kıyısında, tatlı suyun sesinde bir paylaşımlı yazılım evi. Kod yazdığımız, ürettiğimiz ve yaşadığımız çatı burası.",
      scroll: "kaydır",
      plateCaption: "// Dalyan — sabahın ilk ışığı",
    },
    manifesto: {
      eyebrow: "[ MANİFESTO ]",
      title: "Her kasabanın bir sanayisi vardır.",
      lead: "Ustaların, torna ve kaynağın, elleriyle bir şey yapanların mahallesi. Biz o ruhu aldık — çağın aletini, yapay zekâyı, tezgâhın üstüne koyduk. Sonra hepsini betondan çıkarıp doğanın içine taşıdık. San·ai, üreticinin mahallesinin yeni çağ hâli: bir çatı, altında yazılım, ajanlar ve ürünler.",
      beliefs: [
        {
          title: "Üretmek zanaattır",
          desc: "AI bir tezgâh; ustalık hâlâ insanın. Biz aleti değil, işi kutsuyoruz.",
        },
        {
          title: "Doğa lüks değil, altyapı",
          desc: "Tatlı su, yeşil ve sessizlik; fiberle aynı masada. İkisi de temel ihtiyaç.",
        },
        {
          title: "Bir çatı, çok iş",
          desc: "San·ai tek ürün değil; altında büyüyen işlerin ortak evi.",
        },
        {
          title: "Açıkça yaşarız",
          desc: "Sürecin kendisi paylaşılır — kamerada, akışta, açık kapıda.",
        },
      ],
      signature: "— Atakan",
    },
    place: {
      eyebrow: "[ NEREDE ]",
      title: "Hem doğa, hem bant genişliği",
      sub: "Dalyan; nehrin denize karıştığı, caretta'ların yumurtladığı, sazlıkların rüzgârda salındığı yer. Ama masanın üstünde fiber, arkasında sessizlik var.",
      features: [
        {
          label: "01",
          title: "Tatlı su",
          desc: "Kapının önünden geçen nehir. Sabah kahvesi de burada, öğlen molası da.",
        },
        {
          label: "02",
          title: "Doğanın içinde",
          desc: "Köyün kıyısı, sazlık, çam kokusu. Şehir gürültüsü değil, kuş sesi.",
        },
        {
          label: "03",
          title: "Kesintisiz internet",
          desc: "Fiber hat + yedek. Uzaktan çalışma, canlı yayın, deploy — hepsi rahat.",
        },
        {
          label: "04",
          title: "Ortak alan",
          desc: "Paylaşımlı masa, sessiz köşe, mutfak, ateş. Yalnız çalış, birlikte yaşa.",
        },
      ],
      note: "Fotoğraflar yükleniyor — burası gerçek bir ev, gerçek bir kıyı.",
    },
    day: {
      eyebrow: "[ BİR GÜN BURADA ]",
      title: "Sabah kod, öğlen nehir, akşam ekip",
      sub: "San·ai bir ofis değil, bir ritim. Günün doğayla ve işle nasıl aktığı:",
      blocks: [
        { time: "07:30", title: "Nehir kenarında kahve", desc: "Su sesi, sis, ilk defter. Gün planı doğada kurulur." },
        { time: "09:00", title: "Derin çalışma", desc: "Telefon uzakta, ajanlar iş başında. En verimli blok sabahın içinde." },
        { time: "13:00", title: "Suya atla", desc: "Öğlen molası nehirde ya da denizde. Zihin sıfırlanır." },
        { time: "16:00", title: "Ekip senkron", desc: "Kısa birlikte-çalışma; ne bitti, ne kaldı, ne shipliyoruz." },
        { time: "20:00", title: "Ateş ve sohbet", desc: "Kod kapanır, hikâyeler açılır. En iyi fikirler burada çıkar." },
      ],
    },
    roof: {
      eyebrow: "[ ÇATININ ALTINDA ]",
      title: "San·ai bir çatı",
      sub: "Altında büyüyen işler var. İlki burada doğdu; gerisi yolda.",
      projects: [
        {
          name: "Mesai",
          kind: "Dijital AI ofisi",
          desc: "Her projeye bir Chef ata, ekibini topla, ofisini tasarla. San·ai'nin dijital ikizi.",
          href: "/mesai",
          status: "Closed beta",
        },
        {
          name: "Deneyim akışı",
          kind: "İçerik & topluluk",
          desc: "Dalyan'daki yapımın gündelik kaydı — video, foto, not.",
          status: "Hazırlanıyor",
        },
        {
          name: "Daha fazlası",
          kind: "Yeni işler",
          desc: "Çatının altında sıradaki ürünler kuruluyor.",
          status: "Yakında",
        },
      ],
      note: "Bu çatıyı yavaşça büyütüyoruz — her iş, aynı evden.",
    },
    feed: {
      eyebrow: "[ DENEYİM AKIŞI ]",
      title: "Süreci açıkça paylaşıyoruz",
      sub: "Dalyan'daki yapımın gündelik hâli — Instagram, TikTok ve YouTube'da. Kanallar hazırlanıyor; ilk kayıtlar çok yakında.",
      channels: [
        { platform: "Instagram", handle: "@sanai", status: "Hazırlanıyor" },
        { platform: "TikTok", handle: "@sanai", status: "Hazırlanıyor" },
        { platform: "YouTube", handle: "San·ai", status: "Hazırlanıyor" },
      ],
      soon: "yakında",
    },
    invite: {
      eyebrow: "[ KAPI AÇIK ]",
      title: "Uğra, otur, üret",
      sub: "San·ai gelişen bir hikâye. Takip et, haber ver, ya da bir gün gel kapıyı çal.",
      emailLabel: "Yaz",
      email: "info@benatakan.com",
      followLabel: "Takip et",
      backToPortfolio: "Atakan portföyüne dön",
    },
    footer: {
      wordmark: "SAN·AI",
      tag: "yazılım evi · Dalyan",
      lines: [
        "> Yapay zeka çağının sanayisi.",
        "> Doğanın içinde bir çatı.",
      ],
      madeIn: "Dalyan, Muğla'da yapıldı",
      copyright: "© 2026 SAN·AI",
      langLabel: "Dil",
    },
  },
  en: {
    meta: {
      location: "Dalyan · Muğla · Türkiye",
      coords: "36°49′N 28°38′E",
    },
    nav: {
      wordmark: "SAN·AI",
      tag: "software house",
      back: "← Atakan",
    },
    hero: {
      eyebrow: "DALYAN · MUĞLA — WHERE FRESHWATER MEETS THE SEA",
      headline: "The workshop quarter",
      headlineAccent: "of the AI age.",
      sub: "A shared software house inside nature, at the edge of the village, by the sound of freshwater. This is the roof where we code, build and live.",
      scroll: "scroll",
      plateCaption: "// Dalyan — first light",
    },
    manifesto: {
      eyebrow: "[ MANIFESTO ]",
      title: "Every town has its workshop quarter.",
      lead: "The street of craftsmen — the lathe, the welder, the people who make things with their hands. We took that spirit, set the tool of our age, AI, on the workbench, then pulled it all out of the concrete and into nature. San·ai is the maker's quarter reborn: one roof, and under it software, agents and products.",
      beliefs: [
        {
          title: "Making is a craft",
          desc: "AI is a workbench; the mastery is still human. We honour the work, not the tool.",
        },
        {
          title: "Nature is infrastructure",
          desc: "Freshwater, green and silence sit at the same desk as fiber. Both are essential.",
        },
        {
          title: "One roof, many works",
          desc: "San·ai isn't a single product; it's the shared home of the works growing beneath it.",
        },
        {
          title: "We live out loud",
          desc: "The process itself is shared — on camera, in the feed, at an open door.",
        },
      ],
      signature: "— Atakan",
    },
    place: {
      eyebrow: "[ WHERE ]",
      title: "Both nature and bandwidth",
      sub: "Dalyan — where the river meets the sea, the loggerheads nest and the reeds sway in the wind. But on the desk there's fiber, and behind it, silence.",
      features: [
        {
          label: "01",
          title: "Freshwater",
          desc: "The river runs past the door. Morning coffee here, midday break here too.",
        },
        {
          label: "02",
          title: "Inside nature",
          desc: "Edge of the village, reeds, the smell of pine. No city noise — birdsong instead.",
        },
        {
          label: "03",
          title: "Uninterrupted internet",
          desc: "Fiber line + backup. Remote work, live streams, deploys — all effortless.",
        },
        {
          label: "04",
          title: "Shared space",
          desc: "A shared table, a quiet corner, a kitchen, a fire. Work alone, live together.",
        },
      ],
      note: "Photos loading soon — this is a real house on a real shore.",
    },
    day: {
      eyebrow: "[ A DAY HERE ]",
      title: "Code by morning, river by noon, team by night",
      sub: "San·ai isn't an office, it's a rhythm. How a day flows between nature and the work:",
      blocks: [
        { time: "07:30", title: "Coffee by the river", desc: "Water sounds, mist, the first notebook. The day is planned outdoors." },
        { time: "09:00", title: "Deep work", desc: "Phone away, agents on. The most productive block lives in the morning." },
        { time: "13:00", title: "Jump in the water", desc: "The midday break is in the river or the sea. The mind resets." },
        { time: "16:00", title: "Team sync", desc: "A short co-working beat: what shipped, what's left, what's next." },
        { time: "20:00", title: "Fire and talk", desc: "Code closes, stories open. The best ideas surface right here." },
      ],
    },
    roof: {
      eyebrow: "[ UNDER THE ROOF ]",
      title: "San·ai is a roof",
      sub: "Works grow beneath it. The first was born here; the rest are on the way.",
      projects: [
        {
          name: "Mesai",
          kind: "Digital AI office",
          desc: "Assign a Chef to every project, build the team, design the office. San·ai's digital twin.",
          href: "/mesai",
          status: "Closed beta",
        },
        {
          name: "Experience feed",
          kind: "Content & community",
          desc: "The daily record of making in Dalyan — video, photo, notes.",
          status: "In progress",
        },
        {
          name: "More",
          kind: "New works",
          desc: "The next products are being built under the roof.",
          status: "Soon",
        },
      ],
      note: "We grow this roof slowly — every work, from the same house.",
    },
    feed: {
      eyebrow: "[ EXPERIENCE FEED ]",
      title: "We share the process out loud",
      sub: "The daily life of making in Dalyan — on Instagram, TikTok and YouTube. Channels are being prepared; the first recordings land very soon.",
      channels: [
        { platform: "Instagram", handle: "@sanai", status: "In progress" },
        { platform: "TikTok", handle: "@sanai", status: "In progress" },
        { platform: "YouTube", handle: "San·ai", status: "In progress" },
      ],
      soon: "soon",
    },
    invite: {
      eyebrow: "[ THE DOOR IS OPEN ]",
      title: "Drop by, sit, build",
      sub: "San·ai is an unfolding story. Follow along, say hello, or one day come knock on the door.",
      emailLabel: "Write",
      email: "info@benatakan.com",
      followLabel: "Follow",
      backToPortfolio: "Back to Atakan's portfolio",
    },
    footer: {
      wordmark: "SAN·AI",
      tag: "software house · Dalyan",
      lines: [
        "> The workshop quarter of the AI age.",
        "> A roof inside nature.",
      ],
      madeIn: "Made in Dalyan, Muğla",
      copyright: "© 2026 SAN·AI",
      langLabel: "Lang",
    },
  },
};
