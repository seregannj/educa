"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Composer, LoginCta } from "./Composer";
import { DailyTask } from "./DailyTask";
import { EndOfFeed } from "./EndOfFeed";
import { PostCard } from "./PostCard";
import { StoriesRow } from "./Stories";
import { TopBar } from "./TopBar";
import { posts as editorialPosts } from "@/data/posts";
import { stories as editorialStories } from "@/data/stories";
import { useAppState } from "@/components/providers/AppStateProvider";
import type { Post, Story } from "@/lib/types";

type Tab = "subs" | "useful" | "offtopic";

type Viewer = { id: string; name: string; handle: string } | null;

const subKey = (post: Post) => post.uniId ?? post.handle ?? post.id;

const PTR_STYLES = `
  .ptr{height:0;opacity:0;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:9px;transition:opacity .2s}
  .ptrring{width:21px;height:21px;stroke:var(--blue);fill:none;stroke-width:3;stroke-linecap:round;transition:transform .2s}
  .ptrring.ready{transform:rotate(180deg)}
  .ptrring.spin{animation:ptrspin .8s linear infinite}
  @keyframes ptrspin{to{transform:rotate(360deg)}}
  .ptrlabel{font-size:12px;color:var(--muted);font-weight:600}
  body{overscroll-behavior-y:contain}
`;

export function Feed({
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
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("subs");
  const { isSubscribed } = useAppState();

  /* pull-to-refresh */
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(0);
  const pullStart = useRef<number | null>(null);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      pullStart.current = !refreshing && window.scrollY <= 0 ? event.touches[0].clientY : null;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (pullStart.current === null || refreshing) return;
      const dy = event.touches[0].clientY - pullStart.current;
      if (dy > 0 && window.scrollY <= 0) {
        event.preventDefault();
        setPull(Math.min(110, dy / 2.2));
      }
    };
    const onTouchEnd = () => {
      if (pullStart.current === null || refreshing) {
        pullStart.current = null;
        return;
      }
      if (pull >= 60) {
        setRefreshing(true);
        setPull(60);
        setTimeout(() => {
          // Свежие данные с сервера: без refresh() «обновление» лишь
          // перерисовывало шелл со старыми пропсами.
          router.refresh();
          setRefreshedAt(Date.now());
          setRefreshing(false);
          setPull(0);
        }, 900);
      } else {
        setPull(0);
      }
      pullStart.current = null;
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pull, refreshing, router]);

  const allStories = [...userStories, ...editorialStories];

  const editorial = editorialPosts.filter((post) => {
    if (tab === "subs") return isSubscribed(subKey(post));
    if (tab === "useful") return post.cat === "useful" || post.cat === "uni";
    return post.cat === "common" || post.cat === "memes";
  });

  const fromDb = dbPosts.filter((post) => {
    if (tab === "subs") {
      if (!viewer) return false;
      return post.authorId === viewer.id || following.includes(post.authorId ?? "");
    }
    if (tab === "useful") return post.cat === "useful" || post.cat === "uni";
    return post.cat === "common" || post.cat === "memes";
  });

  const list = [...fromDb, ...editorial];
  const empty = list.length === 0;
  const ready = pull >= 60;

  return (
    <>
      <style>{PTR_STYLES}</style>

      <div className="ptr" style={{ height: refreshing ? 60 : pull, opacity: pull > 0 || refreshing ? 1 : 0 }}>
        <svg className={`ptrring${refreshing ? " spin" : ready ? " ready" : ""}`} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 9 9" />
        </svg>
        <span className="ptrlabel">
          {refreshing ? "Обновляем…" : ready ? "Отпусти — обновим" : "Тяни вниз…"}
        </span>
      </div>

      <TopBar stories={allStories} />
      <StoriesRow stories={allStories} canCreate={Boolean(viewer)} />

      <div className="tabwrap">
        <div className="segbar" role="tablist" aria-label="Лента">
          <button
            role="tab"
            aria-selected={tab === "subs"}
            className={`seg whole${tab === "subs" ? " active" : ""}`}
            onClick={() => setTab("subs")}
          >
            Подписки
          </button>
          <div className="seghalf">
            <button
              role="tab"
              aria-selected={tab === "useful"}
              className={`seg${tab === "useful" ? " active" : ""}`}
              onClick={() => setTab("useful")}
            >
              Полезное
            </button>
            <span className="seghr" />
            <button
              role="tab"
              aria-selected={tab === "offtopic"}
              className={`seg${tab === "offtopic" ? " active" : ""}`}
              onClick={() => setTab("offtopic")}
            >
              Офтопик
            </button>
          </div>
        </div>
      </div>

      <main className="main" key={refreshedAt}>
        {viewer ? (
          <Composer name={viewer.name} />
        ) : (
          <LoginCta text="Публикуй посты и истории — нужен аккаунт" />
        )}

        {tab === "useful" ? <DailyTask /> : null}

        {empty ? (
          <div className="empty">
            {tab === "subs"
              ? "Подпишись на вузы и авторов — их посты появятся здесь."
              : "Здесь пока пусто. Напиши первый пост — он появится сразу."}
          </div>
        ) : (
          list.map((post) => <PostCard key={post.id} post={post} viewerId={viewer?.id} />)
        )}

        <EndOfFeed />
      </main>
    </>
  );
}
