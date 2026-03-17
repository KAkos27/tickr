"use client";

import { useFormStatus } from "react-dom";

export default function FormSubmit({
  buttonText,
  pedingText,
}: {
  buttonText: string;
  pedingText: string;
}) {
  const status = useFormStatus();

  return (
    <button type="submit" disabled={status.pending}>
      {status.pending ? pedingText : buttonText}
    </button>
  );
}
