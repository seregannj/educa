"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "./Icon";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Лента", icon: "home" },
  { href: "/vuzy", label: "Вузы", icon: "uni" },
  { href: "/tools", label: "Инструменты", icon: "tools" },
  { href: "/profile", label: "Профиль", icon: "user" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  /* На домашнем маршруте вкладками владеет TabShell — его док мгновенный. */
  const isHome = pathname === "/";

  // Переход уже начался — подсветка переключается сразу, без ожидания сервера.
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const activePath = pendingHref ?? pathname;
  const loading = pendingHref !== null && pendingHref !== pathname;

  return (
    <div className="app">
      <style>{".dock-hidden{display:none!important}"}</style>
      {loading ? <div className="routebar" aria-hidden="true" /> : null}

      <aside className="rail">
        <div>
          <Link href="/" className="rail-brand" aria-label="educa, на главную">
            educa
          </Link>
          <div className="rail-sub">карта твоего будущего</div>
        </div>

        <nav className="rail-nav" aria-label="Разделы">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={() => setPendingHref(item.href)}
              className={`rail-link${isActive(activePath, item.href) ? " on" : ""}`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
          <Link
            href="/favorites"
            prefetch
            onClick={() => setPendingHref("/favorites")}
            className={`rail-link${isActive(activePath, "/favorites") ? " on" : ""}`}
          >
            <Icon name="bookmark" />
            Избранное
          </Link>
          <Link
            href="/settings"
            prefetch
            onClick={() => setPendingHref("/settings")}
            className={`rail-link${isActive(activePath, "/settings") ? " on" : ""}`}
          >
            <Icon name="settings" />
            Настройки
          </Link>
        </nav>

        <Link href="/pwa" className="rail-cta">
          <Icon name="install" size={17} />
          Установить educa
        </Link>

        <div className="rail-foot">
          Открытые данные приёма-2026.
          <br />
          {new Date().getFullYear()} · <Link href="/proposals">предложить правку</Link>
        </div>
      </aside>

      <div className="screen">{children}</div>

      <nav
        className={`dock${isHome ? " dock-hidden" : ""}`}
        aria-label="Основная навигация"
      >
        {NAV.map((item) => {
          const active = isActive(activePath, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={() => setPendingHref(item.href)}
              className={`ditem${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
