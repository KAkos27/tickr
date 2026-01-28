import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { ReactNode } from "react";

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
    <div>
      <h2>GuestLayout</h2>
      {children}
    </div>
  );
}
