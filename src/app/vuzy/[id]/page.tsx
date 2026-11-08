import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { ProgramCard } from "@/components/catalog/ProgramCard";
import { budgetPlaces, getUniversity, scoreRange, universities } from "@/lib/data";

export function generateStaticParams() {
  return universities.map((uni) => ({ id: uni.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const uni = getUniversity(id);
  if (!uni) return { title: "Вуз не найден" };
  return {
    title: uni.name,
    description: `${uni.name}: ${uni.programs.length} программ, проходные баллы и бюджетные места приёма-2026.`,
  };
}

export default async function UniversityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uni = getUniversity(id);
  if (!uni) notFound();

  const range = scoreRange(uni.programs);
  const places = budgetPlaces(uni.programs);
  const colors = uni.programs[0];

  return (
    <>
      <PageHeader title={uni.name} sub={uni.city} back="/vuzy" />

      <div className="uni-hero">
        <span className="ava-xl" style={{ background: colors?.avatarBg, color: colors?.avatarFg }}>
          {uni.short}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{uni.name}</div>
          <div className="uni-meta" style={{ marginTop: 3 }}>
            {uni.city}
          </div>
          {uni.site ? (
            <a
              href={`https://${uni.site.split(" ")[0].replace(/^https?:\/\//, "")}`}
              target="_blank"
              rel="noreferrer noopener"
              className="row"
              style={{ gap: 4, marginTop: 6, fontSize: 12.5, fontWeight: 700, color: "var(--blue)" }}
            >
              {uni.site.split(" ")[0]}
              <Icon name="external" size={13} />
            </a>
          ) : null}
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <b>{uni.programs.length}</b>
          <span>программ</span>
        </div>
        <div className="stat">
          <b>{places}</b>
          <span>бюджетных мест</span>
        </div>
        <div className="stat">
          <b>{range.min !== null ? `${range.min}–${range.max ?? range.min}` : "—"}</b>
          <span>проходной 2026</span>
        </div>
      </div>

      <div className="section-title">Программы</div>

      <div className="page" style={{ paddingTop: 0 }}>
        {uni.programs.map((program) => (
          <ProgramCard key={program.id} program={program} linkToUni={false} />
        ))}

        <div className="notice">
          Данные приёма-2026 из открытых источников. Нашли ошибку?{" "}
          <Link href="/proposals" style={{ color: "var(--blue)", fontWeight: 700 }}>
            Предложите правку
          </Link>
          .
        </div>
      </div>
    </>
  );
}
