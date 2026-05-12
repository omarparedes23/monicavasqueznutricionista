"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types";

/**
 * Obtiene todos los posts publicados, ordenados por fecha de publicación.
 * Opcionalmente limita la cantidad de resultados.
 */
export async function getBlogPosts(limit?: number): Promise<BlogPost[]> {
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  let query = db
    .from("nutri_blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getBlogPosts] Error:", error);
    return [];
  }

  return (data ?? []) as BlogPost[];
}

/**
 * Obtiene un post publicado por su slug.
 * Retorna null si no existe o no está publicado.
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("nutri_blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) {
    if (error && error.code !== "PGRST116") {
      console.error("[getBlogPostBySlug] Error:", error);
    }
    return null;
  }

  return data as BlogPost;
}
