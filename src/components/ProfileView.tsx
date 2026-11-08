"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useAppState } from "@/components/providers/AppStateProvider";
import { posts } from "@/data/posts";
import { universities } from "@/lib/data";

export function ProfileView() {
  const { streak, saved, subs, taskDoneToday } = useAppState();

  const subscriptions = subs
    .map((id) => {
      const uni = universities.find((item) => item.id === id);
      if (uni) return { id, name: uni.name, href: `/vuzy/${uni.id}`, mono: uni.short };
      const post = posts.find((item) => (item.handle ?? item.id) === id);
      if (post) {
        return { id, name: post.name, href: post.handle ? `/u/${post.handle}` : "/", mono: post.name.slice(0, 2).toUpperCase() };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const savedPosts = posts.filter((post) => saved.includes(post.id));

  return (
    <>
      <div className="page" style={{ paddingTop: 14 }}>
        <div className="notice">
          <b>Профиль пока локальный.</b> Войди или создай аккаунт — появятся посты, публикации и настоящие
          подписки.
          <div className="row mt-12" style={{ gap: 8 }}>
            <Link href="/login" className="btn btn-small">
              Войти
            </Link>
            <Link href="/register" className="btn btn-small btn-ghost">
              Создать аккаунт
            </Link>
          </div>
        </div>
      </div>

      <div className="uni-hero">
        <span className="ava-xl" style={{ background: "var(--blue-soft)", color: "var(--blue)" }}>
          Я
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Абитуриент</div>
          <div className="uni-meta" style={{ marginTop: 3 }}>
            @you · гостевой режим
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <b>{streak} 🔥</b>
          <span>стрик</span>
        </div>
        <div className="stat">
          <b>{savedPosts.length}</b>
          <span>в избранном</span>
        </div>
        <div className="stat">
          <b>{subscriptions.length}</b>
          <span>подписок</span>
        </div>
      </div>

      <div className="page">
        <div className="notice">
          {taskDoneToday ? "Задача дня решена — стрик продлён." : "Задача дня ждёт во вкладке «Полезное»."}{" "}
          <Link href="/" style={{ color: "var(--blue)", fontWeight: 700 }}>
            К ленте
          </Link>
        </div>

        <div className="section-title" style={{ padding: "18px 0 6px" }}>
          Подписки
        </div>
        {subscriptions.length ? (
          <div className="list" style={{ marginTop: 0 }}>
            {subscriptions.map((item) => (
              <Link href={item.href} className="list-item" key={item.id}>
                <span
                  className="ava"
                  style={{ width: 28, height: 28, fontSize: 11, background: "var(--blue-soft)", color: "var(--blue)" }}
                >
                  {item.mono}
                </span>
                <span>{item.name}</span>
                <Icon name="chev" size={16} style={{ marginLeft: "auto", stroke: "var(--muted)", fill: "none" }} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ padding: "24px 0" }}>
            Пока нет подписок. Загляни в{" "}
            <Link href="/vuzy" style={{ color: "var(--blue)", fontWeight: 700 }}>
              каталог вузов
            </Link>
            .
          </div>
        )}

        <div className="section-title" style={{ padding: "18px 0 6px" }}>
          Избранное
        </div>
        {savedPosts.length ? (
          <div className="list" style={{ marginTop: 0 }}>
            {savedPosts.map((post) => (
              <Link href="/" className="list-item" key={post.id}>
                <Icon name="bookmark" size={18} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 600 }}>{post.name}</span>
                  <span className="small muted">{post.text.slice(0, 60)}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ padding: "24px 0" }}>
            Сохраняй посты через меню «⋮» — они появятся здесь.
          </div>
        )}

        <div className="list">
          <Link href="/favorites" className="list-item">
            <Icon name="bookmark" size={19} />
            Всё избранное
            <Icon name="chev" size={16} style={{ marginLeft: "auto", stroke: "var(--muted)", fill: "none" }} />
          </Link>
          <Link href="/settings" className="list-item">
            <Icon name="settings" size={19} />
            Настройки
            <Icon name="chev" size={16} style={{ marginLeft: "auto", stroke: "var(--muted)", fill: "none" }} />
          </Link>
          <Link href="/proposals" className="list-item">
            <Icon name="table" size={19} />
            Предложить правку в данных
            <Icon name="chev" size={16} style={{ marginLeft: "auto", stroke: "var(--muted)", fill: "none" }} />
          </Link>
        </div>

        <div className="notice warn">
          <b>Стрик и избранное</b> сохраняются на этом устройстве. Посты, подписки и лайки живут в аккаунте.
        </div>
      </div>
    </>
  );
}
