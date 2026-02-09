import { auth } from "@/auth";

import style from "@/styles/components/dashboard-header.module.scss";
import Link from "next/link";

export default async function DashboardHeader() {
  const session = await auth();

  return (
    <div className={style.header}>
      <div>
        <Link href={"/"}>Home</Link>
        <Link href={"/dashboard/patients"}>Páciensek</Link>
        <Link href={"/dashboard/appointments"}>Naptár</Link>
        <Link href={"/dashboard/operations"}>Beavatkozások</Link>
        <Link href={"/"}>Felhasználók</Link>
      </div>
      {session?.user && <div>Signed in as {session.user.email}</div>}
    </div>
  );
}
