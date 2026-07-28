"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "¿Las consultas online son tan efectivas como las presenciales?",
    a: "¡Totalmente! En las consultas online trabajamos con el mismo rigor técnico. Evaluamos tus hábitos, revisamos exámenes de laboratorio, analizamos fotos o mediciones caseras y te enviamos tu plan digital completo en menos de 24 hs.",
  },
  {
    q: "¿Qué incluye la primera consulta nutricional?",
    a: "Incluye evaluación clínica completa, análisis de composición y hábitos, definición de objetivos realistas, tu plan alimentario personalizado en PDF y acceso a canales directos para resolver dudas entre consultas.",
  },
  {
    q: "¿Emitís factura para reintegro en prepaga o seguro médico?",
    a: "Sí, emito factura oficial de servicios profesionales con número de matrícula habilitante para que puedas presentar en tu obra social o medicina prepaga para trámite de reintegro.",
  },
  {
    q: "¿Tengo que comprar alimentos raros o suplementos caros?",
    a: "No. La base de mi filosofía es la comida real y accesible de supermercado o verdulería. Los suplementos solo se prescriben cuando existe una indicación clínica o deportiva basada en evidencia comprobada.",
  },
  {
    q: "¿Con qué frecuencia son los controles de seguimiento?",
    a: "Generalmente se realizan cada 15 o 30 días, dependiendo de tus necesidades e hitos particulares. En cada control ajustamos el plan según tus avances y sensaciones.",
  },
  {
    q: "¿Cómo se abonan las consultas?",
    a: "Podés abonar de manera rápida y segura mediante transferencia bancaria o Mercado Pago. Recibirás los datos e instrucciones al agendar tu turno.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-slate-50/60 py-20 md:py-28 border-t border-slate-100">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
            <HelpCircle className="h-4 w-4" />
            Preguntas Frecuentes
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Resolvemos todas tus dudas antes de agendar
          </h2>
          <p className="mx-auto max-w-xl text-slate-500 text-base md:text-lg">
            Todo lo que necesitás saber sobre la atención, modalidad de trabajo y facturación.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:border-brand-200 shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-base font-semibold text-slate-900 sm:p-6"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-brand-600 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="animate-fade-in border-t border-slate-100 px-5 pb-6 pt-4 text-sm leading-relaxed text-slate-600 sm:px-6">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
