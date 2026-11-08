"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon, Verified } from "@/components/Icon";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { deletePostAction, followHandleAction, toggleLikeAction } from "@/app/actions/content";
import { avatarFor } from "@/lib/avatar";
import type { Post } from "@/lib/types";

const CHANCE_COLOR: Record<string, string> = {
  "Высокий шанс": "var(--good)",
  "Средний шанс": "var(--warn)",
  "Низкий шанс": "var(--bad)",
};

export function PostCard({
  post,
  viewerId,
  followed = false,
}: {
  post: Post;
  viewerId?: string;
  followed?: boolean;
}) {
  const { isLiked, toggleLike, isSaved, toggleSaved, isSubscribed, toggleSub } = useAppState();
  const toast = useToast();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dbLiked, setDbLiked] = useState(post.liked ?? false);
  const [dbLikes, setDbLikes] = useState(post.likesCount ?? post.likes);
  const [nowFollowing, setNowFollowing] = useState(followed);
  const [hidden, setHidden] = useState(false);
  const [, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const avatar = avatarFor(post.name);
  const subKey = post.uniId ?? post.handle ?? post.id;
  const subscribed = post.db ? nowFollowing : isSubscribed(subKey);
  const liked = post.db ? dbLiked : isLiked(post.id);
  const likes = post.db ? dbLikes : post.likes + (liked ? 1 : 0);
  const saved = isSaved(post.id);
  const isOwn = Boolean(post.db && viewerId && post.authorId === viewerId);

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

  if (hidden) return null;

  const onLike = () => {
    if (!post.db) {
      toggleLike(post.id);
      return;
    }
    // Оптимистично: интерфейс не ждёт сервер.
    const nextLiked = !dbLiked;
    setDbLiked(nextLiked);
    setDbLikes((count) => count + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeAction(post.id);
      if (result.requiresAuth) {
        setDbLiked(!nextLiked);
        setDbLikes((count) => count + (nextLiked ? -1 : 1));
        toast("Войди, чтобы ставить лайки");
        return;
      }
      setDbLiked(Boolean(result.liked));
      setDbLikes(result.likes ?? 0);
    });
  };

  const onSubscribe = () => {
    if (!post.db) {
      toggleSub(subKey);
      toast(`Вы подписались на ${post.name}`);
      return;
    }
    if (!post.handle) return;
    const next = !nowFollowing;
    setNowFollowing(next);
    startTransition(async () => {
      const result = await followHandleAction(post.handle as string);
      if (result.requiresAuth) {
        setNowFollowing(!next);
        toast("Войди, чтобы подписаться");
        return;
      }
      setNowFollowing(Boolean(result.following));
    });
  };

  const nameNode = post.uniId ? (
    <Link href={`/vuzy/${post.uniId}`} className="pname">
      {post.name}
    </Link>
  ) : post.handle ? (
    <Link href={`/u/${post.handle}`} className="pname">
      {post.name}
    </Link>
  ) : (
    <span className="pname">{post.name}</span>
  );

  // window доступен только в браузере — считаем адрес в момент клика.
  const shareUrl = () =>
    post.handle
      ? `${window.location.origin}/u/${post.handle}`
      : `${window.location.origin}/#${post.id}`;

  return (
    <article className="post">
      <div className="pleft">
        <span className="ava" style={{ background: avatar.bg, color: avatar.fg }}>
          {avatar.mono}
        </span>
        {!subscribed && !isOwn ? (
          <button className="subava" onClick={onSubscribe} aria-label={`Подписаться на ${post.name}`}>
            <Icon name="plus" size={14} />
          </button>
        ) : null}
      </div>

      <div className="pbody">
        <div className="prow">
          {nameNode}
          {post.verified ? <Verified /> : null}
          <span className="ptime">·</span>
          <span className="ptime">{post.time}</span>
        </div>

        <div className="ptext">{post.text}</div>

        {post.chances ? (
          <div className="attach">
            <div className="attach-head">Профиль абитуриента · 287 · М+И+А</div>
            {post.chances.map((chance) => {
              const color = CHANCE_COLOR[chance.level] ?? "var(--muted)";
              return (
                <div className="chance-row" key={chance.name + chance.program}>
                  <span className="cdot" style={{ background: color }} />
                  <div>
                    <div className="cname">{chance.name}</div>
                    <div className="cprog">{chance.program}</div>
                  </div>
                  <span className="cchance" style={{ color }}>
                    {chance.level}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}

        {post.chip ? (
          <Link href="/vuzy" className="attach-row">
            <Icon name="table" size={16} className="ticon2" />
            <span>{post.chip}</span>
            <Icon name="chev" size={15} className="chev" />
          </Link>
        ) : null}

        {post.meme ? (
          <div className="attach">
            <div className="attach-head">Мем</div>
            <div className="attach-text">{post.meme}</div>
          </div>
        ) : null}

        <div className="pacts">
          <button
            className={`act${liked ? " liked" : ""}`}
            onClick={onLike}
            aria-pressed={liked}
            aria-label="Нравится"
          >
            <Icon name="heart" size={18} />
            <span>{likes}</span>
          </button>
          <button className="act" onClick={() => router.push(post.handle ? `/u/${post.handle}` : "/")}>
            <Icon name="reply" size={18} />
            <span>{post.replies}</span>
          </button>
          <button className="act" onClick={() => toast("Репосты включим в следующем обновлении")}>
            <Icon name="repost" size={18} />
            <span>{post.reposts}</span>
          </button>
          <button
            className="act"
            aria-label="Поделиться"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl());
                toast("Ссылка скопирована");
              } catch {
                toast("Не удалось скопировать ссылку");
              }
            }}
          >
            <Icon name="share" size={18} />
          </button>
        </div>
      </div>

      <button
        ref={buttonRef}
        className="pmore"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Действия с постом"
        aria-expanded={menuOpen}
      >
        <Icon name="dots" size={15} />
      </button>

      {menuOpen ? (
        <div className="pmenu" ref={menuRef}>
          <button
            onClick={() => {
              toggleSaved(post.id);
              toast(saved ? "Удалено из избранного" : "Сохранено в избранное");
              setMenuOpen(false);
            }}
          >
            <Icon name="bookmark" size={16} />
            {saved ? "Убрать из избранного" : "В избранное"}
          </button>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl());
                toast("Ссылка скопирована");
              } catch {
                toast("Не удалось скопировать ссылку");
              }
              setMenuOpen(false);
            }}
          >
            <Icon name="link" size={16} />
            Скопировать ссылку
          </button>

          {isOwn ? (
            <button
              onClick={() => {
                setMenuOpen(false);
                setHidden(true);
                startTransition(async () => {
                  const result = await deletePostAction(post.id);
                  if (!result.ok) {
                    setHidden(false);
                    toast("Не удалось удалить пост");
                    return;
                  }
                  toast("Пост удалён");
                  router.refresh();
                });
              }}
            >
              <Icon name="close" size={16} />
              Удалить пост
            </button>
          ) : (
            <button
              onClick={() => {
                toast("Жалобы появятся вместе с модерацией");
                setMenuOpen(false);
              }}
            >
              <Icon name="flag" size={16} />
              Пожаловаться
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}
