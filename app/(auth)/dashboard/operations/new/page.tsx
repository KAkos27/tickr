import PostOperation from "@/components/post-operation";
import { createOperation } from "@/lib/actions";

export default function NewOperation() {
  return <PostOperation action={createOperation} />;
}
