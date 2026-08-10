"use server";

import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { guardProfesional } from "@/lib/actions/guard";
import { r2Client, R2_BUCKET } from "@/lib/r2/client";
import type { Foto } from "@/types";

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Sube una foto de evolución a Cloudflare R2 y crea el registro en nutri_fotos.
 * Solo para uso del profesional.
 */
export async function subirFotoProfesional(
  pacienteId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: Foto }> {
  const guard = await guardProfesional();
  if (!guard.ok) return { success: false, error: guard.error };

  const titulo = (formData.get("titulo") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() || undefined;
  const file = formData.get("file") as File | null;

  if (!titulo) return { success: false, error: "El título es requerido." };
  if (!file || file.size === 0) return { success: false, error: "Seleccioná una imagen." };
  if (!ALLOWED_MIME.includes(file.type)) {
    return { success: false, error: "Solo se aceptan imágenes JPEG, PNG o WebP." };
  }
  if (file.size > MAX_SIZE) {
    return { success: false, error: "La imagen no puede superar los 5MB." };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const r2Key = `pacientes/${pacienteId}/fotos/${crypto.randomUUID()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    await r2Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: r2Key,
      Body: buffer,
      ContentType: file.type,
    }));
  } catch (err) {
    console.error("[subirFotoProfesional] R2 upload error:", err);
    return { success: false, error: "Error al subir la imagen. Intentá de nuevo." };
  }

  const supabase = createServiceRoleClient();

  const { data: foto, error: insertError } = await supabase
    .from("nutri_fotos")
    .insert({
      paciente_id: pacienteId,
      titulo,
      descripcion: descripcion ?? null,
      r2_key: r2Key,
      activo: true,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[subirFotoProfesional] Insert error:", insertError);
    return { success: false, error: "Error al guardar el registro de la foto." };
  }

  return { success: true, data: foto as Foto };
}

/**
 * Obtiene las fotos de un paciente específico.
 * Usa service role para el profesional.
 */
export async function getFotosPaciente(pacienteId: string): Promise<Foto[]> {
  const guard = await guardProfesional();
  if (!guard.ok) return [];

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("nutri_fotos")
    .select("*")
    .eq("paciente_id", pacienteId)
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getFotosPaciente] Error:", error);
    return [];
  }

  return (data ?? []) as Foto[];
}

/**
 * Genera una presigned URL de R2 para ver/descargar una foto.
 * Verifica que el solicitante sea profesional antes de firmar.
 */
export async function getFotoSignedUrl(fotoId: string): Promise<string | null> {
  const guard = await guardProfesional();
  if (!guard.ok) return null;

  const serviceClient = createServiceRoleClient();

  const { data: foto } = await serviceClient
    .from("nutri_fotos")
    .select("id, r2_key")
    .eq("id", fotoId)
    .single();

  if (!foto?.r2_key) return null;

  try {
    const cmd = new GetObjectCommand({ Bucket: R2_BUCKET, Key: foto.r2_key });
    return await getSignedUrl(r2Client, cmd, { expiresIn: 60 });
  } catch (err) {
    console.error("[getFotoSignedUrl] Error:", err);
    return null;
  }
}
