import { BookOpen } from "lucide-react";
import { getBlogPosts } from "@/lib/actions/blog";
import { BlogCard } from "@/components/blog/BlogCard";

export const revalidate = 3600;

export const metadata = {
  title: "Blog de Nutrición — Mónica Vásquez",
  description:
    "Artículos, consejos y recetas para una alimentación saludable. Evidencia científica aplicada a tu vida diaria.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="w-full max-w-5xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          <BookOpen className="h-4 w-4" />
          Blog de nutrición
        </div>
        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Artículos para tu bienestar
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-500">
          Consejos prácticos, recetas y evidencia científica para ayudarte a construir hábitos
          alimentarios sostenibles.
        </p>
      </div>

      {/* Grid o empty state */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
          <BookOpen className="mb-4 h-10 w-10 text-slate-300" />
          <p className="text-lg font-medium text-slate-500">Próximamente</p>
          <p className="mt-1 text-sm text-slate-400">
            Estamos preparando contenido de calidad para vos. ¡Volvé pronto!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
