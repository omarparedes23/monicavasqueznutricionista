import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";

/** Formatea una fecha para mostrar al paciente */
export function formatFechaLarga(fecha: Date | string): string {
  const d = typeof fecha === "string" ? parseISO(fecha) : fecha;
  return format(d, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
}

/** Formatea solo la hora */
export function formatHora(hora: string): string {
  // hora es "HH:mm"
  const [h, m] = hora.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

/** Formatea rango de hora de cita */
export function formatRangoCita(horaInicio: string, horaFin: string): string {
  return `${formatHora(horaInicio)} – ${formatHora(horaFin)}`;
}

/** Nombre corto del día de la semana */
export const DIAS_SEMANA_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Nombre largo del día de la semana */
export const DIAS_SEMANA_LARGO = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

/** Nombre del mes */
export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/** Formatea mes y año para el header del calendario */
export function formatMesAnio(fecha: Date): string {
  return `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

/** Genera la grilla de días para un mes (6 semanas de 7 días) */
export function generarGrillaCalendario(anio: number, mes: number): (Date | null)[] {
  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);

  // Día de la semana del primer día (0=Dom)
  const offsetInicio = primerDia.getDay();

  const grilla: (Date | null)[] = [];

  // Relleno inicial
  for (let i = 0; i < offsetInicio; i++) {
    grilla.push(null);
  }

  // Días del mes
  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    grilla.push(new Date(anio, mes, d));
  }

  // Relleno final hasta completar 42 celdas (6 semanas)
  while (grilla.length < 42) {
    grilla.push(null);
  }

  return grilla;
}

/** Convierte Date a string "YYYY-MM-DD" */
export function toDateString(fecha: Date): string {
  return format(fecha, "yyyy-MM-dd");
}

/** Crea un TIMESTAMPTZ a partir de una fecha y "HH:mm" */
export function buildTimestamp(fecha: Date, hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  const dt = new Date(fecha);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
}
