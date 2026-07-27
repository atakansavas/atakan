// Real Dalyan footage from the San·ai shoots, web-optimised into public/san-ai/.
// The Place section's cinematic plate uses the local drone loop; the small
// translucent facet previews beneath it and the Feed reels are lean local
// clips; the footer's ambient background streams from the original CloudFront
// clip. Sources live in the sibling `sanai` project (videos/web) and are
// re-encoded lean before committing.
const BASE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P";

export const videos = {
  // Featured drone loop of the venue — the Place section's cinematic plate.
  hero: "/san-ai/hero.mp4",

  // Feed reels (local web-optimised).
  feedInstagram: "/san-ai/feed-instagram.mp4",
  feedTiktok: "/san-ai/feed-tiktok.mp4",
  feedYoutube: "/san-ai/feed-youtube.mp4",

  // Footer ambient background — original CloudFront clip (footer unchanged).
  rhythm: `${BASE}/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4`,
} as const;
