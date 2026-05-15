import { redirect, notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, Calendar, Mail, Phone, Cake, Image } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPacienteById, getCitasPaciente } from "@/lib/actions/profesional";
import { getHistorialPaciente } from "@/lib/actions/antropometria";
import { getPlanesPaciente } from "@/lib/actions/planes";
import { getFotosPaciente } from "@/lib/actions/fotos";
import { EvolucionChart } from "@/components/dashboard/EvolucionChart";
import { DownloadPlanButton } from "@/components/dashboard/DownloadPlanButton";
import { MedicionFormProfesional } from "@/components/dashboard/MedicionFormProfesional";
import { SubirPlanForm } from "@/components/dashboard/SubirPlanForm";
import { SubirFotoForm } from "@/components/dashboard/SubirFotoForm";
import { VerFotoButton } from "@/components/dashboard/VerFotoButton";
import type { Cita, Plan, Antropometria, Foto } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PacienteDetailPage({ params }: Props) {
  const { id } = await params;

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

  const [paciente, historial, planes, citas, fotos] = await Promise.all([
    getPacienteById(id),
    getHistorialPaciente(id),
    getPlanesPaciente(id),
    getCitasPaciente(id),
    getFotosPaciente(id),
  ]);

  if (!paciente) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">{paciente.nombre}</h1>

      {/* Profile info */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Información</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={paciente.email || "—"} />
          <InfoItem icon={<Phone className="h-4 w-4" />} label="Teléfono" value={paciente.telefono || "—"} />
          <InfoItem
            icon={<Cake className="h-4 w-4" />}
            label="Fecha de nacimiento"
            value={
              paciente.fecha_nacimiento
                ? format(parseISO(paciente.fecha_nacimiento), "d 'de' MMMM yyyy", { locale: es })
                : "—"
            }
          />
        </div>
        {paciente.historia_clinica && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Historia clínica</p>
            <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{paciente.historia_clinica}</p>
          </div>
        )}
      </section>

      {/* Evolución */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Evolución</h2>
        <EvolucionChart data={historial} />
        <MedicionFormProfesional pacienteId={id} />
      </section>

      {/* Planes */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Planes alimentarios</h2>
        <SubirPlanForm pacienteId={id} />
        {planes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No hay planes asignados.</p>
        ) : (
          <div className="space-y-3">
            {planes.map((plan) => (
              <PlanRow key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </section>

      {/* Fotos de evolución */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Fotos de evolución</h2>
        <SubirFotoForm pacienteId={id} />
        {fotos.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No hay fotos cargadas.</p>
        ) : (
          <div className="space-y-3">
            {fotos.map((foto) => (
              <FotoRow key={foto.id} foto={foto} />
            ))}
          </div>
        )}
      </section>

      {/* Citas */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Citas</h2>
        {citas.length === 0 ? (
          <p className="text-sm text-slate-400">No hay citas registradas.</p>
        ) : (
          <div className="space-y-3">
            {citas.map((cita) => (
              <CitaRow key={cita.id} cita={cita} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function PlanRow({ plan }: { plan: Plan }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{plan.titulo}</p>
          {plan.descripcion && (
            <p className="truncate text-xs text-slate-400">{plan.descripcion}</p>
          )}
        </div>
      </div>
      {plan.file_url && <DownloadPlanButton planId={plan.id} />}
    </div>
  );
}

function FotoRow({ foto }: { foto: Foto }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <Image className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{foto.titulo}</p>
          {foto.descripcion && (
            <p className="truncate text-xs text-slate-400">{foto.descripcion}</p>
          )}
        </div>
      </div>
      <VerFotoButton fotoId={foto.id} />
    </div>
  );
}

function CitaRow({ cita }: { cita: Cita }) {
  const fecha = parseISO(cita.fecha_inicio);
  const fechaStr = format(fecha, "EEEE d 'de' MMMM yyyy · HH:mm", { locale: es });

  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{cita.paciente_nombre}</p>
          <p className="text-xs text-slate-500">{fechaStr}</p>
        </div>
      </div>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          cita.estado === "confirmada"
            ? "bg-green-100 text-green-700"
            : cita.estado === "cancelada"
            ? "bg-red-100 text-red-700"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {cita.estado}
      </span>
    </div>
  );
}
