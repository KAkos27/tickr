import { redirect } from "next/navigation";
import Nav from "@/components/nav";
import { auth } from "@/auth";

import type { ChildrenProps } from "@/types/common";

export default async function AuthLayout({ children }: ChildrenProps) {
  const session = await auth();

  if (!session || !session.user) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <Nav />
      {session?.user && <p>Signed in as {session.user.email}</p>}
      <h2>Auth layout</h2>
      {children}
    </div>
  );
}
