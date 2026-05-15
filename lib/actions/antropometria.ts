"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { Antropometria } from "@/types";

/**
 * Obtiene el historial de antropometría del paciente autenticado.
 * Usa RLS (anon key): el paciente solo ve sus propios datos.
 */
export async function getMiHistorial(): Promise<Antropometria[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("nutri_antropometria")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    console.error("[getMiHistorial] Error:", error);
    return [];
  }

  return (data ?? []) as Antropometria[];
}

/**
 * Obtiene el historial de antropometría de un paciente específico.
 * Usa service role para que el profesional pueda ver cualquier paciente.
 */
export async function getHistorialPaciente(pacienteId: string): Promise<Antropometria[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("nutri_antropometria")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("[getHistorialPaciente] Error:", error);
    return [];
  }

  return (data ?? []) as Antropometria[];
}

/**
 * Obtiene la última medición del paciente autenticado.
 */
export async function getMiUltimaMedicion(): Promise<Antropometria | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("nutri_antropometria")
    .select("*")
    .order("fecha", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[getMiUltimaMedicion] Error:", error);
    }
    return null;
  }

  return data as Antropometria;
}

/**
 * Registra una medición antropométrica para un paciente específico.
 * Solo para uso del profesional — usa service role para saltear RLS.
 */
export async function addMedicionPorProfesional(
  pacienteId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: Antropometria }> {
  const pesoRaw = formData.get("peso") as string;
  const fecha = formData.get("fecha") as string;

  const peso = parseFloat(pesoRaw);
  if (isNaN(peso) || peso <= 0) {
    return { success: false, error: "El peso es requerido y debe ser un número válido." };
  }
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return { success: false, error: "La fecha es requerida y debe tener formato YYYY-MM-DD." };
  }

  const grasaRaw = formData.get("porcentaje_grasa") as string;
  const cinturaRaw = formData.get("cintura") as string;
  const caderaRaw = formData.get("cadera") as string;
  const notas = (formData.get("notas") as string) || null;

  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("nutri_antropometria")
    .insert({
      paciente_id: pacienteId,
      peso,
      porcentaje_grasa: grasaRaw ? parseFloat(grasaRaw) : null,
      cintura: cinturaRaw ? parseFloat(cinturaRaw) : null,
      cadera: caderaRaw ? parseFloat(caderaRaw) : null,
      fecha,
      notas,
    })
    .select()
    .single();

  if (error) {
    console.error("[addMedicionPorProfesional] Error:", error);
    return { success: false, error: "Error al guardar la medición." };
  }

  return { success: true, data: data as Antropometria };
}

export interface AddMedicionInput {
  peso: number;
  porcentaje_grasa?: number;
  cintura?: number;
  cadera?: number;
  fecha: string;
  notas?: string;
}

export interface AddMedicionResult {
  success: boolean;
  error?: string;
  data?: Antropometria;
}

/**
 * Registra una nueva medición para el paciente autenticado.
 * RLS verifica que paciente_id = auth.uid().
 */
export async function addMedicion(input: AddMedicionInput): Promise<AddMedicionResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  // @supabase/ssr v0.6.1 + supabase-js v2.99.x type incompatibility — cast to any
  const db = supabase as any;

  const { data, error } = await db
    .from("nutri_antropometria")
    .insert({
      paciente_id: user.id,
      peso: input.peso,
      porcentaje_grasa: input.porcentaje_grasa ?? null,
      cintura: input.cintura ?? null,
      cadera: input.cadera ?? null,
      fecha: input.fecha,
      notas: input.notas ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[addMedicion] Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Antropometria };
}
