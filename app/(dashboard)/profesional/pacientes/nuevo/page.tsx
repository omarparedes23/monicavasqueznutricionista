import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CrearPacienteForm } from "@/components/dashboard/CrearPacienteForm";

export default async function NuevoPacientePage() {
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

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Nuevo Paciente</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <CrearPacienteForm />
      </section>
    </div>
  );
}
