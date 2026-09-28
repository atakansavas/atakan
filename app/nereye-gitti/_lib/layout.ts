import { BASE_PATH, OG_IMAGE, PATHS, SITE_ORIGIN, SUPPORT_EMAIL, APP_STORE_ID } from "./config";
import { FONT_FACES } from "./fonts.generated";
import { html, raw, type Html } from "./html";

type Page = keyof typeof PATHS;

type DocumentOptions = {
  page: Page;
  title: string;
  description: string;
  css: string;
  main: Html;
};

const preloads = FONT_FACES.filter((f) => f.family === "Sora").map(
  (f) => html`<link rel="preload" href="${f.file}" as="font" type="font/woff2" crossorigin>`,
);

const header = (page: Page) => html`<header class="site-header">
<div class="wrap bar">
<a class="brand" href="${PATHS.tanitim}" aria-label="Nereye Gitti"><img src="${BASE_PATH}/mark.svg" width="28" height="28" alt=""><span aria-hidden="true">NEREYE_GİTTİ</span></a>
<nav class="nav" aria-label="Sayfalar">
<a href="${PATHS.gizlilik}"${page === "gizlilik" ? html` aria-current="page"` : ""}>Gizlilik</a>
<a href="${PATHS.destek}"${page === "destek" ? html` aria-current="page"` : ""}>Destek</a>
</nav>
</div>
</header>`;

const footer = html`<footer class="site-footer">
<div class="wrap">
<p class="footer-brand"><img src="${BASE_PATH}/mark.svg" width="24" height="24" alt="">Nereye Gitti</p>
<nav aria-label="Alt bilgi">
<ul class="footer-links">
<li><a href="${PATHS.gizlilik}">Gizlilik Politikası</a></li>
<li><a href="${PATHS.destek}">Destek</a></li>
<li><a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></li>
<li><a href="/">benatakan.com</a></li>
</ul>
</nav>
<p class="footer-copy">© 2026 Atakan Savaş</p>
<p class="footer-tm">Apple, Apple logosu, iPhone ve App Store, Apple Inc.'in ABD'de ve diğer ülkelerde tescilli ticari markalarıdır.</p>
</div>
</footer>`;

/**
 * A complete HTML document. No scripts, no third-party requests, one
 * canonical, page-specific og/twitter tags. The body is wrapped in
 * email_off markers so Cloudflare's Email Address Obfuscation leaves the
 * support address as plain text (and injects no decoder script).
 */
export function renderDocument({ page, title, description, css, main }: DocumentOptions): Html {
  const url = `${SITE_ORIGIN}${PATHS[page]}`;
  return html`<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#050607">
<meta name="color-scheme" content="dark">
${page === "tanitim" ? html`<meta name="apple-itunes-app" content="app-id=${APP_STORE_ID}">\n` : ""}<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="Nereye Gitti">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${OG_IMAGE.url}">
<meta property="og:image:width" content="${OG_IMAGE.width}">
<meta property="og:image:height" content="${OG_IMAGE.height}">
<meta property="og:image:alt" content="${OG_IMAGE.alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${OG_IMAGE.url}">
<meta name="twitter:image:alt" content="${OG_IMAGE.alt}">
<link rel="icon" type="image/svg+xml" href="${BASE_PATH}/icon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="${BASE_PATH}/favicon-32.png">
<link rel="apple-touch-icon" href="${BASE_PATH}/apple-touch-icon.png">
${preloads}
<style>${raw(css)}</style>
</head>
<body>
<!--email_off-->
<a class="skip" href="#icerik">İçeriğe geç</a>
${header(page)}
<main id="icerik" tabindex="-1">
${main}
</main>
${footer}
<!--email_on-->
</body>
</html>
`;
}
