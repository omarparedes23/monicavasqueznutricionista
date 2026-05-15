import { redirect } from "next/navigation";
import Link from "next/link";
import { format, parseISO, isToday, isFuture } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Users, Clock, ChevronRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCitasProfesional, getPacientes } from "@/lib/actions/profesional";
import type { Cita } from "@/types";

export default async function ProfesionalPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfilRaw } = await supabase
    .from("nutri_perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  const perfil = perfilRaw as { rol: string } | null;

  if (perfil?.rol !== "profesional") {
    redirect("/paciente");
  }

  const [citas, pacientes] = await Promise.all([
    getCitasProfesional(),
    getPacientes(),
  ]);

  const citasHoy = citas.filter((c) => isToday(parseISO(c.fecha_inicio)));
  const citasProximas = citas.filter((c) => isFuture(parseISO(c.fecha_inicio)) && !isToday(parseISO(c.fecha_inicio)));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Panel del Profesional</h1>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5 text-brand-600" />}
          label="Pacientes totales"
          value={pacientes.length}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-brand-600" />}
          label="Citas hoy"
          value={citasHoy.length}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-brand-600" />}
          label="Próximas citas"
          value={citasProximas.length}
        />
      </div>

      {/* Citas de hoy */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Citas de hoy</h2>
        {citasHoy.length === 0 ? (
          <p className="text-sm text-slate-500">No tenés citas para hoy.</p>
        ) : (
          <div className="space-y-3">
            {citasHoy.map((cita) => (
              <CitaRow key={cita.id} cita={cita} />
            ))}
          </div>
        )}
      </section>

      {/* Próximas citas */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Próximas citas</h2>
          <Link
            href="/profesional/pacientes"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            Ver pacientes
          </Link>
        </div>
        {citas.length === 0 ? (
          <EmptyCitas />
        ) : (
          <div className="space-y-3">
            {citas.slice(0, 10).map((cita) => (
              <CitaRow key={cita.id} cita={cita} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function CitaRow({ cita }: { cita: Cita }) {
  const fecha = parseISO(cita.fecha_inicio);
  const horaInicio = format(fecha, "HH:mm");
  const fechaStr = isToday(fecha)
    ? "Hoy"
    : format(fecha, "EEEE d 'de' MMMM", { locale: es });

  return (
    <Link
      href={`/profesional/pacientes/${cita.paciente_id ?? "#"}`}
      className="flex items-center justify-between rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{cita.paciente_nombre}</p>
        <p className="text-xs text-slate-500">
          {fechaStr} · {horaInicio}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </Link>
  );
}

function EmptyCitas() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Calendar className="mb-3 h-10 w-10 text-slate-300" />
      <p className="text-sm font-medium text-slate-600">No hay citas próximas</p>
      <p className="text-xs text-slate-400">
        Las reservas confirmadas aparecerán aquí.
      </p>
    </div>
  );
}
