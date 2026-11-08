"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/providers/ToastProvider";

type Platform = "ios" | "android" | "desktop";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STEPS: Record<Platform, { title: string; steps: string[] }> = {
  ios: {
    title: "iPhone и iPad",
    steps: [
      "Открой educa в Safari — установка работает именно в нём.",
      "Нажми «Поделиться» в нижней панели (квадрат со стрелкой вверх).",
      "Пролистай и выбери «На экран «Домой»».",
      "Нажми «Добавить» — иконка educa появится на рабочем столе.",
    ],
  },
  android: {
    title: "Android",
    steps: [
      "Открой educa в Chrome.",
      "Нажми ⋮ в правом верхнем углу.",
      "Выбери «Установить приложение» или «Добавить на главный экран».",
      "Подтверди — приложение откроется без адресной строки.",
    ],
  },
  desktop: {
    title: "Компьютер",
    steps: [
      "Открой educa в Chrome, Edge или другом Chromium-браузере.",
      "Нажми иконку установки в адресной строке справа.",
      "Или меню ⋮ → «Установить educa».",
      "Приложение откроется в отдельном окне и появится в доке или меню «Пуск».",
    ],
  },
};

export function InstallGuide() {
  const toast = useToast();
  const [platform, setPlatform] = useState<Platform>("android");
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) setPlatform("ios");
    else if (!/Android/i.test(navigator.userAgent)) setPlatform("desktop");

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!installEvent) {
      toast("Открой меню браузера и выбери «Установить приложение»");
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  };

  return (
    <div className="page">
      <p className="lead">
        educa работает как обычное приложение: своя иконка, полный экран и офлайн-доступ к сохранённым
        страницам. Платить и регистрироваться не нужно.
      </p>

      <div className="row mt-12">
        <button className="btn" onClick={install} disabled={installed}>
          <Icon name="install" size={17} />
          {installed ? "Уже установлено" : "Установить educa"}
        </button>
      </div>

      {installed ? (
        <div className="notice">
          Приложение уже запущено в отдельном окне. Если иконки нет на рабочем столе — добавь её через меню
          браузера.
        </div>
      ) : null}

      <div className="platforms" role="tablist" aria-label="Платформа">
        {(Object.keys(STEPS) as Platform[]).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={platform === key}
            className={platform === key ? "on" : ""}
            onClick={() => setPlatform(key)}
          >
            {STEPS[key].title}
          </button>
        ))}
      </div>

      <div className="steps">
        {STEPS[platform].steps.map((step) => (
          <div className="step" key={step}>
            {step}
          </div>
        ))}
      </div>

      <div className="notice mt-20">
        <b>Что работает без сети:</b> главная, каталог, инструменты и офлайн-страница. Данные кэшируются при
        первом открытии.
      </div>

      <div className="notice">
        <b>Почему не в App Store?</b> PWA не требует магазина приложений и обновляется автоматически. Для
        уведомлений на iOS 16.4+ приложение должно быть добавлено на экран «Домой».
      </div>
    </div>
  );
}
