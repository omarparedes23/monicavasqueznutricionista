"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, User, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { PacienteConEmail } from "@/types";

interface PatientListProps {
  pacientes: PacienteConEmail[];
}

export function PatientList({ pacientes }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return pacientes;
    return pacientes.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
    );
  }, [pacientes, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <p className="text-xs text-slate-500">
        {filtered.length} {filtered.length === 1 ? "paciente" : "pacientes"}
        {searchTerm ? ` encontrado${filtered.length === 1 ? "" : "s"}` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-12">
          <p className="text-sm text-slate-500">No se encontraron pacientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((paciente) => (
            <Link
              key={paciente.id}
              href={`/profesional/pacientes/${paciente.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {paciente.nombre}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{paciente.email}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
