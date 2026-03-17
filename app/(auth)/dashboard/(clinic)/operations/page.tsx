import { getOperations } from "@/lib/querys";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import style from "@/styles/pages/operations-page.module.scss";

export default async function OperationsPage() {
  const operations = await getOperations();

  return (
    <div className={style.page}>
      <section className={style.hero}>
        <div className={style.heroCopy}>
          <span className={style.eyebrow}>Beavatkozások</span>
          <h1>Árlista és műveletek</h1>
          <p>
            Az aktív rendelőben elérhető kezelések és áraik egy helyen.
          </p>
        </div>
        <Link href="/dashboard/operations/new" className={style.primaryAction}>
          Új beavatkozás
        </Link>
      </section>

      {operations.length === 0 && (
        <div className={style.emptyState}>Még nincs felvett beavatkozás.</div>
      )}

      {operations.length > 0 && (
        <div className={style.grid}>
          {operations.map((operation) => (
            <Link
              key={operation.id}
              href={`/dashboard/operations/${operation.id}`}
              className={style.card}
            >
              <span className={style.cardName}>{operation.name}</span>
              <span className={style.cardPrice}>
                {formatCurrency(operation.price)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
