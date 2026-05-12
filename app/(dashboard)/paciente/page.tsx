import { redirect } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { FileText } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMiHistorial, getMiUltimaMedicion } from "@/lib/actions/antropometria";
import { getMisPlanes } from "@/lib/actions/planes";
import { EvolucionChart } from "@/components/dashboard/EvolucionChart";
import { MedicionForm } from "@/components/dashboard/MedicionForm";
import { DownloadPlanButton } from "@/components/dashboard/DownloadPlanButton";
import type { Antropometria, Plan } from "@/types";

export default async function PacientePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [historial, ultima, planes] = await Promise.all([
    getMiHistorial(),
    getMiUltimaMedicion(),
    getMisPlanes(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Mi Progreso</h1>

      {/* Gráfica evolutiva */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">Evolución</h2>
        <p className="mb-5 text-sm text-slate-500">
          Seguimiento de tus mediciones a lo largo del tiempo
        </p>
        <EvolucionChart data={historial} />
      </section>

      {/* Última medición + Resumen */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Última medición</h2>
          {ultima ? <MedicionCard medicion={ultima} /> : <EmptyMedicion />}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Resumen</h2>
          {historial.length > 0 ? (
            <Resumen historial={historial} />
          ) : (
            <p className="text-sm text-slate-400">
              Registrá tu primera medición para ver tu resumen.
            </p>
          )}
        </section>
      </div>

      {/* Formulario de nueva medición */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">Nueva medición</h2>
        <p className="mb-5 text-sm text-slate-500">
          Registrá tus medidas para hacer seguimiento de tu progreso
        </p>
        <MedicionForm />
      </section>

      {/* Mis Dietas */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-slate-800">Mis Dietas</h2>
        <p className="mb-5 text-sm text-slate-500">
          Planes alimentarios que te asignó tu nutricionista
        </p>
        {planes.length === 0 ? (
          <div className="flex h-24 items-center justify-center">
            <p className="text-sm text-slate-400">
              Aún no tenés planes asignados. Tu nutricionista te los enviará acá.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {planes.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   Subcomponentes server
   ============================================================ */

function MedicionCard({ medicion }: { medicion: Antropometria }) {
  const items = [
    { label: "Peso", valor: medicion.peso, unidad: "kg" },
    { label: "% Grasa", valor: medicion.porcentaje_grasa, unidad: "%" },
    { label: "Cintura", valor: medicion.cintura, unidad: "cm" },
    { label: "Cadera", valor: medicion.cadera, unidad: "cm" },
  ].filter((i) => i.valor != null);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        {format(parseISO(medicion.fecha), "d 'de' MMMM yyyy", { locale: es })}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-400">{item.label}</p>
            <p className="text-xl font-bold text-slate-900">
              {item.valor}
              <span className="text-sm font-normal text-slate-400"> {item.unidad}</span>
            </p>
          </div>
        ))}
      </div>
      {medicion.notas && <p className="text-xs italic text-slate-400">«{medicion.notas}»</p>}
    </div>
  );
}

function EmptyMedicion() {
  return (
    <div className="flex h-32 items-center justify-center">
      <p className="text-sm text-slate-400">Aún no hay mediciones registradas.</p>
    </div>
  );
}

function Resumen({ historial }: { historial: Antropometria[] }) {
  const ordenado = [...historial].reverse();
  const primero = ordenado[0];
  const ultimo = ordenado[ordenado.length - 1];

  const diffs = [
    { label: "Peso", anterior: primero.peso, actual: ultimo.peso, unidad: "kg" },
    {
      label: "% Grasa",
      anterior: primero.porcentaje_grasa,
      actual: ultimo.porcentaje_grasa,
      unidad: "%",
    },
    { label: "Cintura", anterior: primero.cintura, actual: ultimo.cintura, unidad: "cm" },
    { label: "Cadera", anterior: primero.cadera, actual: ultimo.cadera, unidad: "cm" },
  ].filter((d) => d.anterior != null && d.actual != null);

  if (diffs.length === 0) {
    return <p className="text-sm text-slate-400">Registrá más mediciones para ver tu evolución.</p>;
  }

  return (
    <div className="space-y-3">
      {diffs.map((d) => {
        const cambio = (d.actual as number) - (d.anterior as number);
        const bajo = cambio < 0;
        const neutro = cambio === 0;

        return (
          <div key={d.label} className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{d.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {d.anterior} → {d.actual} {d.unidad}
              </span>
              <span
                className={`text-xs font-semibold ${
                  neutro ? "text-slate-400" : bajo ? "text-brand-600" : "text-red-500"
                }`}
              >
                {neutro
                  ? "="
                  : bajo
                    ? `↓ ${Math.abs(cambio).toFixed(1)}`
                    : `↑ ${cambio.toFixed(1)}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
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
