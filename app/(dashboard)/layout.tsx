import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { NavLink } from "@/components/dashboard/NavLink";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <div className="flex min-h-dvh bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900">Monica Nutricionista</h2>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {isProfesional ? (
            <>
              <NavLink href="/profesional">Panel Profesional</NavLink>
              <NavLink href="/profesional/pacientes">Pacientes</NavLink>
              <NavLink href="/profesional/pacientes/nuevo">Nuevo Paciente</NavLink>
              <NavLink href="/profesional/tienda">Tienda</NavLink>
            </>
          ) : (
            <>
              <NavLink href="/paciente">Mis Citas</NavLink>
            </>
          )}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <h2 className="text-base font-bold text-slate-900">Monica Nutricionista</h2>
        <form action={signOut}>
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Salir
          </button>
        </form>
      </div>

      {/* Main */}
      <main className="mt-12 flex-1 overflow-y-auto p-6 md:mt-0 md:p-10">{children}</main>
    </div>
  );
}
