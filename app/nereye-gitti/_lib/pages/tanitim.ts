import {
  APP_STORE_BADGE,
  APP_STORE_URL,
  BASE_PATH,
  NEREYE_GITTI_APP_STORE_LIVE,
  PATHS,
} from "../config";
import { html } from "../html";
import { renderDocument } from "../layout";
import { SCREENSHOTS, type Screenshot } from "../screenshots";
import { landingCss } from "../styles";

// Pre-launch: no badge and no apps.apple.com link anywhere on the page.
const cta = () => html`<div class="cta">
${
  NEREYE_GITTI_APP_STORE_LIVE
    ? html`<a class="badge" href="${APP_STORE_URL}"><img src="${APP_STORE_BADGE.src}" width="${APP_STORE_BADGE.width}" height="${APP_STORE_BADGE.height}" alt="${APP_STORE_BADGE.alt}"></a>`
    : html`<p class="soon">Çok yakında App Store'da.</p>`
}
<p class="meta">iPhone · iOS 16.4 ve üstü · Türkçe</p>
</div>`;

const FEATURES = [
  {
    tick: "cark",
    title: "Bas, çevir, bırak",
    text: "Çarka dokun, parmağını kategoriye kaydır, bırak: tutar ekranı hazır. Sol yarı gider, sağ yarı gelir; o kategoride son girdiğin tutar önerilir.",
  },
  {
    tick: "plan",
    title: "Maaşa kadar ne kalır?",
    text: "Bugün elindeki parayı bir kez gir. Pusula planlarını gün gün ileri sarar; sonraki gelirine kadar ne kalacağını tek sayıyla gösterir, en dar günü de işaretler.",
  },
  {
    tick: "plan",
    title: "Günü gelince sorar",
    text: "Kira, maaş, fatura, taksit: bir kez planla. Vade günü seçtiğin saatte bildirim gelir; Ödedim de tutar hazır, Yarın sor de vade yarına kalsın.",
  },
  {
    tick: "gelir",
    title: "Kilit ekranından kaydet",
    text: "Gider ekle, Gelir ekle ve Çark widget'ları; sıradaki ödemeyi gösteren Yaklaşan. iOS 18'de Denetim Merkezi, kilit ekranı köşeleri ve Eylem düğmesi için kontroller.",
  },
  {
    tick: "plan",
    title: "Ayın tamamı tek ekranda",
    text: "Takvimde günler gelir, gider ve vade işaretli, en dar gün vurgulu. Geçmiş bir güne dokunup unuttuğun harcamayı ekle, ileri bir güne dokunup plan kur.",
  },
  {
    tick: "gider",
    title: "Rapor ve aylık tavan",
    text: "Son 7 gün, bu ay ya da son 3 ay: paranın kategori kategori nereye gittiğini, gelirinin hangi kaynaktan geldiğini gör. İstediğin gider kategorisine aylık tavan koy; tavan aşılınca uyarı gör.",
  },
] as const;

const tickClass = { cark: "tick tick--cark", plan: "tick", gelir: "tick tick--gelir", gider: "tick tick--gider" };

// Real screenshots use <picture> (AVIF/WebP, 360/720/1080w); until they
// exist, a plain grey 1320:2868 placeholder stands in (no fake screenshots).
const shot = (s: Screenshot, hero = false) => {
  if (!s.image) {
    return html`<div class="shot shot--placeholder" aria-hidden="true"><img src="${BASE_PATH}/mark.svg" width="28" height="28" alt=""></div>`;
  }
  const srcset = (ext: string) =>
    s.image!.widths.map((w) => `${s.image!.base}-${w}.${ext} ${w}w`).join(", ");
  const sizes = hero ? "(min-width: 900px) 320px, 76vw" : "(min-width: 900px) 264px, 70vw";
  return html`<div class="shot"><picture>
<source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}">
<source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
<img src="${s.image.base}-720.webp" width="1320" height="2868" alt="${s.alt}"${
    hero ? html` fetchpriority="high"` : html` loading="lazy" decoding="async"`
  }>
</picture></div>`;
};

export const renderTanitim = () =>
  renderDocument({
    page: "tanitim",
    title: "Nereye Gitti — Gelir gider ve bütçe takibi",
    description:
      "Gelir ve giderini bir çarkla saniyeler içinde kaydet; planlı ödemelerin günü gelince sorsun, sonraki gelirine kadar ne kalacağını gör. Hesap yok, reklam yok.",
    css: landingCss,
    main: html`<section class="hero" aria-labelledby="baslik">
<div class="wrap hero-grid">
<div class="hero-text">
<img class="hero-icon" src="${BASE_PATH}/icon.svg" width="72" height="72" alt="Nereye Gitti uygulama simgesi">
<p class="label label--accent label--keep">iPhone için gelir gider ve bütçe takibi</p>
<h1 id="baslik">Paran nereye gitti? <span>Şimdi önünü de gör.</span></h1>
<p class="lede">Nereye Gitti gelir ve giderini bir çarkla saniyeler içinde kaydeder, planlı ödemelerini günü gelince sorar ve sonraki gelirine kadar ne kalacağını gösterir. Hesap yok, reklam yok; verilerin iPhone'unda kalır.</p>
${cta()}
</div>
<div class="hero-visual">${shot(SCREENSHOTS[0], true)}</div>
</div>
</section>

<section class="section" id="ozellikler" aria-labelledby="ozellikler-baslik">
<div class="wrap">
<div class="section-head">
<p class="label">Özellikler</p>
<h2 id="ozellikler-baslik">Açılışta seni rapor değil, çark karşılar.</h2>
</div>
<ul class="features">
${FEATURES.map((f) => html`<li class="card">
<span class="${tickClass[f.tick]}" aria-hidden="true"></span>
<h3>${f.title}</h3>
<p>${f.text}</p>
</li>
`)}</ul>
</div>
</section>

<section class="section" id="ekranlar" aria-labelledby="ekranlar-baslik">
<div class="wrap">
<div class="section-head">
<p class="label">Ekranlar</p>
<h2 id="ekranlar-baslik">Ekran görüntüleri</h2>
</div>
<ul class="shots" tabindex="0" aria-labelledby="ekranlar-baslik">
${SCREENSHOTS.map((s) => html`<li><figure>
${shot(s)}
<figcaption><strong>${s.title}</strong><span>${s.subtitle}</span></figcaption>
</figure></li>
`)}</ul>
</div>
</section>

<section class="section" id="gizlilik" aria-labelledby="gizlilik-baslik">
<div class="wrap">
<div class="panel">
<p class="label">Gizlilik</p>
<h2 id="gizlilik-baslik">Senin verin, senin telefonun.</h2>
<p>Hesap yok, reklam yok, analitik yok. Kayıtların, planların ve bakiyen iPhone'unda durur, bize gönderilmez; uygulama internet olmadan da çalışır. iCloud Yedekleme açıksa ya da iPhone'unu bilgisayara yedekliyorsan verilerin bu cihaz yedeğine dahil olur ve yeni iPhone'a yedekten geçtiğinde seninle gelir; yedek senin Apple hesabında ya da bilgisayarında durur, bizim erişimimiz yoktur. Kayıtlarını istediğin an CSV biçiminde dışa aktarabilir, Ayarlar'dan kayıt ve planlarını silebilirsin.</p>
<a class="more" href="${PATHS.gizlilik}">Gizlilik politikasının tamamı</a>
</div>
</div>
</section>

<section class="section closing" aria-labelledby="kapanis-baslik">
<div class="wrap">
<div class="section-head">
<h2 id="kapanis-baslik">Ayna değil, pusula.</h2>
<p class="closing-text">Nereye Gitti geçmişi kaydetmekle kalmaz, önünü gösterir.</p>
</div>
${cta()}
</div>
</section>`,
  });
