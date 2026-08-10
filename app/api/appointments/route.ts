import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { crearCita } from "@/lib/services/booking";

const AppointmentSchema = z.object({
  patient_name: z
    .string()
    .min(2, "patient_name debe tener al menos 2 caracteres")
    .max(100, "patient_name demasiado largo"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date inválido. Formato: YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "time inválido. Formato: HH:mm"),
  source: z.string().max(100).optional(),
  patient_email: z.string().email("patient_email inválido").optional(),
  patient_phone: z.string().max(20).optional(),
});

/**
 * POST /api/appointments
 * Crea una nueva cita y dispara los emails de confirmación.
 *
 * Body: { patient_name, date, time, source?, patient_email?, patient_phone? }
 *
 * La lógica de negocio (slot, anti-race, usuario auth, emails) vive en
 * `lib/services/booking.ts`, compartida con la Server Action `reservarCita`.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición inválido (JSON malformado)." },
      { status: 400 }
    );
  }

  const parsed = AppointmentSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Datos inválidos.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { patient_name, date, time, source, patient_email, patient_phone } = parsed.data;

  const resultado = await crearCita({
    fecha: date,
    hora_inicio: time,
    nombre: patient_name,
    email: patient_email ?? "",
    telefono: patient_phone ?? "",
    notas: source ? `Reserva vía: ${source}` : null,
  });

  if (!resultado.success) {
    return NextResponse.json(
      { error: resultado.error },
      { status: resultado.status ?? 400 }
    );
  }

  const cita = resultado.data;
  return NextResponse.json(
    {
      id: cita.id,
      patient_name: cita.paciente_nombre,
      patient_email: cita.paciente_email || null,
      date,
      time,
      end_time: cita.hora_fin,
      status: "confirmada",
      created_at: cita.created_at,
    },
    { status: 201 }
  );
}
