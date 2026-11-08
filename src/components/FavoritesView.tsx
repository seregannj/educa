"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PostCard } from "@/components/feed/PostCard";
import { useAppState } from "@/components/providers/AppStateProvider";
import { posts } from "@/data/posts";

export function FavoritesView() {
  const { saved, ready } = useAppState();
  const list = posts.filter((post) => saved.includes(post.id));

  if (!ready) return <div className="empty">Загружаем…</div>;

  if (!list.length) {
    return (
      <div className="empty" style={{ paddingTop: 48 }}>
        <Icon name="bookmark" size={54} />
        <b style={{ display: "block", color: "var(--text)", marginBottom: 6 }}>Пока пусто</b>
        Сохраняй посты через меню «⋮» — они появятся здесь и будут доступны без сети.
        <div style={{ marginTop: 14 }}>
          <Link href="/" className="btn">
            Смотреть ленту
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="notice" style={{ margin: "14px 16px 0" }}>
        Сохранено {list.length}. Избранное хранится на этом устройстве.
      </div>
      {list.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
