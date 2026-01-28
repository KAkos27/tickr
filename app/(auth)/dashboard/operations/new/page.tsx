import FormSubmit from "@/components/form-submit";
import PostForm from "@/components/post-form";
import { createOperation } from "@/lib/actions";

export default function NewOperation() {
  return (
    <PostForm action={createOperation}>
      <input type="text" name="name" id="operation-name" />
      <input type="number" name="price" id="operation-price" />
      <FormSubmit buttonText="Létrehozás" pedingText="Betöltés..." />
    </PostForm>
  );
}
