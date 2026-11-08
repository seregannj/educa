import Link from "next/link";
import { formatNumber } from "@/lib/data";
import type { Program } from "@/lib/types";

/** Карточка программы: используется в каталоге и на странице вуза. */
export function ProgramCard({
  program,
  linkToUni = true,
  action,
}: {
  program: Program;
  linkToUni?: boolean;
  action?: React.ReactNode;
}) {
  const hasLetterScore = /[^\d\s]/.test(program.budgetScoreRaw) && !program.noBudget;
  const showScore = program.budgetScore !== null && !program.noBudget;
  // 400-балльную шкалу показываем целиком, чтобы 396 не читалось как сумма ЕГЭ.
  const scale = program.budgetScoreRaw.match(/\/\s*(\d{3})/)?.[1];
  const scoreText = !showScore
    ? "—"
    : scale
      ? `${program.budgetScore}/${scale}`
      : formatNumber(program.budgetScore);
  const exams = program.exams
    .split(/\s*\+\s*/)
    .map((exam) => exam.trim())
    .filter(Boolean);

  const body = (
    <>
      <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="prog-name">{program.name}</div>
          <div className="prog-code">
            {program.code ? `${program.code} · ` : ""}
            {program.faculty}
            {linkToUni ? ` · ${program.uniName}` : ""}
          </div>
        </div>
        {action}
      </div>

      <div className="prog-grid">
        <div className="kv">
          <b>{scoreText}</b>
          <span>проходной 2026</span>
        </div>
        <div className="kv">
          <b>{program.budgetSeats !== null ? formatNumber(program.budgetSeats) : "—"}</b>
          <span>бюджетных мест</span>
        </div>
        <div className="kv">
          <b>{program.paidScore !== null ? formatNumber(program.paidScore) : "—"}</b>
          <span>платное</span>
        </div>
        {program.priceValue ? (
          <div className="kv">
            <b>{formatNumber(program.priceValue)} ₽</b>
            <span>в год</span>
          </div>
        ) : null}
      </div>

      <div className="badges">
        {program.needsPhysics ? <span className="badge warn">нужна физика</span> : null}
        {program.noBudget ? <span className="badge bad">только платно</span> : null}
        {program.bvi ? <span className="badge blue">БВИ</span> : null}
        {hasLetterScore && !program.bvi && !program.noBudget && !program.comparable ? (
          <span className="badge">особая шкала</span>
        ) : null}
        {program.military ? <span className="badge">{program.military}</span> : null}
      </div>

      {exams.length ? (
        <div className="exams">
          {exams.map((exam) => (
            <span className="exam" key={exam}>
              {exam}
            </span>
          ))}
        </div>
      ) : null}

      {hasLetterScore ? <div className="prog-note">Проходной: {program.budgetScoreRaw}</div> : null}
      {program.price && program.price !== "н/д" ? (
        <div className="prog-note">Стоимость: {program.price}</div>
      ) : null}
      {program.notes ? <div className="prog-note">{program.notes}</div> : null}
    </>
  );

  if (!linkToUni) return <div className="prog">{body}</div>;

  return (
    <Link href={`/vuzy/${program.uniId}#${program.id}`} className="prog">
      {body}
    </Link>
  );
}
