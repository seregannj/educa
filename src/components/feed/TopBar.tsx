"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAppState } from "@/components/providers/AppStateProvider";
import type { Story } from "@/lib/types";

export function TopBar({ stories }: { stories: Story[] }) {
  const { theme, toggleTheme } = useTheme();
  const { isSeen } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 110);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuOpen]);

  return (
    <header className="topbar">
      <div className={`hstack${collapsed ? " on" : ""}`} aria-hidden={!collapsed}>
        {stories.slice(0, 3).map((story, index) => (
          <span
            key={story.id}
            className={`sc${isSeen(story.id) ? " seen" : ""}`}
            style={{ left: index * 18, zIndex: 30 - index }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="sin" style={{ background: story.bg, color: story.fg }}>
              {story.mono}
            </span>
          </span>
        ))}
      </div>

      <button
        className="wordmark"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="educa — наверх"
      >
        educa
      </button>

      <div className="topbar-actions">
        <Link href="/search" className="hicon" aria-label="Поиск">
          <Icon name="search" />
        </Link>

        <button
          ref={buttonRef}
          className="hicon"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Меню"
          aria-expanded={menuOpen}
        >
          <Icon name="dots" />
        </button>

        {menuOpen ? (
          <div className="menu" ref={menuRef} role="menu">
            <Link href="/settings" onClick={() => setMenuOpen(false)}>
              <Icon name="settings" size={17} />
              Настройки
            </Link>
            <Link href="/favorites" onClick={() => setMenuOpen(false)}>
              <Icon name="bookmark" size={17} />
              Избранное
            </Link>
            <button
              onClick={(event) => {
                toggleTheme({ x: event.clientX, y: event.clientY });
                setMenuOpen(false);
              }}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
              {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
