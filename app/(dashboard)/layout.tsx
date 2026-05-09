import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // @supabase/ssr v0.6.1 + supabase-js v2.99.x type incompatibility:
  // ssr imports from dist/module/lib/types (removed in v2.99) → Schema resolves to any.
  // Cast result to extract only what we need.
  const { data: perfilRaw } = await supabase
    .from("nutri_perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  const perfil = perfilRaw as { rol: string } | null;

  const isProfesional = perfil?.rol === "profesional";

  return (
    <div className="min-h-dvh flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            Monica Nutricionista
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {isProfesional ? (
            <>
              <Link
                href="/profesional"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Panel Profesional
              </Link>
              <Link
                href="/profesional/pacientes"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Pacientes
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/paciente"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Mis Citas
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">
          Monica Nutricionista
        </h2>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-red-600 hover:underline"
          >
            Salir
          </button>
        </form>
      </div>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto mt-12 md:mt-0">
        {children}
      </main>
    </div>
  );
}
