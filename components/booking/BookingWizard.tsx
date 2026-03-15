"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BookingCalendar } from "./BookingCalendar";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { BookingForm } from "./BookingForm";
import { ConfirmationScreen } from "./ConfirmationScreen";
import { formatFechaLarga } from "@/lib/utils/dates";
import type { TimeSlot, CitaConfirmada } from "@/types";

type Step = "calendar" | "slots" | "form" | "confirmation";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "calendar", label: "Fecha",    icon: Calendar },
  { id: "slots",    label: "Horario",  icon: Clock },
  { id: "form",     label: "Datos",    icon: ClipboardList },
];

export function BookingWizard() {
  const [step, setStep]                     = useState<Step>("calendar");
  const [fecha, setFecha]                   = useState<Date | null>(null);
  const [slot, setSlot]                     = useState<TimeSlot | null>(null);
  const [citaConfirmada, setCitaConfirmada] = useState<CitaConfirmada | null>(null);

  const handleFechaSeleccionada = useCallback((f: Date) => {
    setFecha(f);
    setSlot(null);
    setStep("slots");
  }, []);

  const handleSlotSeleccionado = useCallback((s: TimeSlot) => {
    setSlot(s);
    setStep("form");
  }, []);

  const handleSuccess = useCallback((cita: CitaConfirmada) => {
    setCitaConfirmada(cita);
    setStep("confirmation");
  }, []);

  const handleNuevaReserva = useCallback(() => {
    setFecha(null);
    setSlot(null);
    setCitaConfirmada(null);
    setStep("calendar");
  }, []);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  if (step === "confirmation" && citaConfirmada && slot) {
    return (
      <div className="w-full max-w-md mx-auto px-4">
        <ConfirmationScreen
          cita={citaConfirmada}
          slot={slot}
          onNuevaReserva={handleNuevaReserva}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Progress steps */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, idx) => {
          const isCompleted = idx < stepIndex;
          const isCurrent   = s.id === step;
          const Icon        = s.icon;

          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    backgroundColor: isCompleted
                      ? "#16a34a"
                      : isCurrent
                      ? "#ffffff"
                      : "#f1f5f9",
                    borderColor: isCompleted || isCurrent ? "#16a34a" : "#e2e8f0",
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isCompleted && "text-white",
                      isCurrent  && "text-brand-600",
                      !isCompleted && !isCurrent && "text-slate-400"
                    )}
                  />
                </motion.div>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    isCurrent  ? "text-brand-600" : "text-slate-400"
                  )}
                >
                  {s.label}
                </span>
              </div>

              {/* Línea conectora */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mb-5">
                  <motion.div
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    initial={{ scaleX: 0 }}
                    style={{ transformOrigin: "left" }}
                    className="h-full bg-brand-400 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                  <div className="-mt-0.5 h-full bg-slate-200 rounded-full -z-10" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Panel principal */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: Calendario */}
          {step === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                Selecciona una fecha
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                Los días resaltados tienen disponibilidad
              </p>
              <BookingCalendar
                onFechaSeleccionada={handleFechaSeleccionada}
                fechaSeleccionada={fecha}
              />
            </motion.div>
          )}

          {/* STEP 2: Horarios */}
          {step === "slots" && fecha && (
            <motion.div
              key="slots"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => setStep("calendar")}
                  className="text-sm text-brand-600 hover:underline font-medium"
                >
                  ← Cambiar fecha
                </button>
              </div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                Elige un horario
              </h2>
              <p className="text-sm text-slate-400 mb-5 capitalize">
                {formatFechaLarga(fecha)}
              </p>
              <TimeSlotPicker
                fecha={fecha}
                slotSeleccionado={slot}
                onSlotSeleccionado={handleSlotSeleccionado}
              />
            </motion.div>
          )}

          {/* STEP 3: Formulario */}
          {step === "form" && fecha && slot && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                Tus datos
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                Completa el formulario para confirmar tu cita
              </p>
              <BookingForm
                fecha={fecha}
                slot={slot}
                onSuccess={handleSuccess}
                onBack={() => setStep("slots")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
