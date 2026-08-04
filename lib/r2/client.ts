import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/** Bucket PRIVADO (archivos de pacientes). NO usar para catálogo/blog. */
export const R2_BUCKET = process.env.R2_BUCKET_NAME!;

/** Bucket PÚBLICO (catálogo de productos, blog). Subir aquí imágenes públicas. */
export const R2_PUBLIC_BUCKET = process.env.R2_PUBLIC_BUCKET_NAME!;

/** URL base pública de R2 (r2.dev). */
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

/** Elimina un objeto de un bucket R2. */
export async function deleteObject(
  bucket: string,
  key: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key })
    );
    return { success: true };
  } catch (err) {
    console.error("[R2 deleteObject] Error:", err);
    return { success: false, error: "Error al eliminar el objeto de R2" };
  }
}

/** Extrae la key del objeto a partir de una URL pública de R2. */
export function extractKeyFromUrl(url: string | null | undefined): string | null {
  if (!url || !R2_PUBLIC_URL) return null;
  const prefix = R2_PUBLIC_URL.replace(/\/+$/, "") + "/";
  if (!url.startsWith(prefix)) return null;
  return url.replace(prefix, "");
}
