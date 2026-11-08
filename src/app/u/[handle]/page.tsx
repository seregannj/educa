import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/feed/PostCard";
import { FollowButton } from "@/components/profile/FollowButton";
import { authorByHandle, posts as editorialPosts } from "@/data/posts";
import { avatarFor } from "@/lib/avatar";
import { getCurrentUser } from "@/lib/auth";
import { countUserStats, findUserByHandle, isFollowing, listPostsByAuthor } from "@/lib/db/queries";
import { dbPostToPost } from "@/lib/feed";
import { monthYear } from "@/lib/format";
import { plural } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const user = await findUserByHandle(handle);
  if (user) return { title: user.name };
  const author = authorByHandle(handle);
  return { title: author ? author.name : "Профиль не найден" };
}

export default async function AuthorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const viewer = await getCurrentUser();
  const user = await findUserByHandle(handle);

  if (user) {
    const [stats, posts, following] = await Promise.all([
      countUserStats(user.id),
      listPostsByAuthor(user.id, viewer?.id ?? ""),
      viewer ? isFollowing(viewer.id, user.id) : Promise.resolve(false),
    ]);
    const avatar = avatarFor(user.name);
    const isSelf = viewer?.id === user.id;

    return (
      <>
        <PageHeader title={user.name} sub={`@${user.handle}`} back="/" />

        <div className="uni-hero">
          <span className="ava-xl" style={{ background: avatar.bg, color: avatar.fg }}>
            {avatar.mono}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{user.name}</div>
            <div className="uni-meta" style={{ marginTop: 3 }}>
              @{user.handle} · с {monthYear(user.created_at)}
            </div>
            <div className="row mt-12" style={{ gap: 8 }}>
              {isSelf ? (
                <Link href="/profile" className="btn btn-small btn-ghost">
                  Редактировать профиль
                </Link>
              ) : (
                <FollowButton handle={user.handle} initial={following} />
              )}
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

        <div className="section-title">Посты</div>

        {posts.length ? (
          posts.map((post) => (
            <PostCard key={post.id} post={dbPostToPost(post)} viewerId={viewer?.id} followed={following} />
          ))
        ) : (
          <div className="empty">Пока без постов.</div>
        )}
      </>
    );
  }

  // Редакционные авторы (демо-лента) остаются доступными по прежним адресам.
  const author = authorByHandle(handle);
  if (!author) notFound();

  const own = editorialPosts.filter((post) => post.handle === handle);
  const likes = own.reduce((sum, post) => sum + post.likes, 0);
  const avatar = avatarFor(author.name);

  return (
    <>
      <PageHeader title={author.name} sub={`@${handle}`} back="/" />

      <div className="uni-hero">
        <span className="ava-xl" style={{ background: avatar.bg, color: avatar.fg }}>
          {avatar.mono}
        </span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{author.name}</div>
          <div className="uni-meta" style={{ marginTop: 3 }}>
            Пишет в educa · {own.length} постов
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <b>{own.length}</b>
          <span>постов</span>
        </div>
        <div className="stat">
          <b>{likes}</b>
          <span>лайков</span>
        </div>
        <div className="stat">
          <b>{own.reduce((sum, post) => sum + post.replies, 0)}</b>
          <span>ответов</span>
        </div>
      </div>

      <div className="section-title">Посты</div>

      {own.map((post) => (
        <PostCard key={post.id} post={post} viewerId={viewer?.id} />
      ))}

      <div className="notice" style={{ margin: "16px" }}>
        Это редакционный профиль из демо-ленты. Зарегистрируйся — и здесь будет твой настоящий профиль.
      </div>
    </>
  );
}
