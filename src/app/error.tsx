"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page">
      <p className="lead">Что-то сломалось на нашей стороне.</p>
      <div className="empty">
        Перезагрузи раздел — иногда помогает со второго раза.
        <div className="small" style={{ marginTop: 8 }}>
          Если ошибка повторяется, загляни позже: мы уже смотрим.
          {error.digest ? ` Код ошибки: ${error.digest}.` : ""}
        </div>
      </div>
      <div className="mt-12">
        <button className="btn" onClick={reset}>
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
