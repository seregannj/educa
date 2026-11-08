"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { abroadRoutes, getUniversity, programs, universities } from "@/lib/data";
import { posts } from "@/data/posts";

const EXAMPLES = ["ВШЭ", "ПМИ", "проходной", "Венгрия", "МФТИ"];

export function SearchPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return null;

    const hit = (value: string) => {
      const haystack = value.toLowerCase();
      return words.every((word) => haystack.includes(word));
    };

    return {
      universities: universities.filter((uni) => hit(`${uni.name} ${uni.city}`)).slice(0, 4),
      programs: programs
        .filter((program) => hit(`${program.name} ${program.faculty} ${program.uniName} ${program.code ?? ""} ${program.exams}`))
        .slice(0, 8),
      abroad: abroadRoutes.filter((route) => hit(`${route.country} ${route.program} ${route.fields}`)).slice(0, 4),
      posts: posts.filter((post) => hit(`${post.name} ${post.text}`)).slice(0, 4),
    };
  }, [query]);

  const empty =
    results !== null &&
    !results.universities.length &&
    !results.programs.length &&
    !results.abroad.length &&
    !results.posts.length;

  return (
    <div className="page">
      <label className="search" style={{ marginTop: 14 }}>
        <Icon name="search" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Вузы, программы, страны, посты"
          type="search"
          autoFocus
          aria-label="Поиск"
        />
      </label>

      {!results ? (
        <>
          <div className="section-title" style={{ padding: "18px 0 6px" }}>
            Например
          </div>
          <div className="chips">
            {EXAMPLES.map((example) => (
              <button key={example} className="chip" onClick={() => setQuery(example)}>
                {example}
              </button>
            ))}
          </div>
          <div className="empty" style={{ paddingTop: 24 }}>
            Ищи по названию вуза, программе, предмету ЕГЭ или стране.
          </div>
        </>
      ) : empty ? (
        <div className="empty">
          <Icon name="search" size={54} />
          Ничего не нашлось. Попробуй короче: «ПМИ», «ВШЭ», «Китай».
        </div>
      ) : (
        <>
          {results.universities.length ? (
            <Section title="Вузы">
              {results.universities.map((uni) => (
                <Link href={`/vuzy/${uni.id}`} className="list-item" key={uni.id}>
                  <Icon name="uni" size={19} />
                  <span>{uni.name}</span>
                  <span className="val">{uni.programs.length} программ</span>
                </Link>
              ))}
            </Section>
          ) : null}

          {results.programs.length ? (
            <Section title="Программы">
              {results.programs.map((program) => (
                <Link href={`/vuzy/${program.uniId}#${program.id}`} className="list-item" key={program.id}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600 }}>{program.name}</span>
                    <span className="small muted">
                      {getUniversity(program.uniId)?.name} · проходной {program.budgetScoreRaw || "—"}
                    </span>
                  </span>
                  <Icon name="chev" size={16} style={{ marginLeft: "auto", stroke: "var(--muted)", fill: "none" }} />
                </Link>
              ))}
            </Section>
          ) : null}

          {results.abroad.length ? (
            <Section title="За рубежом">
              {results.abroad.map((route) => (
                <Link href="/za-rubezhom" className="list-item" key={route.id}>
                  <span>{route.flag}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600 }}>{route.country}</span>
                    <span className="small muted">{route.program.slice(0, 70)}</span>
                  </span>
                </Link>
              ))}
            </Section>
          ) : null}

          {results.posts.length ? (
            <Section title="Лента">
              {results.posts.map((post) => (
                <Link href="/" className="list-item" key={post.id}>
                  <Icon name="home" size={18} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600 }}>{post.name}</span>
                    <span className="small muted">{post.text.slice(0, 70)}</span>
                  </span>
                </Link>
              ))}
            </Section>
          ) : null}
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="section-title" style={{ padding: "18px 0 6px" }}>
        {title}
      </div>
      <div className="list" style={{ marginTop: 0 }}>
        {children}
      </div>
    </>
  );
}
