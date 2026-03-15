import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Reserva tu cita | Monica Nutricionista",
    template: "%s | Monica Nutricionista",
  },
  description:
    "Reserva tu consulta nutricional online de forma rápida y sencilla. " +
    "Selecciona el día y horario que mejor te adapte.",
  keywords: ["nutricionista", "nutrición", "citas", "consulta", "reserva online"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    title: "Reserva tu cita | Monica Nutricionista",
    description: "Agenda tu consulta nutricional online en segundos.",
    siteName: "Monica Nutricionista",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
        {children}
      </body>
    </html>
  );
}
