#!/usr/bin/env node
/**
 * Собирает JSON из открытых CSV в data/.
 *
 * Запуск: npm run data
 * Источник правды — CSV. JSON нужен только для скорости и типизации в приложении.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "src", "data");

/** Минимальный CSV-парсер: кавычки, экранированные кавычки, переводы строк внутри ячеек. */
function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.trim()));
}

const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(value) {
  return value
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const AVATAR_COLORS = [
  ["#EEF1FF", "#4C5BD4"],
  ["#FFE9E7", "#D23B2E"],
  ["#FFF4E0", "#C77700"],
  ["#E8F6EC", "#1F8A4C"],
  ["#FDEEF2", "#C2426E"],
  ["#EDEBFF", "#5A4FC4"],
  ["#EAF1FF", "#2E5B9F"],
  ["#F0E8FF", "#7A4FD4"],
];

const SHORT_NAMES = {
  "МГУ им. М.В. Ломоносова": "МГ",
  "МФТИ": "МФ",
  "НИУ ВШЭ": "ВШ",
  "МГТУ им. Н.Э. Баумана": "БМ",
  "НИЯУ МИФИ": "МИ",
  "НИТУ МИСиС": "МС",
  "РЭУ им. Г.В. Плеханова": "РЭ",
  "МАИ": "МА",
  "РТУ МИРЭА": "МР",
  "НИУ МЭИ": "МЭ",
  "МИЭТ": "МЭТ",
  "МТУСИ": "МТ",
  "Московский Политех": "МП",
};

function firstNumber(value) {
  const match = value.match(/\d[\d\s]*/);
  if (!match) return null;
  const n = Number(match[0].replace(/\s+/g, ""));
  return Number.isFinite(n) ? n : null;
}

function splitUniversity(raw) {
  const clean = raw.replace(/^🏛\s*/, "").replace(/^\d+\.\s*/, "").trim();
  const paren = clean.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!paren) return { name: clean, city: "Москва" };
  const name = paren[1].trim();
  const note = paren[2].trim();
  const isCity = /МО|область|Долгопрудный|Москва/.test(note);
  return { name, city: isCity ? note : "Москва" };
}

function normalizeSphere(raw) {
  if (/^Дизайн/i.test(raw)) return "Дизайн";
  if (/нужна физика|Радиотехника/i.test(raw)) return "Инженерия";
  return raw.replace(/\s*\((не подходит[^)]*)\)/i, "").trim() || "Другое";
}

function buildUniversities() {
  const rows = parseCsv(readFileSync(join(root, "data", "vuzy_rf_2026.csv"), "utf8"));
  const [header, ...body] = rows;

  if (!header || header[0] !== "№") {
    throw new Error("Неожиданная шапка CSV: " + JSON.stringify(header));
  }

  const universities = [];
  let current = null;

  for (const row of body) {
    if (!row[1]) continue;

    const isGroup = row[0] === "" && row[1].startsWith("🏛");
    if (isGroup) {
      const { name, city } = splitUniversity(row[1]);
      const id = slugify(name);
      current = {
        id,
        name,
        city,
        short: SHORT_NAMES[name] ?? name.slice(0, 2).toUpperCase(),
        site: row[10] ?? "",
        programs: [],
      };
      universities.push(current);
      continue;
    }

    if (!current || !/^\d+$/.test(row[0])) continue;

    const nameRaw = row[1] ?? "";
    const code = nameRaw.match(/\((\d{2}\.\d{2}\.\d{2})\)/)?.[1] ?? null;
    const name = nameRaw.replace(/\s*\(\d{2}\.\d{2}\.\d{2}\)\s*/, " ").trim();

    const budgetScoreRaw = row[5] ?? "";
    const budgetSeatsRaw = row[6] ?? "";
    const budgetSeats = firstNumber(budgetSeatsRaw);
    const budgetScore = firstNumber(budgetScoreRaw);
    const exams = row[4] ?? "";

    const bvi = /БВИ/i.test(budgetScoreRaw);
    const hasDvi = /ДВИ/i.test(budgetScoreRaw);
    const scale400 = /\/\s*400/.test(budgetScoreRaw);
    const comparable =
      budgetScore !== null && budgetScore > 0 && budgetScore <= 330 && !bvi && !hasDvi && !scale400;

    const index = universities.length - 1;
    const [bg, fg] = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const sphereRaw = row[3] || "Другое";
    const sphere = normalizeSphere(sphereRaw);

    current.programs.push({
      id: `${current.id}-${row[0]}`,
      uniId: current.id,
      uniName: current.name,
      no: Number(row[0]),
      name,
      code,
      faculty: row[2] ?? "",
      sphere,
      sphereRaw,
      exams,
      budgetScore,
      budgetScoreRaw,
      budgetSeats,
      budgetSeatsRaw,
      paidScore: firstNumber(row[7] ?? ""),
      paidScoreRaw: row[7] ?? "",
      price: row[8] ?? "",
      priceValue: firstNumber(row[8] ?? ""),
      military: row[9] ?? "",
      site: row[10] ?? "",
      notes: row[11] ?? "",
      bvi,
      noBudget: budgetSeats === 0 || /бюджета нет/i.test(budgetScoreRaw),
      needsPhysics: /ТРЕБУЕТСЯ ФИЗИКА/.test(exams),
      comparable,
      avatarBg: bg,
      avatarFg: fg,
    });
  }

  return universities;
}

function buildAbroad() {
  const rows = parseCsv(readFileSync(join(root, "data", "zarubezh_2026.csv"), "utf8"));
  const routes = [];

  for (const row of rows) {
    if (!/^\d+$/.test(row[0] ?? "")) continue;
    const rawCountry = row[1] ?? "";
    const [, flag = "", country = rawCountry] = rawCountry.match(/^([^\p{L}]+)\s*(.*)$/u) ?? [];
    routes.push({
      id: slugify(country || rawCountry) || `route-${row[0]}`,
      no: Number(row[0]),
      country: (country || rawCountry).trim(),
      flag: flag.trim(),
      program: row[2] ?? "",
      fields: row[3] ?? "",
      language: row[4] ?? "",
      coverage: row[5] ?? "",
      cost: row[6] ?? "",
      requirements: row[7] ?? "",
      deadline: row[8] ?? "",
      site: row[9] ?? "",
      notes: row[10] ?? "",
      source: row[11] ?? "",
    });
  }
  return routes;
}

const universities = buildUniversities();
const abroad = buildAbroad();
const programs = universities.flatMap((u) => u.programs);

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "universities.json"), JSON.stringify(universities, null, 2) + "\n");
writeFileSync(join(outDir, "abroad.json"), JSON.stringify(abroad, null, 2) + "\n");
writeFileSync(
  join(outDir, "meta.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      universities: universities.length,
      programs: programs.length,
      abroad: abroad.length,
      spheres: [...new Set(programs.map((p) => p.sphere))].sort(),
    },
    null,
    2,
  ) + "\n",
);

console.log(
  `educa data: ${universities.length} вузов, ${programs.length} программ, ${abroad.length} зарубежных маршрутов`,
);
