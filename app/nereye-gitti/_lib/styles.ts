// Inline stylesheet for the Nereye Gitti pages ("Neon Gece" palette from the
// app's src/theme/colors.ts). Dark only, by design — like the app.

import { FONT_FACES } from "./fonts.generated";

const fontFaces = FONT_FACES.map(
  (f) =>
    `@font-face{font-family:"${f.family}";font-style:normal;font-weight:${f.weight};font-display:swap;src:url(${f.file}) format("woff2")}`,
).join("\n");

const base = /* css */ `
:root{
  color-scheme:dark;
  --bg:#050607;--bg-elevated:#0b0b0e;--surface:#0f0f12;--surface2:#131416;--surface3:#232428;
  --border:#2d2d32;--border-strong:#323237;
  --text:#f1f1f4;--text2:#bcbdc4;--n70:#9d9ea5;--muted:#8c8d93;--muted2:#7a7b81;
  --accent:#b495fe;--accent-bright:#c9b3fe;--gelir:#41f9c7;--gider:#ffa05f;--ink:#08090d;
  --sans:"Sora",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --r-card:14px;--r-pill:20px;--r-panel:28px;
  --gutter:20px;
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
strong{font-weight:600;color:var(--text)}
img,svg{display:block;max-width:100%;height:auto}
a{color:var(--accent);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em;transition:color .15s,background-color .15s,border-color .15s}
a:hover{color:var(--accent-bright)}
:focus-visible{outline:2px solid var(--accent-bright);outline-offset:3px;border-radius:6px}
::selection{background:rgba(180,149,254,.32);color:var(--text)}

.skip{position:absolute;left:12px;top:-200px;z-index:10;display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:var(--r-pill);background:var(--accent);color:var(--ink);font-weight:600;text-decoration:none}
.skip:focus{top:12px;color:var(--ink)}

.wrap{width:100%;max-width:calc(1120px + 2 * var(--gutter));margin-inline:auto;padding-inline:var(--gutter)}
.label{font:500 .75rem/1.5 var(--mono);letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
.label--accent{color:var(--accent)}
.label--keep{text-transform:none}
.meta{font:400 .8125rem/1.5 var(--mono);letter-spacing:.02em;color:var(--muted)}

/* Header */
.site-header{border-bottom:1px solid var(--border)}
.bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;min-height:64px}
.brand{display:inline-flex;align-items:center;gap:10px;min-height:44px;color:var(--accent);text-decoration:none;font:500 .9375rem/1 var(--mono);letter-spacing:.04em}
.brand:hover{color:var(--accent-bright)}
.brand img{width:28px;height:28px}
.nav{display:flex;gap:2px;margin-right:-10px}
.nav a{display:inline-flex;align-items:center;min-height:44px;padding:0 10px;border-radius:var(--r-pill);color:var(--text2);text-decoration:none;font-size:.9375rem}
.nav a:hover{color:var(--text);background:var(--surface2)}
.nav a[aria-current=page]{color:var(--text)}

/* Footer */
.site-footer{border-top:1px solid var(--border);padding:40px 0 48px;color:var(--n70);font-size:.9375rem}
.footer-brand{display:flex;align-items:center;gap:10px;color:var(--text);font-weight:600}
.footer-brand img{width:24px;height:24px}
.footer-links{list-style:none;padding:0;margin:12px 0 0 -2px;display:flex;flex-wrap:wrap;align-items:center}
.footer-links li{display:flex;align-items:center}
.footer-links li+li::before{content:"·";content:"·" / "";color:var(--muted2);padding:0 4px}
.footer-links a{display:inline-flex;align-items:center;min-height:44px;padding:0 2px}
.footer-copy{margin-top:12px}
.footer-tm{margin-top:6px;color:var(--muted2);font-size:.8125rem;line-height:1.5;max-width:68ch}

/* Buttons and calls to action */
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 24px;border-radius:var(--r-pill);background:var(--accent);color:var(--ink);font-weight:600;text-decoration:none}
.btn:hover{background:var(--accent-bright);color:var(--ink)}
.cta{display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.soon{display:inline-flex;align-items:center;gap:12px;min-height:48px;padding:0 20px;border:1px solid var(--border-strong);border-radius:var(--r-pill);background:var(--surface);color:var(--text);font-weight:600}
.soon::before{content:"";flex:none;width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px rgba(180,149,254,.16),0 0 14px rgba(180,149,254,.7)}
/* Apple badge: official artwork, unmodified; >=40px tall, clear space >= 1/4 of its height. */
.badge{display:inline-block;margin:13px 0;line-height:0;border-radius:10px}
.badge img{height:50px;width:auto}

/* Screenshot frame: plain rounded frame, radius ~6% of width, 1px border. */
.shot{aspect-ratio:1320/2868;border-radius:6%/2.762%;border:1px solid var(--border);overflow:hidden;background:var(--surface2)}
.shot img{width:100%;height:100%;object-fit:cover}
.shot--placeholder{display:grid;place-items:center;background:linear-gradient(180deg,#1c1d21,#131416)}
.shot--placeholder img{width:30%;height:auto;opacity:.16}

@media (prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}}
`;

const landing = /* css */ `
.hero{position:relative;isolation:isolate;padding:48px 0 72px}
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
@media (min-width:900px){
  .hero{padding:80px 0 112px}
  .hero-grid{grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:72px}
  .hero-visual{width:min(320px,100%)}
}

.section{padding:72px 0;border-top:1px solid var(--border)}
@media (min-width:900px){.section{padding:112px 0}}
.section-head{max-width:40em}
.section-head h2{margin-top:12px}

.features{list-style:none;padding:0;margin-top:40px;display:grid;gap:16px}
@media (min-width:640px){.features{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1000px){.features{grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}}
.card{height:100%;padding:24px;border:1px solid var(--border);border-radius:var(--r-card);background:var(--surface)}
.card h3{margin-top:20px}
.card p{margin-top:10px;color:var(--text2);font-size:1rem}
.tick{display:block;width:32px;height:6px;border-radius:3px;background:var(--accent);box-shadow:0 0 16px rgba(180,149,254,.45)}
.tick--gelir{background:var(--gelir);box-shadow:0 0 16px rgba(65,249,199,.4)}
.tick--gider{background:var(--gider);box-shadow:0 0 16px rgba(255,160,95,.4)}
.tick--cark{background:linear-gradient(90deg,var(--gider) 0 50%,var(--gelir) 50% 100%);box-shadow:-8px 0 16px rgba(255,160,95,.3),8px 0 16px rgba(65,249,199,.3)}

.shots{list-style:none;margin:40px calc(-1 * var(--gutter)) 0;padding:0 var(--gutter) 16px;display:grid;grid-auto-flow:column;grid-auto-columns:min(70%,250px);gap:16px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding-inline:var(--gutter);scrollbar-color:var(--border-strong) transparent}
.shots li{scroll-snap-align:start}
.shots figcaption{margin-top:14px;font-size:.9375rem;line-height:1.5}
.shots figcaption strong{display:block;font-size:1rem}
.shots figcaption span{display:block;margin-top:2px;color:var(--n70)}
@media (min-width:900px){
  .shots{margin-inline:0;padding:0;overflow:visible;grid-auto-flow:row;grid-auto-columns:auto;grid-template-columns:repeat(3,minmax(0,1fr));gap:48px 32px;justify-items:center}
  .shots li{width:100%;max-width:264px}
}

.panel{position:relative;isolation:isolate;overflow:hidden;padding:36px 24px;border:1px solid var(--border);border-radius:var(--r-panel);background:var(--surface)}
.panel::before{content:"";position:absolute;z-index:-1;inset:0;background:radial-gradient(70% 90% at 0% 0%,rgba(180,149,254,.12),transparent 70%)}
.panel p{margin-top:18px;max-width:68ch;color:var(--text2)}
.panel .more{display:inline-flex;align-items:center;min-height:44px;margin-top:14px;font-weight:600}
@media (min-width:900px){.panel{padding:64px}}

.closing{text-align:center}
.closing .section-head{margin-inline:auto}
.closing p.closing-text{margin-top:16px;color:var(--text2);font-size:1.125rem}
.closing .cta{margin-top:32px;align-items:center}
`;

const doc = /* css */ `
.doc{padding:48px 0 72px}
@media (min-width:900px){.doc{padding:72px 0 104px}}
.doc .wrap>*{max-width:68ch}
#politika p{margin-top:1.1em;color:var(--text2)}
#politika h1+p{margin-top:28px}
#politika .contact{margin-top:2em;padding-top:1.4em;border-top:1px solid var(--border)}
#politika .updated{margin-top:.35em}
.after-links{list-style:none;padding:0;margin-top:40px;display:flex;flex-wrap:wrap;gap:0 24px}
.after-links a{display:inline-flex;align-items:center;min-height:44px}

.intro{margin-top:22px;color:var(--text2);font-size:1.125rem}
.doc .btn{margin-top:28px}
.req{margin-top:40px;padding:22px 24px;border:1px solid var(--border);border-radius:var(--r-card);background:var(--surface)}
.req h2{font:500 .75rem/1.5 var(--mono);letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
.req dl{margin-top:12px;display:grid;gap:8px}
.req dl div{display:flex;flex-wrap:wrap;gap:0 .4em}
.req dt{color:var(--n70)}
.req dd{color:var(--text)}
.req p{margin-top:14px;padding-top:14px;border-top:1px solid var(--border);color:var(--text2);font-size:1rem}
.faq{margin-top:64px}
.faq-list{margin-top:24px}
.qa{padding:26px 0;border-top:1px solid var(--border)}
.qa:last-child{border-bottom:1px solid var(--border)}
.qa h3{scroll-margin-top:24px}
.qa h3:target{color:var(--accent-bright)}
.qa p{margin-top:10px;color:var(--text2)}
`;

export const landingCss = `${fontFaces}\n${base}\n${landing}`;
export const docCss = `${fontFaces}\n${base}\n${doc}`;
