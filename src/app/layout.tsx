import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../../fonts/pershotravneva55.css";
import { AppShell } from "@/components/AppShell";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AppStateProvider } from "@/components/providers/AppStateProvider";
import { ServiceWorker } from "@/components/ServiceWorker";
import { posts } from "@/data/posts";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "educa — карта твоего будущего",
    template: "%s · educa",
  },
  description:
    "Вузы Москвы, проходные баллы приёма-2026, калькулятор шансов и бесплатные маршруты обучения за рубежом. Без рекламной ленты и воды.",
  applicationName: "educa",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "educa", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "educa",
    title: "educa — карта твоего будущего",
    description: "Проходные баллы, программы вузов и шансы поступления — в одном месте.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f12" },
  ],
};

/** Тема применяется до первой отрисовки, чтобы не было вспышки белого. */
const THEME_SCRIPT = `
try {
  var saved = localStorage.getItem('educa:theme');
  var theme = saved === 'dark' || saved === 'light'
    ? saved
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
} catch (e) {}
`;

const defaultSubs = posts
  .filter((post) => post.subscribed)
  .map((post) => post.uniId ?? post.handle ?? post.id);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AppStateProvider defaultSubs={defaultSubs}>
              <AppShell>{children}</AppShell>
              <ServiceWorker />
            </AppStateProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
