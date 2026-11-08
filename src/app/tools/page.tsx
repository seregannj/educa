import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { meta } from "@/lib/data";

export const metadata: Metadata = {
  title: "Инструменты",
  description: "Калькулятор шансов, зарубежные стипендии, избранное и предложения по данным.",
};

const TOOLS: { href: string; title: string; desc: string; icon: IconName }[] = [
  {
    href: "/tools/chances",
    title: "Калькулятор шансов",
    desc: "Введи баллы ЕГЭ — покажем программы, где ты проходишь по проходным 2026.",
    icon: "bolt",
  },
  {
    href: "/za-rubezhom",
    title: "Учёба за рубежом",
    desc: "Стипендии, которые реально покрывают обучение, и дедлайны на 2027.",
    icon: "globe",
  },
  {
    href: "/favorites",
    title: "Избранное",
    desc: "Посты и советы, которые ты сохранил, чтобы вернуться позже.",
    icon: "bookmark",
  },
  {
    href: "/proposals",
    title: "Предложить правку",
    desc: "Нашёл неточность в баллах или стоимости? Собери заявку за минуту.",
    icon: "table",
  },
  {
    href: "/pwa",
    title: "Приложение",
    desc: "Установи educa на телефон — работает как обычное приложение.",
    icon: "install",
  },
];

const SOON = [
  { title: "Сравнение вузов", desc: "До трёх программ рядом: баллы, места, стоимость." },
  { title: "Трекер дедлайнов", desc: "Напоминания о днях открытых дверей и приёме документов." },
];

export default function ToolsPage() {
  return (
    <>
      <PageHeader title="Инструменты" sub="Мини-приложения educa" />

      <div className="tools">
        {TOOLS.map((tool) => (
          <Link href={tool.href} className="tool" key={tool.href}>
            <span className="tool-icon">
              <Icon name={tool.icon} size={20} />
            </span>
            <span>
              <span className="tool-title">{tool.title}</span>
              <span className="tool-desc" style={{ display: "block" }}>
                {tool.desc}
              </span>
            </span>
          </Link>
        ))}

        {SOON.map((tool) => (
          <div className="tool" key={tool.title} style={{ opacity: 0.65 }}>
            <span className="tool-icon">
              <Icon name="sparkle" size={20} />
            </span>
            <span>
              <span className="tool-title">{tool.title}</span>
              <span className="tool-desc" style={{ display: "block" }}>
                {tool.desc}
              </span>
            </span>
            <span className="tool-soon">скоро</span>
          </div>
        ))}
      </div>

      <div className="page">
        <div className="notice">
          Данные: {meta.universities} вузов, {meta.programs} программ, {meta.abroad} зарубежных маршрутов.
          Обновлено {new Date(meta.generatedAt).toLocaleDateString("ru-RU")}.
        </div>
      </div>
    </>
  );
}
