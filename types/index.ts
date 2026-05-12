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
  hora_fin: string; // "HH:mm"
  activo: boolean;
  created_at: string;
}

export type EstadoCita = "confirmada" | "cancelada" | "completada" | "no_asistio";

export interface Cita {
  id: string;
  profesional_id: string;
  paciente_id: string | null;
  paciente_nombre: string;
  paciente_email: string;
  paciente_telefono: string;
  fecha_inicio: string; // ISO 8601
  fecha_fin: string; // ISO 8601
  estado: EstadoCita;
  notas: string | null;
  email_paciente_enviado: boolean;
  email_profesional_enviado: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// NUEVOS TIPOS DE DOMINIO
// ============================================================

export type Rol = "paciente" | "profesional";

export interface Perfil {
  id: string; // FK auth.users
  nombre: string;
  foto_url: string | null;
  fecha_nacimiento: string | null;
  historia_clinica: string | null;
  rol: Rol;
  created_at: string;
  updated_at: string;
}

export interface Antropometria {
  id: string;
  paciente_id: string;
  peso: number | null;
  porcentaje_grasa: number | null;
  cintura: number | null;
  cadera: number | null;
  fecha: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  paciente_id: string;
  titulo: string;
  descripcion: string | null;
  file_url: string | null;
  activo: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  titulo: string;
  slug: string;
  contenido_markdown: string;
  imagen_url: string | null;
  tags: string[] | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  excerpt?: string | null;
}

export interface BlogPostCard {
  id: string;
  titulo: string;
  slug: string;
  excerpt: string;
  imagen_url: string | null;
  tags: string[] | null;
  published_at: string | null;
}

// ============================================================
// TIPOS DE DOMINIO (UI / Lógica)
// ============================================================

/** Un slot de tiempo disponible para reservar */
export interface TimeSlot {
  hora_inicio: string; // "HH:mm"
  hora_fin: string; // "HH:mm"
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
export type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

/** Disponibilidad por fecha (para el calendario) */
export interface DisponibilidadFecha {
  fecha: string; // "YYYY-MM-DD"
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
// DATABASE TYPES (Supabase v2.99+ compatible — inline objects required)
// Row/Insert/Update must be inline object types, not interface references,
// so they satisfy the SDK's `Record<string, unknown>` constraint.
// ============================================================
export type Database = {
  public: {
    Tables: {
      nutri_profesional_config: {
        Row: {
          id: string;
          nombre: string;
          titulo: string;
          email_notificacion: string;
          duracion_cita_minutos: number;
          zona_horaria: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre?: string;
          titulo?: string;
          email_notificacion: string;
          duracion_cita_minutos?: number;
          zona_horaria?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          titulo?: string;
          email_notificacion?: string;
          duracion_cita_minutos?: number;
          zona_horaria?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      nutri_disponibilidad_semanal: {
        Row: {
          id: string;
          profesional_id: string;
          dia_semana: number;
          hora_inicio: string;
          hora_fin: string;
          activo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profesional_id: string;
          dia_semana: number;
          hora_inicio: string;
          hora_fin: string;
          activo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profesional_id?: string;
          dia_semana?: number;
          hora_inicio?: string;
          hora_fin?: string;
          activo?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      nutri_citas: {
        Row: {
          id: string;
          profesional_id: string;
          paciente_id: string | null;
          paciente_nombre: string;
          paciente_email: string;
          paciente_telefono: string;
          fecha_inicio: string;
          fecha_fin: string;
          estado: string;
          notas: string | null;
          email_paciente_enviado: boolean;
          email_profesional_enviado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profesional_id: string;
          paciente_id?: string | null;
          paciente_nombre: string;
          paciente_email: string;
          paciente_telefono: string;
          fecha_inicio: string;
          fecha_fin: string;
          estado?: string;
          notas?: string | null;
          email_paciente_enviado?: boolean;
          email_profesional_enviado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profesional_id?: string;
          paciente_id?: string | null;
          paciente_nombre?: string;
          paciente_email?: string;
          paciente_telefono?: string;
          fecha_inicio?: string;
          fecha_fin?: string;
          estado?: string;
          notas?: string | null;
          email_paciente_enviado?: boolean;
          email_profesional_enviado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      nutri_perfiles: {
        Row: {
          id: string;
          nombre: string;
          foto_url: string | null;
          fecha_nacimiento: string | null;
          historia_clinica: string | null;
          rol: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nombre?: string;
          foto_url?: string | null;
          fecha_nacimiento?: string | null;
          historia_clinica?: string | null;
          rol?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          foto_url?: string | null;
          fecha_nacimiento?: string | null;
          historia_clinica?: string | null;
          rol?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      nutri_antropometria: {
        Row: {
          id: string;
          paciente_id: string;
          peso: number | null;
          porcentaje_grasa: number | null;
          cintura: number | null;
          cadera: number | null;
          fecha: string;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          paciente_id: string;
          peso?: number | null;
          porcentaje_grasa?: number | null;
          cintura?: number | null;
          cadera?: number | null;
          fecha: string;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          paciente_id?: string;
          peso?: number | null;
          porcentaje_grasa?: number | null;
          cintura?: number | null;
          cadera?: number | null;
          fecha?: string;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      nutri_planes: {
        Row: {
          id: string;
          paciente_id: string;
          titulo: string;
          descripcion: string | null;
          file_url: string | null;
          activo: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          paciente_id: string;
          titulo: string;
          descripcion?: string | null;
          file_url?: string | null;
          activo?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          paciente_id?: string;
          titulo?: string;
          descripcion?: string | null;
          file_url?: string | null;
          activo?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      nutri_blog_posts: {
        Row: {
          id: string;
          titulo: string;
          slug: string;
          contenido_markdown: string;
          imagen_url: string | null;
          tags: string[];
          published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          slug: string;
          contenido_markdown?: string;
          imagen_url?: string | null;
          tags?: string[];
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          titulo?: string;
          slug?: string;
          contenido_markdown?: string;
          imagen_url?: string | null;
          tags?: string[];
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_id_by_email: {
        Args: { user_email: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
