import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import type { Metadata } from "next";
import { getProductos, getProductoBySlug } from "@/lib/actions/tienda";
import { formatPrecio, getWhatsAppProductoUrl } from "@/lib/utils/whatsapp";
import { WhatsAppButton } from "@/components/tienda/WhatsAppButton";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const productos = await getProductos();
  return productos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  if (!producto) {
    return { title: "Producto no encontrado" };
  }

  const description =
    producto.descripcion ??
    `${producto.nombre} — producto natural disponible en la tienda de Mónica Vásquez Nutrición.`;

  return {
    title: `${producto.nombre} — Tienda | Mónica Vásquez Nutrición`,
    description,
    openGraph: {
      title: producto.nombre,
      description,
      ...(producto.imagen_url ? { images: [{ url: producto.imagen_url }] } : {}),
    },
  };
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const producto = await getProductoBySlug(slug);

  if (!producto) {
    notFound();
  }

  const waUrl = getWhatsAppProductoUrl(producto.nombre, producto.precio);

  return (
    <article className="w-full max-w-4xl">
      {/* Back link */}
      <Link
        href="/tienda"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la tienda
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Imagen */}
        {producto.imagen_url ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
            <Image
              src={producto.imagen_url}
              alt={producto.nombre}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 512px"
            />
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100">
            <Leaf className="h-24 w-24 text-brand-200" />
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col">
          <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {producto.categoria}
          </span>

          <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900">
            {producto.nombre}
          </h1>

          <p className="mb-6 text-3xl font-bold text-brand-700">
            {formatPrecio(producto.precio)}
          </p>

          {producto.descripcion_larga ? (
            <div className="mb-8 space-y-4">
              {producto.descripcion_larga.split(/\n{2,}/).map((parrafo, i) => (
                <p key={i} className="leading-relaxed text-slate-600">
                  {parrafo}
                </p>
              ))}
            </div>
          ) : producto.descripcion ? (
            <p className="mb-8 leading-relaxed text-slate-600">{producto.descripcion}</p>
          ) : null}

          {/* CTA compra */}
          <div className="mt-auto rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="mb-3 text-sm text-slate-500">
              Para comprar, consulta disponibilidad y coordina la entrega por WhatsApp.
            </p>
            <WhatsAppButton href={waUrl} label="Consultar por WhatsApp" className="w-full" />
          </div>
        </div>
      </div>
    </article>
  );
}
