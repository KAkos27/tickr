import { signInUser } from "@/lib/actions";
import FormSubmit from "@/components/form-submit";
import style from "@/styles/pages/sign-in.module.scss";

export default async function SignInPage() {
  return (
    <div className={style.wrapper}>
      <h1 className={style.title}>Bejelentkezés</h1>
      <p className={style.subtitle}>
        Add meg az email címed, és küldünk egy bejelentkezési linket.
      </p>
      <form action={signInUser} className={style.form}>
        <div className={style.field}>
          <label htmlFor="email">Email cím</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="pelda@email.com"
            required
          />
        </div>
        <FormSubmit buttonText="Bejelentkezés" pendingText="Küldés..." />
      </form>
    </div>
  );
}
