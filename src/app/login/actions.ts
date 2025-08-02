"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const password = formData.get("password");

    // This is a more robust way to check the password
    if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
      cookies().set("session", "1", { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 });
      redirect("/admin");
    } else {
      return "Invalid password.";
    }
  } catch (error: any) {
    if (error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Authentication Error:', error);
    return "An unexpected error occurred. Please check server logs.";
  }
}

export async function logout() {
    cookies().delete("session");
    redirect('/login');
}
