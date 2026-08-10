"use server";

import { z } from "zod";
import { crearCita } from "@/lib/services/booking";
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
  telefono: z.string().min(7, "Teléfono inválido").max(20, "Teléfono demasiado largo"),
});

export type BookingInput = z.infer<typeof BookingSchema>;

// ============================================================
// SERVER ACTION: reservarCita
// ============================================================
export async function reservarCita(input: BookingInput): Promise<ActionResult<CitaConfirmada>> {
  // 1. Validar input
  const parsed = BookingSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Datos inválidos.";
    return { success: false, error: firstError };
  }

  const { fecha, hora_inicio, hora_fin, nombre, email, telefono } = parsed.data;

  // 2. Delegar al servicio compartido (misma lógica que POST /api/appointments):
  //    verificación de slot, anti-race condition, auto-creación de usuario,
  //    INSERT y emails.
  return crearCita({ fecha, hora_inicio, hora_fin, nombre, email, telefono });
}
