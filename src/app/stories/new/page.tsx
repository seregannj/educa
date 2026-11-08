import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { StoryComposer } from "@/components/stories/StoryComposer";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Новая история" };
export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader title="Новая история" sub={`@${user.handle}`} back="/" />
      <StoryComposer />
    </>
  );
}
