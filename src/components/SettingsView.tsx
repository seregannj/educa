"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { meta } from "@/lib/data";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { saved, subs, streak } = useAppState();
  const toast = useToast();
  const [notifications, setNotifications] = useState(false);

  const resetLocal = () => {
    if (!window.confirm("Удалить локальные данные: лайки, избранное, подписки и стрик?")) return;
    try {
      localStorage.removeItem("educa:state:v1");
    } catch {
      /* ничего страшного */
    }
    window.location.reload();
  };

  return (
    <div className="page">
      <div className="section-title" style={{ padding: "18px 0 6px" }}>
        Оформление
      </div>
      <div className="list" style={{ marginTop: 0 }}>
        <button
          className="list-item"
          onClick={(event) => setTheme(theme === "dark" ? "light" : "dark", { x: event.clientX, y: event.clientY })}
        >
          <Icon name={theme === "dark" ? "moon" : "sun"} size={19} />
          Тёмная тема
          <span className={`switch${theme === "dark" ? " on" : ""}`} aria-hidden="true" />
        </button>
        <Link href="/pwa" className="list-item">
          <Icon name="install" size={19} />
          Установить на телефон
          <Icon name="chev" size={16} style={{ marginLeft: "auto", stroke: "var(--muted)", fill: "none" }} />
        </Link>
      </div>

      <div className="section-title" style={{ padding: "18px 0 6px" }}>
        Уведомления
      </div>
      <div className="list" style={{ marginTop: 0 }}>
        <button
          className="list-item"
          onClick={() => {
            setNotifications((value) => !value);
            toast("Напоминания включим вместе с аккаунтами");
          }}
        >
          <Icon name="bell" size={19} />
          Дедлайны и задача дня
          <span className={`switch${notifications ? " on" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <div className="section-title" style={{ padding: "18px 0 6px" }}>
        Аккаунт
      </div>
      <div className="list" style={{ marginTop: 0 }}>
        <div className="list-item static">
          <Icon name="user" size={19} />
          Гостевой режим
          <span className="val">без входа</span>
        </div>
      </div>
      <div className="notice">
        <b>Вход появится на следующем этапе.</b> Тогда же — публикация постов, жалобы и ручная модерация
        спорных случаев (плюс автофильтр на ИИ).
      </div>

      <div className="section-title" style={{ padding: "18px 0 6px" }}>
        Данные
      </div>
      <div className="list" style={{ marginTop: 0 }}>
        <Link href="/proposals" className="list-item">
          <Icon name="table" size={19} />
          Предложить правку
          <Icon name="chev" size={16} style={{ marginLeft: "auto", stroke: "var(--muted)", fill: "none" }} />
        </Link>
        <button className="list-item" onClick={resetLocal}>
          <Icon name="close" size={19} />
          Сбросить локальные данные
          <span className="val">
            {saved.length + subs.length} записей
          </span>
        </button>
      </div>

      <div className="section-title" style={{ padding: "18px 0 6px" }}>
        О приложении
      </div>
      <div className="list" style={{ marginTop: 0 }}>
        <div className="list-item static">
          <Icon name="info" size={19} />
          Версия
          <span className="val">0.2.0</span>
        </div>
        <div className="list-item static">
          <Icon name="uni" size={19} />
          В базе
          <span className="val">
            {meta.universities} вузов · {meta.programs} программ
          </span>
        </div>
        <div className="list-item static">
          <Icon name="flame" size={19} />
          Твой стрик
          <span className="val">{streak} дней</span>
        </div>
      </div>

      <div className="small muted mt-20" style={{ textAlign: "center" }}>
        educa · открытые данные приёма-2026
      </div>
    </div>
  );
}
