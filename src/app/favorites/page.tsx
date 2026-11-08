import type { Metadata } from "next";
import { FavoritesView } from "@/components/FavoritesView";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Избранное" };

export default function FavoritesPage() {
  return (
    <>
      <PageHeader title="Избранное" back="/profile" />
      <FavoritesView />
    </>
  );
}
