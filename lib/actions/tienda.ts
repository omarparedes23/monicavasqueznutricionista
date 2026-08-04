"use server";

import { revalidatePath } from "next/cache";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { z } from "zod";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "@/lib/supabase/server";
import {
  r2Client,
  R2_PUBLIC_BUCKET,
  R2_PUBLIC_URL,
  deleteObject,
  extractKeyFromUrl,
} from "@/lib/r2/client";
import type { Producto } from "@/types";

export interface ResultadoAccion {
  success: boolean;
  error?: string;
}

const ActualizarProductoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(120),
  descripcion: z.string().max(300).optional().nullable(),
  descripcion_larga: z.string().max(5000).optional().nullable(),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
  categoria: z.string().min(2, "Indicá una categoría").max(60),
  orden: z.coerce.number().int().min(0).optional().default(0),
  mostrar_en_tienda: z.coerce.boolean().optional().default(false),
});

const CATEGORIAS_VALIDAS = [
  "Proteínas",
  "Vitaminas y minerales",
  "Tés e infusiones",
  "Snacks saludables",
  "Otros",
];

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_EDGE = 1200;

async function guardProfesional(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "No autenticado." };

  const service = createServiceRoleClient() as any;
  const { data: perfil } = await service
    .from("nutri_perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "profesional") {
    return { ok: false, error: "No autorizado." };
  }

  return { ok: true };
}

/**
 * Obtiene los productos visibles en la tienda, ordenados por `orden`
 * y luego alfabéticamente. El filtro de categorías se hace en el cliente
 * (catálogo chico, una sola query).
 */
export async function getProductos(): Promise<Producto[]> {
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("nutri_productos")
    .select("*")
    .eq("mostrar_en_tienda", true)
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });

  if (error) {
    console.error("[getProductos] Error:", error);
    return [];
  }

  return (data ?? []) as Producto[];
}

/**
 * Obtiene un producto visible por su slug.
 * Retorna null si no existe o no está visible en la tienda.
 */
export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("nutri_productos")
    .select("*")
    .eq("slug", slug)
    .eq("mostrar_en_tienda", true)
    .single();

  if (error || !data) {
    if (error && error.code !== "PGRST116") {
      console.error("[getProductoBySlug] Error:", error);
    }
    return null;
  }

  return data as Producto;
}

/**
 * Obtiene TODOS los productos (visibles y ocultos) para el panel del profesional.
 * Solo accesible por usuarios con rol "profesional".
 */
export async function getProductosAdmin(): Promise<Producto[]> {
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("nutri_productos")
    .select("*")
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });

  if (error) {
    console.error("[getProductosAdmin] Error:", error);
    return [];
  }

  return (data ?? []) as Producto[];
}

/**
 * Sube o reemplaza la imagen de un producto.
 * Procesa a WebP (máx 1200px), sube al bucket PÚBLICO R2 bajo `productos/{slug}.webp`,
 * actualiza `nutri_productos.imagen_url` y borra el objeto anterior.
 * Solo accesible por un profesional.
 */
export async function subirImagenProducto(
  productoId: string,
  formData: FormData
): Promise<ResultadoAccion> {
  console.log("[subirImagenProducto] INICIO productoId:", productoId);

  const guard = await guardProfesional();
  if (!guard.ok) {
    console.warn("[subirImagenProducto] Guard rechazado:", guard.error);
    return { success: false, error: guard.error };
  }
  console.log("[subirImagenProducto] Guard OK");

  const file = formData.get("file") as File | null;
  console.log("[subirImagenProducto] file recibido:", {
    name: file?.name,
    type: file?.type,
    size: file?.size,
  });
  if (!file || file.size === 0) return { success: false, error: "Seleccioná una imagen." };
  if (!ALLOWED_MIME.includes(file.type)) {
    return { success: false, error: "Solo se aceptan imágenes JPG, PNG o WebP." };
  }
  if (file.size > MAX_SIZE) {
    return { success: false, error: "La imagen no puede superar los 3MB." };
  }

  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data: producto, error: getError } = await db
    .from("nutri_productos")
    .select("id, slug, imagen_url")
    .eq("id", productoId)
    .single();

  if (getError || !producto) {
    console.warn("[subirImagenProducto] Producto no encontrado:", getError);
    return { success: false, error: "No se encontró el producto." };
  }
  console.log("[subirImagenProducto] Producto:", { id: producto.id, slug: producto.slug });

  // Procesar a WebP
  let webpBuffer: Buffer;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    webpBuffer = await sharp(input)
      .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    console.log("[subirImagenProducto] WebP procesado:", webpBuffer.length, "bytes");
  } catch (err) {
    console.error("[subirImagenProducto] Error sharp:", err);
    return { success: false, error: "No se pudo procesar la imagen." };
  }

  const r2Key = `productos/${producto.slug}.webp`;
  const nuevaUrl = `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${r2Key}`;
  console.log("[subirImagenProducto] target bucket:", R2_PUBLIC_BUCKET, "| key:", r2Key, "| url:", nuevaUrl);

  // Subir al bucket público
  try {
    const uploadResult = await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_PUBLIC_BUCKET,
        Key: r2Key,
        Body: webpBuffer,
        ContentType: "image/webp",
      })
    );
    console.log("[subirImagenProducto] R2 upload OK:", uploadResult?.ETag ?? "sin ETag");
  } catch (err) {
    console.error("[subirImagenProducto] R2 upload error:", err);
    return { success: false, error: "Error al subir la imagen. Intentá de nuevo." };
  }

  // Actualizar la BD (antes de borrar el objeto viejo para no romper la imagen actual si falla)
  const { error: updateError } = await db
    .from("nutri_productos")
    .update({ imagen_url: nuevaUrl })
    .eq("id", productoId);

  if (updateError) {
    console.error("[subirImagenProducto] Update error:", updateError);
    await deleteObject(R2_PUBLIC_BUCKET, r2Key);
    return { success: false, error: "Error al guardar la imagen del producto." };
  }
  console.log("[subirImagenProducto] BD actualizada con:", nuevaUrl);

  // Borrar objeto anterior si es distinto
  const oldKey = extractKeyFromUrl(producto.imagen_url);
  console.log("[subirImagenProducto] old imagen_url:", producto.imagen_url, "| oldKey:", oldKey);
  if (oldKey && oldKey !== r2Key) {
    await deleteObject(R2_PUBLIC_BUCKET, oldKey);
  }

  revalidatePath("/profesional/tienda");
  revalidatePath("/tienda");
  console.log("[subirImagenProducto] FIN OK");
  return { success: true };
}

/**
 * Elimina la imagen de un producto: borra el objeto R2 y setea `imagen_url = NULL`.
 * Solo accesible por un profesional.
 */
export async function eliminarImagenProducto(productoId: string): Promise<ResultadoAccion> {
  const guard = await guardProfesional();
  if (!guard.ok) return { success: false, error: guard.error };

  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data: producto, error: getError } = await db
    .from("nutri_productos")
    .select("id, imagen_url")
    .eq("id", productoId)
    .single();

  if (getError || !producto) {
    return { success: false, error: "No se encontró el producto." };
  }

  if (!producto.imagen_url) {
    return { success: true }; // no-op
  }

  const key = extractKeyFromUrl(producto.imagen_url);
  if (key) {
    await deleteObject(R2_PUBLIC_BUCKET, key);
  }

  const { error: updateError } = await db
    .from("nutri_productos")
    .update({ imagen_url: null })
    .eq("id", productoId);

  if (updateError) {
    console.error("[eliminarImagenProducto] Update error:", updateError);
    return { success: false, error: "Error al eliminar la imagen del producto." };
  }

  revalidatePath("/profesional/tienda");
  revalidatePath("/tienda");
  return { success: true };
}

/**
 * Actualiza los datos de un producto (nombre, descripción, precio, categoría,
 * orden y visibilidad). Valida con Zod. El slug no se modifica para no romper
 * URLs ni la key de la imagen en R2.
 */
export async function actualizarProducto(
  productoId: string,
  formData: FormData
): Promise<ResultadoAccion> {
  const guard = await guardProfesional();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = ActualizarProductoSchema.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") || null,
    descripcion_larga: formData.get("descripcion_larga") || null,
    precio: formData.get("precio"),
    categoria: formData.get("categoria"),
    orden: formData.get("orden") || "0",
    mostrar_en_tienda: formData.get("mostrar_en_tienda") === "on",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Datos inválidos." };
  }

  const data = parsed.data;

  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { error } = await db
    .from("nutri_productos")
    .update({
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
      descripcion_larga: data.descripcion_larga?.trim() || null,
      precio: data.precio,
      categoria: data.categoria.trim(),
      orden: data.orden,
      mostrar_en_tienda: data.mostrar_en_tienda,
    })
    .eq("id", productoId);

  if (error) {
    console.error("[actualizarProducto] Error:", error);
    return { success: false, error: "Error al guardar el producto." };
  }

  revalidatePath("/profesional/tienda");
  revalidatePath("/tienda");
  return { success: true };
}

/** Convierte un texto a slug URL-safe (ej: "Té Verde Orgánico" → "te-verde-organico"). */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/**
 * Crea un nuevo producto. El slug se genera automáticamente desde el nombre
 * (con sufijo numérico si ya existe). La imagen se sube después desde el panel.
 */
export async function crearProducto(formData: FormData): Promise<ResultadoAccion> {
  const guard = await guardProfesional();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = ActualizarProductoSchema.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") || null,
    descripcion_larga: formData.get("descripcion_larga") || null,
    precio: formData.get("precio"),
    categoria: formData.get("categoria"),
    orden: formData.get("orden") || "0",
    mostrar_en_tienda: formData.get("mostrar_en_tienda") === "on",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Datos inválidos." };
  }

  const data = parsed.data;
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  // Generar slug único
  const baseSlug = slugify(data.nombre) || "producto";
  const { data: existentes } = await db
    .from("nutri_productos")
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  const usados = new Set((existentes ?? []).map((p: any) => p.slug));
  let slug = baseSlug;
  let contador = 2;
  while (usados.has(slug)) {
    slug = `${baseSlug}-${contador++}`;
  }

  const { data: nuevo, error } = await db
    .from("nutri_productos")
    .insert({
      nombre: data.nombre.trim(),
      slug,
      descripcion: data.descripcion?.trim() || null,
      descripcion_larga: data.descripcion_larga?.trim() || null,
      precio: data.precio,
      categoria: data.categoria.trim(),
      orden: data.orden,
      mostrar_en_tienda: data.mostrar_en_tienda,
    })
    .select("id")
    .single();

  if (error || !nuevo) {
    console.error("[crearProducto] Error:", error);
    return { success: false, error: "Error al crear el producto." };
  }

  revalidatePath("/profesional/tienda");
  revalidatePath("/tienda");
  return { success: true };
}
