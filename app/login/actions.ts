"use server";

import { redirect } from "next/navigation";
import { verifyCredentials } from "@/lib/auth";
import { createSession } from "@/lib/session";

type LoginState = { error: string } | null;

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Escribe tu email y tu contraseña." };
  }

  const user = await verifyCredentials(email, password);

  if (!user) {
    // Mensaje genérico a propósito: no revelamos si el email existe.
    return { error: "Email o contraseña incorrectos." };
  }

  await createSession({ id: user.id, name: user.name });
  redirect("/dashboard");
}
