// ============================================================
// HELPERS: WhatsApp (tienda y contacto general)
// ============================================================

// Número de la profesional. Formato internacional sin "+": 51XXXXXXXXX (Perú).
export const WHATSAPP_NUMBER = "51956771930";

/** Formatea un precio en soles peruanos: S/ 89.00 */
export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(precio);
}

/** URL de wa.me con mensaje pre-rellenado para consultar por un producto. */
export function getWhatsAppProductoUrl(nombre: string, precio: number): string {
  const text =
    `¡Hola! Me interesa este producto de la tienda:\n\n` +
    `*${nombre}*\n` +
    `${formatPrecio(precio)}\n\n` +
    `¿Me pasas más información?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
