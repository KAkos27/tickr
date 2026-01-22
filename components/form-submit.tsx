import { useFormStatus } from "react-dom";

export default function FromSubmit({
  buttonText,
  pedingText,
}: {
  buttonText: string;
  pedingText: string;
}) {
  const status = useFormStatus();

  if (status.pending) {
    return <p>{pedingText}</p>;
  }

  return <input type="submit" value={buttonText} />;
}
