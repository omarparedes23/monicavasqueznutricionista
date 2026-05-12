"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-slate-900">Algo salió mal</h1>
        <p className="mb-6 text-sm text-slate-500">
          Ocurrió un error inesperado. Por favor, intenta nuevamente.
        </p>
        <Button onClick={reset} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Intentar nuevamente
        </Button>
      </motion.div>
    </main>
  );
}
