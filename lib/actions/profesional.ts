"use server";

import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { emailBienvenidaPaciente } from "@/lib/email/templates";
import type { ActionResult, Cita, PacienteConEmail } from "@/types";

// ============================================================
// SCHEMA DE VALIDACIÓN
// ============================================================
const CrearPacienteSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "Nombre demasiado largo"),
  email: z.string().email("Email inválido"),
  telefono: z.string().max(20).optional(),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").optional(),
  historia_clinica: z.string().max(5000).optional(),
});

// ============================================================
// SERVER ACTIONS
// ============================================================

/**
 * Obtiene las próximas citas confirmadas del profesional.
 * Ordenadas por fecha_inicio ASC.
 */
export async function getCitasProfesional(): Promise<Cita[]> {
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const now = new Date().toISOString();

  const { data, error } = await db
    .from("nutri_citas")
    .select("*")
    .eq("estado", "confirmada")
    .gte("fecha_inicio", now)
    .order("fecha_inicio", { ascending: true });

  if (error) {
    console.error("[getCitasProfesional] Error:", error);
    return [];
  }

  return (data ?? []) as Cita[];
}

/**
 * Obtiene todas las citas de un paciente específico.
 * Ordenadas por fecha_inicio DESC.
 */
export async function getCitasPaciente(pacienteId: string): Promise<Cita[]> {
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data, error } = await db
    .from("nutri_citas")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("fecha_inicio", { ascending: false });

  if (error) {
    console.error("[getCitasPaciente] Error:", error);
    return [];
  }

  return (data ?? []) as Cita[];
}

/**
 * Obtiene la lista de pacientes con email y teléfono.
 * Realiza un join en memoria entre nutri_perfiles y auth.users.
 */
export async function getPacientes(): Promise<PacienteConEmail[]> {
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data: perfiles, error: perfilesError } = await db
    .from("nutri_perfiles")
    .select("*")
    .eq("rol", "paciente")
    .order("nombre", { ascending: true });

  if (perfilesError) {
    console.error("[getPacientes] Error:", perfilesError);
    return [];
  }

  const perfilesList = (perfiles ?? []) as PacienteConEmail[];
  if (perfilesList.length === 0) return [];

  // Obtener emails y teléfonos desde auth.users
  try {
    const authAdmin = db.auth.admin;
    const { data: usersData, error: usersError } = await authAdmin.listUsers({
      perPage: 1000,
    });

    if (usersError) {
      console.error("[getPacientes] Error listUsers:", usersError);
      // Devolver perfiles sin email si falla auth
      return perfilesList.map((p) => ({
        ...p,
        email: "",
        telefono: "",
      }));
    }

    const users = usersData?.users ?? [];
    const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]));

    return perfilesList.map((p) => {
      const authUser = userMap.get(p.id);
      return {
        ...p,
        email: authUser?.email ?? "",
        telefono: authUser?.user_metadata?.telefono ?? authUser?.phone ?? "",
      };
    });
  } catch (err) {
    console.error("[getPacientes] Excepción listUsers:", err);
    return perfilesList.map((p) => ({
      ...p,
      email: "",
      telefono: "",
    }));
  }
}

/**
 * Obtiene un paciente por ID con email y teléfono.
 */
export async function getPacienteById(id: string): Promise<PacienteConEmail | null> {
  const supabase = createServiceRoleClient();
  const db = supabase as any;

  const { data: perfil, error: perfilError } = await db
    .from("nutri_perfiles")
    .select("*")
    .eq("id", id)
    .eq("rol", "paciente")
    .single();

  if (perfilError || !perfil) {
    console.error("[getPacienteById] Error:", perfilError);
    return null;
  }

  try {
    const authAdmin = db.auth.admin;
    const { data: userData, error: userError } = await authAdmin.getUserById(id);

    if (userError || !userData?.user) {
      console.error("[getPacienteById] Error getUserById:", userError);
      return {
        ...perfil,
        email: "",
        telefono: "",
      } as PacienteConEmail;
    }

    return {
      ...perfil,
      email: userData.user.email ?? "",
      telefono: userData.user.user_metadata?.telefono ?? userData.user.phone ?? "",
    } as PacienteConEmail;
  } catch (err) {
    console.error("[getPacienteById] Excepción getUserById:", err);
    return {
      ...perfil,
      email: "",
      telefono: "",
    } as PacienteConEmail;
  }
}

/**
 * Crea un nuevo paciente:
 * 1. Valida con Zod
 * 2. Verifica email duplicado
 * 3. Crea auth user (no confirmado)
 * 4. INSERT nutri_perfiles
 * 5. Si falla INSERT → rollback (deleteUser)
 * 6. Genera magic link
 * 7. Envía email de bienvenida (no bloquea)
 * 8. Retorna éxito
 */
export async function crearPaciente(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const raw = {
    nombre: formData.get("nombre") as string,
    email: formData.get("email") as string,
    telefono: (formData.get("telefono") as string) || undefined,
    fecha_nacimiento: (formData.get("fecha_nacimiento") as string) || undefined,
    historia_clinica: (formData.get("historia_clinica") as string) || undefined,
  };

  const parsed = CrearPacienteSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Datos inválidos.";
    return { success: false, error: firstError };
  }

  const { nombre, email, telefono, fecha_nacimiento, historia_clinica } = parsed.data;

  const supabase = createServiceRoleClient();
  const db = supabase as any;
  const authAdmin = db.auth.admin;

  // 1. Crear auth user (createUser falla con error descriptivo si el email ya existe)
  const { data: createData, error: createError } = await authAdmin.createUser({
    email,
    email_confirm: false,
    user_metadata: { nombre, telefono: telefono ?? "" },
  });

  if (createError || !createData?.user) {
    console.error("[crearPaciente] Error creando usuario:", createError);
    const msg = createError?.message?.toLowerCase() ?? "";
    const isDuplicate = msg.includes("already") || msg.includes("exists") || msg.includes("registered");
    return {
      success: false,
      error: isDuplicate ? "Ya existe un usuario con ese email." : (createError?.message ?? "Error al crear el usuario."),
    };
  }

  const userId = createData.user.id;

  // 2. UPSERT nutri_perfiles — el trigger on_auth_user_created ya insertó la fila base;
  //    actualizamos con los datos completos del formulario.
  const { error: upsertError } = await db.from("nutri_perfiles").upsert({
    id: userId,
    nombre,
    fecha_nacimiento: fecha_nacimiento ?? null,
    historia_clinica: historia_clinica ?? null,
    rol: "paciente",
  }, { onConflict: "id" });

  if (upsertError) {
    console.error("[crearPaciente] Error en upsert perfil:", upsertError);
    // Rollback: eliminar auth user
    try {
      await authAdmin.deleteUser(userId);
    } catch (delErr) {
      console.error("[crearPaciente] Rollback fallido:", delErr);
    }
    return { success: false, error: "Error al crear el perfil del paciente." };
  }

  // 4. Generar link de invitación (el paciente elige su contraseña al hacer clic)
  let magicLink: string | null = null;
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { data: linkData, error: linkError } = await authAdmin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/establecer-password`,
      },
    });
    if (!linkError && linkData?.properties?.action_link) {
      magicLink = linkData.properties.action_link;
    }
  } catch (err) {
    console.error("[crearPaciente] Error generando link de invitación:", err);
  }

  // 5. Enviar email de bienvenida (no bloquea)
  try {
    const { data: configData } = await db
      .from("nutri_profesional_config")
      .select("nombre")
      .limit(1)
      .single();
    const html = emailBienvenidaPaciente({
      paciente_nombre: nombre,
      profesional_nombre: configData?.nombre ?? "La nutricionista",
      magic_link: magicLink,
    });
    await sendEmail({
      to: email,
      subject: "Bienvenido/a al sistema de nutrición",
      html,
    });
  } catch (err) {
    console.error("[crearPaciente] Error enviando email:", err);
  }

  return { success: true, data: { id: userId } };
}
