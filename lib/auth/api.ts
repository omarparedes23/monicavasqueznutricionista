// ============================================================
// AUTORIZACIÓN: endpoints internos de la API REST
// ============================================================

import type { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Verifica que una petición a la API provenga de un profesional autorizado.
 *
 * Acepta dos mecanismos:
 * 1. **Sesión de usuario** con rol "profesional" (cookies del navegador).
 * 2. **API key dedicada** (`INTEGRATION_API_KEY`) como
 *    `Authorization: Bearer <key>` — para integraciones externas
 *    (bot de Rust) que no usan navegador.
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

  // 2. Integraciones externas (bot de Rust): API key dedicada
  // (INTEGRATION_API_KEY), NUNCA la service role key. Comparación en
  // tiempo constante para evitar timing side-channels.
  const authHeader = request.headers.get("authorization") ?? "";
  const expected = process.env.INTEGRATION_API_KEY;
  if (!expected || !authHeader.startsWith("Bearer ")) return false;
  const provided = authHeader.slice("Bearer ".length);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
