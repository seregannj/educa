import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { findSessionUser } from "./db/queries";

const scryptAsync = promisify(scrypt);
const COOKIE = "educa_session";
const SESSION_DAYS = 30;

/** Формат: scrypt$N$salt$hash — без внешних зависимостей, проверяемо и переносимо. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password.normalize("NFKC"), salt, 64)) as Buffer;
  return `scrypt$16384$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, , saltRaw, hashRaw] = stored.split("$");
  if (scheme !== "scrypt" || !saltRaw || !hashRaw) return false;
  const salt = Buffer.from(saltRaw, "base64url");
  const expected = Buffer.from(hashRaw, "base64url");
  const derived = (await scryptAsync(password.normalize("NFKC"), salt, expected.length)) as Buffer;
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export function newSessionToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
  };
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function sessionTokenHash(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  return token ? sha256(token) : null;
}

export type Viewer = {
  id: string;
  email: string;
  handle: string;
  name: string;
  bio: string;
  createdAt?: string;
};

export async function getCurrentUser(): Promise<Viewer | null> {
  const tokenHash = await sessionTokenHash();
  if (!tokenHash) return null;
  return findSessionUser(tokenHash);
}

/** Валидация регистрации: одна функция, чтобы правила не расходились с формой. */
export function validateRegistration(input: { name: string; email: string; password: string }) {
  const errors: Record<string, string> = {};

  if (input.name.trim().length < 2 || input.name.trim().length > 40) {
    errors.name = "Имя — от 2 до 40 символов";
  }
  if (!/^[^@\s]+@[^@\s]+\.[a-zа-я]{2,}$/i.test(input.email.trim())) {
    errors.email = "Похоже, в почте опечатка";
  }
  if (input.password.length < 8) {
    errors.password = "Пароль — минимум 8 символов";
  }
  if (input.password.length > 200) {
    errors.password = "Слишком длинный пароль";
  }
  return errors;
}

/** Ник из почты: alex.ivanov@mail.ru → alex-ivanov, с суффиксом при занятости. */
export function handleFromEmail(email: string): string {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/[._]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
  return base.length >= 3 ? base : `user-${randomBytes(2).toString("hex")}`;
}
