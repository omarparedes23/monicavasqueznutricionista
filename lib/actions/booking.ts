"use server";

import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import {
  emailConfirmacionPaciente,
  emailNuevaCitaProfesional,
} from "@/lib/email/templates";
import { buildTimestamp } from "@/lib/utils/dates";
import type { ActionResult, CitaConfirmada } from "@/types";

// ============================================================
// SCHEMA DE VALIDACIÓN
// ============================================================
const BookingSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre demasiado largo"),
  email: z.string().email("Email inválido"),
  telefono: z
    .string()
    .min(7, "Teléfono inválido")
    .max(20, "Teléfono demasiado largo"),
});

export type BookingInput = z.infer<typeof BookingSchema>;

// ============================================================
// SERVER ACTION: reservarCita
// ============================================================
export async function reservarCita(
  input: BookingInput
): Promise<ActionResult<CitaConfirmada>> {
  // 1. Validar input
  const parsed = BookingSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Datos inválidos.";
    return { success: false, error: firstError };
  }

  const { fecha, hora_inicio, hora_fin, nombre, email, telefono } = parsed.data;

  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 2. Obtener config del profesional
  const { data: config, error: configError } = await db
    .from("profesional_config")
    .select("*")
    .single();

  if (configError || !config) {
    return { success: false, error: "Error al obtener configuración." };
  }

  // 3. Construir timestamps
  const fechaInicioISO = buildTimestamp(new Date(`${fecha}T12:00:00`), hora_inicio);
  const fechaFinISO    = buildTimestamp(new Date(`${fecha}T12:00:00`), hora_fin);

  // 4. Verificar que el slot sigue disponible (anti-race condition)
  const { data: citasExistentes, error: checkError } = await db
    .from("citas")
    .select("id")
    .eq("profesional_id", config.id)
    .neq("estado", "cancelada")
    .lt("fecha_inicio", fechaFinISO)
    .gt("fecha_fin", fechaInicioISO);

  if (checkError) {
    return { success: false, error: "Error al verificar disponibilidad." };
  }

  if (citasExistentes && citasExistentes.length > 0) {
    return {
      success: false,
      error: "El horario seleccionado ya no está disponible. Por favor elige otro.",
    };
  }

  // 5. Insertar la cita
  const { data: cita, error: insertError } = await db
    .from("citas")
    .insert({
      profesional_id:   config.id,
      paciente_nombre:  nombre,
      paciente_email:   email,
      paciente_telefono: telefono,
      fecha_inicio:     fechaInicioISO,
      fecha_fin:        fechaFinISO,
      estado:           "confirmada",
    })
    .select()
    .single();

  if (insertError || !cita) {
    console.error("[reservarCita] Error al insertar:", insertError);
    return { success: false, error: "Error al guardar la cita. Intenta nuevamente." };
  }

  // 6. Enviar emails (en paralelo, no bloqueamos si fallan)
  const emailPacienteHtml = emailConfirmacionPaciente({
    paciente_nombre:      nombre,
    profesional_nombre:   config.nombre,
    profesional_titulo:   config.titulo,
    fecha_inicio:         fechaInicioISO,
    hora_inicio,
    hora_fin,
  });

  const emailProfesionalHtml = emailNuevaCitaProfesional({
    profesional_nombre:  config.nombre,
    paciente_nombre:     nombre,
    paciente_email:      email,
    paciente_telefono:   telefono,
    fecha_inicio:        fechaInicioISO,
    hora_inicio,
    hora_fin,
  });

  const [emailPacienteOk, emailProfesionalOk] = await Promise.all([
    sendEmail({
      to:      email,
      subject: `✓ Cita confirmada con ${config.nombre}`,
      html:    emailPacienteHtml,
    }),
    sendEmail({
      to:      config.email_notificacion,
      subject: `📅 Nueva cita: ${nombre} – ${hora_inicio}`,
      html:    emailProfesionalHtml,
    }),
  ]);

  // 7. Actualizar flags de email en la cita
  await db
    .from("citas")
    .update({
      email_paciente_enviado:    emailPacienteOk,
      email_profesional_enviado: emailProfesionalOk,
    })
    .eq("id", cita.id);

  return {
    success: true,
    data: {
      id:                cita.id,
      paciente_nombre:   nombre,
      paciente_email:    email,
      fecha_inicio:      fechaInicioISO,
      fecha_fin:         fechaFinISO,
      profesional_nombre: config.nombre,
    },
  };
}
