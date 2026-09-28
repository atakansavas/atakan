import type { MetadataRoute } from "next";
import { LAST_MODIFIED, PATHS, SITE_ORIGIN } from "./nereye-gitti/_lib/config";

// Home plus the Nereye Gitti pages. (Other site pages currently declare the
// home page as their canonical, so listing them would only add noise.)
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_ORIGIN },
    ...Object.values(PATHS).map((p) => ({ url: `${SITE_ORIGIN}${p}`, lastModified: LAST_MODIFIED })),
  ];
}
