import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/PageHeader";
import { abroadRoutes } from "@/lib/data";

export const metadata: Metadata = {
  title: "Учёба за рубежом",
  description: "Бесплатные и почти бесплатные маршруты бакалавриата за рубежом: стипендии, дедлайны, требования.",
};

export default function AbroadPage() {
  return (
    <>
      <PageHeader title="За рубежом" sub={`${abroadRoutes.length} маршрутов · дедлайны 2027`} back="/tools" />

      <div className="page">
        <p className="lead">
          Бесплатное обучение без мифов: что реально покрывает стипендия, что придётся платить самому и когда
          подавать.
        </p>

        {abroadRoutes.map((route) => (
          <details className="prog" key={route.id} style={{ marginTop: 10 }}>
            <summary style={{ cursor: "pointer", listStyle: "none" }}>
              <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="prog-name">
                    {route.flag} {route.country}
                  </div>
                  <div className="prog-code">{route.program}</div>
                </div>
              </div>
              <div className="badges">
                <span className="badge blue">{route.language}</span>
                {/закрыт|заблокировано|⛔/i.test(route.deadline + route.coverage) ? (
                  <span className="badge bad">недоступно</span>
                ) : (
                  <span className="badge good">есть шанс</span>
                )}
              </div>
              <div className="prog-note" style={{ marginTop: 8 }}>
                <b style={{ color: "var(--text)" }}>Дедлайн:</b> {route.deadline}
              </div>
            </summary>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <Block title="Что покрывает" text={route.coverage} />
              <Block title="Сколько стоит без стипендии" text={route.cost} />
              <Block title="Требования" text={route.requirements} />
              <Block title="Направления" text={route.fields} />
              {route.notes ? <Block title="Важно" text={route.notes} /> : null}
              {route.source ? <Block title="Источник" text={route.source} /> : null}
              {route.site ? (
                <a
                  href={`https://${route.site.split(/[;,\s]/)[0].replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="row small"
                  style={{ color: "var(--blue)", fontWeight: 700, gap: 5 }}
                >
                  Официальный сайт
                  <Icon name="external" size={13} />
                </a>
              ) : null}
            </div>
          </details>
        ))}

        <div className="notice">
          Маршруты собраны по официальным сайтам. Правила меняются каждый год — проверяйте дедлайны на сайте
          программы. <Link href="/proposals" style={{ color: "var(--blue)", fontWeight: 700 }}>Предложить правку</Link>.
        </div>
      </div>
    </>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <div className="section-title" style={{ padding: 0, fontSize: 11 }}>
        {title}
      </div>
      <div className="small" style={{ marginTop: 3 }}>
        {text}
      </div>
    </div>
  );
}
