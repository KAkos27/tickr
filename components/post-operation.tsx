"use client";

import { useActionState } from "react";
import { CreateOperationState, FormAction } from "@/types/common";
import FormSubmit from "./form-submit";

export default function PostOperation({
  action,
}: {
  action: FormAction<CreateOperationState>;
}) {
  const [state, formAction] = useActionState<CreateOperationState, FormData>(
    action,
    {},
  );
  return (
    <form action={formAction}>
      <input type="text" name="name" id="operation-name" />
      {state.error?.name.map((error) => (
        <p key={error}>{error}</p>
      ))}
      <input type="number" name="price" id="operation-price" />
      {state.error?.price.map((error) => (
        <p key={error}>{error}</p>
      ))}
      <FormSubmit buttonText="Létrehozás" pedingText="Betöltés..." />
    </form>
  );
}
