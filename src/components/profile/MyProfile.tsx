import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PostCard } from "@/components/feed/PostCard";
import { logoutAction } from "@/app/actions/auth";
import { avatarFor } from "@/lib/avatar";
import { plural } from "@/lib/data";
import type { CountUserStats } from "./types";
import { monthYear } from "@/lib/format";
import type { Post } from "@/lib/types";
import type { Viewer } from "@/lib/auth";

export function MyProfile({
  user,
  stats,
  posts,
}: {
  user: Viewer;
  stats: CountUserStats;
  posts: Post[];
}) {
  const avatar = avatarFor(user.name);

  return (
    <>
      <div className="uni-hero">
        <span className="ava-xl" style={{ background: avatar.bg, color: avatar.fg }}>
          {avatar.mono}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{user.name}</div>
          <div className="uni-meta" style={{ marginTop: 3 }}>
            @{user.handle} · с {monthYear(user.createdAt ?? new Date().toISOString())}
          </div>
          <div className="row mt-12" style={{ gap: 8 }}>
            <Link href="/stories/new" className="btn btn-small">
              <Icon name="plus" size={15} />
              История
            </Link>
            <Link href={`/u/${user.handle}`} className="btn btn-small btn-ghost">
              Мой профиль
            </Link>
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <b>{stats.posts}</b>
          <span>{plural(stats.posts, "пост", "поста", "постов")}</span>
        </div>
        <div className="stat">
          <b>{stats.likesReceived}</b>
          <span>{plural(stats.likesReceived, "лайк", "лайка", "лайков")}</span>
        </div>
        <div className="stat">
          <b>{stats.followers}</b>
          <span>{plural(stats.followers, "подписчик", "подписчика", "подписчиков")}</span>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 6 }}>
        <div className="list">
          <Link href="/favorites" className="list-item">
            <Icon name="bookmark" size={19} />
            Избранное
            <Icon name="chev" size={16} style={{ marginLeft: "auto", stroke: "var(--muted)", fill: "none" }} />
          </Link>
          <Link href="/settings" className="list-item">
            <Icon name="settings" size={19} />
            Настройки
            <Icon name="chev" size={16} style={{ marginLeft: "auto", stroke: "var(--muted)", fill: "none" }} />
          </Link>
          <form action={logoutAction}>
            <button className="list-item" type="submit">
              <Icon name="back" size={19} />
              Выйти из аккаунта
            </button>
          </form>
        </div>
      </div>

      <div className="section-title">Мои посты</div>

      {posts.length ? (
        posts.map((post) => <PostCard key={post.id} post={post} viewerId={user.id} />)
      ) : (
        <div className="empty">
          Постов пока нет. Напиши первый — прямо в ленте.
          <div className="mt-12">
            <Link href="/" className="btn">
              К ленте
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
