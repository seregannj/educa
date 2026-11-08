"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Локальное состояние пользователя.
 * Пока нет аккаунтов, всё хранится в localStorage. Интерфейс функций
 * останется тем же, когда появятся API-вызовы — поменяется только тело.
 */
type AppState = {
  likes: string[];
  subs: string[];
  saved: string[];
  seen: string[];
  streak: number;
  taskDate: string | null;
};

const DEFAULT_STATE: AppState = {
  likes: [],
  subs: [],
  saved: [],
  seen: [],
  streak: 12,
  taskDate: null,
};

const STORAGE_KEY = "educa:state:v1";

type AppStateContextValue = AppState & {
  ready: boolean;
  isLiked: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  isSubscribed: (id: string) => boolean;
  isSeen: (id: string) => boolean;
  toggleLike: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  toggleSub: (id: string) => boolean;
  markSeen: (id: string) => void;
  taskDoneToday: boolean;
  completeTask: () => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AppStateProvider({
  children,
  defaultSubs = [],
}: {
  children: React.ReactNode;
  /** Подписки «из коробки»: вузы и авторы, на которых пользователь подписан по умолчанию. */
  defaultSubs?: string[];
}) {
  const [state, setState] = useState<AppState>({ ...DEFAULT_STATE, subs: defaultSubs });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULT_STATE, subs: defaultSubs, ...(JSON.parse(raw) as Partial<AppState>) });
    } catch {
      /* повреждённое хранилище — начинаем с чистого */
    }
    setReady(true);
  }, [defaultSubs]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* приватный режим */
    }
  }, [state, ready]);

  const toggleLike = useCallback((id: string) => {
    let liked = false;
    setState((prev) => {
      liked = !prev.likes.includes(id);
      return {
        ...prev,
        likes: liked ? [...prev.likes, id] : prev.likes.filter((x) => x !== id),
      };
    });
    return liked;
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      saved: prev.saved.includes(id) ? prev.saved.filter((x) => x !== id) : [...prev.saved, id],
    }));
  }, []);

  const toggleSub = useCallback((id: string) => {
    let subscribed = false;
    setState((prev) => {
      subscribed = !prev.subs.includes(id);
      return {
        ...prev,
        subs: subscribed ? [...prev.subs, id] : prev.subs.filter((x) => x !== id),
      };
    });
    return subscribed;
  }, []);

  const markSeen = useCallback((id: string) => {
    setState((prev) => (prev.seen.includes(id) ? prev : { ...prev, seen: [...prev.seen, id] }));
  }, []);

  const completeTask = useCallback(() => {
    setState((prev) =>
      prev.taskDate === today() ? prev : { ...prev, streak: prev.streak + 1, taskDate: today() },
    );
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      ready,
      isLiked: (id) => state.likes.includes(id),
      isSaved: (id) => state.saved.includes(id),
      isSubscribed: (id) => state.subs.includes(id),
      isSeen: (id) => state.seen.includes(id),
      toggleLike,
      toggleSaved,
      toggleSub,
      markSeen,
      taskDoneToday: state.taskDate === today(),
      completeTask,
    }),
    [state, ready, toggleLike, toggleSaved, toggleSub, markSeen, completeTask],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState должен использоваться внутри AppStateProvider");
  return ctx;
}
