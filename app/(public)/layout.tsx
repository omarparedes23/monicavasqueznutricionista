export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Decorative top bar */}
      <div className="h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 w-full" />

      <div className="flex-1 flex flex-col items-center justify-start py-10 px-4">
        {children}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center pb-8">
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
        <p className="text-xs text-slate-300 mt-2">
          © {new Date().getFullYear()} · Sistema de turnos online
        </p>
      </footer>
    </div>
  );
}
