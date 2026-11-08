"use client";

import { useState } from "react";
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
  const [tab, setTab] = useState<Tab>("subs");
  const { isSubscribed } = useAppState();

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

  return (
    <>
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

      <main className="main">
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
