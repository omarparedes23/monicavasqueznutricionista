import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes, format } from "date-fns";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { calcularSlotsDisponibles } from "@/lib/utils/slots";
import { buildTimestamp } from "@/lib/utils/dates";
import { sendEmail } from "@/lib/email/resend";
import {
  emailConfirmacionPaciente,
  emailNuevaCitaProfesional,
} from "@/lib/email/templates";

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

  const { patient_name, date, time, source, patient_email, patient_phone } =
    parsed.data;

  const supabase = createServiceRoleClient();

  console.log("[POST /api/appointments] Body recibido:", JSON.stringify(body));

  const { data: config, error: configError } = await supabase
    .from("nutri_profesional_config")
    .select("*")
    .single();

  console.log("[POST /api/appointments] Config resultado:", { config, configError });

  if (configError || !config) {
    return NextResponse.json(
      { error: "Error al cargar configuración del profesional." },
      { status: 500 }
    );
  }

  // Calcular hora_fin a partir de hora_inicio + duración
  const [h, m] = time.split(":").map(Number);
  const slotStartDt = new Date(`${date}T12:00:00`);
  slotStartDt.setHours(h, m, 0, 0);
  const hora_fin = format(addMinutes(slotStartDt, config.duracion_cita_minutos), "HH:mm");

  // Verificar que el slot exista en la disponibilidad y esté libre
  const { data: disponibilidad } = await supabase
    .from("nutri_disponibilidad_semanal")
    .select("*")
    .eq("profesional_id", config.id)
    .eq("activo", true);

  const { data: citasDelDia } = await supabase
    .from("nutri_citas")
    .select("*")
    .eq("profesional_id", config.id)
    .neq("estado", "cancelada")
    .gte("fecha_inicio", `${date}T00:00:00.000Z`)
    .lte("fecha_inicio", `${date}T23:59:59.999Z`);

  const slots = calcularSlotsDisponibles(
    new Date(`${date}T12:00:00`),
    disponibilidad ?? [],
    (citasDelDia ?? []) as import("@/types").Cita[],
    config.duracion_cita_minutos
  );

  const slotValido = slots.find((s) => s.hora_inicio === time && s.disponible);
  if (!slotValido) {
    return NextResponse.json(
      { error: "El horario seleccionado no está disponible." },
      { status: 409 }
    );
  }

  const fechaInicioISO = buildTimestamp(new Date(`${date}T12:00:00`), time);
  const fechaFinISO = buildTimestamp(new Date(`${date}T12:00:00`), hora_fin);

  // Verificación anti-race condition
  const { data: citasConflicto, error: checkError } = await supabase
    .from("nutri_citas")
    .select("id")
    .eq("profesional_id", config.id)
    .neq("estado", "cancelada")
    .lt("fecha_inicio", fechaFinISO)
    .gt("fecha_fin", fechaInicioISO);

  if (checkError) {
    return NextResponse.json(
      { error: "Error al verificar disponibilidad." },
      { status: 500 }
    );
  }

  if (citasConflicto && citasConflicto.length > 0) {
    return NextResponse.json(
      { error: "El horario fue reservado recientemente. Por favor elige otro." },
      { status: 409 }
    );
  }

  // Auto-crear usuario auth si no existe
  let pacienteId: string | null = null;
  if (patient_email) {
    try {
      const authAdmin = (supabase as any).auth.admin;
      const { data: createData, error: createError } = await authAdmin.createUser({
        email: patient_email,
        email_confirm: true,
        user_metadata: { nombre: patient_name },
      });
      if (createError) {
        if (
          createError.message?.toLowerCase().includes("already") ||
          createError.message?.toLowerCase().includes("duplicate")
        ) {
          const { data: existingId } = await supabase.rpc("get_user_id_by_email", {
            user_email: patient_email,
          });
          if (existingId) pacienteId = existingId as string;
        } else {
          console.error("[POST /api/appointments] Error creando usuario:", createError);
        }
      } else if (createData?.user) {
        pacienteId = createData.user.id;
      }
    } catch (err) {
      console.error("[POST /api/appointments] Excepción creando usuario:", err);
    }
  }

  // Insertar cita
  const insertPayload = {
    profesional_id:    config.id,
    paciente_id:       pacienteId,
    paciente_nombre:   patient_name,
    paciente_email:    patient_email ?? "",
    paciente_telefono: patient_phone ?? "",
    fecha_inicio:      fechaInicioISO,
    fecha_fin:         fechaFinISO,
    estado:            "confirmada",
    notas:             source ? `Reserva vía: ${source}` : null,
  };
  console.log("[POST /api/appointments] Insert payload:", JSON.stringify(insertPayload));

  const { data: cita, error: insertError } = await supabase
    .from("nutri_citas")
    .insert(insertPayload)
    .select()
    .single();

  if (insertError || !cita) {
    console.error("[POST /api/appointments] Insert error:", insertError);
    return NextResponse.json(
      { error: "Error al guardar la cita." },
      { status: 500 }
    );
  }

  // Enviar emails — cada uno en su propio try/catch para no bloquear la respuesta
  let emailProfesionalOk = false;
  let emailPacienteOk = false;

  try {
    const emailProfesionalHtml = emailNuevaCitaProfesional({
      profesional_nombre: config.nombre,
      paciente_nombre:    patient_name,
      paciente_email:     patient_email ?? "No proporcionado",
      paciente_telefono:  patient_phone ?? "No proporcionado",
      fecha_inicio:       fechaInicioISO,
      hora_inicio:        time,
      hora_fin,
    });
    emailProfesionalOk = await sendEmail({
      to:      config.email_notificacion,
      subject: `📅 Nueva cita: ${patient_name} – ${time}`,
      html:    emailProfesionalHtml,
    });
  } catch (err) {
    console.error("[POST /api/appointments] Error enviando email al profesional:", err);
  }

  if (patient_email) {
    try {
      const emailPacienteHtml = emailConfirmacionPaciente({
        paciente_nombre:    patient_name,
        profesional_nombre: config.nombre,
        profesional_titulo: config.titulo,
        fecha_inicio:       fechaInicioISO,
        hora_inicio:        time,
        hora_fin,
      });
      emailPacienteOk = await sendEmail({
        to:      patient_email,
        subject: `✓ Cita confirmada con ${config.nombre}`,
        html:    emailPacienteHtml,
      });
    } catch (err) {
      console.error("[POST /api/appointments] Error enviando email al paciente:", err);
    }
  }

  await supabase
    .from("nutri_citas")
    .update({
      email_profesional_enviado: emailProfesionalOk,
      email_paciente_enviado:    emailPacienteOk,
    })
    .eq("id", cita.id);

  return NextResponse.json(
    {
      id:            cita.id,
      patient_name:  cita.paciente_nombre,
      patient_email: cita.paciente_email || null,
      date,
      time,
      end_time:      hora_fin,
      status:        cita.estado,
      created_at:    cita.created_at,
    },
    { status: 201 }
  );
}
