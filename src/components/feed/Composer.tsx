"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/providers/ToastProvider";
import { createPostAction, type ContentState } from "@/app/actions/content";
import { avatarFor } from "@/lib/avatar";

const CATS: { id: string; label: string }[] = [
  { id: "useful", label: "Полезное" },
  { id: "common", label: "Офтопик" },
  { id: "memes", label: "Мемы" },
];

export function Composer({ name }: { name: string }) {
  const [state, action, pending] = useActionState<ContentState, FormData>(createPostAction, null);
  const [cat, setCat] = useState("useful");
  const [text, setText] = useState("");
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const avatar = avatarFor(name);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      setText("");
      formRef.current?.reset();
      toast("Опубликовано");
    } else if (state.error) {
      toast(state.error);
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={action} className="composer">
      <div className="composer-top">
        <span className="ava" style={{ background: avatar.bg, color: avatar.fg, width: 32, height: 32, fontSize: 12 }}>
          {avatar.mono}
        </span>
        <textarea
          className="composer-input"
          name="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Чем поделиться? Совет, вопрос, новость вуза…"
          maxLength={600}
          rows={2}
          required
        />
      </div>

      <input type="hidden" name="cat" value={cat} />

      <div className="composer-foot">
        <div className="composer-cats">
          {CATS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip${cat === item.id ? " on" : ""}`}
              onClick={() => setCat(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="composer-count">{text.length}/600</span>
        <button className="btn btn-small" type="submit" disabled={pending || text.trim().length < 2}>
          {pending ? "Публикуем…" : "Опубликовать"}
        </button>
      </div>
    </form>
  );
}

/** Компактный призыв войти для гостей. */
export function LoginCta({ text }: { text: string }) {
  return (
    <a className="login-cta" href="/login">
      <Icon name="user" size={18} />
      <span>{text}</span>
      <span className="login-cta-action">Войти</span>
    </a>
  );
}
