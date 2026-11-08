import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "educa — карта твоего будущего",
    short_name: "educa",
    description:
      "Проходные баллы, программы вузов и шансы поступления. Открытые данные приёма-2026.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1E8FE0",
    lang: "ru",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Каталог вузов", url: "/vuzy" },
      { name: "Калькулятор шансов", url: "/tools/chances" },
      { name: "Зарубежные стипендии", url: "/za-rubezhom" },
    ],
  };
}
