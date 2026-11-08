/** Моно-аватары: у вузов из прототипа сохранены фирменные цвета. */
const KNOWN: Record<string, [string, string, string]> = {
  "Поступалка Бот": ["ПБ", "#EEF1FF", "#4C5BD4"],
  МФТИ: ["МФ", "#FFE9E7", "#D23B2E"],
  "НИУ ВШЭ": ["ВШ", "#FFF4E0", "#C77700"],
  котоучёный: ["КО", "#E8F6EC", "#1F8A4C"],
  чай_с_дедлайном: ["ЧД", "#FFF6E8", "#B26A00"],
  "абитуриент №228": ["А2", "#F0E8FF", "#7A4FD4"],
};

const PALETTE: [string, string][] = [
  ["#EAF1FF", "#2E5B9F"],
  ["#FDEEF2", "#C2426E"],
  ["#EDEBFF", "#5A4FC4"],
  ["#E8F6EC", "#1F8A4C"],
  ["#FFF4E0", "#C77700"],
  ["#FFE9E7", "#D23B2E"],
];

export function avatarFor(name: string, short?: string): { mono: string; bg: string; fg: string } {
  const known = KNOWN[name];
  if (known) return { mono: known[0], bg: known[1], fg: known[2] };

  const letters = short ?? name.replace(/[«»"]/g, "").slice(0, 2).toUpperCase();
  let hash = 0;
  for (const ch of name) hash = (hash + ch.charCodeAt(0)) % PALETTE.length;
  const [bg, fg] = PALETTE[hash];
  return { mono: letters, bg, fg };
}
