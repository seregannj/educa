import type { DbPost, DbStory } from "@/lib/db/queries";
import { avatarFor } from "@/lib/avatar";
import { timeAgo } from "@/lib/format";
import type { Post, Story } from "@/lib/types";

const CATS = new Set(["useful", "common", "memes"]);

export function dbPostToPost(row: DbPost): Post {
  const cat = CATS.has(row.cat) ? (row.cat as Post["cat"]) : "common";
  return {
    id: row.id,
    db: true,
    authorId: row.author_id,
    cat,
    name: row.author_name,
    handle: row.author_handle,
    time: timeAgo(row.created_at),
    text: row.text,
    likes: row.likes,
    likesCount: row.likes,
    liked: row.liked,
    replies: 0,
    reposts: 0,
  };
}

export function dbStoryToStory(row: DbStory): Story {
  const avatar = avatarFor(row.author_name);
  return {
    id: row.id,
    uniId: "",
    name: row.author_name,
    handle: row.author_handle,
    mono: avatar.mono,
    bg: avatar.bg,
    fg: avatar.fg,
    slides: row.slides.length ? row.slides : [{ title: row.author_name, text: "Без текста" }],
  };
}
