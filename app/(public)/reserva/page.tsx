import { Suspense } from "react";
import { Leaf, Star, Shield, Clock } from "lucide-react";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getConfigYDisponibilidad } from "@/lib/actions/availability";

// Revalidar cada 5 minutos para reflejar cambios de configuración
export const revalidate = 300;

async function ProfesionalHeader() {
  const result = await getConfigYDisponibilidad();
  const nombre = result.success ? result.data.config.nombre : "Monica Vasquez";
  const titulo = result.success ? result.data.config.titulo : "Licenciada en Nutrición";

  return (
    <div className="mb-10 text-center">
      {/* Avatar / Logo */}
      <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-200">
        <Leaf className="h-9 w-9 text-white" />
      </div>

      <h1 className="mb-1 text-2xl font-bold text-slate-900">{nombre}</h1>
      <p className="text-sm text-slate-500">{titulo}</p>

      {/* Trust badges */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Shield className="h-3.5 w-3.5 text-brand-500" />
          Datos seguros
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5 text-brand-500" />
          Confirmación inmediata
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Star className="h-3.5 w-3.5 text-brand-500" />
          Sin necesidad de cuenta
        </div>
      </div>
    </div>
  );
}

function ProfesionalHeaderSkeleton() {
  return (
    <div className="mb-10 animate-pulse text-center">
      <div className="mb-4 inline-flex h-20 w-20 rounded-full bg-slate-200" />
      <div className="mx-auto mb-2 h-7 w-48 rounded-lg bg-slate-200" />
      <div className="mx-auto h-4 w-36 rounded bg-slate-200" />
    </div>
  );
}

export default function ReservaPage() {
  return (
    <>
      {/* Header del profesional (SSR) */}
      <Suspense fallback={<ProfesionalHeaderSkeleton />}>
        <ProfesionalHeader />
      </Suspense>

      {/* Wizard de reserva */}
      <div className="w-full">
        <BookingWizard />
      </div>
    </>
  );
}
