import { redirect } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProductosAdmin } from "@/lib/actions/tienda";
import { ProductoFotosAdmin } from "@/components/tienda/ProductoFotosAdmin";
import { NuevoProductoButton } from "@/components/tienda/NuevoProductoButton";

export default async function ProfesionalTiendaPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfilRaw } = await supabase
    .from("nutri_perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  const perfil = perfilRaw as { rol: string } | null;

  if (perfil?.rol !== "profesional") {
    redirect("/paciente");
  }

  const productos = await getProductosAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fotos de la Tienda</h1>
          <p className="mt-1 text-sm text-slate-500">
            Subí, reemplazá o eliminá las imágenes de los productos. Se publican al instante en la
            tienda.
          </p>
        </div>
        <NuevoProductoButton />
      </div>

      {productos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
          <ImageIcon className="mb-4 h-10 w-10 text-slate-300" />
          <p className="text-lg font-medium text-slate-500">Sin productos</p>
          <p className="mt-1 text-sm text-slate-400">
            Aún no hay productos cargados en la tienda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {productos.map((producto) => (
            <ProductoFotosAdmin key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
