/**
 * Схема educa. Выполняется при первом обращении к базе (CREATE IF NOT EXISTS).
 * Одинаково работает в Postgres и в локальной PGlite.
 */
export const SCHEMA_SQL = `
create table if not exists users (
  id text primary key,
  email text not null unique,
  handle text not null unique,
  name text not null,
  password_hash text not null,
  bio text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  user_id text not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists sessions_user_idx on sessions (user_id);

create table if not exists posts (
  id text primary key,
  author_id text not null references users(id) on delete cascade,
  cat text not null default 'common',
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_idx on posts (created_at desc);
create index if not exists posts_author_idx on posts (author_id);

create table if not exists likes (
  post_id text not null references posts(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists stories (
  id text primary key,
  author_id text not null references users(id) on delete cascade,
  slides jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists stories_created_idx on stories (created_at desc);

create table if not exists follows (
  follower_id text not null references users(id) on delete cascade,
  target text not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, target)
);

create table if not exists comments (
  id text primary key,
  post_id text not null references posts(id) on delete cascade,
  author_id text not null references users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_idx on comments (post_id, created_at);
`;

/**
 * Мягкие миграции для баз, созданных до этих ограничений: likes.post_id и
 * follows.target не ссылались на родительские таблицы, поэтому после удаления
 * поста или пользователя оставались строки-сироты. Каждая миграция выполняется
 * отдельно и в try/catch (см. db/index.ts) — повторный запуск и старые базы
 * не роняем: сработает лишь раз, дальше ошибка «constraint already exists»
 * тихо проглатывается.
 */
export const MIGRATIONS: string[] = [
  "delete from likes where post_id not in (select id from posts)",
  "alter table likes add constraint likes_post_fk foreign key (post_id) references posts(id) on delete cascade",
  "delete from follows where target not in (select id from users)",
  "alter table follows add constraint follows_target_fk foreign key (target) references users(id) on delete cascade",
];
