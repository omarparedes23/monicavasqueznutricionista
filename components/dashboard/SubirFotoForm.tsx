"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { subirFotoProfesional } from "@/lib/actions/fotos";

interface Props {
  pacienteId: string;
}

export function SubirFotoForm({ pacienteId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);

    const formData = new FormData(e.currentTarget);
    const result = await subirFotoProfesional(pacienteId, formData);

    if (!result.success) {
      setError(result.error ?? "Error al subir la foto.");
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
        className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        <ImagePlus className="h-4 w-4" />
        Subir foto de evolución
      </button>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Subir foto de evolución</p>
        <button
          onClick={() => { setOpen(false); setError(null); setOk(false); }}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Imagen <span className="text-red-500">*</span>
          </label>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            required
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 transition-all"
          />
          <p className="text-xs text-slate-400">JPEG, PNG, WebP · máximo 5MB</p>
        </div>

        <Input label="Título" name="titulo" type="text" required placeholder="Ej: Semana 4 — frente" />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="descripcion-foto" className="text-sm font-medium text-slate-700">
            Descripción (opcional)
          </label>
          <textarea
            id="descripcion-foto"
            name="descripcion"
            rows={2}
            placeholder="Ej: Después de 4 semanas de plan..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {ok && <p className="text-sm text-brand-600">Foto subida correctamente.</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Subiendo…" : "Guardar foto"}
        </Button>
      </form>
    </div>
  );
}
