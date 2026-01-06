import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div>
      {session && session.user ? (
        <Link href={"/dashboard"}>Dashboard</Link>
      ) : (
        <Link href={"/sign-in"}>Sign In</Link>
      )}
    </div>
  );
}
