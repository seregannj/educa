/** Типы данных educa. Формируются scripts/build-data.mjs из CSV в data/. */

export type Program = {
  id: string;
  uniId: string;
  uniName: string;
  no: number;
  name: string;
  code: string | null;
  faculty: string;
  sphere: string;
  sphereRaw: string;
  exams: string;
  budgetScore: number | null;
  budgetScoreRaw: string;
  budgetSeats: number | null;
  budgetSeatsRaw: string;
  paidScore: number | null;
  paidScoreRaw: string;
  price: string;
  priceValue: number | null;
  military: string;
  site: string;
  notes: string;
  bvi: boolean;
  noBudget: boolean;
  needsPhysics: boolean;
  /** Балл можно честно сравнить с суммой ЕГЭ (нет ДВИ и 400-балльной шкалы). */
  comparable: boolean;
  avatarBg: string;
  avatarFg: string;
};

export type University = {
  id: string;
  name: string;
  city: string;
  short: string;
  site: string;
  programs: Program[];
};

export type AbroadRoute = {
  id: string;
  no: number;
  country: string;
  flag: string;
  program: string;
  fields: string;
  language: string;
  coverage: string;
  cost: string;
  requirements: string;
  deadline: string;
  site: string;
  notes: string;
  source: string;
};

export type DataMeta = {
  generatedAt: string;
  universities: number;
  programs: number;
  abroad: number;
  spheres: string[];
};

export type ChanceLevel = "high" | "good" | "edge" | "low" | "unlikely";

export type Post = {
  id: string;
  /** Пост из базы: лайки и подписка живут на сервере, а не в localStorage. */
  db?: boolean;
  authorId?: string;
  liked?: boolean;
  likesCount?: number;
  cat: "useful" | "uni" | "common" | "memes";
  name: string;
  handle?: string;
  uniId?: string;
  time: string;
  bot?: boolean;
  official?: boolean;
  verified?: boolean;
  subscribed?: boolean;
  text: string;
  chip?: string;
  chances?: { name: string; program: string; level: string }[];
  meme?: string;
  likes: number;
  replies: number;
  reposts: number;
};

export type Story = {
  id: string;
  uniId: string;
  handle?: string;
  name: string;
  mono: string;
  bg: string;
  fg: string;
  slides: { title: string; text: string }[];
};
