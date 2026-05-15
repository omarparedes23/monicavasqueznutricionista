import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getBlogPosts } from "@/lib/actions/blog";
import { BlogCard } from "@/components/blog/BlogCard";

/* ============================================================
   LANDING PAGE — Mónica Vásquez, Licenciada en Nutrición
   ============================================================ */

const SERVICIOS = [
  {
    icon: <ClipboardList className="h-7 w-7 text-brand-600" />,
    title: "Consulta Inicial",
    description:
      "Evaluación completa de tu historial clínico, hábitos alimentarios y objetivos. Definimos juntos tu plan de acción.",
  },
  {
    icon: <Apple className="h-7 w-7 text-brand-600" />,
    title: "Plan Personalizado",
    description:
      "Diseño de un plan de alimentación a tu medida, adaptado a tu estilo de vida, preferencias y necesidades nutricionales.",
  },
  {
    icon: <TrendingUp className="h-7 w-7 text-brand-600" />,
    title: "Seguimiento Continuo",
    description:
      "Controles periódicos para ajustar tu plan, resolver dudas y asegurar que avances hacia tus metas.",
  },
  {
    icon: <Calendar className="h-7 w-7 text-brand-600" />,
    title: "Nutrición Deportiva",
    description:
      "Optimiza tu rendimiento físico con una alimentación diseñada para tu disciplina, entrenamiento y competencias.",
  },
];

const PASOS = [
  {
    num: "01",
    title: "Reserva tu cita",
    desc: "Elige el día y horario que mejor se adapte a tu agenda. Sin complicaciones.",
  },
  {
    num: "02",
    title: "Consulta personalizada",
    desc: "Nos conocemos, evaluamos tu situación y definimos objetivos claros y realistas.",
  },
  {
    num: "03",
    title: "Transforma tu salud",
    desc: "Recibe tu plan, haz el seguimiento y empieza a ver resultados desde la primera semana.",
  },
];

export default async function LandingPage() {
  const blogPosts = await getBlogPosts(3);

  return (
    <div className="w-full">
      {/* ==========================================================
         HERO
         ========================================================== */}
      <section className="relative w-full overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -left-24 top-32 h-64 w-64 rounded-full bg-brand-50/80 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 text-center md:pb-28 md:pt-24">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Leaf className="h-4 w-4" />
            Licenciada en Nutrición y Dietética
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-bold leading-[1.15] tracking-tight text-slate-900 md:text-6xl">
            Nutrición basada en <span className="text-brand-600">ciencia</span>,
            <br className="hidden md:block" /> adaptada a tu{" "}
            <span className="text-brand-600">vida</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-500 md:text-xl">
            Soy Mónica Vásquez. Te ayudo a mejorar tu relación con la comida, alcanzar tu peso ideal
            y sentirte con más energía — sin dietas extremas ni restricciones imposibles.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/reserva">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Reservar cita
              </Button>
            </Link>
            <Link href="#servicios">
              <Button variant="secondary" size="lg">
                Ver servicios
              </Button>
            </Link>
          </div>

          {/* Trust pills */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-500" />
              Atención online y presencial
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-500" />
              Planes 100% personalizados
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-500" />
              Resultados sostenibles
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
         SERVICIOS
         ========================================================== */}
      <section id="servicios" className="w-full bg-white/60 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Servicios profesionales
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-500">
              Un enfoque integral para tu bienestar, respaldado por formación académica y años de
              experiencia clínica.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {SERVICIOS.map((s) => (
              <div
                key={s.title}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:border-brand-100 hover:shadow-md md:p-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 transition-transform group-hover:scale-105">
                  {s.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
         CÓMO FUNCIONA
         ========================================================== */}
      <section className="w-full py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Tu camino hacia una mejor salud
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-500">
              Un proceso simple, profesional y diseñado para que no te sientas solo en el camino.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {PASOS.map((p) => (
              <div key={p.num} className="relative text-center">
                <div className="mb-4 text-5xl font-bold text-brand-100">{p.num}</div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{p.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================
         SOBRE MÓNICA
         ========================================================== */}
      <section className="w-full bg-brand-50/50 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
            {/* Avatar / Visual */}
            <div className="shrink-0">
              <div className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-xl shadow-brand-200 md:h-56 md:w-56">
                <Leaf className="h-20 w-20 text-white" />
              </div>
            </div>

            {/* Text */}
            <div className="text-center md:text-left">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">Sobre Mónica</h2>
              <p className="mb-4 leading-relaxed text-slate-600">
                Licenciada en Nutrición y Dietética con especialización en nutrición clínica y
                deportiva. Mi enfoque combina evidencia científica con empatía: entiendo que cada
                persona es única, y por eso cada plan que diseño es único también.
              </p>
              <p className="mb-6 leading-relaxed text-slate-600">
                He acompañado a cientos de personas en su proceso de cambio, desde quienes buscan
                perder peso de forma saludable hasta atletas que quieren optimizar su rendimiento.
                Mi objetivo es que aprendas a comer bien, no que sigas una dieta por siempre.
              </p>

              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                {[
                  "Nutrición Clínica",
                  "Nutrición Deportiva",
                  "Pérdida de Peso",
                  "Reeducación Alimentaria",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-brand-100 bg-white px-3 py-1 text-sm font-medium text-brand-700"
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
         TESTIMONIO
         ========================================================== */}
      <section className="w-full py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Quote className="mx-auto mb-6 h-10 w-10 text-brand-200" />
          <blockquote className="mb-8 text-xl font-medium leading-relaxed text-slate-700 md:text-2xl">
            “Con Mónica entendí que no se trata de comer menos, sino de comer mejor. En tres meses
            bajé 8 kilos sin pasar hambre, y lo mejor es que ahora sé cómo mantenerlo.”
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              LP
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">Lucía P.</p>
              <p className="text-xs text-slate-500">Paciente desde 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
         BLOG PREVIEW
         ========================================================== */}
      <section className="w-full bg-white/60 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">
                Blog de nutrición
              </h2>
              <p className="text-slate-500">
                Artículos, consejos y recetas para una vida más saludable.
              </p>
            </div>
            <Link
              href="/blog"
              className="hidden items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 md:flex"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16">
              <p className="text-sm text-slate-400">Próximamente — artículos de nutrición.</p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================================
         CTA FINAL
         ========================================================== */}
      <section className="w-full py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            ¿Listo para transformar tu salud?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-slate-500">
            Tu primera consulta es el primer paso. Agenda ahora y empezá a construir una relación
            saludable con la comida.
          </p>
          <Link href="/reserva">
            <Button
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
              className="shadow-lg shadow-brand-200"
            >
              Reservar mi cita
            </Button>
          </Link>
          <p className="mt-4 text-xs text-slate-400">
            Sin necesidad de crear una cuenta. Confirmación inmediata.
          </p>
        </div>
      </section>
    </div>
  );
}
