"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { CHANCE_COLOR, CHANCE_LABEL, chanceFor, formatNumber, programs } from "@/lib/data";
import type { Program } from "@/lib/types";

const MAX_PICKED = 3;

export function Compare() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Program[]>([]);
  const [total, setTotal] = useState<number | null>(null);

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return programs
      .filter((p) => {
        const hay = [p.name, p.faculty, p.uniName, p.exams, p.code].join(" ").toLowerCase();
        return words.every((word) => hay.includes(word));
      })
      .filter((p) => !picked.some((x) => x.id === p.id))
      .slice(0, 8);
  }, [query, picked]);

  const pick = (program: Program) => {
    setPicked((prev) => (prev.length >= MAX_PICKED ? prev : [...prev, program]));
    setQuery("");
  };

  const remove = (id: string) => setPicked((prev) => prev.filter((p) => p.id !== id));

  const rows: { label: string; render: (p: Program) => string }[] = [
    { label: "Вуз", render: (p) => p.uniName },
    { label: "Экзамены", render: (p) => p.exams },
    { label: "Проходной (бюджет)", render: (p) => (p.budgetScore === null ? "—" : `${p.budgetScore}${p.bvi ? " · БВИ" : ""}`) },
    { label: "Бюджетных мест", render: (p) => (p.budgetSeats === null ? "—" : formatNumber(p.budgetSeats)) },
    { label: "Проходной (платное)", render: (p) => (p.paidScore === null ? "н/д" : String(p.paidScore)) },
    { label: "Стоимость ₽/год", render: (p) => p.price || "н/д" },
    { label: "Военная кафедра", render: (p) => p.military },
  ];

  return (
    <div className="page">
      <style>{COMPARE_STYLES}</style>

      <label className="search">
        <Icon name="search" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={picked.length >= MAX_PICKED ? "Максимум 3 программы" : "Вуз или программа — добавить к сравнению"}
          type="search"
          aria-label="Поиск программы для сравнения"
        />
      </label>

      {results.length ? (
        <div className="cmp-results">
          {results.map((p) => (
            <button key={p.id} className="cmp-item" onClick={() => pick(p)}>
              <b>{p.uniName}</b>
              <span>{p.name}</span>
              <span className="cmp-item-meta">Проходной: {p.budgetScore ?? "—"} · {p.exams}</span>
            </button>
          ))}
        </div>
      ) : null}

      {picked.length ? (
        <div className="cmp-scroll">
          <table className="cmp">
            <thead>
              <tr>
                <th className="cmp-label">Критерий</th>
                {picked.map((p) => (
                  <th key={p.id}>
                    <button className="cmp-x" onClick={() => remove(p.id)} aria-label={`Убрать ${p.name}`}>
                      ✕
                    </button>
                    <div className="cmp-uni">{p.uniName}</div>
                    <div className="cmp-name">{p.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="cmp-label">{row.label}</td>
                  {picked.map((p) => (
                    <td key={p.id}>{row.render(p)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="cmp-label">Шанс при твоём балле</td>
                {picked.map((p) => {
                  const chance = total !== null ? chanceFor(total, p) : null;
                  return (
                    <td key={p.id} style={{ color: chance ? CHANCE_COLOR[chance.level] : "var(--muted)", fontWeight: 700 }}>
                      {chance ? CHANCE_LABEL[chance.level] : "введи балл"}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          Добавь до трёх программ — сравним баллы, места, стоимость и шансы бок о бок.
        </div>
      )}

      <div className="cmp-score">
        <label htmlFor="cmp-total">Твой балл (ЕГЭ + ИД):</label>
        <input
          id="cmp-total"
          type="number"
          min={0}
          max={310}
          value={total ?? ""}
          onChange={(event) => setTotal(event.target.value === "" ? null : Math.max(0, Math.min(310, Number(event.target.value))))}
          placeholder="0–310"
        />
        <span>/ {310}</span>
      </div>
    </div>
  );
}

const COMPARE_STYLES = `
  .cmp-results{display:flex;flex-direction:column;gap:6px;margin-top:10px}
  .cmp-item{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border:1px solid var(--line);
    border-radius:12px;background:var(--bg);cursor:pointer;text-align:left;font:inherit;color:inherit}
  .cmp-item:hover{background:var(--chipbg)}
  .cmp-item span:last-child,.cmp-item-meta{font-size:12.5px;color:var(--muted)}
  .cmp-scroll{overflow-x:auto;margin-top:14px;-webkit-overflow-scrolling:touch}
  .cmp{border-collapse:collapse;width:100%;min-width:540px}
  .cmp th,.cmp td{border:1px solid var(--line);padding:9px 10px;font-size:13px;text-align:left;vertical-align:top}
  .cmp .cmp-label{color:var(--muted);font-weight:600;white-space:nowrap;background:var(--quotebg)}
  .cmp th{min-width:120px;position:relative}
  .cmp-uni{font-weight:700;font-size:13px}
  .cmp-name{font-size:12px;color:var(--muted);margin-top:2px}
  .cmp-x{position:absolute;top:6px;right:6px;width:20px;height:20px;border:none;background:var(--chipbg);
    border-radius:50%;cursor:pointer;font-size:10px;color:var(--muted);line-height:1}
  .cmp-score{display:flex;align-items:center;gap:8px;margin-top:14px;font-size:13.5px;color:var(--muted)}
  .cmp-score input{width:80px;padding:8px 10px;border:1px solid var(--line);border-radius:10px;
    background:var(--bg);color:var(--text);font:inherit;font-weight:700}
`;
