"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { calcularSlotsDisponibles, getFechasDisponiblesDelMes } from "@/lib/utils/slots";
import type {
  ActionResult,
  TimeSlot,
  ProfesionalConfig,
  DisponibilidadSemanal,
} from "@/types";

interface ConfigYDisponibilidad {
  config: ProfesionalConfig;
  disponibilidad: DisponibilidadSemanal[];
}

/**
 * Obtiene la configuración del profesional y sus bloques de disponibilidad.
 * Se llama una vez al cargar la página (SSR).
 */
export async function getConfigYDisponibilidad(): Promise<
  ActionResult<ConfigYDisponibilidad>
> {
  const supabase = createServiceRoleClient();

  const { data: config, error: configError } = await supabase
    .from("profesional_config")
    .select("*")
    .single();

  if (configError || !config) {
    return { success: false, error: "No se encontró la configuración del profesional." };
  }

  const { data: disponibilidad, error: dispError } = await supabase
    .from("disponibilidad_semanal")
    .select("*")
    .eq("profesional_id", config.id)
    .eq("activo", true)
    .order("dia_semana")
    .order("hora_inicio");

  if (dispError) {
    return { success: false, error: "Error al cargar la disponibilidad." };
  }

  return {
    success: true,
    data: { config, disponibilidad: disponibilidad ?? [] },
  };
}

/**
 * Obtiene los slots disponibles para una fecha específica.
 * Se llama cada vez que el usuario selecciona una fecha en el calendario.
 */
export async function getSlotsParaFecha(
  fechaStr: string // "YYYY-MM-DD"
): Promise<ActionResult<TimeSlot[]>> {
  const supabase = createServiceRoleClient();

  // 1. Config
  const { data: config, error: configError } = await supabase
    .from("profesional_config")
    .select("*")
    .single();

  if (configError || !config) {
    return { success: false, error: "Error al cargar configuración." };
  }

  // 2. Disponibilidad semanal
  const { data: disponibilidad, error: dispError } = await supabase
    .from("disponibilidad_semanal")
    .select("*")
    .eq("profesional_id", config.id)
    .eq("activo", true);

  if (dispError) {
    return { success: false, error: "Error al cargar disponibilidad." };
  }

  // 3. Citas confirmadas en la fecha indicada
  const fechaInicio = `${fechaStr}T00:00:00.000Z`;
  const fechaFin    = `${fechaStr}T23:59:59.999Z`;

  const { data: citas, error: citasError } = await supabase
    .from("citas")
    .select("*")
    .eq("profesional_id", config.id)
    .neq("estado", "cancelada")
    .gte("fecha_inicio", fechaInicio)
    .lte("fecha_inicio", fechaFin);

  if (citasError) {
    return { success: false, error: "Error al verificar citas existentes." };
  }

  // 4. Calcular slots
  const fecha = new Date(`${fechaStr}T12:00:00`); // noon para evitar issues de timezone
  const slots = calcularSlotsDisponibles(
    fecha,
    disponibilidad ?? [],
    citas ?? [],
    config.duracion_cita_minutos
  );

  return { success: true, data: slots };
}

/**
 * Devuelve las fechas del mes con disponibilidad (para pintar el calendario).
 */
export async function getFechasDisponibles(
  anio: number,
  mes: number // 0-indexed
): Promise<ActionResult<string[]>> {
  const supabase = createServiceRoleClient();

  const { data: config, error: configError } = await supabase
    .from("profesional_config")
    .select("*")
    .single();

  if (configError || !config) {
    return { success: false, error: "Error al cargar configuración." };
  }

  const { data: disponibilidad } = await supabase
    .from("disponibilidad_semanal")
    .select("*")
    .eq("profesional_id", config.id)
    .eq("activo", true);

  // Citas del mes
  const primerDia = new Date(anio, mes, 1).toISOString();
  const ultimoDia = new Date(anio, mes + 1, 0, 23, 59, 59).toISOString();

  const { data: citas } = await supabase
    .from("citas")
    .select("*")
    .eq("profesional_id", config.id)
    .neq("estado", "cancelada")
    .gte("fecha_inicio", primerDia)
    .lte("fecha_inicio", ultimoDia);

  const fechasSet = getFechasDisponiblesDelMes(
    anio,
    mes,
    disponibilidad ?? [],
    citas ?? [],
    config.duracion_cita_minutos
  );

  return { success: true, data: Array.from(fechasSet) };
}
