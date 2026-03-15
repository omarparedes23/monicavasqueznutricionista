import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * GET /api/appointments/search?name=Juan
 * Busca citas cuyo paciente_nombre sea similar al parámetro recibido.
 * Retorna: { id, fecha_inicio, fecha_fin, paciente_nombre }[]
 */
export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");

  if (!name || name.trim().length === 0) {
    return NextResponse.json(
      { error: "El parámetro 'name' es requerido." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("citas")
    .select("id, fecha_inicio, fecha_fin, paciente_nombre")
    .ilike("paciente_nombre", `%${name.trim()}%`)
    .order("fecha_inicio", { ascending: false });

  if (error) {
    console.error("[GET /api/appointments/search] Supabase error:", error);
    return NextResponse.json(
      { error: "Error al conectar con la base de datos." },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}
