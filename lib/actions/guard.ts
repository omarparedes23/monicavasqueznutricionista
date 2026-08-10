// ============================================================
// GUARD: verificación de rol profesional (Server Actions)
// ============================================================

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

export interface GuardResultado {
  ok: boolean;
  error?: string;
}

/**
 * Verifica que el usuario autenticado tenga rol "profesional".
 * Debe llamarse al inicio de toda Server Action de escritura del panel
 * (subir planes, fotos, mediciones, productos, etc.).
 */
export async function guardProfesional(): Promise<GuardResultado> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "No autenticado." };

  const { data: perfil } = await createServiceRoleClient()
    .from("nutri_perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "profesional") {
    return { ok: false, error: "No autorizado." };
  }

  return { ok: true };
}
