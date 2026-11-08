import type { Metadata } from "next";
import { Catalog } from "@/components/catalog/Catalog";
import { PageHeader } from "@/components/PageHeader";
import { meta } from "@/lib/data";

export const metadata: Metadata = {
  title: "Вузы и программы",
  description: "Проходные баллы, бюджетные места и стоимость обучения — приём 2026.",
};

export default function UniversitiesPage() {
  return (
    <>
      <PageHeader
        title="Вузы"
        sub={`${meta.universities} вузов · ${meta.programs} программ · приём-2026`}
      />
      <Catalog />
    </>
  );
}
