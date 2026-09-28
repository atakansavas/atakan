import { PATHS, SUPPORT_EMAIL } from "../config";
import { html, type Html } from "../html";
import { renderDocument } from "../layout";
import { docCss } from "../styles";

const mail = html`<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;
const policyLink = html`<a href="${PATHS.gizlilik}">Gizlilik Politikası</a>`;

// Question/answer text is binding; ids are used for deep links in support
// replies (…/destek#yeni-telefon).
const FAQ: { id: string; q: string; a: Html }[] = [
  {
    id: "yeni-telefon",
    q: "Verilerim nerede saklanıyor? Yeni telefona nasıl taşırım?",
    a: html`Kayıtların, planların ve bakiyen iPhone'unda saklanır; bir sunucumuz yok, verilerini görmeyiz. iPhone'unda iCloud Yedekleme açıksa (Ayarlar → adın → iCloud → iCloud Yedekleme) Nereye Gitti verileri de yedeğe dahil olur. Yeni iPhone'u kurarken bu yedekten geri yüklersen verilerin seninle gelir; Mac ya da PC'de aldığın yedek de aynı şekilde çalışır. Uygulamayı silip yeniden yüklemek verileri geri getirmez; taşımak için yedekten geri yüklemeyi kullan.`,
  },
  {
    id: "verileri-silme",
    q: "Verilerimi nasıl silerim?",
    a: html`Uygulamada Ayarlar → Verileri sıfırla tüm kayıtları, planları ve bakiye çıpasını siler; kategoriler kalır. Uygulamayı silmek, telefondaki tüm Nereye Gitti verilerini kaldırır. Daha önce alınmış iCloud yedeklerindeki kopya, o yedekler yenilenene ya da silinene kadar durabilir. Hesap olmadığı için sunucuda seninle ilişkilendirilen bir kayıt tutulmaz; ayrıntılar ${policyLink}'nda.`,
  },
  {
    id: "csv",
    q: "Kayıtlarımı Excel'e ya da bir tabloya nasıl aktarırım?",
    a: html`Ayarlar → Verileri dışa aktar, tüm kayıtlarını CSV biçiminde (tarih, saat, tip, kategori, tutar, not) metin olarak paylaşım menüsüne gönderir. Kendine e-postayla gönderebilir, Notlar'a yapıştırabilir ya da Dosyalar'a kaydedebilirsin; ardından Numbers, Excel ya da Google E-Tablolar'da virgülle ayrılmış metin (CSV) olarak içe aktar. Tutarlar noktalı ondalıkla yazılır (ör. 1250.00). Dışa aktarma kayıtları kapsar; planlar dahil değildir.`,
  },
  {
    id: "bildirimler",
    q: "Bildirimler gelmiyor, ne yapmalıyım?",
    a: html`Bildirimler yalnız planların vade günü gelir; tek seferlik kayıtlar için bildirim yoktur. Şunlara bak: (1) Nereye Gitti → Ayarlar → Bildirimler açık mı? Satırda "Ayarları aç" yazıyorsa iPhone izni kapalıdır: iPhone Ayarlar → Bildirimler → Nereye Gitti → Bildirimlere İzin Ver. (2) Hatırlatma saati: vade günü bu saatte sorar; sessiz saatlere denk gelirse bildirim sessiz saatler bitince gelir. (3) Odak modları (Rahatsız Etme, Uyku) bildirimleri gizleyebilir. (4) O günün hatırlatma saati geçtikten sonra kurulan bir planın vadesi uygulamada Çark ekranında kart olarak bekler; onaylamazsan ertesi gün bir kez daha bildirim gelir.`,
  },
  {
    id: "widget",
    q: "Widget'ları nasıl eklerim?",
    a: html`Önce Nereye Gitti'yi bir kez aç; widget'lar ilk açılışta hazırlanır. Ana ekran: boş bir yere basılı tut → Düzenle → Widget Ekle → "Nereye Gitti" ara → Yaklaşan → küçük ya da orta boy → Widget Ekle. Kilit ekranı: kilit ekranına basılı tut → Özelleştir → Kilit Ekranı → saatin altındaki alana dokun → Nereye Gitti → Gider ekle, Gelir ekle, Çark ya da Yaklaşan → Bitti. Listede görünmüyorsa uygulamayı güncelleyip bir kez aç; hâlâ yoksa telefonu yeniden başlat. Adım adım rehber uygulamada: Ayarlar → Widget'ları ekle.`,
  },
  {
    id: "kontroller",
    q: "iOS 18 kontrollerini nasıl kullanırım?",
    a: html`iOS 18 ve sonrası gerekir. Denetim Merkezi: sağ üstten aşağı çek → sol üstteki + → Denetim Ekle → "Nereye Gitti" ara → Gider ekle, Gelir ekle ya da Çark. Kilit ekranı köşesi: kilit ekranına basılı tut → Özelleştir → Kilit Ekranı → alttaki fener ya da kamera düğmesini − ile kaldır → + → Nereye Gitti. Eylem düğmesi (olan iPhone'larda): Ayarlar → Eylem Düğmesi → Denetim → Nereye Gitti → Gider ekle.`,
  },
  {
    id: "ucret",
    q: "Nereye Gitti ücretsiz mi? Reklam var mı?",
    a: html`Evet, ücretsiz. Reklam, abonelik ya da uygulama içi satın alma yok; hesap açman da gerekmez.`,
  },
  {
    id: "iletisim",
    q: "Sana nasıl ulaşırım?",
    a: html`Soru, öneri ve hata bildirimi için ${mail} adresine yaz. Hata bildiriyorsan iPhone modelini, iOS sürümünü ve uygulama sürümünü (uygulamada Ayarlar ekranının en altında yazar) eklersen daha hızlı yardımcı olabilirim.`,
  },
];

export const renderDestek = () =>
  renderDocument({
    page: "destek",
    title: "Destek — Nereye Gitti",
    description:
      "Nereye Gitti için destek ve sık sorulan sorular: yeni telefona taşıma, verileri silme, CSV dışa aktarma, bildirimler ve widget'lar.",
    css: docCss,
    main: html`<div class="doc"><div class="wrap">
<h1>Nereye Gitti — Destek</h1>
<p class="intro">Soru, öneri ya da hata bildirimi için e-posta gönder: ${mail}. Genellikle 2 iş günü içinde yanıt veririm.</p>
<a class="btn" href="mailto:${SUPPORT_EMAIL}?subject=Nereye%20Gitti">E-posta gönder</a>
<section class="req" aria-labelledby="gereksinimler">
<h2 id="gereksinimler">Sistem gereksinimleri</h2>
<dl>
<div><dt>Cihaz:</dt><dd>iPhone</dd></div>
<div><dt>iOS:</dt><dd>16.4 ve üstü</dd></div>
<div><dt>iOS 18 kontrolleri (Denetim Merkezi, kilit ekranı köşeleri, Eylem düğmesi):</dt><dd>iOS 18 ve üstü</dd></div>
<div><dt>Dil:</dt><dd>Türkçe</dd></div>
</dl>
<p>Hesap gerekmez; uygulama internet olmadan da çalışır.</p>
</section>
<section class="faq" aria-labelledby="sss">
<h2 id="sss">Sık sorulan sorular</h2>
<div class="faq-list">
${FAQ.map(({ id, q, a }) => html`<div class="qa">
<h3 id="${id}">${q}</h3>
<p>${a}</p>
</div>
`)}</div>
</section>
<ul class="after-links">
<li><a href="${PATHS.gizlilik}">Gizlilik Politikası</a></li>
<li><a href="${PATHS.tanitim}">Nereye Gitti tanıtım sayfası</a></li>
</ul>
</div></div>`,
  });
