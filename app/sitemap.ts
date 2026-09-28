import type { MetadataRoute } from "next";
import { LAST_MODIFIED, PATHS, SITE_ORIGIN } from "./nereye-gitti/_lib/config";

// Public pages (see README). The Nereye Gitti pages carry a lastmod.
const SITE_PAGES = ["/", "/cv", "/projects", "/san-ai", "/mesai", "/presentations"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...SITE_PAGES.map((p) => ({ url: `${SITE_ORIGIN}${p === "/" ? "" : p}` })),
    ...Object.values(PATHS).map((p) => ({ url: `${SITE_ORIGIN}${p}`, lastModified: LAST_MODIFIED })),
  ];
}
