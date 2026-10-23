import { PATHS } from "../config";
import { html } from "../html";
import { renderDocument } from "../layout";
import { gizlilikCss } from "../styles";

// The policy text below is binding and matched word-for-word with the App
// Store privacy declaration (source: gidertakip docs/magaza-metinleri.md §6).
// Do not edit, shorten, "smart-quote" or text-transform it. Check after any
// change: collapse whitespace in #politika's innerText -> 2835 characters,
// SHA-256 419bca96d559e5a953c00428f1fff63b3c8b289ef8421282c268322676bfad58.
// (Update 4, 2026-10-23: Android for Google Play — Google backup sentences
// in "Yedekleme", "iPhone'da da Android'de de" in "Bildirimler" and
// "Uygulama güncellemeleri", the launch-crash summary sentence (update 3 §1)
// before the Expo processor sentence, and the new date.)
// When the policy changes, update the text and "Son güncelleme" together.
const policy = html`<article id="politika">
<h1>Nereye Gitti — Gizlilik Politikası</h1>
<p>Nereye Gitti'ye girdiğin kayıtlar, planlar, vadeler, kategoriler, bakiye ve görünen adın kendi cihazında saklanır (cihaz yedeğin açıksa o yedekte de; aşağıdaki "Yedekleme"ye bak). Hesap açman gerekmez; bu verileri biz görmeyiz, sunucularımıza gönderilmez, üçüncü taraflarla paylaşılmaz. Uygulamada reklam, analitik ya da izleme yoktur.</p>
<p><strong>Yedekleme:</strong> iPhone'unda iCloud Yedekleme açıksa ya da iPhone'unu bilgisayara yedekliyorsan Nereye Gitti verileri de bu cihaz yedeğine dahil olur; yeni bir iPhone'u bu yedekten geri yüklediğinde verilerin taşınır. iCloud yedeği senin Apple hesabında Apple tarafından, bilgisayar yedeği kendi bilgisayarında saklanır; ikisine de bizim erişimimiz yoktur. Android telefonunda Google yedeklemesi açıksa Nereye Gitti verileri Google hesabındaki cihaz yedeğine dahil olur; aynı hesapla kurduğun yeni bir Android telefona bu yedekten taşınır. Bu yedek senin Google hesabında Google tarafından saklanır; ona da bizim erişimimiz yoktur.</p>
<p><strong>Bildirimler:</strong> Vade hatırlatmaları iPhone'da da Android'de de cihazında yerel olarak planlanır; push token alınmaz.</p>
<p><strong>Dışa aktarma:</strong> CSV dışa aktarmayı yalnızca sen başlatırsın ve paylaşacağın yeri sen seçersin.</p>
<p><strong>Uygulama güncellemeleri:</strong> Uygulama, iPhone'da da Android'de de hata düzeltmelerini hızlıca ulaştırmak için açılışta Expo'nun EAS Update hizmetiyle güncelleme olup olmadığını kontrol eder. Bu kontrolde cihazının platformu, uygulama sürümü bilgisi, güncelleme kanalı ve uygulama kurulumuna özel rastgele bir kimlik gönderilir; her internet bağlantısında olduğu gibi IP adresin de Expo'nun sunucularına ulaşır. Expo bu kimliği güncellemeleri kademeli dağıtmak ve güncellemeyi alan kurulumları saymak için saklar. Kimlik seni ya da cihazının donanımını tanımlamaz, uygulamadaki verilerinle ilişkilendirilmez; uygulamayı silince cihazından da silinir. Uygulama açılışta çökerse, bir sonraki kontrolde bu çökmeye ait kısa bir teknik hata özeti de Expo'ya gönderilir. Expo bu bilgileri güncelleme hizmetini sağlamak için bizim adımıza işler, bu politikadaki korumayla aynı ya da eşdeğer bir koruma sağlar ve hizmet için makul ölçüde gerekli olduğu sürece tutar. Uygulamayı silmek bu gönderimi durdurur. Bu konudaki soruların ve taleplerin için <a href="mailto:info@benatakan.com">info@benatakan.com</a> adresine yazabilirsin. Expo'nun gizlilik politikası: <a href="https://expo.dev/privacy" rel="noreferrer">https://expo.dev/privacy</a></p>
<p><strong>Verilerini silmek:</strong> Uygulamada Ayarlar → Verileri sıfırla tüm kayıt, plan ve bakiye bilgisini siler; uygulamayı silmek cihazdaki tüm verileri kaldırır. Daha önce alınmış cihaz yedeklerindeki kopya, o yedekler yenilenene ya da silinene kadar durabilir.</p>
<p><strong>Değişiklikler:</strong> Bu politika değişirse bu sayfa güncellenir; uygulama bir gün hesap ya da senkron gibi veri toplayan bir özellik kazanırsa politika o sürümden önce güncellenir.</p>
<p class="contact"><strong>İletişim:</strong> Atakan Savaş · <a href="mailto:info@benatakan.com">info@benatakan.com</a></p>
<p class="updated">Son güncelleme: 23 Ekim 2026</p>
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
