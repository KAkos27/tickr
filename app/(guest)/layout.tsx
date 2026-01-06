import { auth } from "@/auth";
import { redirect } from "next/navigation";

import type { ChildrenProps } from "@/types/common";

export default async function GuestLayout({ children }: ChildrenProps) {
  const session = await auth();

  if (session && session?.user) {
    return redirect("/dashboard");
  }
  return (
    <div>
      <h2>GuestLayout</h2>
      {children}
    </div>
  );
}
