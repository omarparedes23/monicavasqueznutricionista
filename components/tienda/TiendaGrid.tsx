"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ProductoCard } from "@/components/tienda/ProductoCard";
import type { Producto } from "@/types";

const TODAS = "Todas";

interface TiendaGridProps {
  productos: Producto[];
}

/**
 * Grilla de productos con filtro por categoría en cliente.
 * El catálogo es chico (gestión manual), así que se filtra en memoria
 * sin roundtrips al servidor.
 */
export function TiendaGrid({ productos }: TiendaGridProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<string>(TODAS);

  // Categorías únicas, en orden de primera aparición (respeta `orden` del producto)
  const categorias = [TODAS, ...new Set(productos.map((p) => p.categoria))];

  const visibles =
    categoriaActiva === TODAS ? productos : productos.filter((p) => p.categoria === categoriaActiva);

  return (
    <div className="w-full">
      {/* Filtro de categorías */}
      {categorias.length > 2 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaActiva(cat)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                cat === categoriaActiva
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grilla */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibles.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}
