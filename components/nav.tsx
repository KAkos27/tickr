import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href={"/"}>Home</Link>
      <Link href={"/dashboard/patients"}>Páciensek</Link>
      <Link href={"/dashboard/calendar"}>Naptár</Link>
      <Link href={"/dashboard/operations"}>Beavatkozások</Link>
      <Link href={"/"}>Felhasználók</Link>
    </nav>
  );
}
