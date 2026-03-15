import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <p className="text-8xl font-black text-slate-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Página no encontrada
        </h1>
        <p className="text-slate-500 mb-8 text-sm">
          Esta página no existe. Vuelve al inicio para reservar tu cita.
        </p>
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </main>
  );
}
