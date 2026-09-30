import type { MetadataRoute } from "next";
import { site } from "@/data";

/**
 * Only the home page exists, so only the home page is listed. `sitemap.ts`
 * generates the matching `sitemap.xml`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
