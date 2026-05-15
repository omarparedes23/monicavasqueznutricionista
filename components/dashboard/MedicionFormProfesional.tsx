"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { addMedicionPorProfesional } from "@/lib/actions/antropometria";

interface Props {
  pacienteId: string;
}

export function MedicionFormProfesional({ pacienteId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setOk(false);

    const result = await addMedicionPorProfesional(pacienteId, formData);

    if (!result.success) {
      setError(result.error ?? "Error al guardar la medición.");
    } else {
      setOk(true);
      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        <PlusCircle className="h-4 w-4" />
        Registrar nueva medición
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Nueva medición</p>
        <button
          onClick={() => { setOpen(false); setError(null); setOk(false); }}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Peso (kg)" name="peso" type="number" step="0.1" min="30" max="300" required placeholder="70.5" />
          <Input label="% Grasa corporal" name="porcentaje_grasa" type="number" step="0.1" min="1" max="60" placeholder="25.0" />
          <Input label="Cintura (cm)" name="cintura" type="number" step="0.1" min="40" max="200" placeholder="80.0" />
          <Input label="Cadera (cm)" name="cadera" type="number" step="0.1" min="40" max="200" placeholder="100.0" />
        </div>
        <Input label="Fecha" name="fecha" type="date" defaultValue={today} required />
        <Input label="Notas (opcional)" name="notas" placeholder="Ej: ayuno de 8 horas" />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {ok && <p className="text-sm text-brand-600">Medición guardada.</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Guardando…" : "Guardar medición"}
        </Button>
      </form>
    </div>
  );
}
