import type { Metadata } from "next";
import { Calculator } from "@/components/Calculator";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Калькулятор шансов",
  description: "Введи баллы ЕГЭ и узнай, на какие программы вузов Москвы хватает баллов в 2026.",
};

export default function ChancesPage() {
  return (
    <>
      <PageHeader title="Калькулятор шансов" sub="По проходным баллам приёма-2026" back="/tools" />
      <Calculator />
    </>
  );
}
