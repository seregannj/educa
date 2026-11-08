import { Feed } from "@/components/feed/Feed";
import { getCurrentUser } from "@/lib/auth";
import { followingIds, listFeedPosts, listStories } from "@/lib/db/queries";
import { dbPostToPost, dbStoryToStory } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  const [posts, stories, following] = await Promise.all([
    listFeedPosts(user?.id ?? ""),
    listStories(6),
    user ? followingIds(user.id) : Promise.resolve([]),
  ]);

  return (
    <Feed
      viewer={user ? { id: user.id, name: user.name, handle: user.handle } : null}
      dbPosts={posts.map(dbPostToPost)}
      userStories={stories.map(dbStoryToStory)}
      following={following}
    />
  );
}
