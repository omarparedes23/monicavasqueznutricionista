import Link from "next/link";
import Image from "next/image";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPrecio, getWhatsAppProductoUrl } from "@/lib/utils/whatsapp";
import { WhatsAppButton } from "@/components/tienda/WhatsAppButton";
import type { Producto } from "@/types";

interface ProductoCardProps {
  producto: Producto;
  className?: string;
}

export function ProductoCard({ producto, className }: ProductoCardProps) {
  const waUrl = getWhatsAppProductoUrl(producto.nombre, producto.precio);

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white",
        "transition-all duration-200 hover:border-brand-100 hover:shadow-md",
        className
      )}
    >
      {/* Imagen → detalle */}
      <Link href={`/tienda/${producto.slug}`} className="block">
        {producto.imagen_url ? (
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={producto.imagen_url}
              alt={producto.nombre}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-brand-50">
            <Leaf className="h-12 w-12 text-brand-300" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {/* Categoría */}
        <span className="mb-2 inline-flex w-fit items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
          {producto.categoria}
        </span>

        {/* Nombre → detalle */}
        <Link href={`/tienda/${producto.slug}`}>
          <h3 className="mb-1.5 line-clamp-2 text-lg font-semibold text-slate-900 transition-colors hover:text-brand-700">
            {producto.nombre}
          </h3>
        </Link>

        {producto.descripcion && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {producto.descripcion}
          </p>
        )}

        {/* Precio + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-xl font-bold text-brand-700">
            {formatPrecio(producto.precio)}
          </span>
          <WhatsAppButton href={waUrl} label="Consultar" className="px-3.5 py-1.5 text-xs" />
        </div>
      </div>
    </div>
  );
}
