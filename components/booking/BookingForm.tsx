"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, ArrowRight, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { reservarCita } from "@/lib/actions/booking";
import { formatFechaLarga, formatRangoCita } from "@/lib/utils/dates";
import type { TimeSlot, CitaConfirmada } from "@/types";

interface BookingFormProps {
  fecha: Date;
  slot: TimeSlot;
  onSuccess: (cita: CitaConfirmada) => void;
  onBack: () => void;
}

interface FormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  general?: string;
}

export function BookingForm({ fecha, slot, onSuccess, onBack }: BookingFormProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPending, startTransition] = useTransition();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!nombre.trim() || nombre.trim().length < 2) {
      newErrors.nombre = "Ingresa tu nombre completo (mínimo 2 caracteres)";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ingresa un email válido";
    }
    if (!telefono.trim() || telefono.trim().length < 7) {
      newErrors.telefono = "Ingresa un teléfono válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      // Construir fecha string en formato "YYYY-MM-DD"
      const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

      const result = await reservarCita({
        fecha: fechaStr,
        hora_inicio: slot.hora_inicio,
        hora_fin: slot.hora_fin,
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim(),
      });

      if (result.success) {
        onSuccess(result.data);
      } else {
        setErrors({ general: result.error });
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      {/* Resumen de la cita */}
      <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
            <CalendarCheck className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold capitalize text-brand-800">
              {formatFechaLarga(fecha)}
            </p>
            <p className="text-sm text-brand-600">
              {formatRangoCita(slot.hora_inicio, slot.hora_fin)}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Nombre completo"
          type="text"
          placeholder="Ej: María González"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: undefined }));
          }}
          error={errors.nombre}
          leftIcon={<User className="h-4 w-4" />}
          autoComplete="name"
          autoFocus
        />

        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          autoComplete="email"
        />

        <Input
          label="Teléfono"
          type="tel"
          placeholder="+54 11 1234-5678"
          value={telefono}
          onChange={(e) => {
            setTelefono(e.target.value);
            if (errors.telefono) setErrors((prev) => ({ ...prev, telefono: undefined }));
          }}
          error={errors.telefono}
          leftIcon={<Phone className="h-4 w-4" />}
          autoComplete="tel"
        />

        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 bg-red-50 p-3"
          >
            <p className="text-sm text-red-600">{errors.general}</p>
          </motion.div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={isPending}
            className="flex-1"
          >
            Volver
          </Button>
          <Button
            type="submit"
            loading={isPending}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="flex-1"
          >
            {isPending ? "Reservando..." : "Confirmar cita"}
          </Button>
        </div>
      </form>

      <p className="mt-4 text-center text-xs text-slate-400">
        Recibirás una confirmación por email al reservar.
      </p>
    </motion.div>
  );
}
