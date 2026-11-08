"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/providers/ToastProvider";
import { programs, universities } from "@/lib/data";

const FIELDS = [
  "Проходной балл (бюджет)",
  "Проходной балл (платно)",
  "Количество бюджетных мест",
  "Стоимость обучения",
  "Требуемые ЕГЭ",
  "Другое",
];

const DRAFT_KEY = "educa:proposal:v1";

type Draft = {
  uniId: string;
  programId: string;
  field: string;
  value: string;
  source: string;
  comment: string;
};

const EMPTY: Draft = { uniId: "", programId: "", field: FIELDS[0], value: "", source: "", comment: "" };

export function ProposalForm() {
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setDraft({ ...EMPTY, ...(JSON.parse(raw) as Partial<Draft>) });
    } catch {
      /* черновик не восстановился */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* приватный режим */
    }
  }, [draft]);

  const uniPrograms = useMemo(
    () => programs.filter((program) => program.uniId === draft.uniId),
    [draft.uniId],
  );

  const program = programs.find((item) => item.id === draft.programId);
  const university = universities.find((item) => item.id === draft.uniId);

  const currentValue = (() => {
    if (!program) return "—";
    switch (draft.field) {
      case FIELDS[0]:
        return program.budgetScoreRaw || "—";
      case FIELDS[1]:
        return program.paidScoreRaw || "—";
      case FIELDS[2]:
        return program.budgetSeatsRaw || "—";
      case FIELDS[3]:
        return program.price || "—";
      case FIELDS[4]:
        return program.exams || "—";
      default:
        return "—";
    }
  })();

  const ready = Boolean(draft.uniId && draft.programId && draft.value.trim());

  const markdown = `## Правка данных educa

- **Вуз:** ${university?.name ?? "—"}
- **Программа:** ${program?.name ?? "—"}${program?.code ? ` (${program.code})` : ""}
- **Поле:** ${draft.field}
- **Сейчас в таблице:** ${currentValue}
- **Новое значение:** ${draft.value.trim() || "—"}
- **Источник:** ${draft.source.trim() || "—"}
- **Комментарий:** ${draft.comment.trim() || "—"}
`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast("Заявка скопирована — можно отправить в Telegram или GitHub");
    } catch {
      toast("Не удалось скопировать, выдели текст вручную");
    }
  };

  return (
    <div className="page">
      <p className="lead">
        Таблица живёт на открытых данных: баллы, места и стоимость проверяются вручную. Заявка выглядит как
        правка на GitHub, только проще.
      </p>

      <div className="field">
        <label htmlFor="proposal-uni">Вуз</label>
        <select
          id="proposal-uni"
          className="select"
          value={draft.uniId}
          onChange={(event) => setDraft({ ...draft, uniId: event.target.value, programId: "" })}
        >
          <option value="">Выбери вуз</option>
          {universities.map((uni) => (
            <option key={uni.id} value={uni.id}>
              {uni.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="proposal-program">Программа</label>
        <select
          id="proposal-program"
          className="select"
          value={draft.programId}
          onChange={(event) => setDraft({ ...draft, programId: event.target.value })}
          disabled={!draft.uniId}
        >
          <option value="">{draft.uniId ? "Выбери программу" : "Сначала выбери вуз"}</option>
          {uniPrograms.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} {item.code ? `(${item.code})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="proposal-field">Что меняем</label>
        <select
          id="proposal-field"
          className="select"
          value={draft.field}
          onChange={(event) => setDraft({ ...draft, field: event.target.value })}
        >
          {FIELDS.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>

      {program ? (
        <div className="small muted" style={{ marginTop: 6 }}>
          Сейчас в таблице: {currentValue}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="proposal-value">Новое значение</label>
        <input
          id="proposal-value"
          className="input"
          value={draft.value}
          onChange={(event) => setDraft({ ...draft, value: event.target.value })}
          placeholder="Например, 312"
        />
      </div>

      <div className="field">
        <label htmlFor="proposal-source">Ссылка на источник</label>
        <input
          id="proposal-source"
          className="input"
          value={draft.source}
          onChange={(event) => setDraft({ ...draft, source: event.target.value })}
          placeholder="https://pk.mipt.ru/…"
          inputMode="url"
        />
      </div>

      <div className="field">
        <label htmlFor="proposal-comment">Комментарий</label>
        <textarea
          id="proposal-comment"
          className="textarea"
          value={draft.comment}
          onChange={(event) => setDraft({ ...draft, comment: event.target.value })}
          placeholder="Что именно не так и почему"
        />
      </div>

      <div className="row mt-12">
        <button className="btn" onClick={copy} disabled={!ready}>
          <Icon name="copy" size={17} />
          Скопировать заявку
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setDraft(EMPTY);
            toast("Черновик очищен");
          }}
        >
          Очистить
        </button>
      </div>

      <div className="section-title" style={{ padding: "18px 0 6px" }}>
        Заявка целиком
      </div>
      <pre className="md-preview">{ready ? markdown : "Заполни вуз, программу и новое значение — здесь появится готовая заявка."}</pre>

      <div className="notice">
        <b>Как это будет работать.</b> Заявка уходит в очередь, автофильтр проверяет ссылку и формат, спорные
        случаи смотрит модератор. После правки в таблице остаётся история изменений.
      </div>
    </div>
  );
}
