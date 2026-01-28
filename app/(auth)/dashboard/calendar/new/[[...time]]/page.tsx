import FormSubmit from "@/components/form-submit";
import PostForm from "@/components/post-form";
import { createAppointment } from "@/lib/actions";
import type { Params } from "@/types/route";
import { notFound } from "next/navigation";

type NewAppointmentParams = {
  time?: string[];
};

export default async function NewAppointmenttPage({
  params,
}: Params<NewAppointmentParams>) {
  const { time } = await params;

  if (time && time?.length > 2) {
    notFound();
  }

  const decode = (value: string | undefined) =>
    value ? decodeURIComponent(value) : null;

  const start = decode(time?.[0]);
  const end = decode(time?.[1]);

  console.log(start, end);

  return (
    <div>
      <PostForm action={createAppointment}>
        <input type="text" name="title" />
        <input
          type="datetime-local"
          name="start"
          defaultValue={start ? start : ""}
        />
        <input type="datetime-local" name="end" defaultValue={end ? end : ""} />
        <FormSubmit buttonText="ok" pedingText="pending" />
      </PostForm>
    </div>
  );
}
