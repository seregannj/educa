"use server";

import { randomBytes } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { createComment, listComments } from "@/lib/db/queries";
import { hitLimit } from "@/lib/rate-limit";

export type CommentDto = {
  id: string;
  authorName: string;
  authorHandle: string;
  text: string;
  createdAt: string;
  mine: boolean;
};

/** Результат записи: ошибка читается формой, а не угадывается по null. */
export type AddCommentResult = { ok: true; comment: CommentDto } | { ok: false; error: string };

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

/** Пишет только авторизованный. Текст 1–300 символов, не чаще 10 в минуту. */
export async function addCommentAction(postId: string, text: string): Promise<AddCommentResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Войди, чтобы комментировать" };

  if (hitLimit(`comment:${user.id}`, 10, 60_000)) {
    return { ok: false, error: "Слишком много комментариев подряд. Подожди минуту." };
  }

  const clean = text.trim().slice(0, 300);
  if (!clean) return { ok: false, error: "Пустой комментарий" };

  const created = await createComment({
    id: randomBytes(8).toString("hex"),
    postId,
    authorId: user.id,
    text: clean,
  });

  return {
    ok: true,
    comment: {
      id: created.id,
      authorName: created.author_name,
      authorHandle: created.author_handle,
      text: created.text,
      createdAt: created.created_at,
      mine: true,
    },
  };
}
