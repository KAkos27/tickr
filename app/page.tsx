import { signIn } from "@/auth";
import Login from "@/components/login";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <div>
      <form
        action={async (formData) => {
          "use server";
          await signIn("resend", formData);
        }}
      >
        <input type="text" name="email" placeholder="Email" />
        <button type="submit">Signin with Resend</button>
      </form>
      {/* <SessionProvider>
        <Login />
      </SessionProvider> */}
    </div>
  );
}
