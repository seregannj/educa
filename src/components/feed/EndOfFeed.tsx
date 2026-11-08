export function EndOfFeed() {
  return (
    <div className="theend">
      <svg viewBox="0 0 140 100" aria-hidden="true">
        <circle cx="56" cy="40" r="26" fill="none" stroke="var(--blue)" strokeWidth="4.5" />
        <path d="M75 59 98 82" stroke="var(--blue)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="49" cy="36" r="2.6" fill="var(--blue)" />
        <circle cx="64" cy="36" r="2.6" fill="var(--blue)" />
        <path d="M50 46c4 3.5 9 3.5 13 0" fill="none" stroke="var(--blue)" strokeWidth="3" strokeLinecap="round" />
        <path d="M88 18l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="#FFB020" />
        <circle cx="110" cy="50" r="3" fill="var(--good)" />
        <circle cx="24" cy="66" r="2.4" fill="var(--bad)" />
      </svg>
      <div className="t1">Это конец ленты… пока что</div>
      <div className="t2">Новое появится — заглядывай позже 👋</div>
    </div>
  );
}
