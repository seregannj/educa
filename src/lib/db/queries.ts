import { getDb } from "./index";

export type DbUser = {
  id: string;
  email: string;
  handle: string;
  name: string;
  bio: string;
  created_at: string;
};

export type DbPost = {
  id: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  cat: string;
  text: string;
  created_at: string;
  likes: number;
  liked: boolean;
  comments: number;
};

export type DbStory = {
  id: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  slides: { title: string; text: string }[];
  created_at: string;
};

export type DbComment = {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  text: string;
  created_at: string;
};

const iso = (value: unknown): string =>
  value instanceof Date ? value.toISOString() : new Date(String(value)).toISOString();

/* ---------- пользователи ---------- */

export async function createUser(input: {
  id: string;
  email: string;
  handle: string;
  name: string;
  passwordHash: string;
}): Promise<DbUser> {
  const db = await getDb();
  const rows = await db.query<DbUser>(
    `insert into users (id, email, handle, name, password_hash)
     values ($1, $2, $3, $4, $5)
     returning id, email, handle, name, bio, created_at`,
    [input.id, input.email.toLowerCase(), input.handle, input.name, input.passwordHash],
  );
  return { ...rows[0], created_at: iso(rows[0].created_at) };
}

export async function findUserByEmail(email: string) {
  const db = await getDb();
  const rows = await db.query<DbUser & { password_hash: string }>(
    `select id, email, handle, name, bio, created_at, password_hash
     from users where email = $1`,
    [email.toLowerCase()],
  );
  return rows[0] ?? null;
}

export async function findUserByHandle(handle: string) {
  const db = await getDb();
  const rows = await db.query<DbUser>(
    `select id, email, handle, name, bio, created_at from users where handle = $1`,
    [handle.toLowerCase()],
  );
  return rows[0] ? { ...rows[0], created_at: iso(rows[0].created_at) } : null;
}

export async function findUserById(id: string) {
  const db = await getDb();
  const rows = await db.query<DbUser>(
    `select id, email, handle, name, bio, created_at from users where id = $1`,
    [id],
  );
  return rows[0] ? { ...rows[0], created_at: iso(rows[0].created_at) } : null;
}

export async function handleTaken(handle: string): Promise<boolean> {
  return (await findUserByHandle(handle)) !== null;
}

/* ---------- сессии ---------- */

export async function createSession(tokenHash: string, userId: string, expiresAt: Date) {
  const db = await getDb();
  await db.query(
    `insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)`,
    [tokenHash, userId, expiresAt.toISOString()],
  );
}

export async function findSessionUser(tokenHash: string) {
  const db = await getDb();
  const rows = await db.query<DbUser & { expires_at: string }>(
    `select u.id, u.email, u.handle, u.name, u.bio, u.created_at, s.expires_at
     from sessions s join users u on u.id = s.user_id
     where s.token_hash = $1`,
    [tokenHash],
  );
  const row = rows[0];
  if (!row) return null;
  if (new Date(iso(row.expires_at)).getTime() < Date.now()) return null;
  return {
    id: row.id,
    email: row.email,
    handle: row.handle,
    name: row.name,
    bio: row.bio,
    createdAt: iso(row.created_at),
  };
}

export async function deleteSession(tokenHash: string) {
  const db = await getDb();
  await db.query(`delete from sessions where token_hash = $1`, [tokenHash]);
}

/* ---------- посты ---------- */

export async function createPost(input: { id: string; authorId: string; cat: string; text: string }) {
  const db = await getDb();
  await db.query(`insert into posts (id, author_id, cat, text) values ($1, $2, $3, $4)`, [
    input.id,
    input.authorId,
    input.cat,
    input.text,
  ]);
}

const POST_SELECT = `
  select p.id, p.author_id, u.name as author_name, u.handle as author_handle,
         p.cat, p.text, p.created_at,
         (select count(*)::int from likes l where l.post_id = p.id) as likes,
         (select count(*)::int from comments c where c.post_id = p.id) as comments,
         exists(select 1 from likes l where l.post_id = p.id and l.user_id = $1) as liked
  from posts p join users u on u.id = p.author_id
`;

export async function listFeedPosts(viewerId: string, options?: { followingOnly?: boolean }) {
  const db = await getDb();
  const where = options?.followingOnly
    ? `where p.author_id = $1 or exists (
         select 1 from follows f where f.follower_id = $1 and f.target = p.author_id
       )`
    : "";
  const rows = await db.query<DbPost & { comments: number }>(
    `${POST_SELECT} ${where} order by p.created_at desc limit 60`,
    [viewerId],
  );
  return rows.map((row) => ({
    ...row,
    created_at: iso(row.created_at),
    likes: Number(row.likes),
    comments: Number(row.comments ?? 0),
  }));
}

export async function listPostsByAuthor(authorId: string, viewerId = "") {
  const db = await getDb();
  const rows = await db.query<DbPost & { comments: number }>(
    `${POST_SELECT} where p.author_id = $2 order by p.created_at desc limit 60`,
    [viewerId, authorId],
  );
  return rows.map((row) => ({
    ...row,
    created_at: iso(row.created_at),
    likes: Number(row.likes),
    comments: Number(row.comments ?? 0),
  }));
}

export async function countUserStats(userId: string) {
  const db = await getDb();
  const rows = await db.query<{ posts: number; likes_received: number; followers: number }>(
    `select
       (select count(*)::int from posts where author_id = $1) as posts,
       (select count(*)::int from likes l join posts p on p.id = l.post_id where p.author_id = $1) as likes_received,
       (select count(*)::int from follows where target = $1) as followers`,
    [userId],
  );
  return {
    posts: Number(rows[0]?.posts ?? 0),
    likesReceived: Number(rows[0]?.likes_received ?? 0),
    followers: Number(rows[0]?.followers ?? 0),
  };
}

export async function deletePost(postId: string, authorId: string) {
  const db = await getDb();
  const rows = await db.query<{ id: string }>(
    `delete from posts where id = $1 and author_id = $2 returning id`,
    [postId, authorId],
  );
  return rows.length > 0;
}

/* ---------- лайки ---------- */

export async function toggleLike(postId: string, userId: string) {
  const db = await getDb();
  const existing = await db.query<{ post_id: string }>(
    `select post_id from likes where post_id = $1 and user_id = $2`,
    [postId, userId],
  );

  if (existing.length) {
    await db.query(`delete from likes where post_id = $1 and user_id = $2`, [postId, userId]);
  } else {
    await db.query(`insert into likes (post_id, user_id) values ($1, $2)`, [postId, userId]);
  }

  const rows = await db.query<{ likes: number }>(
    `select count(*)::int as likes from likes where post_id = $1`,
    [postId],
  );
  return { liked: existing.length === 0, likes: Number(rows[0]?.likes ?? 0) };
}

/* ---------- истории ---------- */

export async function createStory(input: {
  id: string;
  authorId: string;
  slides: { title: string; text: string }[];
}) {
  const db = await getDb();
  await db.query(`insert into stories (id, author_id, slides) values ($1, $2, $3::jsonb)`, [
    input.id,
    input.authorId,
    JSON.stringify(input.slides),
  ]);
}

export async function listStories(limit = 8) {
  const db = await getDb();
  const rows = await db.query<DbStory>(
    `select s.id, s.author_id, u.name as author_name, u.handle as author_handle, s.slides, s.created_at
     from stories s join users u on u.id = s.author_id
     order by s.created_at desc limit $1`,
    [limit],
  );
  return rows.map((row) => ({
    ...row,
    created_at: iso(row.created_at),
    slides: typeof row.slides === "string" ? JSON.parse(row.slides) : row.slides,
  }));
}

/* ---------- подписки ---------- */

export async function toggleFollow(followerId: string, target: string) {
  const db = await getDb();
  const existing = await db.query<{ target: string }>(
    `select target from follows where follower_id = $1 and target = $2`,
    [followerId, target],
  );

  if (existing.length) {
    await db.query(`delete from follows where follower_id = $1 and target = $2`, [followerId, target]);
    return { following: false };
  }
  await db.query(`insert into follows (follower_id, target) values ($1, $2)`, [followerId, target]);
  return { following: true };
}

export async function isFollowing(followerId: string, target: string) {
  const db = await getDb();
  const rows = await db.query<{ target: string }>(
    `select target from follows where follower_id = $1 and target = $2`,
    [followerId, target],
  );
  return rows.length > 0;
}

export async function followingIds(followerId: string) {
  const db = await getDb();
  const rows = await db.query<{ target: string }>(`select target from follows where follower_id = $1`, [
    followerId,
  ]);
  return rows.map((row) => row.target);
}

/* ---------- комментарии ---------- */

export async function listComments(postId: string) {
  const db = await getDb();
  const rows = await db.query<DbComment>(
    `select c.id, c.post_id, c.author_id, u.name as author_name, u.handle as author_handle,
            c.text, c.created_at
     from comments c join users u on u.id = c.author_id
     where c.post_id = $1
     order by c.created_at asc`,
    [postId],
  );
  return rows.map((row) => ({ ...row, created_at: iso(row.created_at) }));
}

export async function createComment(input: {
  id: string;
  postId: string;
  authorId: string;
  text: string;
}) {
  const db = await getDb();
  const rows = await db.query<DbComment>(
    `insert into comments (id, post_id, author_id, text)
     values ($1, $2, $3, $4)
     returning id, post_id, author_id, text, created_at`,
    [input.id, input.postId, input.authorId, input.text],
  );
  const row = rows[0];
  const user = await findUserById(input.authorId);
  return {
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    author_name: user?.name ?? "",
    author_handle: user?.handle ?? "",
    text: row.text,
    created_at: iso(row.created_at),
  };
}

export async function deleteComment(commentId: string, authorId: string) {
  const db = await getDb();
  const rows = await db.query<{ id: string }>(
    `delete from comments where id = $1 and author_id = $2 returning id`,
    [commentId, authorId],
  );
  return rows.length > 0;
}

/* ---------- сидинг демо-контента ---------- */

/**
 * Пустая база (первый запуск / PGlite на serverless) наполняется демо-контентом,
 * чтобы educa выглядела живой сразу. Войти в демо-аккаунты нельзя:
 * пароли — случайные байты.
 */
export async function seedDemoContent(seed: {
  createUser: (input: {
    id: string;
    email: string;
    handle: string;
    name: string;
    passwordHash: string;
  }) => Promise<void>;
  createPost: (input: { id: string; authorId: string; cat: string; text: string }) => Promise<void>;
}) {
  const demoUsers = [
    { id: "demo-mfti", email: "mfti@educa.demo", handle: "mfti", name: "МФТИ" },
    { id: "demo-vshe", email: "vshe@educa.demo", handle: "vshe", name: "НИУ ВШЭ" },
    { id: "demo-bot", email: "bot@educa.demo", handle: "bot", name: "Поступалка Бот" },
    { id: "demo-sasha", email: "sasha@educa.demo", handle: "sasha-k", name: "Саша К." },
    { id: "demo-dasha", email: "dasha@educa.demo", handle: "dasha-v", name: "Даша В." },
  ];

  const db = await getDb();
  const existing = await db.query<{ count: number }>(`select count(*)::int as count from users`);
  if (Number(existing[0]?.count ?? 0) > 0) return;

  for (const user of demoUsers) {
    await seed.createUser({
      id: user.id,
      email: user.email,
      handle: user.handle,
      name: user.name,
      passwordHash: `demo$${user.id}`,
    });
  }

  const demoPosts = [
    { authorId: "demo-bot", cat: "useful", text: "Совет: подтяни запись на дни открытых дверей через трекер дедлайнов — в ноябре их целых два." },
    { authorId: "demo-mfti", cat: "uni", text: "ФПМИ приглашает 11-классников на экскурсию в лаборатории квантовых вычислений." },
    { authorId: "demo-sasha", cat: "common", text: "Кто идёт на ДДИ ВШЭ в декабре? Собираемся группой 👋" },
    { authorId: "demo-dasha", cat: "memes", text: "моя стратегия поступления: поступить. всё." },
  ];
  for (const post of demoPosts) {
    await seed.createPost({
      id: `demo-${post.authorId}-${Math.random().toString(16).slice(2, 8)}`,
      authorId: post.authorId,
      cat: post.cat,
      text: post.text,
    });
  }
}
