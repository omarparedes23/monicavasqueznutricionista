"use server";

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { guardProfesional } from "@/lib/actions/guard";
import { r2Client, R2_BUCKET } from "@/lib/r2/client";
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
  const guard = await guardProfesional();
  if (!guard.ok) return [];

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
 * Genera una URL firmada para descargar un plan.
 * - file_url empieza con "pacientes/" → R2 (nuevo)
 * - file_url empieza con "planes/"    → Supabase Storage (legado)
 */
export async function getPlanSignedUrl(planId: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const serviceClient = createServiceRoleClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data: plan } = await serviceClient
    .from("nutri_planes")
    .select("id, file_url, paciente_id")
    .eq("id", planId)
    .single();

  if (!plan?.file_url) return null;

  const guard = await guardProfesional();
  const isOwner = plan.paciente_id === user.user.id;
  if (!guard.ok && !isOwner) return null;

  // R2 (nuevos archivos)
  if (plan.file_url.startsWith("pacientes/")) {
    try {
      const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: plan.file_url });
      return await getSignedUrl(r2Client, cmd, { expiresIn: 60 });
    } catch (err) {
      console.error("[getPlanSignedUrl] Error R2:", err);
      return null;
    }
  }

  // Supabase Storage (legado: file_url empieza con "planes/")
  const { data: signedData, error: signedError } = await serviceClient.storage
    .from("planes")
    .createSignedUrl(plan.file_url, 60);

  if (signedError || !signedData?.signedUrl) {
    console.error("[getPlanSignedUrl] Error Supabase:", signedError);
    return null;
  }

  return signedData.signedUrl;
}

/**
 * Sube un PDF a Cloudflare R2 y crea el registro en DB.
 * Estrategia: upload primero, INSERT después.
 */
export async function subirPlanProfesional(
  pacienteId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: Plan }> {
  const guard = await guardProfesional();
  if (!guard.ok) return { success: false, error: guard.error };

  const titulo = (formData.get("titulo") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || undefined;
  const file = formData.get("file") as File | null;

  if (!titulo) return { success: false, error: "El título es requerido." };
  if (!file || file.size === 0) return { success: false, error: "Seleccioná un archivo PDF." };
  if (file.type !== "application/pdf") return { success: false, error: "Solo se aceptan archivos PDF." };
  if (file.size > 10 * 1024 * 1024) return { success: false, error: "El archivo no puede superar los 10MB." };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const r2Key = `pacientes/${pacienteId}/planes/${crypto.randomUUID()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    await r2Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: r2Key,
      Body: buffer,
      ContentType: "application/pdf",
    }));
  } catch (err) {
    console.error("[subirPlanProfesional] R2 upload error:", err);
    return { success: false, error: "Error al subir el archivo. Intentá de nuevo." };
  }

  const plan = await createPlanRecord({ pacienteId, titulo, descripcion, filePath: r2Key });

  if (!plan) {
    // Intentar limpiar el archivo subido
    try {
      await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: r2Key }));
    } catch { /* ignorar */ }
    return { success: false, error: "Error al guardar el plan en la base de datos." };
  }

  return { success: true, data: plan };
}

export interface CreatePlanInput {
  pacienteId: string;
  titulo: string;
  descripcion?: string;
  filePath: string;
}

/**
 * Crea un registro de plan en la base de datos.
 */
export async function createPlanRecord(input: CreatePlanInput): Promise<Plan | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
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
