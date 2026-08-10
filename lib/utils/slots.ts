import {
  addMinutes,
  format,
  parseISO,
  isWithinInterval,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
} from "date-fns";
import type { DisponibilidadSemanal, Cita, TimeSlot } from "@/types";

/**
 * Convierte "HH:mm" en { hours, minutes }
 */
function parseHoraString(hora: string): { hours: number; minutes: number } {
  const [h, m] = hora.split(":").map(Number);
  return { hours: h, minutes: m };
}

/**
 * Crea un Date en una fecha específica con HH:mm dados
 */
function buildDateTime(fecha: Date, hora: string): Date {
  const { hours, minutes } = parseHoraString(hora);
  return setMilliseconds(setSeconds(setMinutes(setHours(new Date(fecha), hours), minutes), 0), 0);
}

/**
 * Calcula los time slots disponibles para una fecha específica.
 *
 * @param fecha          - La fecha para la que se calculan los slots
 * @param disponibilidad - Bloques de disponibilidad semanal del profesional
 * @param citasOcupadas  - Citas ya confirmadas en esa fecha
 * @param duracionMinutos - Duración de cada cita en minutos
 * @returns Array de TimeSlot ordenados cronológicamente
 */
export function calcularSlotsDisponibles(
  fecha: Date,
  disponibilidad: DisponibilidadSemanal[],
  citasOcupadas: Cita[],
  duracionMinutos: number
): TimeSlot[] {
  // dia_semana: 0=Dom, 1=Lun ... 6=Sáb
  const diaSemana = fecha.getDay();

  // Filtrar bloques del día correspondiente y activos
  const bloquesDelDia = disponibilidad.filter((b) => b.dia_semana === diaSemana && b.activo);

  if (bloquesDelDia.length === 0) return [];

  const slots: TimeSlot[] = [];
  const ahora = new Date();

  for (const bloque of bloquesDelDia) {
    let cursor = buildDateTime(fecha, bloque.hora_inicio);
    const bloqueFinDt = buildDateTime(fecha, bloque.hora_fin);

    while (
      isBefore(addMinutes(cursor, duracionMinutos), bloqueFinDt) ||
      addMinutes(cursor, duracionMinutos).getTime() === bloqueFinDt.getTime()
    ) {
      const slotFin = addMinutes(cursor, duracionMinutos);

      // No mostrar slots en el pasado
      if (isBefore(slotFin, ahora)) {
        cursor = slotFin;
        continue;
      }

      // Verificar si el slot está ocupado
      const ocupado = citasOcupadas.some((cita) => {
        if (cita.estado === "cancelada") return false;
        const citaInicio = parseISO(cita.fecha_inicio);
        const citaFin = parseISO(cita.fecha_fin);

        // Hay solapamiento si los intervalos se intersectan
        return isBefore(cursor, citaFin) && isAfter(slotFin, citaInicio);
      });

      slots.push({
        hora_inicio: format(cursor, "HH:mm"),
        hora_fin: format(slotFin, "HH:mm"),
        disponible: !ocupado,
      });

      cursor = slotFin;
    }
  }

  return slots.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
}

/**
 * Determina si una fecha tiene al menos un slot disponible.
 * Útil para deshabilitar días en el calendario.
 */
export function fechaTieneDisponibilidad(
  fecha: Date,
  disponibilidad: DisponibilidadSemanal[],
  citasOcupadas: Cita[],
  duracionMinutos: number
): boolean {
  const slots = calcularSlotsDisponibles(fecha, disponibilidad, citasOcupadas, duracionMinutos);
  return slots.some((s) => s.disponible);
}

/**
 * Devuelve las fechas (dentro del mes dado) que tienen disponibilidad.
 */
export function getFechasDisponiblesDelMes(
  anio: number,
  mes: number, // 0-indexed
  disponibilidad: DisponibilidadSemanal[],
  citasOcupadas: Cita[],
  duracionMinutos: number
): Set<string> {
  const diasConDisp = new Set<string>();
  const hoy = startOfDay(new Date());
  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);

  let cursor = new Date(primerDia);
  while (!isAfter(cursor, ultimoDia)) {
    if (!isBefore(cursor, hoy)) {
      if (fechaTieneDisponibilidad(cursor, disponibilidad, citasOcupadas, duracionMinutos)) {
        diasConDisp.add(format(cursor, "yyyy-MM-dd"));
      }
    }
    // setDate(+1) en vez de sumar 24h en ms: respeta los cambios de horario
    // (DST) y no saltea el último día del mes.
    cursor.setDate(cursor.getDate() + 1);
  }

  return diasConDisp;
}
