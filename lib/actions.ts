"use server";

import { signIn } from "@/auth";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const signInUser = async (formData: FormData) => {
  await signIn("resend", formData);
};

export const createOperation = async (
  _prevState: unknown,
  formData: FormData,
) => {
  const name = formData.get("name")?.toString().trim() ?? "";
  const price = Number(formData.get("price")?.toString().trim() ?? "");

  if (!name || Number.isNaN(price) || price < 0) {
    return { error: "Hibás név vagy ár" };
  }

  try {
    await prisma.operation.create({
      data: { name, price },
    });
  } catch {
    return { error: "Adatbázis hiba" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/operations");
};
