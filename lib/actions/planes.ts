"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Plan } from "@/types";

/**
 * Obtiene los planes del paciente autenticado.
 * Usa RLS (anon key): el paciente solo ve sus propios planes.
 */
export async function getMisPlanes(): Promise<Plan[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("nutri_planes")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getMisPlanes] Error:", error);
    return [];
  }

  return (data ?? []) as Plan[];
}

/**
 * Obtiene los planes de un paciente específico.
 * Usa service role para el profesional.
 */
export async function getPlanesPaciente(pacienteId: string): Promise<Plan[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("nutri_planes")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPlanesPaciente] Error:", error);
    return [];
  }

  return (data ?? []) as Plan[];
}

/**
 * Genera una URL firmada para descargar un archivo de plan.
 * Verifica que el usuario tenga acceso al plan antes de firmar.
 */
export async function getPlanSignedUrl(planId: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const serviceClient = createServiceRoleClient();

  // Verificar que el plan existe y el usuario tiene acceso
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  // Usar service role para leer el plan (evita problemas de tipos)
  const db = serviceClient as any;
  const { data: plan } = await db
    .from("nutri_planes")
    .select("id, file_url, paciente_id")
    .eq("id", planId)
    .single();

  if (!plan) return null;

  // Verificar: es el paciente dueño del plan o es profesional
  const { data: perfil } = await db
    .from("nutri_perfiles")
    .select("rol")
    .eq("id", user.user.id)
    .single();

  const isProfesional = perfil?.rol === "profesional";
  const isOwner = plan.paciente_id === user.user.id;

  if (!isProfesional && !isOwner) return null;
  if (!plan.file_url) return null;

  // Generar URL firmada (válida por 60 segundos)
  const { data: signedData, error: signedError } = await serviceClient.storage
    .from("planes")
    .createSignedUrl(plan.file_url, 60);

  if (signedError || !signedData?.signedUrl) {
    console.error("[getPlanSignedUrl] Error:", signedError);
    return null;
  }

  return signedData.signedUrl;
}

export interface CreatePlanInput {
  pacienteId: string;
  titulo: string;
  descripcion?: string;
  filePath: string;
}

/**
 * Crea un registro de plan en la base de datos.
 * Para usar después de subir el archivo a Storage.
 * Usa service role (solo el profesional llama a esto).
 */
export async function createPlanRecord(input: CreatePlanInput): Promise<Plan | null> {
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("nutri_planes")
    .insert({
      paciente_id: input.pacienteId,
      titulo: input.titulo,
      descripcion: input.descripcion ?? null,
      file_url: input.filePath,
      activo: true,
    })
    .select()
    .single();

  if (error) {
    console.error("[createPlanRecord] Error:", error);
    return null;
  }

  return data as Plan;
}
