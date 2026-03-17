import { getOperation } from "@/lib/querys";
import { formatCurrency } from "@/lib/utils";
import type { Params } from "@/types/route";
import { notFound } from "next/navigation";
import Link from "next/link";
import style from "@/styles/pages/operation-detail.module.scss";

export default async function OperationPage({
  params,
}: Params<{ id: string }>) {
  const id = (await params).id;
  const operation = await getOperation(id);

  if (!operation) {
    notFound();
  }

  return (
    <div className={style.page}>
      <Link href="/dashboard/operations" className={style.backLink}>
        Vissza a beavatkozásokhoz
      </Link>

      <section className={style.hero}>
        <span className={style.eyebrow}>Beavatkozás</span>
        <h1>{operation.name}</h1>
        <p>Az aktív rendelőben érvényes ár.</p>
        <div className={style.price}>{formatCurrency(operation.price)}</div>
      </section>
    </div>
  );
}
