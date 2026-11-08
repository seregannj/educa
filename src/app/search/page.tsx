import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SearchPage } from "@/components/SearchPage";

export const metadata: Metadata = { title: "Поиск" };

export default function SearchRoute() {
  return (
    <>
      <PageHeader title="Поиск" back="/" />
      <SearchPage />
    </>
  );
}
