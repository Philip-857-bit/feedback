"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const password = formData.get("password");
    if (password === process.env.ADMIN_PASSWORD) {
      cookies().set("session", "1", { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 });
      redirect("/admin");
    } else {
      return "Invalid password.";
    }
  } catch (error) {
    console.error(error);
    return "An unexpected error occurred.";
  }
}

export async function logout() {
    cookies().delete("session");
    redirect('/login');
}
