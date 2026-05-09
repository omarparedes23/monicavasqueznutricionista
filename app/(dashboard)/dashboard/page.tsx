import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

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

  const supabase = createServiceRoleClient();
  const { data: perfil } = await supabase
    .from("nutri_perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol === "profesional") {
    redirect("/profesional");
  }

  redirect("/paciente");
}
