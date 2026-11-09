import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <p className="lead">Такой страницы нет — возможно, ссылка устарела.</p>
      <div className="empty">
        404
        <div className="small" style={{ marginTop: 8 }}>
          Попробуй каталог вузов, поиск или калькулятор шансов.
        </div>
      </div>
      <div className="chips">
        <Link href="/" className="chip on">
          На главную
        </Link>
        <Link href="/vuzy" className="chip">
          Каталог вузов
        </Link>
        <Link href="/tools/chances" className="chip">
          Калькулятор шансов
        </Link>
      </div>
    </div>
  );
}
