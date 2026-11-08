import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ProposalForm } from "@/components/ProposalForm";

export const metadata: Metadata = {
  title: "Предложить правку",
  description: "Сообщи об ошибке в проходных баллах, местах или стоимости обучения.",
};

export default function ProposalsPage() {
  return (
    <>
      <PageHeader title="Предложить правку" sub="Данные проверяются вручную" back="/tools" />
      <ProposalForm />
    </>
  );
}
