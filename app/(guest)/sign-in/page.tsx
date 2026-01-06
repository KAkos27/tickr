import { signInUser } from "@/lib/actions";

export default async function SignInPage() {
  return (
    <div>
      <form action={signInUser}>
        <input type="text" name="email" placeholder="Email" />
        <button type="submit">Signin with Resend</button>
      </form>
    </div>
  );
}
