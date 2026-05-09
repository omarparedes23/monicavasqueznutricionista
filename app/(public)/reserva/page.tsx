import { Suspense } from "react";
import { Leaf, Star, Shield, Clock } from "lucide-react";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getConfigYDisponibilidad } from "@/lib/actions/availability";

// Revalidar cada 5 minutos para reflejar cambios de configuración
export const revalidate = 300;

async function ProfesionalHeader() {
  const result = await getConfigYDisponibilidad();
  const nombre = result.success ? result.data.config.nombre : "Monica Vasquez";
  const titulo = result.success
    ? result.data.config.titulo
    : "Licenciada en Nutrición";

  return (
    <div className="text-center mb-10">
      {/* Avatar / Logo */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-200 mb-4">
        <Leaf className="w-9 h-9 text-white" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">{nombre}</h1>
      <p className="text-sm text-slate-500">{titulo}</p>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-brand-500" />
          Datos seguros
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          Confirmación inmediata
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Star className="w-3.5 h-3.5 text-brand-500" />
          Sin necesidad de cuenta
        </div>
      </div>
    </div>
  );
}

function ProfesionalHeaderSkeleton() {
  return (
    <div className="text-center mb-10 animate-pulse">
      <div className="inline-flex w-20 h-20 rounded-full bg-slate-200 mb-4" />
      <div className="h-7 w-48 bg-slate-200 rounded-lg mx-auto mb-2" />
      <div className="h-4 w-36 bg-slate-200 rounded mx-auto" />
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
