import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardHeader from "@/components/dashboard-header";

import style from "@/styles/layouts/auth-layout.module.scss";
import { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  return (
    <div className={style.dashboardContainer}>
      <DashboardHeader />
      <div className={style.container}>{children}</div>
    </div>
  );
}
