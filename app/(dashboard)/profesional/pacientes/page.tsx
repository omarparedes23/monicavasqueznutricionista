import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPacientes } from "@/lib/actions/profesional";
import { PatientList } from "@/components/dashboard/PatientList";
import { Button } from "@/components/ui/Button";

export default async function PacientesPage() {
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

  const pacientes = await getPacientes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
        <Button asChild size="sm">
          <Link href="/profesional/pacientes/nuevo">
            <Plus className="h-4 w-4" />
            Crear paciente
          </Link>
        </Button>
      </div>

      {pacientes.length === 0 ? (
        <EmptyState />
      ) : (
        <PatientList pacientes={pacientes} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
      <p className="text-sm font-medium text-slate-600">No hay pacientes registrados</p>
      <p className="mt-1 text-xs text-slate-400">
        Creá el primero haciendo clic en "Crear paciente".
      </p>
      <Button asChild size="sm" className="mt-4">
        <Link href="/profesional/pacientes/nuevo">
          <Plus className="h-4 w-4" />
          Crear paciente
        </Link>
      </Button>
    </div>
  );
}
