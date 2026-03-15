import { getOperations } from "@/lib/querys";
import Link from "next/link";
import style from "@/styles/pages/operations-page.module.scss";

export default async function OperationsPage() {
  const operations = await getOperations();

  return (
    <div className={style.container}>
      {operations.map((operation) => (
        <Link key={operation.id} href={`/dashboard/operations/${operation.id}`}>
          {operation.name}
        </Link>
      ))}

      <Link href="/dashboard/operations/new">
        <button>Új</button>
      </Link>
    </div>
  );
}
