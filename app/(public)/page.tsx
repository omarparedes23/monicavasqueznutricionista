import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  Calendar,
  ClipboardList,
  TrendingUp,
  Apple,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Quote,
  Star,
  Award,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getBlogPosts } from "@/lib/actions/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { getProductos } from "@/lib/actions/tienda";
import { ProductoCard } from "@/components/tienda/ProductoCard";
import { PlanQuiz } from "@/components/landing/PlanQuiz";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FaqSection } from "@/components/landing/FaqSection";

/* ============================================================
   LANDING PAGE — Mónica Vásquez, Licenciada en Nutrición
   ============================================================ */

const HERO_IMG = "/images/hero-monica.jpg";
const MONICA_IMG = "/images/monica-portrait.jpg";

const SERVICIOS = [
  {
    icon: <ClipboardList className="h-6 w-6 text-brand-600" />,
    title: "Consulta Inicial Integral",
    description:
      "Evaluación completa de tu historial clínico, hábitos alimentarios y objetivos. Definimos juntos un plan estratégico de acción.",
    features: ["Anamnesis clínica", "Medición antropométrica", "PDF con metas"],
    highlight: "Primer paso",
  },
  {
    icon: <Apple className="h-6 w-6 text-brand-600" />,
    title: "Plan de Nutrición Personalizado",
    description:
      "Diseño de un plan alimentario estructurado a tu medida, adaptado a tus horarios, cocina habitual y gustos personales.",
    features: ["Menú adaptable", "Recetario exclusivo", "Lista de compras"],
    highlight: "100% Medida",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-brand-600" />,
    title: "Seguimiento & Acompañamiento",
    description:
      "Controles periódicos para ajustar tu plan según tus avances, resolver dudas en tiempo real y asegurar resultados duraderos.",
    features: ["Ajuste de macros", "Soporte vía WhatsApp", "Evaluación de logros"],
    highlight: "Sostenible",
  },
  {
    icon: <Zap className="h-6 w-6 text-brand-600" />,
    title: "Nutrición Deportiva & Alto Rendimiento",
    description:
      "Optimización de rendimiento físico, aumento de masa magra y estrategias de timing nutricional antes, durante y post entrenamiento.",
    features: ["Timing de nutrientes", "Suplementación basada en ciencia", "Plan de competencias"],
    highlight: "Deportes & Gym",
  },
];

const PASOS = [
  {
    num: "01",
    title: "Reserva tu turno online",
    desc: "Seleccioná la fecha, horario y modalidad (Online o Presencial) que mejor encaje en tu rutina.",
    badge: "1 minuto",
  },
  {
    num: "02",
    title: "Consulta personalizada",
    desc: "En nuestro encuentro evaluamos tu estado actual, exámenes y trazamos tu hoja de ruta.",
    badge: "60 minutos",
  },
  {
    num: "03",
    title: "Evolución y resultados",
    desc: "Recibís tu plan claro y comenzás a notar mayor energía, bienestar y cambios reales desde la semana 1.",
    badge: "Seguimiento continuo",
  },
];

export default async function LandingPage() {
  const [blogPosts, productos] = await Promise.all([getBlogPosts(3), getProductos()]);

  return (
    <div className="w-full">
      {/* ==========================================================
         HERO SECTION
         ========================================================== */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-brand-50/40 via-white to-slate-50/50 pb-20 pt-12 md:pb-28 md:pt-16">
        {/* Background decorative blobs */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-brand-200/40 to-emerald-200/20 blur-3xl" />
        <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-brand-100/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-12 md:gap-8">
          {/* Texto Hero */}
          <div className="text-center md:col-span-7 md:text-left">
            {/* Badge Matrícula */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-white/90 px-4 py-2 text-xs font-semibold text-brand-800 shadow-sm backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>Lic. Mónica Vásquez · Mat. Prof. MN 4821</span>
            </div>

            {/* Heading */}
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Nutrición basada en <span className="bg-gradient-to-r from-brand-600 to-emerald-600 bg-clip-text text-transparent">ciencia</span>, adaptada a tu <span className="bg-gradient-to-r from-brand-600 to-teal-600 bg-clip-text text-transparent">estilo de vida</span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-600 md:mx-0 md:text-xl">
              Mejorá tu relación con la comida, alcancá tus metas de peso o rendimiento deportivo y ganá vitalidad — <strong className="font-semibold text-slate-800">sin dietas restrictivas ni pasar hambre</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center md:justify-start">
              <Link href="/reserva">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} className="w-full sm:w-auto shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30">
                  Agendar consulta ahora
                </Button>
              </Link>
              <Link href="#quiz">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto border-slate-200/90 bg-white hover:bg-slate-50">
                  <Sparkles className="h-4 w-4 mr-2 text-brand-600" />
                  Descubrir mi plan ideal
                </Button>
              </Link>
            </div>

            {/* Trust pills */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-600 md:justify-start">
              <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 shadow-sm border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                Atención Presencial & Online
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 shadow-sm border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                Planes 100% a medida
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 shadow-sm border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                Apto Reintegro Prepaga
              </div>
            </div>
          </div>

          {/* Imagen Hero con badges flotantes */}
          <div className="relative mx-auto w-full max-w-md md:col-span-5 md:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border-4 border-white shadow-2xl shadow-brand-500/10">
              <Image
                src={HERO_IMG}
                alt="Mónica Vásquez — Licenciada en Nutrición"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 450px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
            </div>

            {/* Badge Flotante 1 (Rating) */}
            <div className="animate-float absolute -bottom-5 -left-4 sm:-left-6 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 font-bold">
                  ⭐️
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-900">4.9 / 5</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500">+250 Pacientes atendidos</p>
                </div>
              </div>
            </div>

            {/* Badge Flotante 2 (Enfoque) */}
            <div className="animate-float absolute -top-4 -right-4 sm:-right-6 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Leaf className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Nutrición Real</p>
                  <p className="text-[11px] font-medium text-brand-700">Sin dietas de moda</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
         SERVICIOS DESTACADOS
         ========================================================== */}
      <section id="servicios" className="w-full bg-white py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
              <Award className="h-4 w-4" />
              Atención Clínica Especializada
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Planes diseñados para tus metas específicas
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-500">
              Combino la ciencia nutricional moderna con estrategias prácticas para que alcances cambios perdurables.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICIOS.map((s) => (
              <div
                key={s.title}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-100">
                      {s.icon}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-800 transition-colors">
                      {s.highlight}
                    </span>
                  </div>

                  <h3 className="mb-3 text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-slate-500">{s.description}</p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {s.features.map((feat) => (
                      <span
                        key={feat}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600"
                      >
                        <CheckCircle2 className="h-3 w-3 text-brand-500" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
         QUIZ INTERACTIVO (RECOMENDADOR DE PLAN)
         ========================================================== */}
      <section id="quiz" className="w-full py-12 bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-4">
          <PlanQuiz />
        </div>
      </section>

      {/* ==========================================================
         CÓMO FUNCIONA (TIMELINE INTERACTIVA)
         ========================================================== */}
      <section className="w-full py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Tu camino hacia una mejor salud en 3 pasos
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-500">
              Un proceso fluido, transparente y acompañado en cada etapa de tu transformación.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
            {/* Horizontal line for desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-emerald-200 z-0" />

            {PASOS.map((p) => (
              <div key={p.num} className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-brand-100 bg-white text-2xl font-extrabold text-brand-600 shadow-lg shadow-brand-500/10 transition-transform duration-300 hover:scale-105">
                  {p.num}
                </div>

                <span className="mb-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {p.badge}
                </span>

                <h3 className="mb-2 text-xl font-bold text-slate-900">{p.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
         SOBRE MÓNICA (PERFIL PROFESIONAL)
         ========================================================== */}
      <section className="w-full bg-gradient-to-br from-brand-50/60 via-emerald-50/30 to-white py-20 md:py-28 border-y border-brand-100/50">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
            {/* Foto Retrato */}
            <div className="shrink-0">
              <div className="relative h-64 w-64 overflow-hidden rounded-3xl border-4 border-white shadow-2xl shadow-brand-500/15 md:h-72 md:w-72">
                <Image
                  src={MONICA_IMG}
                  alt="Licenciada Mónica Vásquez"
                  fill
                  className="object-cover"
                  sizes="288px"
                />
              </div>
            </div>

            {/* Texto Profesional */}
            <div className="text-center md:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-brand-800 shadow-sm border border-brand-200">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                Matrícula Nacional MN 4821 / MP 9120
              </div>

              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                Hola, soy Mónica Vásquez
              </h2>

              <p className="mb-4 text-base leading-relaxed text-slate-600">
                Licenciada en Nutrición y Dietética especializada en nutrición clínica y deportiva. Mi filosofía combina evidencia científica actualizada con profunda empatía humana: entiendo que cada persona tiene una realidad diferente y que el mejor plan es el que podés sostener en el tiempo con alegría.
              </p>

              <p className="mb-6 text-base leading-relaxed text-slate-600">
                He acompañado a más de 250 personas a recuperar su bienestar, optimizar sus análisis clínicos y alcanzar su mejor versión física sin culpa ni restricciones imposibles.
              </p>

              <div className="flex flex-wrap justify-center gap-2.5 md:justify-start">
                {[
                  "Nutrición Clínica",
                  "Nutrición Deportiva",
                  "Composición Corporal",
                  "Reeducación Alimentaria",
                  "Salud Digestiva",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-brand-200 bg-white px-3.5 py-1 text-xs font-semibold text-brand-800 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
         TESTIMONIOS
         ========================================================== */}
      <TestimonialsSection />

      {/* ==========================================================
         TIENDA PREVIEW
         ========================================================== */}
      {productos.length > 0 && (
        <section className="w-full bg-white py-20 md:py-28 border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Tienda de Suplementos & Productos
                </h2>
                <p className="text-slate-500">
                  Selección de suplementación y productos naturales recomendados en consulta.
                </p>
              </div>
              <Link
                href="/tienda"
                className="hidden items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 md:flex"
              >
                Ver tienda completa <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {productos.slice(0, 4).map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/tienda"
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Ver tienda completa <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================================
         BLOG PREVIEW
         ========================================================== */}
      <section className="w-full bg-slate-50/50 py-20 md:py-28 border-t border-slate-100">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Artículos & Consejos Nutricionales
              </h2>
              <p className="text-slate-500">
                Información basada en evidencia para mejorar tu día a día.
              </p>
            </div>
            <Link
              href="/blog"
              className="hidden items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 md:flex"
            >
              Explorar blog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <p className="text-sm text-slate-400">Próximamente — nuevos artículos de nutrición.</p>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================================
         PREGUNTAS FRECUENTES (FAQ)
         ========================================================== */}
      <FaqSection />

      {/* ==========================================================
         CTA FINAL DE CONVERSIÓN
         ========================================================== */}
      <section className="w-full py-20 md:py-28 bg-gradient-to-b from-white to-brand-50/40">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-100 text-brand-700 shadow-xl shadow-brand-500/10">
            <Leaf className="h-8 w-8" />
          </div>

          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            ¿Listo para transformar tu salud y hábitos?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-slate-600">
            Agendá tu primera consulta en 1 minuto. Elegí la modalidad que mejor se adapte a vos y comenzá hoy mismo.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/reserva">
              <Button
                size="lg"
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="w-full sm:w-auto shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 px-8 py-4 text-base font-bold"
              >
                Reservar mi turno
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs font-medium text-slate-400">
            Reserva directa online sin necesidad de crear cuenta. Confirmación inmediata por email.
          </p>
        </div>
      </section>
    </div>
  );
}
