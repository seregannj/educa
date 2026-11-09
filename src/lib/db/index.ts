import { MIGRATIONS, SCHEMA_SQL } from "./schema";

/**
 * Один SQL-диалект для продакшена и разработки:
 * - есть DATABASE_URL → Postgres (Vercel + Neon/Supabase и т.п.);
 * - локально нет → PGlite (Postgres в WASM), данные в .data/pglite;
 * - на serverless без DATABASE_URL → гостевой режим без БД: WASM-инициализация
 *   PGlite перевешивает лимит функции, поэтому `/` повисал.
 */
export type Db = {
  query: <T>(text: string, params?: unknown[]) => Promise<T[]>;
  exec: (text: string) => Promise<void>;
};

/** Гостевой режим: на serverless без DATABASE_URL записи не сохраняются. */
export function isGuestMode(): boolean {
  return process.env.VERCEL === "1" && !process.env.DATABASE_URL;
}

const globalForDb = globalThis as unknown as { __educaDb?: Promise<Db> };

async function createDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 5 });
    return {
      async query<T>(text: string, params: unknown[] = []) {
        const result = await pool.query(text, params as never[]);
        return result.rows as T[];
      },
      async exec(text: string) {
        await pool.query(text);
      },
    };
  }

  /* На serverless (Vercel) без внешней базы работаем в гостевом режиме:
     редакционный контент отдаётся, записи требуют DATABASE_URL. */
  if (isGuestMode()) {
    const stub: Db = {
      async query<T>() {
        return [] as unknown as T[];
      },
      async exec() {},
    };
    return stub;
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdirSync } = await import("node:fs");
  const dataDir = ".data/pglite";
  mkdirSync(dataDir, { recursive: true });
  const pglite = new PGlite(dataDir);
  return {
    async query<T>(text: string, params: unknown[] = []) {
      const result = await pglite.query<T>(text, params);
      return result.rows;
    },
    async exec(text: string) {
      await pglite.exec(text);
    },
  };
}

/** Ленивая инициализация: схема создаётся один раз на процесс. */
export function getDb(): Promise<Db> {
  if (!globalForDb.__educaDb) {
    globalForDb.__educaDb = createDb().then(async (db) => {
      await db.exec(SCHEMA_SQL);

      /* Мягкие миграции: каждая — отдельно и с проглатыванием ошибки,
         чтобы повторный запуск или старая база не роняли старт процесса. */
      for (const statement of MIGRATIONS) {
        try {
          await db.exec(statement);
        } catch {
          /* ограничение уже стоит или данные не позволили — не критично */
        }
      }

      /* Просроченные сессии иначе не удаляет никто — чистим при старте процесса. */
      try {
        await db.exec("delete from sessions where expires_at < now()");
      } catch {
        /* не критично */
      }

      /* Пустая база (только локальный PGlite) наполняется демо-контентом. */
      try {
        const { seedDemoContent } = await import("./queries");
        await seedDemoContent({
          createUser: async (input) => {
            await db.query(
              `insert into users (id, email, handle, name, password_hash)
               values ($1, $2, $3, $4, $5)`,
              [input.id, input.email.toLowerCase(), input.handle, input.name, input.passwordHash],
            );
          },
          createPost: async (input) => {
            await db.query(`insert into posts (id, author_id, cat, text) values ($1, $2, $3, $4)`, [
              input.id,
              input.authorId,
              input.cat,
              input.text,
            ]);
          },
        });
      } catch {
        /* сидинг не критичен: без него лента всё равно работает */
      }

      return db;
    });
  }
  return globalForDb.__educaDb;
}
