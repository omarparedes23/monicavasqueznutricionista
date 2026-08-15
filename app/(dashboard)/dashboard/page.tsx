import { redirect } from "next/navigation";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";

/**
 * Página de entrada al dashboard: lee el rol del usuario
 * y redirige al área correcta (paciente o profesional).
 *
 * El middleware redirige aquí en lugar de hardcodear /profesional,
 * evitando que pacientes aterricen en el dashboard equivocado.
 */
export default async function DashboardRedirectPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createServerSupabaseClient();
  // @supabase/ssr + supabase-js: el schema se resuelve como any/never;
  // cast para extraer solo el rol (mismo patrón que el layout del dashboard).
  const { data: perfilRaw } = await supabase
    .from("nutri_perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  const perfil = perfilRaw as { rol: string } | null;

  if (perfil?.rol === "profesional") {
    redirect("/profesional");
  }

  redirect("/paciente");
}
