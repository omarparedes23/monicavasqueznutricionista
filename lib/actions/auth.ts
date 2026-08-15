"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/utils/rate-limit";

export async function signInWithPassword(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // /dashboard lee el rol y redirige al área correcta (paciente o profesional)
  redirect("/dashboard");
}

export async function signInWithOtp(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;

  // Rate limit por email+IP (mitiga email bombing / spam de cuentas)
  const ip = clientIpFromHeaders(await headers());
  const rl = checkRateLimit(`otp:${email.toLowerCase()}:${ip}`, 3, 60_000);
  if (!rl.ok) {
    return { error: "Demasiados intentos. Esperá un minuto y volvé a intentar." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Revisa tu correo para el enlace mágico." };
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function actualizarPassword(_prevState: unknown, formData: FormData) {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/paciente");
}
