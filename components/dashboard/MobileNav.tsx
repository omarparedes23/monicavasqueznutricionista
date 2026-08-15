"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "@/components/dashboard/NavLink";
import { signOut } from "@/lib/actions/auth";

interface MobileNavProps {
  isProfesional: boolean;
}

export function MobileNav({ isProfesional }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Menú desplegable (móvil) */}
      {open && (
        <div className="absolute inset-x-0 top-full mt-px border-t border-slate-100 bg-white shadow-lg">
          <nav className="space-y-1 p-4">
            {isProfesional ? (
              <>
                <NavLink href="/profesional">Panel Profesional</NavLink>
                <NavLink href="/profesional/pacientes">Pacientes</NavLink>
                <NavLink href="/profesional/pacientes/nuevo">Nuevo Paciente</NavLink>
                <NavLink href="/profesional/tienda">Tienda</NavLink>
              </>
            ) : (
              <>
                <NavLink href="/paciente">Mis Citas</NavLink>
              </>
            )}
          </nav>
          <div className="border-t border-slate-100 p-4">
            <form action={signOut}>
              <button
                type="submit"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
