import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { MyProfile } from "@/components/profile/MyProfile";
import { ProfileView } from "@/components/ProfileView";
import { getCurrentUser } from "@/lib/auth";
import { countUserStats, listPostsByAuthor } from "@/lib/db/queries";
import { dbPostToPost } from "@/lib/feed";

export const metadata: Metadata = { title: "Профиль" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <PageHeader title="Профиль" />
        <ProfileView />
      </>
    );
  }

  const [stats, posts] = await Promise.all([countUserStats(user.id), listPostsByAuthor(user.id, user.id)]);

  return (
    <>
      <PageHeader title="Профиль" />
      <MyProfile user={user} stats={stats} posts={posts.map(dbPostToPost)} />
    </>
  );
}
