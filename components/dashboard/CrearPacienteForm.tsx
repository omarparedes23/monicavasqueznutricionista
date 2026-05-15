"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { crearPaciente } from "@/lib/actions/profesional";

export function CrearPacienteForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(crearPaciente, null);

  useEffect(() => {
    if (state?.success && state.data?.id) {
      router.push(`/profesional/pacientes/${state.data.id}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Nombre completo"
        name="nombre"
        type="text"
        required
        placeholder="Ej: María González"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        required
        placeholder="maria@email.com"
      />

      <Input
        label="Teléfono (opcional)"
        name="telefono"
        type="tel"
        placeholder="+54 9 11 1234 5678"
      />

      <Input
        label="Fecha de nacimiento (opcional)"
        name="fecha_nacimiento"
        type="date"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="historia_clinica" className="text-sm font-medium text-slate-700">
          Historia clínica (opcional)
        </label>
        <textarea
          id="historia_clinica"
          name="historia_clinica"
          rows={4}
          placeholder="Notas médicas relevantes..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {state?.success === false && state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <Button type="submit" className="w-full">
        Crear paciente
      </Button>
    </form>
  );
}
