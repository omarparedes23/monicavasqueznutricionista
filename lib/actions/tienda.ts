"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Producto } from "@/types";

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
