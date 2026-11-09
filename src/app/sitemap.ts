import type { MetadataRoute } from "next";
import { universities } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

/** Статические разделы; карточки вузов выводим из собранных данных. */
const STATIC_PATHS: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/vuzy", priority: 0.9 },
  { path: "/tools/chances", priority: 0.9 },
  { path: "/za-rubezhom", priority: 0.9 },
  { path: "/tools/compare", priority: 0.7 },
  { path: "/tools/deadlines", priority: 0.7 },
  { path: "/tools", priority: 0.6 },
  { path: "/search", priority: 0.5 },
  { path: "/pwa", priority: 0.4 },
  { path: "/proposals", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "weekly",
    priority,
  }));

  for (const university of universities) {
    entries.push({
      url: `${SITE_URL}/vuzy/${university.id}`,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
