import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href={"/"}>Home</Link>
      <Link href={"/dashboard/groups"}>Groups</Link>
      <Link href={"/"}>Users</Link>
    </nav>
  );
}
