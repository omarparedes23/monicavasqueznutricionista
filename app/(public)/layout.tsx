import { Navbar } from "@/components/layout/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Decorative top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />

      <Navbar />

      <div className="flex flex-1 flex-col items-center justify-start px-4 py-10">{children}</div>

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center">
        <p className="text-xs text-slate-400">
          ¿Problemas para reservar? Contáctanos por{" "}
          <a
            href="https://wa.me/5491100000000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:underline"
          >
            WhatsApp
          </a>
        </p>
        <p className="mt-2 text-xs text-slate-300">
          © {new Date().getFullYear()} · Sistema de turnos online
        </p>
      </footer>
    </div>
  );
}
