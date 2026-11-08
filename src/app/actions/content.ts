"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  createPost,
  createStory,
  deletePost,
  findUserByHandle,
  toggleFollow,
  toggleLike,
} from "@/lib/db/queries";

export type ContentState = { ok?: boolean; error?: string } | null;

const CATS = ["useful", "common", "memes"] as const;

export async function createPostAction(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Войди, чтобы публиковать" };

  const text = String(formData.get("text") ?? "").trim();
  const cat = String(formData.get("cat") ?? "common");

  if (text.length < 2) return { error: "Слишком коротко" };
  if (text.length > 600) return { error: "Максимум 600 символов" };
  if (!CATS.includes(cat as (typeof CATS)[number])) return { error: "Неизвестная рубрика" };

  await createPost({ id: randomUUID(), authorId: user.id, cat, text });
  revalidatePath("/");
  revalidatePath(`/u/${user.handle}`);
  revalidatePath("/profile");
  return { ok: true };
}

export async function deletePostAction(postId: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  const removed = await deletePost(postId, user.id);
  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: removed };
}

export async function createStoryAction(_prev: ContentState, formData: FormData): Promise<ContentState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Войди, чтобы публиковать истории" };

  const slides = [1, 2, 3]
    .map((index) => ({
      title: String(formData.get(`title-${index}`) ?? "").trim(),
      text: String(formData.get(`text-${index}`) ?? "").trim(),
    }))
    .filter((slide) => slide.title.length > 0 || slide.text.length > 0);

  if (!slides.length) return { error: "Добавь хотя бы один слайд" };
  if (slides.some((slide) => slide.title.length > 80 || slide.text.length > 240)) {
    return { error: "Заголовок — до 80 символов, текст — до 240" };
  }

  await createStory({ id: randomUUID(), authorId: user.id, slides });
  revalidatePath("/");
  return { ok: true };
}

export async function toggleLikeAction(
  postId: string,
): Promise<{ requiresAuth?: boolean; liked?: boolean; likes?: number }> {
  const user = await getCurrentUser();
  if (!user) return { requiresAuth: true };
  const result = await toggleLike(postId, user.id);
  revalidatePath("/");
  return result;
}

export async function toggleFollowAction(
  target: string,
): Promise<{ requiresAuth?: boolean; following?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { requiresAuth: true };
  if (target === user.id) return { following: false };
  const result = await toggleFollow(user.id, target);
  revalidatePath("/");
  return result;
}

export async function followHandleAction(
  handle: string,
): Promise<{ requiresAuth?: boolean; following?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { requiresAuth: true };
  const target = await findUserByHandle(handle);
  if (!target || target.id === user.id) return { following: false };
  const result = await toggleFollow(user.id, target.id);
  revalidatePath("/");
  revalidatePath(`/u/${handle}`);
  return result;
}

