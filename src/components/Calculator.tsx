"use client";

import { useMemo, useState } from "react";
import { ProgramCard } from "@/components/catalog/ProgramCard";
import { CHANCE_COLOR, CHANCE_LABEL, chanceFor, formatNumber, programs, spheres } from "@/lib/data";

/** Ограда ввода: только цифры, без ведущих нулей, не выше максимума. */
function clampInput(value: string, max: number): string {
  const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return String(Math.min(max, Number(digits)));
}

export function Calculator() {
  const [ru, setRu] = useState("");
  const [math, setMath] = useState("");
  const [third, setThird] = useState("");
  const [extra, setExtra] = useState("");
  const [sphere, setSphere] = useState("all");
  const [budgetOnly, setBudgetOnly] = useState(true);

  const total = [ru, math, third, extra].reduce((sum, value) => sum + (Number(value) || 0), 0);

  const results = useMemo(() => {
    if (total <= 0) return [];
    return programs
      .filter((program) => program.comparable)
      .filter((program) => !budgetOnly || !program.noBudget)
      .filter((program) => sphere === "all" || program.sphere === sphere)
      .map((program) => ({ program, chance: chanceFor(total, program) }))
      .filter((item) => item.chance && item.chance.level !== "unlikely")
      .sort((a, b) => {
        // Сначала те, куда проходишь, внутри группы — самые сильные программы.
        const rank: Record<string, number> = { high: 0, good: 1, edge: 2, low: 3 };
        const byChance = rank[a.chance!.level] - rank[b.chance!.level];
        return byChance !== 0 ? byChance : (b.program.budgetScore ?? 0) - (a.program.budgetScore ?? 0);
      })
      .slice(0, 40);
  }, [total, sphere, budgetOnly]);

  return (
    <div className="page">
      <p className="lead">
        Три ЕГЭ и индивидуальные достижения — максимум 310 баллов. Сравниваем с проходными бюджета 2026.
      </p>

      <div className="score-inputs">
        <div className="field" style={{ marginTop: 0 }}>
          <label htmlFor="score-ru">Русский</label>
          <input
            id="score-ru"
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            placeholder="—"
            value={ru}
            onChange={(event) => setRu(clampInput(event.target.value, 100))}
          />
        </div>
        <div className="field" style={{ marginTop: 0 }}>
          <label htmlFor="score-math">Математика</label>
          <input
            id="score-math"
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            placeholder="—"
            value={math}
            onChange={(event) => setMath(clampInput(event.target.value, 100))}
          />
        </div>
        <div className="field" style={{ marginTop: 0 }}>
          <label htmlFor="score-third">Третий</label>
          <input
            id="score-third"
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            placeholder="—"
            value={third}
            onChange={(event) => setThird(clampInput(event.target.value, 100))}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="score-extra">Индивидуальные достижения (0–10)</label>
        <input
          id="score-extra"
          className="input"
          type="number"
          inputMode="numeric"
          min={0}
          max={10}
          placeholder="0"
          value={extra}
          onChange={(event) => setExtra(clampInput(event.target.value, 10))}
          style={{ maxWidth: 140 }}
        />
      </div>

      <div className="calc-total">
        <b>{formatNumber(total)}</b>
        <span>из 310</span>
      </div>

      <div className="chips">
        <button className={`chip${sphere === "all" ? " on" : ""}`} onClick={() => setSphere("all")}>
          Все сферы
        </button>
        {spheres.map((item) => (
          <button key={item} className={`chip${sphere === item ? " on" : ""}`} onClick={() => setSphere(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="filters">
        <label className="toggle">
          <input type="checkbox" checked={budgetOnly} onChange={(event) => setBudgetOnly(event.target.checked)} />
          Только бюджет
        </label>
        {total > 0 ? <span className="result-count">{results.length} вариантов</span> : null}
      </div>

      {total <= 0 ? (
        <div className="empty">
          Введи баллы — и увидишь, куда проходишь.
          <div className="small" style={{ marginTop: 8 }}>
            Оценка ориентировочная: без олимпиад, квот и ДВИ.
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="empty">
          Пока не хватает баллов ни на одну программу из подборки.
          <div className="small" style={{ marginTop: 8 }}>
            Попробуй снять фильтр «Только бюджет» или другую сферу.
          </div>
        </div>
      ) : (
        <>
          <div className="notice">
            Считаем только программы, где балл сопоставим с суммой ЕГЭ (без ДВИ и 400-балльной шкалы).
            Проходной — это балл последнего зачисленного в 2026, а не гарантия.
          </div>

          <div className="mt-12">
            {results.map(({ program, chance }) => (
              <ProgramCard
                key={program.id}
                program={program}
                action={
                  <span
                    className="badge"
                    style={{ background: "var(--chipbg)", color: CHANCE_COLOR[chance!.level], flex: "0 0 auto" }}
                  >
                    {CHANCE_LABEL[chance!.level]}
                    {chance!.diff >= 0 ? ` +${chance!.diff}` : ` ${chance!.diff}`}
                  </span>
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
