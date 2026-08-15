// ============================================================
// RATE LIMITING: sliding window en memoria (single-instance).
// Suficiente para la escala actual de monicanutri; si se despliega
// en varias instancias, migrar a un store distribuido (ej. Redis).
// ============================================================

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds?: number;
}

/**
 * Comprueba y consume una unidad del bucket `key`.
 * @param key - identificador del cliente (ej. IP, email).
 * @param limit - máx. de requests permitidos en la ventana.
 * @param windowMs - tamaño de la ventana en milisegundos.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // Limpieza periódica para que el Map no crezca sin límite.
    if (buckets.size >= MAX_BUCKETS) {
      for (const [k, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}

/** Extrae la IP del cliente desde los headers (proxy-aware). */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
