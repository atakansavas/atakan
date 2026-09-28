// Inline stylesheets for the Nereye Gitti pages ("Neon Gece" palette from the
// app's src/theme/colors.ts). Dark only, by design — like the app. Each page
// gets the shared chrome plus only its own rules.

import { FONT_FACES } from "./fonts.generated";

const mono = FONT_FACES.find((f) => f.family === "IBM Plex Mono")!;

const fontFaces = [
  ...FONT_FACES.map(
    (f) =>
      `@font-face{font-family:"${f.family}";font-style:normal;font-weight:${f.weight};font-display:swap;src:url(${f.file}) format("woff2")}`,
  ),
  // Sora has no arrows or ₺; borrow them from Plex Mono (already loaded).
  `@font-face{font-family:"Sora";font-style:normal;font-weight:400 700;font-display:swap;src:url(${mono.file}) format("woff2");unicode-range:U+2190-2193,U+20BA}`,
  // Arial scaled to Sora's metrics, so the swap to Sora barely moves text.
  `@font-face{font-family:"Sora Fallback";src:local("Arial"),local("ArialMT");size-adjust:112.93%;ascent-override:85.89%;descent-override:25.68%;line-gap-override:0%}`,
].join("\n");

const base = /* css */ `
:root{
  color-scheme:dark;
  --bg:#050607;--surface:#0f0f12;--surface2:#131416;--surface3:#232428;
  --border:#2d2d32;--border-strong:#323237;
  --text:#f1f1f4;--text2:#bcbdc4;--n70:#9d9ea5;--muted:#8c8d93;--muted2:#7a7b81;
  --accent:#b495fe;--accent-bright:#c9b3fe;--gelir:#41f9c7;--gider:#ffa05f;--ink:#08090d;
  --sans:"Sora","Sora Fallback",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --r-card:14px;--r-pill:20px;--r-panel:28px;
  --gutter:20px;--measure:min(68ch,38rem);
}
@media (min-width:768px){:root{--gutter:32px}}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;background:var(--bg)}
body{margin:0;background:var(--bg);color:var(--text);font:400 1.0625rem/1.6 var(--sans);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-wrap:break-word}
h1,h2,h3,p,figure,dl,dd,ul{margin:0}
h1,h2,h3{color:var(--text);font-weight:700;text-wrap:balance}
h1{font-size:clamp(2.25rem,6vw,3.75rem);letter-spacing:-.02em;line-height:1.1}
h2{font-size:clamp(1.5rem,3.5vw,2.25rem);letter-spacing:-.015em;line-height:1.2}
h3{font-size:1.25rem;font-weight:600;line-height:1.35;letter-spacing:-.005em}
p{text-wrap:pretty}
strong{font-weight:600;color:var(--text)}
img{display:block;max-width:100%;height:auto}
a{color:var(--accent);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em;transition:color .15s,background-color .15s}
a:hover{color:var(--accent-bright)}
/* Links in running text: 44px-tall tap area without moving the text. */
p a,dd a{position:relative}
p a::after,dd a::after{content:"";position:absolute;inset:-12px -2px}
:focus-visible{outline:2px solid var(--accent-bright);outline-offset:3px;border-radius:6px}
::selection{background:rgba(180,149,254,.32);color:var(--text)}
.nw{white-space:nowrap}

.skip{position:absolute;left:12px;top:-200px;z-index:10;display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:var(--r-pill);background:var(--accent);color:var(--ink);font-weight:600;text-decoration:none}
.skip:focus{top:12px;color:var(--ink)}
.wrap{width:100%;max-width:calc(1120px + 2 * var(--gutter));margin-inline:auto;padding-inline:var(--gutter)}

/* Header */
.site-header{border-bottom:1px solid var(--border)}
.bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;min-height:64px}
.brand{display:inline-flex;align-items:center;gap:10px;min-height:44px;color:var(--accent);text-decoration:none;font:500 .9375rem/1 var(--mono);letter-spacing:.04em}
.brand:hover{color:var(--accent-bright)}
.brand img{width:28px;height:28px}
.nav{display:flex;gap:4px;margin-right:-12px}
.nav a{display:inline-flex;align-items:center;min-height:44px;padding:0 12px;border-radius:var(--r-pill);color:var(--text2);text-decoration:none;font-size:.9375rem}
.nav a:hover{color:var(--text);background:var(--surface2)}
.nav a[aria-current=page]{color:var(--text);background:var(--surface2)}

/* Footer */
.site-footer{border-top:1px solid var(--border);padding:40px 0 48px;color:var(--n70);font-size:.9375rem}
.footer-brand{display:flex;align-items:center;gap:10px;color:var(--text);font-weight:600}
.footer-brand img{width:24px;height:24px}
.footer-links{list-style:none;padding:0;margin:12px 0 0;display:flex;flex-wrap:wrap;align-items:center;column-gap:24px}
.footer-links li{display:flex;align-items:center}
.footer-links a{display:inline-flex;align-items:center;min-height:44px}
@media (min-width:640px){
  .footer-links{column-gap:0}
  .footer-links li+li::before{content:"·";content:"·" / "";color:var(--muted2);padding:0 10px}
}
.footer-copy{margin-top:12px}
.footer-tm{margin-top:6px;max-width:var(--measure);color:var(--muted2);font-size:.8125rem;line-height:1.5}

@media (prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}}
`;

const landing = /* css */ `
.label{font:500 .75rem/1.5 var(--mono);letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
.label--accent{color:var(--accent)}
.label--keep{text-transform:none}
.meta{font:500 .8125rem/1.5 var(--mono);letter-spacing:.01em;color:var(--muted)}

.cta{display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.soon{display:inline-flex;align-items:center;gap:10px;min-height:40px;padding:0 16px 0 14px;border-radius:var(--r-pill);background:var(--surface2);color:var(--text2);font-weight:500;font-size:.9375rem}
.soon::before{content:"";flex:none;width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px rgba(180,149,254,.16),0 0 14px rgba(180,149,254,.7)}
/* Apple badge: official artwork, unmodified; >=40px tall, clear space >= 1/4 of its height. */
.badge{display:inline-block;margin:13px 0;line-height:0;border-radius:10px}
.badge img{height:50px;width:auto}
.store-link{display:inline-flex;align-items:center;min-height:44px;font-weight:600}

/* Screenshot frame: plain rounded frame, radius ~6% of width, 1px border. */
.shot{aspect-ratio:1320/2868;border-radius:6%/2.762%;border:1px solid var(--border);overflow:hidden;background:var(--surface2)}
.shot img{width:100%;height:100%;object-fit:cover}
/* Until the real screenshots arrive: an obviously empty grey slot. */
.shot--placeholder{border-style:dashed;border-color:var(--border-strong);background:repeating-linear-gradient(135deg,#17181b 0 12px,#131416 12px 24px)}

.hero{position:relative;isolation:isolate;overflow-x:clip;padding:48px 0 72px}
.hero::before{content:"";position:absolute;z-index:-1;inset:0 0 auto 0;height:720px;background:radial-gradient(60% 55% at 20% 0%,rgba(180,149,254,.16),transparent 70%),radial-gradient(40% 45% at 85% 30%,rgba(180,149,254,.08),transparent 70%);pointer-events:none}
.hero-grid{display:grid;gap:56px;align-items:center}
.hero-icon{width:72px;height:72px}
.hero .label{margin-top:28px}
.hero h1{margin-top:14px}
.hero h1 span{color:var(--accent)}
.lede{margin-top:22px;max-width:36em;color:var(--text2);font-size:1.125rem;line-height:1.6}
.hero .cta{margin-top:32px}
.hero-visual{justify-self:center;width:min(300px,76vw);position:relative}
.hero-visual::before{content:"";position:absolute;z-index:-1;inset:10% -20%;background:radial-gradient(closest-side,rgba(180,149,254,.18),transparent);pointer-events:none}
.hero-visual:has(.shot--placeholder){width:min(240px,62vw)}
@media (min-width:900px){
  .hero{padding:80px 0 112px}
  .hero-grid{grid-template-columns:minmax(0,1fr) 320px;gap:72px}
  .hero-visual{justify-self:end;width:100%}
  .hero-visual:has(.shot--placeholder){width:280px}
}

.section{padding:72px 0;border-top:1px solid var(--border)}
@media (min-width:900px){.section{padding:112px 0}}
.section-head{max-width:40em}
.section-head h2{margin-top:12px}

.features{list-style:none;padding:0;margin-top:40px;display:grid;gap:16px}
@media (min-width:640px){.features{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1000px){.features{grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}}
.card{height:100%;padding:24px;border:1px solid var(--border);border-radius:var(--r-card);background:var(--surface)}
.card h3{margin-top:14px}
.card p{margin-top:10px;color:var(--text2);font-size:1rem}
.tag{display:flex;align-items:center;gap:10px;font:500 .75rem/1.5 var(--mono);letter-spacing:.04em;text-transform:uppercase;color:var(--accent)}
.tag::before{content:"";flex:none;width:8px;height:8px;border-radius:50%;background:currentColor;box-shadow:0 0 12px currentColor}
.tag--gelir{color:var(--gelir)}
.tag--gider{color:var(--gider)}
.tag--cark{color:var(--text2)}
.tag--cark::before{background:linear-gradient(90deg,var(--gider) 50%,var(--gelir) 50%);box-shadow:-4px 0 10px rgba(255,160,95,.5),4px 0 10px rgba(65,249,199,.5)}

.shots{list-style:none;margin:40px calc(-1 * var(--gutter)) 0;padding:0 var(--gutter) 16px;display:grid;grid-auto-flow:column;grid-auto-columns:min(70%,250px);gap:16px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding-inline:var(--gutter);scrollbar-color:var(--border-strong) transparent}
.shots:focus-visible{outline-offset:-2px;border-radius:var(--r-card)}
.shots li{scroll-snap-align:start}
.shots figcaption{margin-top:14px;font-size:.9375rem;line-height:1.5}
.shots figcaption strong{display:block;font-size:1rem}
.shots figcaption span{display:block;margin-top:2px;color:var(--n70);text-wrap:pretty}
@media (min-width:900px){
  .shots{margin-inline:0;padding:0;overflow:visible;grid-auto-flow:row;grid-auto-columns:auto;grid-template-columns:repeat(3,minmax(0,264px));justify-content:space-between;gap:48px 32px}
}

.panel{position:relative;isolation:isolate;overflow:hidden;padding:36px 24px;border:1px solid var(--border);border-radius:var(--r-panel);background:var(--surface)}
.panel::before{content:"";position:absolute;z-index:-1;inset:0;background:radial-gradient(70% 90% at 0% 0%,rgba(180,149,254,.12),transparent 70%)}
.panel h2{margin-top:12px}
.panel p{margin-top:18px;max-width:var(--measure);color:var(--text2)}
.panel .more{display:inline-flex;align-items:center;min-height:44px;margin-top:14px;font-weight:600}
@media (min-width:900px){
  .panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,38rem);gap:0 64px;align-items:start;padding:64px}
  .panel-head{grid-row:span 2}
  .panel p{margin-top:0}
}

.closing{text-align:center}
.closing .section-head{margin-inline:auto}
.closing-text{margin-top:16px;color:var(--text2);font-size:1.125rem}
.closing .cta{margin-top:32px;align-items:center}
`;

const doc = /* css */ `
.doc{padding:48px 0 72px}
@media (min-width:900px){.doc{padding:72px 0 104px}}
.doc .wrap>*{max-width:var(--measure)}
.doc .wrap>h1{max-width:none}
.after-links{list-style:none;padding:0;margin-top:40px;display:flex;flex-wrap:wrap;gap:0 24px}
.after-links a{display:inline-flex;align-items:center;min-height:44px}
`;

const gizlilik = /* css */ `
#politika p{margin-top:1.1em;color:var(--text2)}
#politika h1+p{margin-top:28px}
#politika .contact{margin-top:2em;padding-top:1.4em;border-top:1px solid var(--border)}
#politika .updated{margin-top:.35em}
`;

const destek = /* css */ `
.intro{margin-top:22px;color:var(--text2);font-size:1.125rem}
.btn{display:inline-flex;align-items:center;justify-content:center;margin-top:28px;min-height:48px;padding:0 24px;border-radius:var(--r-pill);background:var(--accent);color:var(--ink);font-weight:600;text-decoration:none}
.btn:hover{background:var(--accent-bright);color:var(--ink)}
.req{margin-top:40px;padding:22px 24px;border:1px solid var(--border);border-radius:var(--r-card);background:var(--surface)}
.req h2{font:500 .75rem/1.5 var(--mono);letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
.req dl{margin-top:14px;display:grid;gap:10px}
.req dl div{display:grid;gap:0 .4em}
.req dt{color:var(--n70);font-size:.9375rem}
.req dd{color:var(--text)}
@media (min-width:560px){.req dl div{grid-template-columns:minmax(0,13rem) minmax(0,1fr)}.req dt{font-size:inherit}}
.req p{margin-top:16px;padding-top:14px;border-top:1px solid var(--border);color:var(--text2);font-size:1rem}
.faq{margin-top:64px}
.faq-list{margin-top:24px}
.qa{padding:26px 0;border-top:1px solid var(--border)}
.qa:last-child{border-bottom:1px solid var(--border)}
.qa h3{scroll-margin-top:24px}
.qa h3:target{color:var(--accent-bright)}
.qa p{margin-top:10px;color:var(--text2)}
`;

// Collapse whitespace; the rules above contain no strings where it matters.
const min = (css: string) => css.replace(/\n\s*/g, "").trim();

export const landingCss = fontFaces + min(base + landing);
export const gizlilikCss = fontFaces + min(base + doc + gizlilik);
export const destekCss = fontFaces + min(base + doc + destek);
