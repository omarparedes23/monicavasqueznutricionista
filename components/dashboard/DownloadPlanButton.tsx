"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getPlanSignedUrl } from "@/lib/actions/planes";

interface DownloadPlanButtonProps {
  planId: string;
  label?: string;
}

export function DownloadPlanButton({ planId, label = "Descargar" }: DownloadPlanButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);

    const url = await getPlanSignedUrl(planId);
    if (!url) {
      setError("No se pudo generar el enlace de descarga");
      setLoading(false);
      return;
    }

    window.open(url, "_blank");
    setLoading(false);
  }

  return (
    <div>
      <Button size="sm" variant="secondary" onClick={handleDownload} disabled={loading}>
        <Download className="mr-1.5 h-4 w-4" />
        {loading ? "Generando…" : label}
      </Button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
