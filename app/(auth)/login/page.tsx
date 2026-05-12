"use client";

import { useActionState } from "react";
import { signInWithPassword, signInWithOtp } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [passwordState, passwordAction] = useActionState(signInWithPassword, null);
  const [otpState, otpAction] = useActionState(signInWithOtp, null);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mb-6 text-center text-sm text-slate-500">Accede a tu cuenta</p>

        <form action={passwordAction} className="space-y-4">
          <Input label="Email" name="email" type="email" required />
          <Input label="Contraseña" name="password" type="password" required />
          {passwordState?.error && <p className="text-xs text-red-500">{passwordState.error}</p>}
          <Button type="submit" className="w-full">
            Ingresar
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">o</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form action={otpAction} className="space-y-4">
          <Input label="Email" name="email" type="email" required />
          {otpState?.error && <p className="text-xs text-red-500">{otpState.error}</p>}
          {otpState?.success && <p className="text-xs text-brand-600">{otpState.success}</p>}
          <Button type="submit" variant="secondary" className="w-full">
            Enviar enlace mágico
          </Button>
        </form>
      </div>
    </main>
  );
}
