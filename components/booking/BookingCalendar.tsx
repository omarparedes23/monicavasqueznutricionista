"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  formatMesAnio,
  generarGrillaCalendario,
  toDateString,
  DIAS_SEMANA_CORTO,
} from "@/lib/utils/dates";
import { getFechasDisponibles } from "@/lib/actions/availability";

interface BookingCalendarProps {
  onFechaSeleccionada: (fecha: Date) => void;
  fechaSeleccionada: Date | null;
}

export function BookingCalendar({
  onFechaSeleccionada,
  fechaSeleccionada,
}: BookingCalendarProps) {
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );
  const [fechasDisponibles, setFechasDisponibles] = useState<Set<string>>(
    new Set()
  );
  const [cargandoMes, startTransition] = useTransition();

  const cargarFechasDelMes = useCallback(
    (fecha: Date) => {
      startTransition(async () => {
        const result = await getFechasDisponibles(
          fecha.getFullYear(),
          fecha.getMonth()
        );
        if (result.success) {
          setFechasDisponibles(new Set(result.data));
        }
      });
    },
    [startTransition]
  );

  // Cargar mes inicial solo en el cliente, tras el montaje
  useEffect(() => {
    cargarFechasDelMes(mesActual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const irMesAnterior = () => {
    const anterior = new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1);
    // No ir al pasado
    if (
      anterior.getFullYear() < hoy.getFullYear() ||
      (anterior.getFullYear() === hoy.getFullYear() &&
        anterior.getMonth() < hoy.getMonth())
    )
      return;
    setMesActual(anterior);
    cargarFechasDelMes(anterior);
  };

  const irMesSiguiente = () => {
    // Máximo 3 meses adelante
    const maxMes = new Date(hoy.getFullYear(), hoy.getMonth() + 3, 1);
    const siguiente = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1);
    if (siguiente > maxMes) return;
    setMesActual(siguiente);
    cargarFechasDelMes(siguiente);
  };

  const grilla = generarGrillaCalendario(
    mesActual.getFullYear(),
    mesActual.getMonth()
  );

  const esMesAnteriorDeshabilitado =
    mesActual.getFullYear() === hoy.getFullYear() &&
    mesActual.getMonth() === hoy.getMonth();

  const esMesSiguienteDeshabilitado =
    mesActual >= new Date(hoy.getFullYear(), hoy.getMonth() + 3, 1);

  return (
    <div className="w-full">
      {/* Header del mes */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={irMesAnterior}
          disabled={esMesAnteriorDeshabilitado}
          className={cn(
            "p-2 rounded-xl transition-colors",
            esMesAnteriorDeshabilitado
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <motion.h3
          key={formatMesAnio(mesActual)}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-semibold text-slate-800 capitalize"
        >
          {formatMesAnio(mesActual)}
        </motion.h3>

        <button
          onClick={irMesSiguiente}
          disabled={esMesSiguienteDeshabilitado}
          className={cn(
            "p-2 rounded-xl transition-colors",
            esMesSiguienteDeshabilitado
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {DIAS_SEMANA_CORTO.map((dia) => (
          <div
            key={dia}
            className="text-center text-xs font-medium text-slate-400 py-1"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <motion.div
        key={`${mesActual.getFullYear()}-${mesActual.getMonth()}`}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: cargandoMes ? 0.5 : 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-7 gap-y-1"
      >
        {grilla.map((fecha, idx) => {
          if (!fecha) {
            return <div key={`empty-${idx}`} />;
          }

          const fechaStr   = toDateString(fecha);
          const esHoy      = toDateString(new Date()) === fechaStr;
          const esPasado   = fecha < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
          const disponible = fechasDisponibles.has(fechaStr) && !esPasado;
          const seleccionada =
            fechaSeleccionada && toDateString(fechaSeleccionada) === fechaStr;

          return (
            <div key={fechaStr} className="flex justify-center py-0.5">
              <button
                onClick={() => disponible && onFechaSeleccionada(fecha)}
                disabled={!disponible}
                aria-label={`${fecha.getDate()} ${disponible ? "disponible" : "no disponible"}`}
                aria-pressed={seleccionada ?? false}
                className={cn(
                  "w-9 h-9 rounded-xl text-sm font-medium transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  // Estado seleccionado
                  seleccionada &&
                    "bg-brand-600 text-white shadow-md shadow-brand-600/30 scale-105",
                  // Disponible no seleccionado
                  !seleccionada && disponible &&
                    "text-slate-700 hover:bg-brand-50 hover:text-brand-700 cursor-pointer",
                  // Hoy
                  esHoy && !seleccionada &&
                    "font-bold ring-1 ring-brand-300",
                  // No disponible / pasado
                  !disponible &&
                    "text-slate-300 cursor-not-allowed"
                )}
              >
                {fecha.getDate()}
              </button>
            </div>
          );
        })}
      </motion.div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-3 h-3 rounded-full bg-brand-600" />
          Disponible
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-3 h-3 rounded-full bg-slate-200" />
          No disponible
        </div>
      </div>
    </div>
  );
}
