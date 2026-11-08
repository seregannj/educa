"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  clearSessionCookie,
  getCurrentUser,
  handleFromEmail,
  hashPassword,
  newSessionToken,
  sessionTokenHash,
  setSessionCookie,
  validateRegistration,
  verifyPassword,
} from "@/lib/auth";
import {
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
  handleTaken,
} from "@/lib/db/queries";
import { hitLimit } from "@/lib/rate-limit";

export type AuthState = { error?: string; fieldErrors?: Record<string, string> } | null;

async function clientKey(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for") ?? "local";
  return forwarded.split(",")[0].trim();
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (hitLimit(`register:${await clientKey()}`, 5)) {
    return { error: "Слишком много попыток. Попробуй через 10 минут." };
  }

  const fieldErrors = validateRegistration({ name, email, password });
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  if (await findUserByEmail(email)) {
    return { error: "Такая почта уже зарегистрирована. Войди в аккаунт." };
  }

  let handle = handleFromEmail(email);
  if (await handleTaken(handle)) {
    handle = `${handle}-${randomBytes(2).toString("hex")}`;
  }

  let userId: string;
  try {
    const user = await createUser({
      id: randomUUID(),
      email,
      handle,
      name,
      passwordHash: await hashPassword(password),
    });
    userId = user.id;
  } catch {
    return { error: "Не получилось создать аккаунт. Попробуй ещё раз." };
  }

  const { token, tokenHash, expiresAt } = newSessionToken();
  await createSession(tokenHash, userId, expiresAt);
  await setSessionCookie(token, expiresAt);

  redirect("/");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (hitLimit(`login:${email}:${await clientKey()}`)) {
    return { error: "Слишком много попыток входа. Подожди 10 минут." };
  }

  if (!email || !password) return { error: "Введи почту и пароль" };

  const user = await findUserByEmail(email);
  const valid = user ? await verifyPassword(password, user.password_hash) : false;

  // Одинаковый ответ для несуществующей почты и неверного пароля.
  if (!user || !valid) return { error: "Неверная почта или пароль" };

  const { token, tokenHash, expiresAt } = newSessionToken();
  await createSession(tokenHash, user.id, expiresAt);
  await setSessionCookie(token, expiresAt);

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const tokenHash = await sessionTokenHash();
  if (tokenHash) await deleteSession(tokenHash);
  await clearSessionCookie();
  redirect("/");
}

export async function currentUser() {
  return getCurrentUser();
}
