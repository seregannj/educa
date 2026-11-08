import Link from "next/link";
import { Icon } from "./Icon";

export function PageHeader({
  title,
  sub,
  back,
}: {
  title: string;
  sub?: string;
  back?: string;
}) {
  return (
    <div className="page-head">
      {back !== undefined ? (
        <Link href={back} className="back" aria-label="Назад">
          <Icon name="back" size={18} />
        </Link>
      ) : null}
      <div style={{ minWidth: 0 }}>
        <div className="page-title">{title}</div>
        {sub ? <div className="page-sub">{sub}</div> : null}
      </div>
    </div>
  );
}
