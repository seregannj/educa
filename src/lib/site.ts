/**
 * Единый источник правды для публичного адреса сайта.
 *
 * metadataBase, sitemap и robots собираются из него — домен не дублируется
 * строкой нигде больше. Приоритет: явный env → домен проекта на Vercel →
 * URL конкретного деплоя → localhost для разработки.
 */
function normalize(raw: string): string {
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

export const SITE_URL = normalize(
  process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000",
);
