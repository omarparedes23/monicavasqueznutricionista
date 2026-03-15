import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { calcularSlotsDisponibles } from "@/lib/utils/slots";

/**
 * GET /api/availability?date=YYYY-MM-DD
 * Devuelve un array de strings con los horarios disponibles: ["09:00", "10:00", ...]
 */
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Parámetro 'date' requerido. Formato esperado: YYYY-MM-DD" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  const { data: config, error: configError } = await supabase
    .from("profesional_config")
    .select("*")
    .single();

  if (configError || !config) {
    return NextResponse.json(
      { error: "Error al cargar configuración del profesional." },
      { status: 500 }
    );
  }

  const { data: disponibilidad, error: dispError } = await supabase
    .from("disponibilidad_semanal")
    .select("*")
    .eq("profesional_id", config.id)
    .eq("activo", true);

  if (dispError) {
    return NextResponse.json(
      { error: "Error al cargar disponibilidad." },
      { status: 500 }
    );
  }

  const { data: citas, error: citasError } = await supabase
    .from("citas")
    .select("*")
    .eq("profesional_id", config.id)
    .neq("estado", "cancelada")
    .gte("fecha_inicio", `${date}T00:00:00.000Z`)
    .lte("fecha_inicio", `${date}T23:59:59.999Z`);

  if (citasError) {
    return NextResponse.json(
      { error: "Error al verificar citas existentes." },
      { status: 500 }
    );
  }

  const slots = calcularSlotsDisponibles(
    new Date(`${date}T12:00:00`),
    disponibilidad ?? [],
    citas ?? [],
    config.duracion_cita_minutos
  );

  const horariosDisponibles = slots
    .filter((s) => s.disponible)
    .map((s) => s.hora_inicio);

  return NextResponse.json(horariosDisponibles);
}
