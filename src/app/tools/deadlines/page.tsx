import type { Metadata } from "next";
import { Deadlines } from "@/components/Deadlines";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Трекер дедлайнов",
  description: "Дни открытых дверей, стипендии, ЕГЭ и приёмная кампания — с обратным отсчётом.",
};

export default function DeadlinesPage() {
  return (
    <>
      <PageHeader title="Трекер дедлайнов" sub="Не проспи: даты, которые решают" back="/tools" />
      <Deadlines />
    </>
  );
}
