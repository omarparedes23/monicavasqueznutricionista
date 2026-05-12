"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { addMedicion } from "@/lib/actions/antropometria";

export function MedicionForm() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSending(true);
    setError(null);
    setOk(false);

    const peso = parseFloat(formData.get("peso") as string);
    if (isNaN(peso) || peso <= 0) {
      setError("Ingresá un peso válido");
      setSending(false);
      return;
    }

    const grasaRaw = formData.get("porcentaje_grasa") as string;
    const cinturaRaw = formData.get("cintura") as string;
    const caderaRaw = formData.get("cadera") as string;
    const fecha = formData.get("fecha") as string;
    const notas = formData.get("notas") as string;

    const result = await addMedicion({
      peso,
      porcentaje_grasa: grasaRaw ? parseFloat(grasaRaw) : undefined,
      cintura: cinturaRaw ? parseFloat(cinturaRaw) : undefined,
      cadera: caderaRaw ? parseFloat(caderaRaw) : undefined,
      fecha,
      notas: notas || undefined,
    });

    if (!result.success) {
      setError(result.error ?? "Error al guardar");
    } else {
      setOk(true);
      router.refresh();
    }

    setSending(false);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Peso (kg)"
          name="peso"
          type="number"
          step="0.1"
          min="30"
          max="300"
          required
          placeholder="70.5"
        />
        <Input
          label="% Grasa corporal"
          name="porcentaje_grasa"
          type="number"
          step="0.1"
          min="1"
          max="60"
          placeholder="25.0"
        />
        <Input
          label="Cintura (cm)"
          name="cintura"
          type="number"
          step="0.1"
          min="40"
          max="200"
          placeholder="80.0"
        />
        <Input
          label="Cadera (cm)"
          name="cadera"
          type="number"
          step="0.1"
          min="40"
          max="200"
          placeholder="100.0"
        />
      </div>

      <Input label="Fecha" name="fecha" type="date" defaultValue={today} required />

      <Input label="Notas (opcional)" name="notas" placeholder="Ej: después del almuerzo" />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {ok && <p className="text-sm text-brand-600">Medición guardada correctamente.</p>}

      <Button type="submit" disabled={sending} className="w-full">
        {sending ? "Guardando…" : "Registrar medición"}
      </Button>
    </form>
  );
}
