"use server";

import { randomBytes } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { createComment, listComments } from "@/lib/db/queries";

export type CommentDto = {
  id: string;
  authorName: string;
  authorHandle: string;
  text: string;
  createdAt: string;
  mine: boolean;
};

/** Комментарии публичны: читать можно без аккаунта. */
export async function listCommentsAction(postId: string): Promise<CommentDto[]> {
  const viewer = await getCurrentUser();
  const rows = await listComments(postId);
  return rows.map((row) => ({
    id: row.id,
    authorName: row.author_name,
    authorHandle: row.author_handle,
    text: row.text,
    createdAt: row.created_at,
    mine: viewer?.id === row.author_id,
  }));
}

/** Пишет только авторизованный. Текст 1–300 символов. */
export async function addCommentAction(postId: string, text: string): Promise<CommentDto | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const clean = text.trim().slice(0, 300);
  if (!clean) return null;

  const created = await createComment({
    id: randomBytes(8).toString("hex"),
    postId,
    authorId: user.id,
    text: clean,
  });

  return {
    id: created.id,
    authorName: created.author_name,
    authorHandle: created.author_handle,
    text: created.text,
    createdAt: created.created_at,
    mine: true,
  };
}
