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
    <main className="min-h-dvh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full text-center"
      >
        <div className="inline-flex w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Algo salió mal
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Ocurrió un error inesperado. Por favor, intenta nuevamente.
        </p>
        <Button
          onClick={reset}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Intentar nuevamente
        </Button>
      </motion.div>
    </main>
  );
}
