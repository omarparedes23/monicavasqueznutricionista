import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EstablecerPasswordForm } from "@/components/auth/EstablecerPasswordForm";

export default async function EstablecerPasswordPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-xl font-bold text-slate-900">Creá tu contraseña</h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Elegí una contraseña para acceder al sistema cuando quieras.
        </p>
        <EstablecerPasswordForm />
      </div>
    </main>
  );
}
