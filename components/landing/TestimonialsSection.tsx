"use client";

import { Star, Quote, CheckCircle2 } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Con Mónica entendí que no se trata de comer menos, sino de comer mejor. En tres meses logré reducir 8 kilos de grasa ganando masa magra sin pasar nada de hambre.",
    name: "Lucía P.",
    tag: "Nutrición Deportiva & Composición",
    patientSince: "Paciente desde 2024",
    initials: "LP",
    stars: 5,
    highlight: "-8 kg grasa corporal",
  },
  {
    quote: "Tenía problemas digestivos severos y desorganización total con mis comidas. Mónica me estructuró un menú súper práctico y mis análisis clínicos mejoraron muchísimo.",
    name: "Martín G.",
    tag: "Salud Digestiva & Clínica",
    patientSince: "Paciente desde 2023",
    initials: "MG",
    stars: 5,
    highlight: "Sintomatología 0%",
  },
  {
    quote: "La atención online es excelente. Vive respondiendo mis dudas y los recetarios en PDF que me mandó son riquísimos. Aprendí a comer bien en familia.",
    name: "Carolina R.",
    tag: "Reeducación Alimentaria",
    patientSince: "Paciente desde 2024",
    initials: "CR",
    stars: 5,
    highlight: "Hábitos sostenibles",
  },
];

export function TestimonialsSection() {
  return (
    <section className="w-full py-20 md:py-28 bg-gradient-to-b from-white to-brand-50/20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span>4.9 / 5 de valoración promedio</span>
          </div>

          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Historias reales de cambios sostenibles
          </h2>
          <p className="mx-auto max-w-xl text-slate-500 text-base md:text-lg">
            La experiencia de pacientes que transformaron su relación con la comida.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-7 shadow-lg shadow-slate-100/80 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                    {t.highlight}
                  </span>
                </div>

                <Quote className="mb-3 h-8 w-8 text-brand-200/80" />

                <p className="mb-6 text-sm leading-relaxed text-slate-600 italic">
                  “{t.quote}”
                </p>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-emerald-200 text-sm font-bold text-brand-800 shadow-inner">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    {t.name}
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" />
                  </h4>
                  <p className="text-xs text-slate-400">{t.tag}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
