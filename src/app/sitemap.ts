import type { MetadataRoute } from "next";
import { listPublishedRealisations } from "@/lib/db/public";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await listPublishedRealisations();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/realisations`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const realisationsRoutes: MetadataRoute.Sitemap = items.map((r) => ({
    url: `${SITE_URL}/realisations/${r.slug}`,
    lastModified: r.published_at ? new Date(r.published_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...realisationsRoutes];
}
