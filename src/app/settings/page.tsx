import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SettingsView } from "@/components/SettingsView";

export const metadata: Metadata = { title: "Настройки" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Настройки" back="/profile" />
      <SettingsView />
    </>
  );
}
