import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes, format } from "date-fns";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { calcularSlotsDisponibles } from "@/lib/utils/slots";
import { buildTimestamp } from "@/lib/utils/dates";
import { sendEmail } from "@/lib/email/resend";
import { emailNuevaCitaProfesional } from "@/lib/email/templates";

// En Next.js 15 los params de rutas dinámicas son una Promise
type RouteParams = { params: Promise<{ id: string }> };

const RescheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date inválido. Formato: YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "time inválido. Formato: HH:mm"),
});

/**
 * DELETE /api/appointments/[id]
 * Cancela (soft-delete) una cita existente.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const supabase = createServiceRoleClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cita, error: fetchError } = await supabase
    .from("citas")
    .select("id, estado")
    .eq("id", id)
    .single() as any;

  if (fetchError || !cita) {
    return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
  }

  if (cita.estado === "cancelada") {
    return NextResponse.json({ error: "La cita ya está cancelada." }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from("citas")
    .update({ estado: "cancelada" as const })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: "Error al cancelar la cita." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id, status: "cancelada" });
}

/**
 * PATCH /api/appointments/[id]
 * Reprograma una cita a nueva fecha y hora.
 *
 * Body: { date: "YYYY-MM-DD", time: "HH:mm" }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Cuerpo de la petición inválido (JSON malformado)." },
        { status: 400 }
      );
    }

    const parsed = RescheduleSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Datos inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { date, time } = parsed.data;

    const supabase = createServiceRoleClient();

    const { data: citaExistente, error: fetchError } = await supabase
      .from("citas")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !citaExistente) {
      return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
    }

    if (citaExistente.estado === "cancelada") {
      return NextResponse.json(
        { error: "No se puede reprogramar una cita cancelada." },
        { status: 409 }
      );
    }

    const { data: config, error: configError } = await supabase
      .from("profesional_config")
      .select("*")
      .single();

    if (configError || !config) {
      console.error("[PATCH /api/appointments] Error cargando config:", configError);
      return NextResponse.json(
        { error: "Error al cargar configuración del profesional." },
        { status: 500 }
      );
    }

    // Calcular hora_fin
    const [h, m] = time.split(":").map(Number);
    const slotStartDt = new Date(`${date}T12:00:00`);
    slotStartDt.setHours(h, m, 0, 0);
    const hora_fin = format(addMinutes(slotStartDt, config.duracion_cita_minutos), "HH:mm");

    // Verificar disponibilidad excluyendo la propia cita
    const { data: disponibilidad } = await supabase
      .from("disponibilidad_semanal")
      .select("*")
      .eq("profesional_id", config.id)
      .eq("activo", true);

    const { data: citasDelDia } = await supabase
      .from("citas")
      .select("*")
      .eq("profesional_id", config.id)
      .neq("estado", "cancelada")
      .neq("id", id) // excluir la cita actual
      .gte("fecha_inicio", `${date}T00:00:00.000Z`)
      .lte("fecha_inicio", `${date}T23:59:59.999Z`);

    const slots = calcularSlotsDisponibles(
      new Date(`${date}T12:00:00`),
      disponibilidad ?? [],
      citasDelDia ?? [],
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

    // Verificación anti-race condition (excluyendo la propia cita)
    const { data: citasConflicto, error: checkError } = await supabase
      .from("citas")
      .select("id")
      .eq("profesional_id", config.id)
      .neq("estado", "cancelada")
      .neq("id", id)
      .lt("fecha_inicio", fechaFinISO)
      .gt("fecha_fin", fechaInicioISO);

    if (checkError) {
      console.error("[PATCH /api/appointments] Error verificando disponibilidad:", checkError);
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

    console.log("Intentando actualizar ID:", id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rowsActualizadas, error: updateError } = await supabase
      .from("citas")
      .update({ fecha_inicio: fechaInicioISO, fecha_fin: fechaFinISO })
      .eq("id", id)
      .select() as any;

    if (updateError) {
      console.error("[PATCH /api/appointments] Error actualizando cita:", updateError);
      return NextResponse.json(
        { error: "Error al reprogramar la cita." },
        { status: 500 }
      );
    }

    if (!rowsActualizadas || rowsActualizadas.length === 0) {
      console.error("[PATCH /api/appointments] UPDATE devolvió 0 filas para ID:", id);
      return NextResponse.json(
        { error: "No se encontró la fila para actualizar o RLS bloqueó la operación." },
        { status: 404 }
      );
    }

    const citaActualizada = rowsActualizadas[0];

    // Notificar al profesional — el fallo de email nunca bloquea la respuesta
    try {
      const emailHtml = emailNuevaCitaProfesional({
        profesional_nombre:  config.nombre,
        paciente_nombre:     citaActualizada.paciente_nombre,
        paciente_email:      citaActualizada.paciente_email,
        paciente_telefono:   citaActualizada.paciente_telefono,
        fecha_inicio:        fechaInicioISO,
        hora_inicio:         time,
        hora_fin,
      });
      await sendEmail({
        to:      config.email_notificacion,
        subject: `📅 Cita reprogramada: ${citaActualizada.paciente_nombre} – ${time}`,
        html:    emailHtml,
      });
    } catch (emailErr) {
      console.error("[PATCH /api/appointments] Error enviando email de notificación:", emailErr);
      // No retornamos error — la cita ya fue guardada correctamente
    }

    return NextResponse.json({
      id:           citaActualizada.id,
      patient_name: citaActualizada.paciente_nombre,
      date,
      time,
      end_time:     hora_fin,
      status:       citaActualizada.estado,
    });
  } catch (error) {
    console.error("Detalle del error en PATCH:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
