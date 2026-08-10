import type { MetadataRoute } from "next";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils/site";

// Regenera el sitemap en cada request: refleja productos/posts nuevos sin redeploy.
export const dynamic = "force-dynamic";

/**
 * Sitemap dinámico: rutas estáticas + productos de la tienda + posts del blog.
 * Requiere NEXT_PUBLIC_SITE_URL en producción para generar URLs absolutas.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tienda`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/reserva`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const supabase = createServiceRoleClient();

  const [productos, posts] = await Promise.all([
    supabase
      .from("nutri_productos")
      .select("slug, updated_at")
      .eq("mostrar_en_tienda", true),
    supabase
      .from("nutri_blog_posts")
      .select("slug, published_at, updated_at")
      .eq("published", true),
  ]);

  const productoEntries: MetadataRoute.Sitemap = (productos.data ?? []).map((p) => ({
    url: `${base}/tienda/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap = (posts.data ?? []).map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.published_at ?? p.updated_at,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...productoEntries, ...postEntries];
}
