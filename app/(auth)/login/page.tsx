"use client";

import { useActionState } from "react";
import { signInWithPassword, signInWithOtp } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [passwordState, passwordAction] = useActionState(signInWithPassword, null);
  const [otpState, otpAction] = useActionState(signInWithOtp, null);

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <h1 className="text-xl font-bold text-slate-900 mb-2 text-center">
          Iniciar sesión
        </h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          Accede a tu cuenta
        </p>

        <form action={passwordAction} className="space-y-4">
          <Input label="Email" name="email" type="email" required />
          <Input label="Contraseña" name="password" type="password" required />
          {passwordState?.error && (
            <p className="text-xs text-red-500">{passwordState.error}</p>
          )}
          <Button type="submit" className="w-full">
            Ingresar
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">o</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form action={otpAction} className="space-y-4">
          <Input label="Email" name="email" type="email" required />
          {otpState?.error && (
            <p className="text-xs text-red-500">{otpState.error}</p>
          )}
          {otpState?.success && (
            <p className="text-xs text-brand-600">{otpState.success}</p>
          )}
          <Button type="submit" variant="secondary" className="w-full">
            Enviar enlace mágico
          </Button>
        </form>
      </div>
    </main>
  );
}
