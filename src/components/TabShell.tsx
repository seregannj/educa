"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { Feed } from "@/components/feed/Feed";
import { Catalog } from "@/components/catalog/Catalog";
import { PageHeader } from "@/components/PageHeader";
import { MyProfile } from "@/components/profile/MyProfile";
import { ProfileView } from "@/components/ProfileView";
import { meta, plural } from "@/lib/data";
import type { Post, Story } from "@/lib/types";
import type { Viewer } from "@/lib/auth";

type Tab = "feed" | "vuzy" | "tools" | "profile";

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: "feed", label: "Лента", icon: "home" },
  { id: "vuzy", label: "Вузы", icon: "uni" },
  { id: "tools", label: "Инструменты", icon: "tools" },
  { id: "profile", label: "Профиль", icon: "user" },
];

const TOOLS: { href: string; title: string; desc: string; icon: IconName }[] = [
  { href: "/tools/chances", title: "Калькулятор шансов", desc: "Введи баллы ЕГЭ — покажем программы, где ты проходишь по проходным 2026.", icon: "bolt" },
  { href: "/za-rubezhom", title: "Учёба за рубежом", desc: "Стипендии, которые реально покрывают обучение, и дедлайны на 2027.", icon: "globe" },
  { href: "/favorites", title: "Избранное", desc: "Посты и советы, которые ты сохранил, чтобы вернуться позже.", icon: "bookmark" },
  { href: "/proposals", title: "Предложить правку", desc: "Нашёл неточность в баллах или стоимости? Собери заявку за минуту.", icon: "table" },
  { href: "/pwa", title: "Приложение", desc: "Установи educa на телефон — работает как обычное приложение.", icon: "install" },
];

const SOON = [
  { title: "Сравнение вузов", desc: "До трёх программ рядом: баллы, места, стоимость." },
  { title: "Трекер дедлайнов", desc: "Напоминания о днях открытых дверей и приёме документов." },
];

/**
 * Домашний шелл: все главные вкладки живут в одном клиентском компоненте —
 * переключение мгновенное, состояние каждой вкладки сохраняется.
 * Док рендерится здесь; док AppShell скрывается на этом маршруте.
 */
export function TabShell({
  viewer,
  dbPosts,
  userStories,
  following,
}: {
  viewer: Viewer;
  dbPosts: Post[];
  userStories: Story[];
  following: string[];
}) {
  const [tab, setTab] = useState<Tab>("feed");

  /* Прячем док AppShell — на домашнем маршруте доком владеет TabShell. */
  useEffect(() => {
    document.documentElement.dataset.shell = "tabs";
    return () => {
      delete document.documentElement.dataset.shell;
    };
  }, []);

  const myPosts = viewer ? dbPosts.filter((post) => post.authorId === viewer.id) : [];
  const stats = {
    posts: myPosts.length,
    likesReceived: myPosts.reduce((sum, post) => sum + (post.likes ?? 0), 0),
    followers: following.length,
  };

  return (
    <>
      {/* Лента */}
      <div hidden={tab !== "feed"}>
        <Feed viewer={viewer} dbPosts={dbPosts} userStories={userStories} following={following} />
      </div>

      {/* Вузы */}
      <div hidden={tab !== "vuzy"}>
        <PageHeader
          title="Вузы"
          sub={`${meta.universities} вузов · ${meta.programs} программ · приём-2026`}
        />
        <Catalog />
      </div>

      {/* Инструменты */}
      <div hidden={tab !== "tools"}>
        <PageHeader title="Инструменты" sub="Мини-приложения educa" />
        <div className="tools">
          {TOOLS.map((tool) => (
            <Link href={tool.href} className="tool" key={tool.href}>
              <span className="tool-icon">
                <Icon name={tool.icon} size={20} />
              </span>
              <span>
                <span className="tool-title">{tool.title}</span>
                <span className="tool-desc" style={{ display: "block" }}>
                  {tool.desc}
                </span>
              </span>
            </Link>
          ))}
          {SOON.map((tool) => (
            <div className="tool" key={tool.title} style={{ opacity: 0.65 }}>
              <span className="tool-icon">
                <Icon name="sparkle" size={20} />
              </span>
              <span>
                <span className="tool-title">{tool.title}</span>
                <span className="tool-desc" style={{ display: "block" }}>
                  {tool.desc}
                </span>
              </span>
              <span className="tool-soon">скоро</span>
            </div>
          ))}
        </div>
        <div className="page">
          <div className="notice">
            Данные: {meta.universities} вузов, {meta.programs} программ, {meta.abroad} зарубежных маршрутов.
            Обновлено {new Date(meta.generatedAt).toLocaleDateString("ru-RU")}.
          </div>
        </div>
      </div>

      {/* Профиль */}
      <div hidden={tab !== "profile"}>
        {viewer ? (
          <MyProfile user={viewer} stats={stats} posts={myPosts} />
        ) : (
          <>
            <PageHeader title="Профиль" />
            <ProfileView />
          </>
        )}
      </div>

      {/* Док TabShell — мгновенное переключение */}
      <nav className="dock" aria-label="Основная навигация">
        {TABS.map((item) => (
          <button
            key={item.id}
            className={`ditem${tab === item.id ? " active" : ""}`}
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
