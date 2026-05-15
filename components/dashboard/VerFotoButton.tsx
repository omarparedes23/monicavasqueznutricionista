"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { getFotoSignedUrl } from "@/lib/actions/fotos";

interface Props {
  fotoId: string;
}

export function VerFotoButton({ fotoId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const url = await getFotoSignedUrl(fotoId);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
    >
      <Eye className="h-3.5 w-3.5" />
      {loading ? "Cargando…" : "Ver"}
    </button>
  );
}
