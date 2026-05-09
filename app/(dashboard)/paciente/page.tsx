import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function PacientePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Mis Citas</h1>

      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <p className="text-sm text-slate-500">
          Aquí se mostrarán tus próximas citas.
        </p>
      </section>
    </div>
  );
}
