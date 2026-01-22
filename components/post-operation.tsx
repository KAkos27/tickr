"use client";

import { useActionState } from "react";
import FromSubmit from "./form-submit";

type OperationActionState = { error?: string; success?: boolean };
type OperationAction = (
  prevState: OperationActionState,
  formData: FormData,
) => Promise<OperationActionState> | OperationActionState;

export default function PostOperation({ action }: { action: OperationAction }) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction}>
      <input type="text" name="name" id="operation-name" />
      <input type="number" name="price" id="operation-price" />
      <FromSubmit buttonText="Létrehozás" pedingText="Betöltés..." />
      {state.error && <div>{state.error}</div>}
    </form>
  );
}
