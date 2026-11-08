"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { ProgramCard } from "./ProgramCard";
import { programs, spheres } from "@/lib/data";
import type { Program } from "@/lib/types";

type Sort = "score-asc" | "score-desc" | "name";

const SORT_LABEL: Record<Sort, string> = {
  "score-asc": "Проходной: по возрастанию",
  "score-desc": "Проходной: по убыванию",
  name: "По названию",
};

function matches(program: Program, words: string[]): boolean {
  if (!words.length) return true;
  const haystack = [program.name, program.faculty, program.uniName, program.exams, program.code, program.notes]
    .join(" ")
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}

export function Catalog() {
  const [query, setQuery] = useState("");
  const [sphere, setSphere] = useState<string>("all");
  const [budgetOnly, setBudgetOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("score-desc");

  const filtered = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return programs
      .filter((program) => matches(program, words))
      .filter((program) => sphere === "all" || program.sphere === sphere)
      .filter((program) => !budgetOnly || (program.budgetSeats ?? 0) > 0)
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name, "ru");
        // Программы без бюджета и с несопоставимой шкалой — всегда в конце.
        const left = a.comparable && a.budgetScore !== null ? a.budgetScore : -1;
        const right = b.comparable && b.budgetScore !== null ? b.budgetScore : -1;
        return sort === "score-asc" ? left - right : right - left;
      });
  }, [query, sphere, budgetOnly, sort]);

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; city: string; items: Program[] }>();
    for (const program of filtered) {
      const group = map.get(program.uniId);
      if (group) group.items.push(program);
      else map.set(program.uniId, { name: program.uniName, city: "", items: [program] });
    }
    return [...map.entries()];
  }, [filtered]);

  const reset = () => {
    setQuery("");
    setSphere("all");
    setBudgetOnly(false);
  };

  return (
    <div className="page">
      <label className="search">
        <Icon name="search" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Вуз, программа, предмет или код"
          type="search"
          aria-label="Поиск по программам"
        />
      </label>

      <div className="chips">
        <button className={`chip${sphere === "all" ? " on" : ""}`} onClick={() => setSphere("all")}>
          Все сферы
        </button>
        {spheres.map((item) => (
          <button
            key={item}
            className={`chip${sphere === item ? " on" : ""}`}
            onClick={() => setSphere(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="filters">
        <label className="toggle">
          <input type="checkbox" checked={budgetOnly} onChange={(event) => setBudgetOnly(event.target.checked)} />
          Только с бюджетом
        </label>

        <select
          className="select"
          value={sort}
          onChange={(event) => setSort(event.target.value as Sort)}
          aria-label="Сортировка"
          style={{ width: "auto", padding: "7px 10px", fontSize: 12.5, borderRadius: 999, background: "var(--bg)" }}
        >
          {(Object.keys(SORT_LABEL) as Sort[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABEL[key]}
            </option>
          ))}
        </select>

        <span className="result-count">{filtered.length} программ</span>
      </div>

      {groups.length === 0 ? (
        <div className="empty">
          <Icon name="search" size={54} />
          Ничего не нашлось.
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-ghost" onClick={reset}>
              Сбросить фильтры
            </button>
          </div>
        </div>
      ) : (
        groups.map(([uniId, group]) => (
          <section className="uni-block" key={uniId}>
            <div className="uni-head">
              <div>
                <div className="uni-name">{group.name}</div>
                <div className="uni-meta">
                  {group.items.length} программ · бюджетных мест{" "}
                  {group.items.reduce((sum, item) => sum + (item.budgetSeats ?? 0), 0)}
                </div>
              </div>
            </div>
            {group.items.map((program) => (
              <ProgramCard key={program.id} program={program} linkToUni={false} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
