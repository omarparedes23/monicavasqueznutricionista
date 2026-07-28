import { ShoppingBag } from "lucide-react";
import { getProductos } from "@/lib/actions/tienda";
import { TiendaGrid } from "@/components/tienda/TiendaGrid";
import { WhatsAppButton } from "@/components/tienda/WhatsAppButton";
import { WHATSAPP_NUMBER } from "@/lib/utils/whatsapp";

export const revalidate = 3600;

export const metadata = {
  title: "Tienda — Mónica Vásquez Nutrición",
  description:
    "Productos naturales seleccionados por tu nutricionista: proteínas, vitaminas, tés e infusiones y snacks saludables. Consultá y comprá por WhatsApp.",
};

export default async function TiendaPage() {
  const productos = await getProductos();

  return (
    <div className="w-full max-w-6xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          <ShoppingBag className="h-4 w-4" />
          Tienda natural
        </div>
        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Productos para tu bienestar
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-500">
          Seleccionados profesionalmente para complementar tu plan alimentario.
          Consulta disponibilidad y coordina tu compra por WhatsApp.
        </p>
      </div>

      {/* Grid con filtro o empty state */}
      {productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
          <ShoppingBag className="mb-4 h-10 w-10 text-slate-300" />
          <p className="text-lg font-medium text-slate-500">Próximamente</p>
          <p className="mt-1 text-sm text-slate-400">
            Estamos preparando los productos para ti. ¡Vuelve pronto!
          </p>
        </div>
      ) : (
        <>
          <TiendaGrid productos={productos} />

          {/* CTA inferior */}
          <div className="mt-16 text-center">
            <p className="mb-4 text-sm text-slate-500">
              ¿Buscas algo que no está aquí? Consúltame directamente.
            </p>
            <WhatsAppButton
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                "¡Hola! Quiero consultar por los productos de la tienda."
              )}`}
              label="Escríbeme por WhatsApp"
            />
          </div>
        </>
      )}
    </div>
  );
}
