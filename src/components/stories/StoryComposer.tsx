"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/providers/ToastProvider";
import { createStoryAction, type ContentState } from "@/app/actions/content";

const EMPTY = { title: "", text: "" };

export function StoryComposer() {
  const [state, action, pending] = useActionState<ContentState, FormData>(createStoryAction, null);
  const [slides, setSlides] = useState([{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }]);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast("История опубликована");
      router.push("/");
      router.refresh();
    } else if (state.error) {
      toast(state.error);
    }
  }, [state, toast, router]);

  return (
    <form action={action} className="page">
      <p className="lead">
        История — это 1–3 слайда. Она появится в ленте у всех и будет доступна 24 часа.
      </p>

      {slides.map((slide, index) => {
        const number = index + 1;
        const active = index === 0 || slides[index - 1].title.trim() || slides[index - 1].text.trim();
        if (!active) return null;

        return (
          <div className="story-slide" key={number}>
            <div className="story-slide-head">
              <span className="story-slide-num">{number}</span>
              Слайд {number}
              {index > 0 ? (
                <button
                  type="button"
                  className="story-slide-remove"
                  onClick={() => setSlides((prev) => prev.map((item, i) => (i === index ? { ...EMPTY } : item)))}
                >
                  Убрать
                </button>
              ) : null}
            </div>
            <div className="field" style={{ marginTop: 6 }}>
              <label htmlFor={`title-${number}`}>Заголовок</label>
              <input
                id={`title-${number}`}
                name={`title-${number}`}
                className="input"
                maxLength={80}
                placeholder={number === 1 ? "День открытых дверей ФПМИ" : "Ещё одна мысль"}
                value={slide.title}
                onChange={(event) =>
                  setSlides((prev) => prev.map((item, i) => (i === index ? { ...item, title: event.target.value } : item)))
                }
              />
            </div>
            <div className="field">
              <label htmlFor={`text-${number}`}>Текст</label>
              <textarea
                id={`text-${number}`}
                name={`text-${number}`}
                className="textarea"
                maxLength={240}
                placeholder="Коротко: что, где и когда"
                value={slide.text}
                onChange={(event) =>
                  setSlides((prev) => prev.map((item, i) => (i === index ? { ...item, text: event.target.value } : item)))
                }
              />
            </div>
          </div>
        );
      })}

      <div className="row mt-12">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setSlides((prev) => (prev.length >= 3 ? prev : [...prev, { ...EMPTY }]))}
          disabled={slides.length >= 3}
        >
          <Icon name="plus" size={16} />
          Добавить слайд
        </button>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Публикуем…" : "Опубликовать"}
        </button>
      </div>

      <div className="notice">
        Сторис живут 24 часа и не попадают в профиль. Постоянные посты публикуй в ленте.
      </div>
    </form>
  );
}
