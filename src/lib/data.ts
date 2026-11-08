import universitiesJson from "@/data/universities.json";
import abroadJson from "@/data/abroad.json";
import metaJson from "@/data/meta.json";
import type { AbroadRoute, ChanceLevel, DataMeta, Program, University } from "./types";

export const universities = universitiesJson as University[];
export const abroadRoutes = abroadJson as AbroadRoute[];
export const meta = metaJson as DataMeta;

export const programs: Program[] = universities.flatMap((u) => u.programs);

/** Порядок сфер фиксирован: IT всегда первым, остальные — по алфавиту. */
export const spheres = [...new Set(programs.map((p) => p.sphere))].sort((a, b) => {
  if (a === "IT") return -1;
  if (b === "IT") return 1;
  return a.localeCompare(b, "ru");
});

export function getUniversity(id: string): University | undefined {
  return universities.find((u) => u.id === id);
}

export function getProgram(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function getRoute(id: string): AbroadRoute | undefined {
  return abroadRoutes.find((r) => r.id === id);
}

const nf = new Intl.NumberFormat("ru-RU");

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : nf.format(value);
}

/** Сумма трёх ЕГЭ + индивидуальные достижения: максимум 310. */
export const MAX_TOTAL = 310;

export function chanceFor(total: number, program: Program): { level: ChanceLevel; diff: number } | null {
  if (!program.comparable || program.budgetScore === null) return null;
  const diff = total - program.budgetScore;
  if (diff >= 25) return { level: "high", diff };
  if (diff >= 5) return { level: "good", diff };
  if (diff >= -10) return { level: "edge", diff };
  if (diff >= -30) return { level: "low", diff };
  return { level: "unlikely", diff };
}

export const CHANCE_LABEL: Record<ChanceLevel, string> = {
  high: "Высокий шанс",
  good: "Хороший шанс",
  edge: "На грани",
  low: "Низкий шанс",
  unlikely: "Маловероятно",
};

export const CHANCE_COLOR: Record<ChanceLevel, string> = {
  high: "var(--good)",
  good: "var(--good)",
  edge: "var(--warn)",
  low: "var(--bad)",
  unlikely: "var(--bad)",
};

/** Минимальный и максимальный проходной балл среди сопоставимых программ вуза. */
export function scoreRange(list: Program[]): { min: number | null; max: number | null } {
  const scores = list
    .map((p) => p.budgetScore)
    .filter((n): n is number => n !== null && n > 0 && n <= 330);
  if (!scores.length) return { min: null, max: null };
  return { min: Math.min(...scores), max: Math.max(...scores) };
}

export function budgetPlaces(list: Program[]): number {
  return list.reduce((sum, p) => sum + (p.budgetSeats ?? 0), 0);
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
