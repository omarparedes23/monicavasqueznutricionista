import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <p className="mb-4 text-8xl font-black text-slate-200">404</p>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Página no encontrada</h1>
        <p className="mb-8 text-sm text-slate-500">
          Esta página no existe. Vuelve al inicio para reservar tu cita.
        </p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
