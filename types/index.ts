// ============================================================
// TIPOS: Sistema de Gestión de Citas - Nutricionista
// ============================================================

export interface ProfesionalConfig {
  id: string;
  nombre: string;
  titulo: string;
  email_notificacion: string;
  duracion_cita_minutos: number;
  zona_horaria: string;
  created_at: string;
  updated_at: string;
}

export interface DisponibilidadSemanal {
  id: string;
  profesional_id: string;
  dia_semana: number; // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
  hora_inicio: string; // "HH:mm"
  hora_fin: string;    // "HH:mm"
  activo: boolean;
  created_at: string;
}

export type EstadoCita = "confirmada" | "cancelada" | "completada" | "no_asistio";

export interface Cita {
  id: string;
  profesional_id: string;
  paciente_nombre: string;
  paciente_email: string;
  paciente_telefono: string;
  fecha_inicio: string; // ISO 8601
  fecha_fin: string;    // ISO 8601
  estado: EstadoCita;
  notas: string | null;
  email_paciente_enviado: boolean;
  email_profesional_enviado: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// TIPOS DE DOMINIO (UI / Lógica)
// ============================================================

/** Un slot de tiempo disponible para reservar */
export interface TimeSlot {
  hora_inicio: string; // "HH:mm"
  hora_fin: string;    // "HH:mm"
  disponible: boolean;
}

/** Datos del formulario de reserva */
export interface BookingFormData {
  nombre: string;
  email: string;
  telefono: string;
}

/** Estado completo de una reserva en proceso */
export interface BookingState {
  fecha: Date | null;
  slot: TimeSlot | null;
  paciente: BookingFormData | null;
}

/** Respuesta de los Server Actions */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Disponibilidad por fecha (para el calendario) */
export interface DisponibilidadFecha {
  fecha: string;       // "YYYY-MM-DD"
  slots: TimeSlot[];
  tiene_disponibilidad: boolean;
}

/** Resumen de cita confirmada */
export interface CitaConfirmada {
  id: string;
  paciente_nombre: string;
  paciente_email: string;
  fecha_inicio: string;
  fecha_fin: string;
  profesional_nombre: string;
}

// ============================================================
// DATABASE TYPES (Supabase generated-style)
// ============================================================
export type Database = {
  public: {
    Tables: {
      profesional_config: {
        Row: ProfesionalConfig;
        Insert: Omit<ProfesionalConfig, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProfesionalConfig, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      disponibilidad_semanal: {
        Row: DisponibilidadSemanal;
        Insert: Omit<DisponibilidadSemanal, "id" | "created_at">;
        Update: Partial<Omit<DisponibilidadSemanal, "id" | "created_at">>;
        Relationships: [];
      };
      citas: {
        Row: Cita;
        Insert: Omit<Cita, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Cita, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
