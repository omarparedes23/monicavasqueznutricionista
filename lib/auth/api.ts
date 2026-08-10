// ============================================================
// AUTORIZACIÓN: endpoints internos de la API REST
// ============================================================

import type { NextRequest } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Verifica que una petición a la API provenga de un profesional autorizado.
 *
 * Acepta dos mecanismos:
 * 1. **Sesión de usuario** con rol "profesional" (cookies del navegador).
 * 2. **Service role key** como `Authorization: Bearer <key>` — para
 *    integraciones externas (bot de Rust) que no usan navegador.
 *
 * Sin esto, el endpoint expondría datos de pacientes a cualquier persona.
 */
export async function esProfesionalAutorizado(request: NextRequest): Promise<boolean> {
  // 1. Sesión de usuario con rol profesional
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: perfil } = await createServiceRoleClient()
        .from("nutri_perfiles")
        .select("rol")
        .eq("id", user.id)
        .single();
      if (perfil?.rol === "profesional") return true;
    }
  } catch (err) {
    console.error("[esProfesionalAutorizado] Error verificando sesión:", err);
  }

  // 2. Fallback para integraciones externas: service role key como Bearer token
  const authHeader = request.headers.get("authorization") ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!serviceKey && authHeader === `Bearer ${serviceKey}`;
}
