import { Navbar } from "@/components/layout/Navbar";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { WHATSAPP_NUMBER } from "@/lib/utils/whatsapp";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col relative">
      {/* Decorative top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />

      <Navbar />

      <div className="flex flex-1 flex-col items-center justify-start px-4 py-10">{children}</div>

      <WhatsAppFloat />

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center">
        <p className="text-xs text-slate-400">
          ¿Problemas para reservar? Contáctanos por{" "}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:underline font-medium"
          >
            WhatsApp
          </a>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          © {new Date().getFullYear()} Mónica Vásquez · Licenciada en Nutrición · Sistema de turnos online
        </p>
      </footer>
    </div>
  );
}
