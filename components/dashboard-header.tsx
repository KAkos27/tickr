import { auth } from "@/auth";

import style from "@/styles/components/dashboard-header.module.css";

export default async function DashboardHeader() {
  const session = await auth();

  return (
    <div className={style.header}>
      {session?.user && <p>Signed in as {session.user.email}</p>}
    </div>
  );
}
