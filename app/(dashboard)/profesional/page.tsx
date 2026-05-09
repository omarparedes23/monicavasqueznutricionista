import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProfesionalPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // @supabase/ssr v0.6.1 + supabase-js v2.99.x type incompatibility — see layout.tsx
  const { data: perfilRaw } = await supabase
    .from("nutri_perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  const perfil = perfilRaw as { rol: string } | null;

  if (perfil?.rol !== "profesional") {
    redirect("/paciente");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">
        Panel del Profesional
      </h1>

      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Próximas citas
        </h2>
        <p className="text-sm text-slate-500">
          Aquí se mostrará la lista de citas.
        </p>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Crear paciente
        </h2>
        <p className="text-sm text-slate-500">
          Formulario para crear una cuenta de paciente.
        </p>
      </section>
    </div>
  );
}
