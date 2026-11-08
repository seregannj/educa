"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon, Verified } from "@/components/Icon";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { addCommentAction, listCommentsAction, type CommentDto } from "@/app/actions/comments";
import { deletePostAction, followHandleAction, toggleLikeAction } from "@/app/actions/content";
import { avatarFor } from "@/lib/avatar";
import type { Post } from "@/lib/types";

const CHANCE_COLOR: Record<string, string> = {
  "Высокий шанс": "var(--good)",
  "Средний шанс": "var(--warn)",
  "Низкий шанс": "var(--bad)",
};

const COMMENT_STYLES = `
  .cmts{margin-top:10px;display:flex;flex-direction:column;gap:10px}
  .cmt{display:flex;gap:9px;align-items:flex-start}
  .cmt-ava{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;
    font-size:11px;font-weight:800;flex:0 0 auto}
  .cmt-body{min-width:0;flex:1}
  .cmt-head{display:flex;align-items:center;gap:6px;font-size:13px}
  .cmt-name{font-weight:600}
  .cmt-mine{font-size:11px;color:var(--blue);font-weight:700}
  .cmt-text{font-size:14px;line-height:1.4;margin-top:1px}
  .cmt-form{display:flex;gap:8px;margin-top:10px}
  .cmt-input{flex:1;padding:9px 12px;border:1px solid var(--line);border-radius:12px;
    background:var(--bg);color:var(--text);font:inherit;font-size:13.5px}
  .cmt-send{border:none;background:var(--blue-soft);color:var(--blue);font-weight:700;
    font-size:12.5px;border-radius:10px;padding:0 14px;cursor:pointer;font-family:inherit}
  .cmt-send:disabled{opacity:.5;cursor:default}
  .cmt-empty{font-size:13px;color:var(--muted);margin-top:6px}
`;

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

  /* комментарии (только для постов из базы) */
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentDto[] | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  const avatar = avatarFor(post.name);
  const subKey = post.uniId ?? post.handle ?? post.id;
  const subscribed = post.db ? nowFollowing : isSubscribed(subKey);
  const liked = post.db ? dbLiked : isLiked(post.id);
  const likes = post.db ? dbLikes : post.likes + (liked ? 1 : 0);
  const saved = isSaved(post.id);
  const isOwn = Boolean(post.db && viewerId && post.authorId === viewerId);

  const openComments = () => {
    setCommentsOpen((open) => !open);
    if (!commentsOpen && comments === null && post.db) {
      setLoadingComments(true);
      startTransition(async () => {
        const rows = await listCommentsAction(post.id);
        setComments(rows);
        setLoadingComments(false);
      });
    }
  };

  const sendComment = () => {
    const text = commentText.trim();
    if (!text || sending) return;
    setSending(true);
    startTransition(async () => {
      const added = await addCommentAction(post.id, text);
      setSending(false);
      if (!added) {
        toast("Войди, чтобы комментировать");
        return;
      }
      setComments((prev) => (prev ? [...prev, added] : [added]));
      setCommentText("");
    });
  };

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
        <style>{COMMENT_STYLES}</style>
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
          <button
            className={`act${commentsOpen ? " liked" : ""}`}
            onClick={post.db ? openComments : () => router.push(post.handle ? `/u/${post.handle}` : "/")}
            aria-expanded={commentsOpen}
            aria-label="Комментарии"
          >
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

        {commentsOpen && post.db ? (
          <div className="cmts">
            {loadingComments ? (
              <div className="cmt-empty">Загружаем комментарии…</div>
            ) : comments && comments.length ? (
              comments.map((comment) => {
                const commentAvatar = avatarFor(comment.authorName);
                return (
                  <div className="cmt" key={comment.id}>
                    <span className="cmt-ava" style={{ background: commentAvatar.bg, color: commentAvatar.fg }}>
                      {commentAvatar.mono}
                    </span>
                    <div className="cmt-body">
                      <div className="cmt-head">
                        <span className="cmt-name">{comment.authorName}</span>
                        {comment.mine ? <span className="cmt-mine">это ты</span> : null}
                      </div>
                      <div className="cmt-text">{comment.text}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="cmt-empty">Комментариев пока нет — напиши первый.</div>
            )}

            {viewerId ? (
              <div className="cmt-form">
                <input
                  className="cmt-input"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") sendComment();
                  }}
                  placeholder="Написать комментарий…"
                  maxLength={300}
                  aria-label="Твой комментарий"
                />
                <button className="cmt-send" onClick={sendComment} disabled={sending || !commentText.trim()}>
                  {sending ? "…" : "Отправить"}
                </button>
              </div>
            ) : (
              <div className="cmt-empty">Войди, чтобы обсудить в комментариях.</div>
            )}
          </div>
        ) : null}
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
