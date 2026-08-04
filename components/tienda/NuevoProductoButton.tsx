"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { crearProducto } from "@/lib/actions/tienda";

const CATEGORIAS = [
  "Proteínas",
  "Vitaminas y minerales",
  "Tés e infusiones",
  "Snacks saludables",
  "Otros",
];

export function NuevoProductoButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, startCreate] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startCreate(async () => {
      const result = await crearProducto(formData);
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error || "Error al crear el producto.");
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
        Nuevo producto
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo producto" description="Creá un producto. Después podés subirle la foto.">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label htmlFor="categoria" className="mb-1 block text-sm font-medium text-slate-700">
              Categoría
            </label>
            <select
              id="categoria"
              name="categoria"
              defaultValue="Proteínas"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="precio" className="mb-1 block text-sm font-medium text-slate-700">
              Precio (S/)
            </label>
            <input
              id="precio"
              name="precio"
              type="number"
              step="0.01"
              min="0"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-slate-700">
              Descripción corta
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label htmlFor="descripcion_larga" className="mb-1 block text-sm font-medium text-slate-700">
              Descripción larga
            </label>
            <textarea
              id="descripcion_larga"
              name="descripcion_larga"
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="w-24">
              <label htmlFor="orden" className="mb-1 block text-sm font-medium text-slate-700">
                Orden
              </label>
              <input
                id="orden"
                name="orden"
                type="number"
                min="0"
                defaultValue="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="mostrar_en_tienda"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Visible en tienda
            </label>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isCreating} disabled={isCreating}>
              Crear producto
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
