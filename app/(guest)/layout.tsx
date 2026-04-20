import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import style from "@/styles/layouts/guest-layout.module.scss";

export default async function GuestLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (session && session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className={style.container}>
      <div className={style.card}>
        <div className={style.brand}>Tickr</div>
        {children}
      </div>
    </div>
  );
}
