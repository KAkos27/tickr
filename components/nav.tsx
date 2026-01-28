import Link from "next/link";

import stlye from "@/styles/components/nav.module.scss";

export default function Nav() {
  return (
    <nav className={stlye.nav}>
      <Link href={"/"}>Home</Link>
      <Link href={"/dashboard/patients"}>Páciensek</Link>
      <Link href={"/dashboard/calendar"}>Naptár</Link>
      <Link href={"/dashboard/operations"}>Beavatkozások</Link>
      <Link href={"/"}>Felhasználók</Link>
    </nav>
  );
}
