"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme, origin?: { x: number; y: number }) => void;
  toggleTheme: (origin?: { x: number; y: number }) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "educa:theme";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(currentTheme());
  }, []);

  const applyTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* приватный режим — просто не запоминаем */
    }
    setThemeState(next);
  }, []);

  const setTheme = useCallback(
    (next: Theme, origin?: { x: number; y: number }) => {
      const x = origin?.x ?? window.innerWidth - 60;
      const y = origin?.y ?? 40;

      const apply = () => {
        document.documentElement.classList.add("noanim");
        applyTheme(next);
        requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove("noanim")));
      };

      type WithViewTransition = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
      const doc = document as WithViewTransition;

      if (typeof doc.startViewTransition === "function") {
        const transition = doc.startViewTransition(apply);
        transition.ready.then(() => {
          const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 550, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
          );
        });
      } else {
        apply();
      }
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) => {
      setTheme(currentTheme() === "dark" ? "light" : "dark", origin);
    },
    [setTheme],
  );

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme должен использоваться внутри ThemeProvider");
  return ctx;
}
