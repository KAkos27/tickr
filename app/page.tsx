import Link from "next/link";
import { auth } from "@/auth";
import style from "@/styles/pages/landing.module.scss";

export default async function Home() {
  const session = await auth();

  return (
    <div className={style.page}>
      <div className={style.hero}>
        <span className={style.eyebrow}>Dental higiéniai szoftver</span>
        <h1 className={style.title}>Tickr</h1>
        <p className={style.subtitle}>
          Időpontkezelés, páciens kartonok és fogászati státusz nyilvántartás
          dental higiénés szakembereknek.
        </p>
        {session && session.user ? (
          <Link href="/dashboard" className={style.cta}>
            Dashboard megnyitása
          </Link>
        ) : (
          <Link href="/sign-in" className={style.cta}>
            Bejelentkezés
          </Link>
        )}
      </div>
    </div>
  );
}
