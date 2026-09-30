import type { MetadataRoute } from "next";
import { site } from "@/data";

/**
 * Single-page site: one URL, updated whenever the build runs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
