import { PATHS } from "../config";
import { html } from "../html";
import { renderDocument } from "../layout";
import { gizlilikCss } from "../styles";

// The policy text below is binding and matched word-for-word with the App
// Store privacy declaration (source: gidertakip docs/magaza-metinleri.md §6).
// Do not edit, shorten, "smart-quote" or text-transform it. Check after any
// change: collapse whitespace in #politika's innerText -> 2075 characters,
// SHA-256 d40a877104833db8455564d4433bbe8f6ee1ee675d206eb4458dd44c7552f0ab.
// (The brief's text with the contact address changed from destek@ to
// info@benatakan.com at the owner's request, 2026-09-28.)
// When the policy changes, update the text and "Son güncelleme" together.
const policy = html`<article id="politika">
<h1>Nereye Gitti — Gizlilik Politikası</h1>
<p>Nereye Gitti'ye girdiğin kayıtlar, planlar, vadeler, kategoriler, bakiye ve görünen adın kendi cihazında saklanır (cihaz yedeğin açıksa o yedekte de; aşağıdaki "Yedekleme"ye bak). Hesap açman gerekmez; bu verileri biz görmeyiz, sunucularımıza gönderilmez, üçüncü taraflarla paylaşılmaz. Uygulamada reklam, analitik ya da izleme yoktur.</p>
<p><strong>Yedekleme:</strong> iPhone'unda iCloud Yedekleme açıksa ya da iPhone'unu bilgisayara yedekliyorsan Nereye Gitti verileri de bu cihaz yedeğine dahil olur; yeni bir iPhone'u bu yedekten geri yüklediğinde verilerin taşınır. iCloud yedeği senin Apple hesabında Apple tarafından, bilgisayar yedeği kendi bilgisayarında saklanır; ikisine de bizim erişimimiz yoktur.</p>
<p><strong>Bildirimler:</strong> Vade hatırlatmaları cihazında yerel olarak planlanır; push token alınmaz.</p>
<p><strong>Dışa aktarma:</strong> CSV dışa aktarmayı yalnızca sen başlatırsın ve paylaşacağın yeri sen seçersin.</p>
<p><strong>Uygulama güncellemeleri:</strong> Uygulama, hata düzeltmelerini hızlıca ulaştırmak için açılışta Expo'nun EAS Update hizmetiyle güncelleme olup olmadığını kontrol eder. Bu kontrolde cihazının platformu, uygulama sürümü bilgisi, güncelleme kanalı ve uygulama kurulumuna özel rastgele bir kimlik gönderilir; her internet bağlantısında olduğu gibi IP adresin de Expo'nun sunucularına ulaşır. Expo bu kimliği güncellemeleri kademeli dağıtmak ve güncellemeyi alan kurulumları saymak için saklar. Kimlik seni ya da cihazının donanımını tanımlamaz, uygulamadaki verilerinle ilişkilendirilmez; uygulamayı silince cihazından da silinir. Expo'nun gizlilik politikası: <a href="https://expo.dev/privacy" rel="noreferrer">https://expo.dev/privacy</a></p>
<p><strong>Verilerini silmek:</strong> Uygulamada Ayarlar → Verileri sıfırla tüm kayıt, plan ve bakiye bilgisini siler; uygulamayı silmek cihazdaki tüm verileri kaldırır. Daha önce alınmış cihaz yedeklerindeki kopya, o yedekler yenilenene ya da silinene kadar durabilir.</p>
<p><strong>Değişiklikler:</strong> Bu politika değişirse bu sayfa güncellenir; uygulama bir gün hesap ya da senkron gibi veri toplayan bir özellik kazanırsa politika o sürümden önce güncellenir.</p>
<p class="contact"><strong>İletişim:</strong> Atakan Savaş · <a href="mailto:info@benatakan.com">info@benatakan.com</a></p>
<p class="updated">Son güncelleme: 28 Eylül 2026</p>
</article>`;

export const renderGizlilik = () =>
  renderDocument({
    page: "gizlilik",
    title: "Gizlilik Politikası — Nereye Gitti",
    description:
      "Nereye Gitti'nin gizlilik politikası: verilerin cihazında kalır; hesap, reklam ve analitik yok. Güncelleme kontrolü ve cihaz yedeği hakkında ayrıntılar.",
    css: gizlilikCss,
    main: html`<div class="doc"><div class="wrap">
${policy}
<ul class="after-links">
<li><a href="${PATHS.destek}">Destek</a></li>
<li><a href="${PATHS.tanitim}">Nereye Gitti tanıtım sayfası</a></li>
</ul>
</div></div>`,
  });
