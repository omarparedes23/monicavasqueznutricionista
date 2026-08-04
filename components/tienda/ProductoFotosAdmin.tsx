"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Leaf, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  subirImagenProducto,
  eliminarImagenProducto,
  actualizarProducto,
} from "@/lib/actions/tienda";
import type { Producto } from "@/types";

const CATEGORIAS = [
  "Proteínas",
  "Vitaminas y minerales",
  "Tés e infusiones",
  "Snacks saludables",
  "Otros",
];

interface ProductoFotosAdminProps {
  producto: Producto;
}

export function ProductoFotosAdmin({ producto }: ProductoFotosAdminProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isUploading, startUpload] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isEditing, startEdit] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearFeedback();

    if (!file) {
      setError("Seleccioná una imagen.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startUpload(async () => {
      const result = await subirImagenProducto(producto.id, formData);
      if (result.success) {
        setSuccess("Imagen actualizada.");
        setFile(null);
        formRef.current?.reset();
      } else {
        setError(result.error || "Error al subir la imagen.");
      }
    });
  }

  function handleDelete() {
    clearFeedback();
    startDelete(async () => {
      const result = await eliminarImagenProducto(producto.id);
      if (result.success) {
        setSuccess("Imagen eliminada.");
      } else {
        setError(result.error || "Error al eliminar la imagen.");
      }
    });
  }

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearFeedback();
    const formData = new FormData(e.currentTarget);

    startEdit(async () => {
      const result = await actualizarProducto(producto.id, formData);
      if (result.success) {
        setSuccess("Producto actualizado.");
        setEditOpen(false);
      } else {
        setError(result.error || "Error al guardar el producto.");
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Miniatura */}
      {producto.imagen_url ? (
        <div className="relative aspect-square w-full">
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-brand-50">
          <Leaf className="h-12 w-12 text-brand-300" />
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">{producto.nombre}</h3>
            <p className="text-xs text-slate-500">
              {producto.categoria} · {producto.imagen_url ? "con foto" : "sin foto"}
              {!producto.mostrar_en_tienda && (
                <span className="ml-1 font-medium text-amber-600">· oculto</span>
              )}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditOpen(true)}
            leftIcon={<Pencil className="h-4 w-4" />}
            className="shrink-0"
          >
            Editar
          </Button>
        </div>

        {/* Formulario de subida */}
        <form ref={formRef} onSubmit={handleUpload} className="space-y-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              clearFeedback();
            }}
            className={cn(
              "block w-full cursor-pointer rounded-lg border border-dashed border-slate-300",
              "bg-slate-50 text-xs text-slate-600 file:mr-2 file:rounded-l-lg",
              "file:border-0 file:bg-slate-100 file:px-3 file:py-2",
              "file:text-xs file:font-medium file:text-slate-600",
              "hover:border-brand-300 hover:bg-brand-50/50"
            )}
          />
          <Button
            type="submit"
            size="sm"
            className="w-full"
            loading={isUploading}
            disabled={isUploading || isDeleting}
            leftIcon={!isUploading ? <ImagePlus className="h-4 w-4" /> : undefined}
          >
            {producto.imagen_url ? "Reemplazar foto" : "Subir foto"}
          </Button>
        </form>

        {producto.imagen_url && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="w-full"
            loading={isDeleting}
            disabled={isUploading || isDeleting}
            onClick={handleDelete}
            leftIcon={!isDeleting ? <Trash2 className="h-4 w-4" /> : undefined}
          >
            Eliminar foto
          </Button>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            {success}
          </p>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar producto" description={producto.nombre}>
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              defaultValue={producto.nombre}
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
              defaultValue={producto.categoria}
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
              defaultValue={producto.precio}
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
              defaultValue={producto.descripcion ?? ""}
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
              defaultValue={producto.descripcion_larga ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="orden" className="mb-1 block text-sm font-medium text-slate-700">
                Orden
              </label>
              <input
                id="orden"
                name="orden"
                type="number"
                min="0"
                defaultValue={producto.orden}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="mostrar_en_tienda"
                  defaultChecked={producto.mostrar_en_tienda}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Visible en tienda
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isEditing} disabled={isEditing}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
