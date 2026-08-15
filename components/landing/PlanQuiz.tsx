"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Check, ArrowRight, RotateCcw, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

const GOALS = [
  { id: "peso", label: "Perder peso o mejorar composición corporal", icon: "🔥" },
  { id: "deporte", label: "Optimizar rendimiento deportivo y masa muscular", icon: "⚡" },
  { id: "salud", label: "Mejorar digestión o tratar condición clínica", icon: "🩺" },
  { id: "habitos", label: "Aprender a comer mejor sin restricciones", icon: "🥗" },
];

const MODALITIES = [
  { id: "online", label: "Online (100% remota)", icon: "💻" },
  { id: "presencial", label: "Presencial en consultorio", icon: "🏥" },
];

export function PlanQuiz() {
  const [goal, setGoal] = useState<string | null>(null);
  const [modality, setModality] = useState<string | null>(null);

  const isCompleted = goal !== null && modality !== null;

  const getRecommendation = () => {
    if (goal === "deporte") {
      return {
        title: "Nutrición Deportiva Personalizada",
        desc: "Plan especializado enfocado en el timing nutricional antes/después del entreno, aumento de masa magra y suplementación eficiente.",
        badge: "Recomendado para deportistas",
      };
    }
    if (goal === "salud") {
      return {
        title: "Consulta Inicial + Plan Clínico",
        desc: "Evaluación clínica integral, análisis de sintomatología e interpretación de exámenes de laboratorio para restaurar tu bienestar.",
        badge: "Enfoque clínico especializado",
      };
    }
    return {
      title: "Plan de Reeducación & Composición",
      desc: "Estrategia nutricional adaptada a tu rutina diaria, sin pasar hambre ni eliminar grupos de alimentos.",
      badge: "Ideal para hábitos sostenibles",
    };
  };

  const recommendation = isCompleted ? getRecommendation() : null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-100/80 bg-gradient-to-br from-white via-brand-50/30 to-emerald-50/50 p-6 sm:p-10 shadow-xl shadow-brand-500/5">
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand-200/30 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-brand-700 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          Recomendador de Consulta
        </div>

        <h3 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          ¿No sabés qué consulta se adapta mejor a vos?
        </h3>
        <p className="mb-8 text-sm text-slate-500 sm:text-base">
          Respondé 2 preguntas simples y descubrí el plan idóneo para tus metas.
        </p>

        {!isCompleted ? (
          <div className="space-y-6">
            {/* Step 1 */}
            <div>
              <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Paso 1: ¿Cuál es tu objetivo principal?
              </label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                      goal === g.id
                        ? "border-brand-500 bg-brand-50 text-brand-900 shadow-sm"
                        : "border-slate-200/80 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/20"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span>{g.icon}</span>
                      <span>{g.label}</span>
                    </span>
                    {goal === g.id && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            {goal && (
              <div className="animate-fade-in">
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paso 2: Preferencia de atención
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {MODALITIES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModality(m.id)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${
                        modality === m.id
                          ? "border-brand-500 bg-brand-50 text-brand-900 shadow-sm"
                          : "border-slate-200/80 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/20"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                      </span>
                      {modality === m.id && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Result Card */
          <div className="animate-slide-up rounded-2xl border border-brand-200 bg-white p-6 shadow-lg shadow-brand-500/10">
            <div className="mb-3 inline-block rounded-md bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800">
              {recommendation?.badge}
            </div>
            <h4 className="mb-2 text-xl font-bold text-slate-900">{recommendation?.title}</h4>
            <p className="mb-6 text-sm text-slate-600 leading-relaxed">{recommendation?.desc}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild size="md">
                <Link href="/reserva">
                  Reservar este Plan ({modality === "online" ? "Online" : "Presencial"})
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <button
                onClick={() => {
                  setGoal(null);
                  setModality(null);
                }}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors py-2"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Cambiar respuestas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
