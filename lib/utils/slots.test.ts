import { describe, expect, it } from "vitest";
import {
  calcularSlotsDisponibles,
  fechaTieneDisponibilidad,
  getFechasDisponiblesDelMes,
} from "./slots";
import type { Cita, DisponibilidadSemanal, TimeSlot } from "@/types";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/**
 * Fecha futura (5 años desde hoy) para evitar el filtrado de slots del pasado
 * y que los tests sigan siendo deterministas sin depender del año actual.
 */
const FUTURO = new Date(new Date().getFullYear() + 5, 0, 7);

/** Construye un Date en el mismo día que FUTURO (misma semana del año). */
function fechaCita(h: number, m: number): Date {
  return new Date(FUTURO.getFullYear(), FUTURO.getMonth(), FUTURO.getDate(), h, m);
}

function makeDisponibilidad(overrides: Partial<DisponibilidadSemanal> = {}): DisponibilidadSemanal {
  return {
    id: "disp-1",
    profesional_id: "prof-1",
    dia_semana: FUTURO.getDay(),
    hora_inicio: "09:00",
    hora_fin: "11:00",
    activo: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeCita(overrides: Partial<Cita> = {}): Cita {
  return {
    id: "cita-1",
    profesional_id: "prof-1",
    paciente_id: "pac-1",
    paciente_nombre: "Test",
    paciente_email: "test@test.com",
    paciente_telefono: "12345678",
    fecha_inicio: fechaCita(9, 30).toISOString(),
    fecha_fin: fechaCita(10, 30).toISOString(),
    estado: "confirmada",
    notas: null,
    email_paciente_enviado: true,
    email_profesional_enviado: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function slotsResumen(slots: TimeSlot[]): string[] {
  return slots.map((s) => `${s.hora_inicio}-${s.hora_fin}:${s.disponible ? "libre" : "ocupado"}`);
}

// ------------------------------------------------------------
// calcularSlotsDisponibles
// ------------------------------------------------------------

describe("calcularSlotsDisponibles", () => {
  it("devuelve [] si no hay disponibilidad para ese día", () => {
    const slots = calcularSlotsDisponibles(FUTURO, [], [], 60);
    expect(slots).toEqual([]);
  });

  it("genera slots de 60 min dentro del bloque (09:00-11:00)", () => {
    const disponibilidad = [makeDisponibilidad()];
    const slots = calcularSlotsDisponibles(FUTURO, disponibilidad, [], 60);

    expect(slots).toHaveLength(2);
    expect(slots[0].hora_inicio).toBe("09:00");
    expect(slots[0].hora_fin).toBe("10:00");
    expect(slots[1].hora_inicio).toBe("10:00");
    expect(slots[1].hora_fin).toBe("11:00");
    expect(slots.every((s) => s.disponible)).toBe(true);
  });

  it("respeta la duración configurada (30 min → 4 slots)", () => {
    const disponibilidad = [makeDisponibilidad()];
    const slots = calcularSlotsDisponibles(FUTURO, disponibilidad, [], 30);

    expect(slots).toHaveLength(4);
    expect(slots.map((s) => s.hora_inicio)).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  it("marca como ocupado el slot que se solapa con una cita confirmada", () => {
    const disponibilidad = [makeDisponibilidad()];
    const cita = makeCita({
      fecha_inicio: fechaCita(9, 30).toISOString(),
      fecha_fin: fechaCita(10, 30).toISOString(),
    });

    const slots = calcularSlotsDisponibles(FUTURO, disponibilidad, [cita], 30);
    const resumen = slotsResumen(slots);

    expect(resumen).toEqual([
      "09:00-09:30:libre",
      "09:30-10:00:ocupado",
      "10:00-10:30:ocupado",
      "10:30-11:00:libre",
    ]);
  });

  it("ignora citas canceladas (no bloquean el slot)", () => {
    const disponibilidad = [makeDisponibilidad()];
    const cita = makeCita({
      estado: "cancelada",
      fecha_inicio: fechaCita(9, 0).toISOString(),
      fecha_fin: fechaCita(10, 0).toISOString(),
    });

    const slots = calcularSlotsDisponibles(FUTURO, disponibilidad, [cita], 60);
    expect(slots.every((s) => s.disponible)).toBe(true);
  });

  it("ignora bloques desactivados (activo = false)", () => {
    const disponibilidad = [makeDisponibilidad({ activo: false })];
    const slots = calcularSlotsDisponibles(FUTURO, disponibilidad, [], 60);
    expect(slots).toEqual([]);
  });

  it("combina y ordena varios bloques del mismo día", () => {
    const disponibilidad = [
      makeDisponibilidad({ hora_inicio: "16:00", hora_fin: "17:00" }),
      makeDisponibilidad(),
    ];

    const slots = calcularSlotsDisponibles(FUTURO, disponibilidad, [], 60);
    expect(slots.map((s) => s.hora_inicio)).toEqual(["09:00", "10:00", "16:00"]);
  });

  it("filtra slots en el pasado", () => {
    const pasada = new Date(2000, 0, 6); // fecha pasada, día de la semana real
    const disponibilidad = [makeDisponibilidad({ dia_semana: pasada.getDay() })];
    const slots = calcularSlotsDisponibles(pasada, disponibilidad, [], 60);
    expect(slots).toEqual([]);
  });
});

// ------------------------------------------------------------
// fechaTieneDisponibilidad
// ------------------------------------------------------------

describe("fechaTieneDisponibilidad", () => {
  it("devuelve true si queda al menos un slot libre", () => {
    const disponibilidad = [makeDisponibilidad()];
    expect(fechaTieneDisponibilidad(FUTURO, disponibilidad, [], 60)).toBe(true);
  });

  it("devuelve false si todos los slots están ocupados", () => {
    const disponibilidad = [makeDisponibilidad()];
    const citas = [
      makeCita({
        fecha_inicio: fechaCita(9, 0).toISOString(),
        fecha_fin: fechaCita(10, 0).toISOString(),
      }),
      makeCita({
        fecha_inicio: fechaCita(10, 0).toISOString(),
        fecha_fin: fechaCita(11, 0).toISOString(),
      }),
    ];
    expect(fechaTieneDisponibilidad(FUTURO, disponibilidad, citas, 60)).toBe(false);
  });

  it("devuelve false si el día no tiene bloques", () => {
    expect(fechaTieneDisponibilidad(FUTURO, [], [], 60)).toBe(false);
  });
});

// ------------------------------------------------------------
// getFechasDisponiblesDelMes
// ------------------------------------------------------------

describe("getFechasDisponiblesDelMes", () => {
  it("devuelve todos los lunes del mes cuando solo se trabaja los lunes", () => {
    const anio = FUTURO.getFullYear();
    const mes = 2; // Marzo
    const disponibilidad = [makeDisponibilidad({ dia_semana: 1 })];

    const resultado = getFechasDisponiblesDelMes(anio, mes, disponibilidad, [], 60);

    // Esperado: todos los lunes de marzo
    const esperado: string[] = [];
    const ultimoDia = new Date(anio, mes + 1, 0).getDate();
    for (let d = 1; d <= ultimoDia; d++) {
      if (new Date(anio, mes, d).getDay() === 1) {
        const m = String(mes + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        esperado.push(`${anio}-${m}-${dd}`);
      }
    }

    expect(Array.from(resultado).sort()).toEqual(esperado.sort());
  });

  it("excluye días del pasado (mes viejo → conjunto vacío)", () => {
    const resultado = getFechasDisponiblesDelMes(2000, 0, [makeDisponibilidad({ dia_semana: 1 })], [], 60);
    expect(resultado.size).toBe(0);
  });
});
