import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PacientesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>

      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Crear cuenta de paciente</h2>
        <p className="text-sm text-slate-500">
          Formulario para crear una cuenta de paciente. Próximamente.
        </p>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Lista de pacientes</h2>
        <p className="text-sm text-slate-500">
          Aquí se mostrará la lista de pacientes registrados. Próximamente.
        </p>
      </section>
    </div>
  );
}
