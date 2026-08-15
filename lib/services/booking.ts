// ============================================================
// SERVICIO COMPARTIDO: creación de citas
// Usado por la Server Action `reservarCita` y por el endpoint
// `POST /api/appointments` (evita lógica duplicada).
// ============================================================

import { addMinutes, format } from "date-fns";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { emailConfirmacionPaciente, emailNuevaCitaProfesional } from "@/lib/email/templates";
import { buildTimestamp } from "@/lib/utils/dates";
import { calcularSlotsDisponibles } from "@/lib/utils/slots";
import type { Cita, CitaConfirmada } from "@/types";

export interface CrearCitaInput {
  fecha: string; // "YYYY-MM-DD"
  hora_inicio: string; // "HH:mm"
  hora_fin?: string; // "HH:mm" — si se omite, se calcula con duracion_cita_minutos
  nombre: string;
  email: string;
  telefono: string;
  notas?: string | null;
}

export type CrearCitaResultado =
  | { success: true; data: CitaConfirmada & { hora_fin: string; created_at: string } }
  | { success: false; error: string; status?: number };

/**
 * Crea una cita con el flujo completo:
 * validación de slot → anti-race condition → auto-creación de usuario auth
 * → INSERT → emails en paralelo → flags de envío.
 */
export async function crearCita(input: CrearCitaInput): Promise<CrearCitaResultado> {
  const { fecha, hora_inicio, nombre, email, telefono, notas } = input;
  const supabase = createServiceRoleClient();

  // 1. Config del profesional
  const { data: config, error: configError } = await supabase
    .from("nutri_profesional_config")
    .select("*")
    .single();

  if (configError || !config) {
    return { success: false, error: "Error al obtener configuración." };
  }

  // 2. Hora fin (explícita o calculada según duración de la cita)
  const hora_fin =
    input.hora_fin ??
    (() => {
      const [h, m] = hora_inicio.split(":").map(Number);
      const start = new Date(`${fecha}T12:00:00`);
      start.setHours(h, m, 0, 0);
      return format(addMinutes(start, config.duracion_cita_minutos), "HH:mm");
    })();

  // 3. Timestamps
  const fechaInicioISO = buildTimestamp(new Date(`${fecha}T12:00:00`), hora_inicio);
  const fechaFinISO = buildTimestamp(new Date(`${fecha}T12:00:00`), hora_fin);

  // 4. Verificar que el horario exista en la disponibilidad y esté libre
  const { data: disponibilidad, error: dispError } = await supabase
    .from("nutri_disponibilidad_semanal")
    .select("*")
    .eq("profesional_id", config.id)
    .eq("activo", true);

  if (dispError) {
    return { success: false, error: "Error al cargar disponibilidad." };
  }

  const { data: citasDelDia } = await supabase
    .from("nutri_citas")
    .select("*")
    .eq("profesional_id", config.id)
    .neq("estado", "cancelada")
    .gte("fecha_inicio", `${fecha}T00:00:00.000Z`)
    .lte("fecha_inicio", `${fecha}T23:59:59.999Z`);

  const slots = calcularSlotsDisponibles(
    new Date(`${fecha}T12:00:00`),
    disponibilidad ?? [],
    (citasDelDia ?? []) as Cita[],
    config.duracion_cita_minutos
  );

  const slotValido = slots.find((s) => s.hora_inicio === hora_inicio && s.disponible);
  if (!slotValido) {
    return {
      success: false,
      error: "El horario seleccionado ya no está disponible. Por favor elige otro.",
      status: 409,
    };
  }

  // 5. Anti-race condition (ventana entre el cálculo y el INSERT)
  const { data: citasExistentes, error: checkError } = await supabase
    .from("nutri_citas")
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
      status: 409,
    };
  }

  // 6. Auto-crear usuario auth si no existe (o vincularlo si ya existe)
  let pacienteId: string | null = null;
  try {
    // auth.admin no está expuesto en los tipos públicos de supabase-js v2
    type AuthAdminClient = {
      auth: {
        admin: {
          createUser: (args: {
            email: string;
            email_confirm: boolean;
            user_metadata: { nombre: string };
          }) => Promise<{
            data: { user: { id: string } | null } | null;
            error: { message?: string } | null;
          }>;
        };
      };
    };
    const authAdmin = (supabase as unknown as AuthAdminClient).auth.admin;
    const { data: createData, error: createError } = await authAdmin.createUser({
      email,
      // No confirmar automáticamente: la cuenta se confirma cuando el
      // paciente entra por magic link (OTP). Evita cuentas plenamente
      // utilizables creadas sin verificación desde el flujo público.
      email_confirm: false,
      user_metadata: { nombre },
    });
    if (createError) {
      if (
        createError.message?.toLowerCase().includes("already") ||
        createError.message?.toLowerCase().includes("duplicate")
      ) {
        // Usuario ya existe → buscar por email via RPC (O(1), no listUsers)
        const { data: existingId } = await supabase.rpc("get_user_id_by_email", {
          user_email: email,
        });
        if (existingId) pacienteId = existingId;
      } else {
        console.error("[crearCita] Error creando usuario:", createError);
      }
    } else if (createData?.user) {
      pacienteId = createData.user.id;
    }
  } catch (err) {
    console.error("[crearCita] Excepción creando usuario:", err);
  }

  // 7. Insertar la cita
  const { data: cita, error: insertError } = await supabase
    .from("nutri_citas")
    .insert({
      profesional_id: config.id,
      paciente_id: pacienteId,
      paciente_nombre: nombre,
      paciente_email: email,
      paciente_telefono: telefono,
      fecha_inicio: fechaInicioISO,
      fecha_fin: fechaFinISO,
      estado: "confirmada",
      notas: notas ?? null,
    })
    .select()
    .single();

  if (insertError || !cita) {
    console.error("[crearCita] Error al insertar:", insertError);
    return { success: false, error: "Error al guardar la cita. Intenta nuevamente." };
  }

  // 8. Emails en paralelo (no bloqueamos si fallan).
  // El email al paciente solo se envía si se proporcionó una dirección.
  const emailProfesionalHtml = emailNuevaCitaProfesional({
    profesional_nombre: config.nombre,
    paciente_nombre: nombre,
    paciente_email: email || "No proporcionado",
    paciente_telefono: telefono || "No proporcionado",
    fecha_inicio: fechaInicioISO,
    hora_inicio,
    hora_fin,
  });

  const envios: Promise<boolean>[] = [
    sendEmail({
      to: config.email_notificacion,
      subject: `📅 Nueva cita: ${nombre} – ${hora_inicio}`,
      html: emailProfesionalHtml,
    }),
  ];

  if (email) {
    envios.push(
      sendEmail({
        to: email,
        subject: `✓ Cita confirmada con ${config.nombre}`,
        html: emailConfirmacionPaciente({
          paciente_nombre: nombre,
          profesional_nombre: config.nombre,
          profesional_titulo: config.titulo,
          fecha_inicio: fechaInicioISO,
          hora_inicio,
          hora_fin,
        }),
      })
    );
  }

  let emailProfesionalOk = false;
  let emailPacienteOk = false;
  try {
    [emailProfesionalOk, emailPacienteOk] = await Promise.all(envios);
  } catch (err) {
    // La cita ya quedó creada: un fallo de email no debe devolver 500
    // (el cliente reintentaría y duplicaría la cita).
    console.error("[crearCita] Error enviando emails:", err);
  }

  // 9. Actualizar flags de email en la cita
  await supabase
    .from("nutri_citas")
    .update({
      email_paciente_enviado: emailPacienteOk ?? false,
      email_profesional_enviado: emailProfesionalOk,
    })
    .eq("id", cita.id);

  return {
    success: true,
    data: {
      id: cita.id,
      paciente_nombre: nombre,
      paciente_email: email,
      fecha_inicio: fechaInicioISO,
      fecha_fin: fechaFinISO,
      hora_fin,
      created_at: cita.created_at,
      profesional_nombre: config.nombre,
    },
  };
}
