"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Clock, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatFechaLarga, formatRangoCita } from "@/lib/utils/dates";
import type { CitaConfirmada } from "@/types";

interface ConfirmationScreenProps {
  cita: CitaConfirmada;
  slot: { hora_inicio: string; hora_fin: string };
  onNuevaReserva: () => void;
}

export function ConfirmationScreen({ cita, slot, onNuevaReserva }: ConfirmationScreenProps) {
  const fecha = new Date(cita.fecha_inicio);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex flex-col items-center text-center"
    >
      {/* Ícono de check animado */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100"
      >
        <CheckCircle2 className="h-10 w-10 text-brand-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="mb-2 text-2xl font-bold text-slate-900">¡Cita Confirmada!</h2>
        <p className="mb-8 text-sm text-slate-500">
          Hemos enviado los detalles a{" "}
          <span className="font-medium text-slate-700">{cita.paciente_email}</span>
        </p>
      </motion.div>

      {/* Card de detalles */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 w-full space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
            <Calendar className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Fecha</p>
            <p className="text-sm font-semibold capitalize text-slate-800">
              {formatFechaLarga(fecha)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
            <Clock className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Horario</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatRangoCita(slot.hora_inicio, slot.hora_fin)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
            <Mail className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Confirmación enviada a</p>
            <p className="break-all text-sm font-semibold text-slate-800">{cita.paciente_email}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <Button
          variant="secondary"
          onClick={onNuevaReserva}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="w-full"
        >
          Reservar otra cita
        </Button>
      </motion.div>
    </motion.div>
  );
}
