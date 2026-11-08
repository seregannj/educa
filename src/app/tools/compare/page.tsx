import type { Metadata } from "next";
import { Compare } from "@/components/Compare";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Сравнение вузов",
  description: "До трёх программ бок о бок: баллы, места, стоимость и шансы поступления.",
};

export default function ComparePage() {
  return (
    <>
      <PageHeader title="Сравнение вузов" sub="До трёх программ бок о бок — с шансом при твоём балле" back="/tools" />
      <Compare />
    </>
  );
}
