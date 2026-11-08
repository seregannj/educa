import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Нет сети" };

export default function OfflinePage() {
  return (
    <div className="page" style={{ paddingTop: 60 }}>
      <div className="empty">
        <Icon name="globe" size={54} />
        <b style={{ display: "block", color: "var(--text)", marginBottom: 6 }}>Нет подключения</b>
        Сохранённые страницы откроются, как только появится сеть.
      </div>
      <div className="row" style={{ justifyContent: "center" }}>
        <Link href="/" className="btn">
          На главную
        </Link>
      </div>
    </div>
  );
}
