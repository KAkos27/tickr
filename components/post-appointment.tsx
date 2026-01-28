"use client";

import type { FormAction } from "@/types/common";
import { useActionState } from "react";
import FromSubmit from "./form-submit";

export default function PostAppointment({
  action,
  start,
  end,
}: {
  action: FormAction;
  start: string | null;
  end: string | null;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction}>
      {state.error && (
        <p style={{ color: "crimson", margin: 0 }}>{state.error}</p>
      )}
      <input type="text" name="title" />
      <input
        type="datetime-local"
        name="start"
        defaultValue={start ? start : ""}
      />
      <input type="datetime-local" name="end" defaultValue={end ? end : ""} />
      <FromSubmit buttonText="ok" pedingText="pending" />
    </form>
  );
}
