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

export function ConfirmationScreen({
  cita,
  slot,
  onNuevaReserva,
}: ConfirmationScreenProps) {
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
        className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-brand-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          ¡Cita Confirmada!
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Hemos enviado los detalles a{" "}
          <span className="font-medium text-slate-700">{cita.paciente_email}</span>
        </p>
      </motion.div>

      {/* Card de detalles */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 text-left space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Fecha</p>
            <p className="text-sm font-semibold text-slate-800 capitalize">
              {formatFechaLarga(fecha)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Horario</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatRangoCita(slot.hora_inicio, slot.hora_fin)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Confirmación enviada a</p>
            <p className="text-sm font-semibold text-slate-800 break-all">
              {cita.paciente_email}
            </p>
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
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="w-full"
        >
          Reservar otra cita
        </Button>
      </motion.div>
    </motion.div>
  );
}
