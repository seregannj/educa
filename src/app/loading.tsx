/** Скелетон на время перехода: интерфейс не «замирает» на пустом экране. */
export default function Loading() {
  return (
    <div className="skeleton" aria-busy="true" aria-live="polite">
      <div className="sk-head">
        <span className="sk-line w40" />
      </div>
      <div className="sk-body">
        <span className="sk-line w70" />
        <span className="sk-line w90" />
        <span className="sk-line w55" />
        <div className="sk-cards">
          <span className="sk-card" />
          <span className="sk-card" />
          <span className="sk-card" />
        </div>
      </div>
    </div>
  );
}
