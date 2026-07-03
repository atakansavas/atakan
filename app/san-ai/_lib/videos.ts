// Cinematic section clips (CloudFront). The hero uses its own video in Hero.tsx;
// these drive the video-rich sections below it.
const BASE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P";

export const videos = {
  place: `${BASE}/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4`,
  rhythm: `${BASE}/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4`,
  feedInstagram: `${BASE}/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4`,
  feedTiktok: `${BASE}/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4`,
  feedYoutube: `${BASE}/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4`,
} as const;
