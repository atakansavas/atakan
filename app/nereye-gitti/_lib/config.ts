// Nereye Gitti — iPhone app pages (/nereye-gitti, /gizlilik, /destek).
//
// These three URLs are hard-coded in App Store Connect (Marketing, Privacy
// Policy and Support URL) and inside the app's Settings screen. Never rename
// or redirect them.

/**
 * The single launch switch.
 *
 * false (pre-launch, default): no App Store badge and no apps.apple.com link
 *   anywhere; the call-to-action reads "Çok yakında App Store'da."
 * true (live): the official Turkish "Download on the App Store" badge shows
 *   in the hero and the closing section gets a text link (Apple allows one
 *   badge per layout); both go to APP_STORE_URL.
 *
 * Flip only after the owner says "Nereye Gitti yayında", then commit + push
 * (Railway deploys main) and re-run the acceptance checks.
 */
export const NEREYE_GITTI_APP_STORE_LIVE = false;

export const APP_STORE_ID = "6812267051";
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;

export const SITE_ORIGIN = "https://benatakan.com";
export const BASE_PATH = "/nereye-gitti";

export const PATHS = {
  tanitim: BASE_PATH,
  gizlilik: `${BASE_PATH}/gizlilik`,
  destek: `${BASE_PATH}/destek`,
} as const;

export const SUPPORT_EMAIL = "info@benatakan.com";

export const OG_IMAGE = {
  url: `${SITE_ORIGIN}${BASE_PATH}/og.png`,
  width: 1200,
  height: 630,
  alt: 'Nereye Gitti uygulama simgesi ve "Gelir gider ve bütçe takibi" yazısı',
} as const;

/**
 * Official black Turkish badge from Apple Marketing Tools
 * (toolbox.marketingtools.apple.com, fetched 2026-09-28), self-hosted and
 * unmodified. Used only when live. Intrinsic size 151.29 × 40; shown 50px tall.
 */
export const APP_STORE_BADGE = {
  src: `${BASE_PATH}/app-store-rozeti-tr.svg`,
  // Same text as printed on the badge (Apple draws a typographic apostrophe).
  alt: "App Store’dan İndirin",
  width: 151,
  height: 40,
} as const;

/** Last-modified date for the sitemap entries of these pages. */
export const LAST_MODIFIED = "2026-09-28";
