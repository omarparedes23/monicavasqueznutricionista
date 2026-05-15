"use client";

import { useActionState } from "react";
import { actualizarPassword } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function EstablecerPasswordForm() {
  const [state, formAction] = useActionState(actualizarPassword, null);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Nueva contraseña"
        name="password"
        type="password"
        required
        placeholder="Mínimo 8 caracteres"
      />
      <Input
        label="Confirmar contraseña"
        name="confirm"
        type="password"
        required
        placeholder="Repetí la contraseña"
      />
      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
      <Button type="submit" className="w-full">
        Guardar contraseña
      </Button>
    </form>
  );
}
