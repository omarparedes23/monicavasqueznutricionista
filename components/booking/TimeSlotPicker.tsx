"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toDateString, formatHora } from "@/lib/utils/dates";
import { getSlotsParaFecha } from "@/lib/actions/availability";
import type { TimeSlot } from "@/types";

interface TimeSlotPickerProps {
  fecha: Date;
  slotSeleccionado: TimeSlot | null;
  onSlotSeleccionado: (slot: TimeSlot) => void;
}

export function TimeSlotPicker({
  fecha,
  slotSeleccionado,
  onSlotSeleccionado,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const fechaStr = toDateString(fecha);
      const result = await getSlotsParaFecha(fechaStr);
      if (result.success) {
        setSlots(result.data);
      }
    });
  }, [fecha]);

  const slotsDisponibles = slots.filter((s) => s.disponible);
  const slotsOcupados = slots.filter((s) => !s.disponible);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-10"
          >
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            <p className="text-sm text-slate-500">Cargando horarios...</p>
          </motion.div>
        ) : slots.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-2 py-10 text-center"
          >
            <Clock className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Sin horarios disponibles</p>
            <p className="text-xs text-slate-400">Selecciona otra fecha del calendario</p>
          </motion.div>
        ) : (
          <motion.div
            key="slots"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Slots disponibles */}
            {slotsDisponibles.length > 0 && (
              <div className="mb-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Horarios disponibles ({slotsDisponibles.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {slotsDisponibles.map((slot) => {
                    const seleccionado = slotSeleccionado?.hora_inicio === slot.hora_inicio;

                    return (
                      <motion.button
                        key={slot.hora_inicio}
                        onClick={() => onSlotSeleccionado(slot)}
                        whileTap={{ scale: 0.95 }}
                        aria-pressed={seleccionado}
                        className={cn(
                          "rounded-xl px-2 py-2.5 text-sm font-medium transition-all duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                          seleccionado
                            ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                            : "border border-brand-100 bg-brand-50 text-brand-700 hover:bg-brand-100"
                        )}
                      >
                        {formatHora(slot.hora_inicio)}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Slots ocupados */}
            {slotsOcupados.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
                  No disponibles
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {slotsOcupados.map((slot) => (
                    <div
                      key={slot.hora_inicio}
                      className={cn(
                        "rounded-xl px-2 py-2.5 text-center text-sm font-medium",
                        "cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-300",
                        "line-through"
                      )}
                    >
                      {formatHora(slot.hora_inicio)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
