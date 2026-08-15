import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { calcularSlotsDisponibles } from "@/lib/utils/slots";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/utils/rate-limit";

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

  // Rate limit por IP: endpoint público consultado desde el calendario.
  const ip = clientIpFromHeaders(request.headers);
  const rl = checkRateLimit(`api:availability:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiadas consultas. Esperá un momento." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds ?? 60) } }
    );
  }

  const supabase = createServiceRoleClient();

  const { data: config, error: configError } = await supabase
    .from("nutri_profesional_config")
    .select("*")
    .single();

  if (configError || !config) {
    return NextResponse.json(
      { error: "Error al cargar configuración del profesional." },
      { status: 500 }
    );
  }

  const { data: disponibilidad, error: dispError } = await supabase
    .from("nutri_disponibilidad_semanal")
    .select("*")
    .eq("profesional_id", config.id)
    .eq("activo", true);

  if (dispError) {
    return NextResponse.json({ error: "Error al cargar disponibilidad." }, { status: 500 });
  }

  // Solo se proyectan los campos necesarios para el cálculo de slots
  // (minimización: las filas completas de nutri_citas contienen PII).
  const { data: citas, error: citasError } = await supabase
    .from("nutri_citas")
    .select("fecha_inicio, fecha_fin, estado")
    .eq("profesional_id", config.id)
    .neq("estado", "cancelada")
    .gte("fecha_inicio", `${date}T00:00:00.000Z`)
    .lte("fecha_inicio", `${date}T23:59:59.999Z`);

  if (citasError) {
    return NextResponse.json({ error: "Error al verificar citas existentes." }, { status: 500 });
  }

  const slots = calcularSlotsDisponibles(
    new Date(`${date}T12:00:00`),
    disponibilidad ?? [],
    (citas ?? []) as import("@/types").Cita[],
    config.duracion_cita_minutos
  );

  const horariosDisponibles = slots.filter((s) => s.disponible).map((s) => s.hora_inicio);

  return NextResponse.json(horariosDisponibles);
}
