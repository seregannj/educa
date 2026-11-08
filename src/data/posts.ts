import type { Post } from "@/lib/types";

/**
 * Контент ленты. Пока это редакционный набор: позже он переедет в базу,
 * но структура постов останется такой же.
 */
export const posts: Post[] = [
  {
    id: "p1",
    cat: "useful",
    name: "Поступалка Бот",
    handle: "postupalka-bot",
    bot: true,
    verified: true,
    time: "2ч",
    text: "Обновили проходные-2026: ПМИ ВШЭ — 300, Бауманка ИУ — 290, ФПМИ МФТИ — 310.",
    chip: "Открыть таблицу баллов",
    likes: 342,
    replies: 51,
    reposts: 18,
    chances: [
      { name: "МФТИ", program: "ФПМИ", level: "Высокий шанс" },
      { name: "НИУ ВШЭ", program: "ПМИ", level: "Средний шанс" },
      { name: "МГТУ им. Баумана", program: "ИУ", level: "Низкий шанс" },
    ],
  },
  {
    id: "p2",
    cat: "uni",
    name: "МФТИ",
    uniId: "mfti",
    official: true,
    verified: true,
    subscribed: true,
    time: "5ч",
    text: "День открытых дверей ФПМИ — регистрация уже началась. Успей занять место!",
    likes: 98,
    replies: 12,
    reposts: 4,
  },
  {
    id: "p3",
    cat: "common",
    name: "котоучёный",
    handle: "kotouchyonyi",
    time: "1ч",
    text: "кто тоже решает задачу дня вместо домашки 😅",
    likes: 128,
    replies: 23,
    reposts: 2,
  },
  {
    id: "p4",
    cat: "common",
    name: "чай_с_дедлайном",
    handle: "chay-s-deadline",
    subscribed: true,
    time: "3ч",
    text: "Готовлюсь всю ночь, а утром делаю вид, что всё под контролем. Кто со мной?",
    likes: 87,
    replies: 31,
    reposts: 1,
  },
  {
    id: "p5",
    cat: "memes",
    name: "абитуриент №228",
    handle: "abiturient-228",
    time: "20м",
    text: "когда написал «поступлю куда-нибудь» в заявлении",
    meme: "«куда-нибудь» — это тоже стратегия, если вузов пять",
    likes: 511,
    replies: 140,
    reposts: 66,
  },
  {
    id: "p6",
    cat: "uni",
    name: "НИУ ВШЭ",
    uniId: "niu-vshe",
    official: true,
    verified: true,
    subscribed: true,
    time: "1д",
    text: "Открыт набор на новую программу «ИИ и анализ данных». Мест — 120, проходной прошлого года — 305.",
    likes: 156,
    replies: 9,
    reposts: 22,
  },
];

export const postById = (id: string) => posts.find((p) => p.id === id);

/** Авторы-люди для страниц /u/[handle]. */
export const authors = posts.filter((p) => p.handle && !p.official && !p.bot);

export const authorByHandle = (handle: string) => authors.find((p) => p.handle === handle);
