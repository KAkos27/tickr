"use client";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/webauthn";
import { signIn as devSignIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const { status } = useSession();
  const [email, setEmail] = useState("");

  return (
    <div>
      {status === "unauthenticated" && (
        <div style={{ display: "grid", gap: 8 }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={() => devSignIn("credentials", { email })}>
            Sign in (dev)
          </button>
          <button onClick={() => signIn("passkey")}>
            Sign in with Passkey
          </button>
        </div>
      )}
      {status === "authenticated" && (
        <button onClick={() => signIn("passkey", { action: "register" })}>
          Register new Passkey
        </button>
      )}
    </div>
  );
}
