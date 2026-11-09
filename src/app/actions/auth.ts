"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
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
import { isGuestMode } from "@/lib/db";
import {
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
  handleTaken,
} from "@/lib/db/queries";
import { clientKey, hitLimit } from "@/lib/rate-limit";

export type AuthState = { error?: string; fieldErrors?: Record<string, string> } | null;

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  // В гостевом режиме (serverless без DATABASE_URL) регистрация всё равно
  // не сохранится — честно скажем об этом сразу, а не после заполнения формы.
  if (isGuestMode()) {
    return { error: "Регистрация временно недоступна: не настроена база данных (DATABASE_URL)." };
  }

  // 10 на 10 минут: одна школа за общим NAT не должна упираться в лимит,
  // но и лить аккаунты пачкой это не позволяет.
  if (hitLimit(`register:${await clientKey()}`, 10)) {
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

  if (isGuestMode()) {
    return { error: "Вход временно недоступен: не настроена база данных (DATABASE_URL)." };
  }

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
