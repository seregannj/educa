/**
 * Схема educa. Выполняется при первом обращении к базе (CREATE IF NOT EXISTS).
 * Одинаково работает в Postgres и в локальном PGlite.
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
  post_id text not null,
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
  target text not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, target)
);
`;
