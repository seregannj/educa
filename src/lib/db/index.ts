import { SCHEMA_SQL } from "./schema";

/**
 * Один SQL-диалект для продакшена и разработки:
 * - есть DATABASE_URL → Postgres (Vercel + Neon/Supabase и т.п.);
 * - нет → PGlite (Postgres в WASM), данные в .data/pglite локально
 *   или /tmp/educa-pglite на serverless (Vercel: CWD read-only).
 */
export type Db = {
  query: <T>(text: string, params?: unknown[]) => Promise<T[]>;
  exec: (text: string) => Promise<void>;
};

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

  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdirSync } = await import("node:fs");
  // На Vercel (serverless) рабочая директория read-only — единственная
  // записываемая папка это /tmp. Локально оставляем .data/pglite.
  const dataDir =
    process.env.VERCEL === "1" ? "/tmp/educa-pglite" : ".data/pglite";
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

      /* Пустая база наполняется демо-контентом, чтобы educa была живой сразу. */
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
