"use server";

import { signIn } from "@/auth";

export const signInUser = async (formData: FormData) => {
  await signIn("resend", formData);
};
