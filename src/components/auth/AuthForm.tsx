"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Icon } from "@/components/Icon";
import { loginAction, registerAction, type AuthState } from "@/app/actions/auth";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, null);
  const isRegister = mode === "register";

  return (
    <div className="auth">
      <div className="auth-head">
        <Link href="/" className="wordmark" style={{ fontSize: 30 }}>
          educa
        </Link>
        <h1 className="auth-title">{isRegister ? "Создай аккаунт" : "С возвращением"}</h1>
        <p className="auth-sub">
          {isRegister
            ? "Публикуй посты и истории, сохраняй подписки и следи за дедлайнами."
            : "Войди, чтобы публиковать и подписываться на вузы и людей."}
        </p>
      </div>

      <form action={formAction} className="auth-card">
        {isRegister ? (
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="name">Как тебя зовут</label>
            <input
              id="name"
              name="name"
              className="input"
              placeholder="Саша"
              autoComplete="name"
              required
              aria-invalid={Boolean(state?.fieldErrors?.name)}
            />
            {state?.fieldErrors?.name ? <span className="field-error">{state.fieldErrors.name}</span> : null}
          </div>
        ) : null}

        <div className="field" style={{ marginTop: isRegister ? 12 : 0 }}>
          <label htmlFor="email">Почта</label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            placeholder="you@mail.ru"
            autoComplete="email"
            required
            aria-invalid={Boolean(state?.fieldErrors?.email)}
          />
          {state?.fieldErrors?.email ? <span className="field-error">{state.fieldErrors.email}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            placeholder={isRegister ? "Минимум 8 символов" : "••••••••"}
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : undefined}
            required
            aria-invalid={Boolean(state?.fieldErrors?.password)}
          />
          {state?.fieldErrors?.password ? (
            <span className="field-error">{state.fieldErrors.password}</span>
          ) : null}
        </div>

        {state?.error ? (
          <div className="notice warn" role="alert">
            {state.error}
          </div>
        ) : null}

        <button className="btn btn-block mt-12" type="submit" disabled={pending}>
          {pending ? "Секунду…" : isRegister ? "Создать аккаунт" : "Войти"}
          {pending ? null : <Icon name="chev" size={16} />}
        </button>

        <div className="auth-switch">
          {isRegister ? (
            <>
              Уже есть аккаунт? <Link href="/login">Войти</Link>
            </>
          ) : (
            <>
              Впервые здесь? <Link href="/register">Создать аккаунт</Link>
            </>
          )}
        </div>
      </form>

      <p className="auth-legal">
        Регистрируясь, ты соглашаешься с правилами сообщества. Несовершеннолетним — с согласия родителей.
      </p>
    </div>
  );
}
