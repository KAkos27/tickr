"use client";

import { useFormStatus } from "react-dom";

export default function FormSubmit({
  buttonText,
  pendingText,
}: {
  buttonText: string;
  pendingText: string;
}) {
  const status = useFormStatus();

  return (
    <button type="submit" disabled={status.pending}>
      {status.pending ? pendingText : buttonText}
    </button>
  );
}
