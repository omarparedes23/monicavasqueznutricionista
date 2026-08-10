// ============================================================
// HELPERS: URLs del sitio (canonical, sitemap, JSON-LD)
// ============================================================

/**
 * URL base del sitio.
 * En producción, definir NEXT_PUBLIC_SITE_URL (ej: https://monicanutri.com).
 * Sin esa variable, se usa localhost (solo para desarrollo).
 */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

/** Convierte una ruta local ("/tienda/mi-producto") en URL absoluta. */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${clean}`;
}
