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

export function BookingCalendar({ onFechaSeleccionada, fechaSeleccionada }: BookingCalendarProps) {
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [fechasDisponibles, setFechasDisponibles] = useState<Set<string>>(new Set());
  const [cargandoMes, startTransition] = useTransition();

  const cargarFechasDelMes = useCallback(
    (fecha: Date) => {
      startTransition(async () => {
        const result = await getFechasDisponibles(fecha.getFullYear(), fecha.getMonth());
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
      (anterior.getFullYear() === hoy.getFullYear() && anterior.getMonth() < hoy.getMonth())
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

  const grilla = generarGrillaCalendario(mesActual.getFullYear(), mesActual.getMonth());

  const esMesAnteriorDeshabilitado =
    mesActual.getFullYear() === hoy.getFullYear() && mesActual.getMonth() === hoy.getMonth();

  const esMesSiguienteDeshabilitado =
    mesActual >= new Date(hoy.getFullYear(), hoy.getMonth() + 3, 1);

  return (
    <div className="w-full">
      {/* Header del mes */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={irMesAnterior}
          disabled={esMesAnteriorDeshabilitado}
          className={cn(
            "rounded-xl p-2 transition-colors",
            esMesAnteriorDeshabilitado
              ? "cursor-not-allowed text-slate-300"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <motion.h3
          key={formatMesAnio(mesActual)}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-semibold capitalize text-slate-800"
        >
          {formatMesAnio(mesActual)}
        </motion.h3>

        <button
          onClick={irMesSiguiente}
          disabled={esMesSiguienteDeshabilitado}
          className={cn(
            "rounded-xl p-2 transition-colors",
            esMesSiguienteDeshabilitado
              ? "cursor-not-allowed text-slate-300"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="mb-2 grid grid-cols-7">
        {DIAS_SEMANA_CORTO.map((dia) => (
          <div key={dia} className="py-1 text-center text-xs font-medium text-slate-400">
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

          const fechaStr = toDateString(fecha);
          const esHoy = toDateString(new Date()) === fechaStr;
          const esPasado = fecha < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
          const disponible = fechasDisponibles.has(fechaStr) && !esPasado;
          const seleccionada = fechaSeleccionada && toDateString(fechaSeleccionada) === fechaStr;

          return (
            <div key={fechaStr} className="flex justify-center py-0.5">
              <button
                onClick={() => disponible && onFechaSeleccionada(fecha)}
                disabled={!disponible}
                aria-label={`${fecha.getDate()} ${disponible ? "disponible" : "no disponible"}`}
                aria-pressed={seleccionada ?? false}
                className={cn(
                  "h-9 w-9 rounded-xl text-sm font-medium transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  // Estado seleccionado
                  seleccionada && "scale-105 bg-brand-600 text-white shadow-md shadow-brand-600/30",
                  // Disponible no seleccionado
                  !seleccionada &&
                    disponible &&
                    "cursor-pointer text-slate-700 hover:bg-brand-50 hover:text-brand-700",
                  // Hoy
                  esHoy && !seleccionada && "font-bold ring-1 ring-brand-300",
                  // No disponible / pasado
                  !disponible && "cursor-not-allowed text-slate-300"
                )}
              >
                {fecha.getDate()}
              </button>
            </div>
          );
        })}
      </motion.div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="h-3 w-3 rounded-full bg-brand-600" />
          Disponible
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="h-3 w-3 rounded-full bg-slate-200" />
          No disponible
        </div>
      </div>
    </div>
  );
}
