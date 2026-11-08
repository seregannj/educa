"use client";

import { useMemo, useState } from "react";
import { deadlines, type DeadlineCat } from "@/data/deadlines";

const CATS: (DeadlineCat | "all")[] = ["all", "ЕГЭ и олимпиады", "Стипендии за рубеж", "Дни открытых дверей", "Документы"];

const CAT_ICON: Record<DeadlineCat, string> = {
  "ЕГЭ и олимпиады": "🎓",
  "Стипендии за рубеж": "🌍",
  "Дни открытых дверей": "🏛",
  Документы: "📄",
};

function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today.getTime()) / 86400000);
}

function countdownLabel(days: number): string {
  if (days < 0) return "прошло";
  if (days === 0) return "сегодня";
  if (days === 1) return "завтра";
  if (days < 5) return `через ${days} дн.`;
  return `через ${days} дн.`;
}

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

export function Deadlines() {
  const [cat, setCat] = useState<DeadlineCat | "all">("all");
  const [showPast, setShowPast] = useState(false);

  const withDays = useMemo(
    () =>
      deadlines
        .map((d) => ({ ...d, left: daysUntil(d.date) }))
        .sort((a, b) => a.left - b.left),
    [],
  );

  const filtered = withDays.filter((d) => (cat === "all" || d.cat === cat) && (showPast || d.left >= 0));
  const past = withDays.filter((d) => d.left < 0).reverse();
  const soon = filtered.filter((d) => d.left >= 0 && d.left <= 14);

  return (
    <div className="page">
      <style>{DEADLINE_STYLES}</style>

      <div className="chips">
        {CATS.map((item) => (
          <button
            key={item}
            className={`chip${cat === item ? " on" : ""}`}
            onClick={() => setCat(item)}
          >
            {item === "all" ? "Все" : `${CAT_ICON[item as DeadlineCat]} ${item}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">В этой категории пока пусто.</div>
      ) : (
        <div className="dl-list">
          {filtered.map((d) => (
            <a
              key={d.id}
              className={`dl-item${d.left < 0 ? " dl-past" : d.left <= 14 ? " dl-soon" : ""}`}
              href={d.site ? `https://${d.site}` : undefined}
              target="_blank"
              rel="noreferrer"
            >
              <span className="dl-date">
                <b>{fmtDate(d.date)}</b>
                <span className="dl-left">
                  {d.left < 0 ? "прошло" : countdownLabel(d.left)}
                </span>
              </span>
              <span className="dl-body">
                <span className="dl-cat">{CAT_ICON[d.cat]} {d.cat}</span>
                <span className="dl-title">{d.title}</span>
                <span className="dl-note">{d.note}</span>
              </span>
            </a>
          ))}
        </div>
      )}

      {past.length && !showPast ? (
        <button className="btn btn-ghost dl-more" onClick={() => setShowPast(true)}>
          Показать прошедшие ({past.length})
        </button>
      ) : null}

      {showPast && past.length ? (
        <div className="dl-list dl-list-past">
          {past.map((d) => (
            <div key={`p-${d.id}`} className="dl-item dl-past">
              <span className="dl-date">
                <b>{fmtDate(d.date)}</b>
              </span>
              <span className="dl-body">
                <span className="dl-cat">{CAT_ICON[d.cat]} {d.cat}</span>
                <span className="dl-title">{d.title}</span>
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {soon.length ? (
        <div className="notice">
          ⚡ Ближайшие {soon.length} в течение двух недель — не проспи.
        </div>
      ) : null}
    </div>
  );
}

const DEADLINE_STYLES = `
  .chips{display:flex;gap:8px;flex-wrap:wrap}
  .chip{padding:8px 14px;border-radius:999px;border:none;background:var(--chipbg);color:var(--text);
    font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:.15s}
  .chip.on{background:var(--blue-soft);color:var(--blue);font-weight:700}
  .dl-list{display:flex;flex-direction:column}
  .dl-item{display:flex;gap:12px;padding:13px 16px;border-bottom:1px solid var(--line);
    text-decoration:none;color:inherit}
  .dl-item:hover{background:var(--chipbg)}
  .dl-past{opacity:.6}
  .dl-soon{box-shadow:inset 3px 0 0 var(--warn)}
  .dl-date{display:flex;flex-direction:column;gap:2px;min-width:110px;flex:0 0 auto}
  .dl-date b{font-size:13px;font-weight:700}
  .dl-left{font-size:11.5px;color:var(--blue);font-weight:700}
  .dl-past .dl-left{color:var(--muted)}
  .dl-body{display:flex;flex-direction:column;gap:3px;min-width:0}
  .dl-cat{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}
  .dl-title{font-weight:700;font-size:14.5px;line-height:1.35}
  .dl-note{font-size:13px;color:var(--muted);line-height:1.4}
  .dl-more{margin:14px 16px}
  .dl-list-past{opacity:.75}
  .notice{margin:14px 16px;padding:12px 14px;border-radius:12px;background:var(--quotebg);
    color:var(--muted);font-size:13px}
`;
