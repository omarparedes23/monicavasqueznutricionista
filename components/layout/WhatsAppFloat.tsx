"use client";

import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/utils/whatsapp";

export function WhatsAppFloat() {
  const message = encodeURIComponent("¡Hola Mónica! Quisiera consultar sobre la atención nutricional y reservar un turno.");
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip badge */}
      <div className="hidden rounded-2xl border border-emerald-100 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-xl shadow-emerald-900/5 backdrop-blur-md sm:flex sm:items-center sm:gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </span>
        ¿Dudas? Hablá directamente con Mónica
      </div>

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        <MessageCircle className="h-7 w-7 transition-transform group-hover:scale-110" />
        <span className="sr-only">WhatsApp</span>
      </a>
    </div>
  );
}
