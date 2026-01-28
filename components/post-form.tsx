"use client";

import type { FormAction } from "@/types/common";
import { ReactNode, useActionState } from "react";

export default function PostForm({
  action,
  children,
}: {
  action: FormAction;
  children: ReactNode;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction}>
      {state.error && (
        <p style={{ color: "crimson", margin: 0 }}>{state.error}</p>
      )}
      {children}
    </form>
  );
}
