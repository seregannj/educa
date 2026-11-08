import type { Metadata } from "next";
import { InstallGuide } from "@/components/InstallGuide";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Приложение educa",
  description: "Как установить educa на iPhone, Android или компьютер и что работает офлайн.",
};

export default function PwaPage() {
  return (
    <>
      <PageHeader title="Приложение" sub="PWA · установка за 10 секунд" back="/tools" />
      <InstallGuide />
    </>
  );
}
