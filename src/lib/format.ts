/** Относительное время для постов: «5м», «2ч», «3д», дальше дата. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "сейчас";
  if (minutes < 60) return `${minutes}м`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}ч`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}д`;

  return new Date(then).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

/** Дата регистрации: «8 ноября 2026 г.» — с днём месяц стоит в родительном падеже. */
export function monthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}
