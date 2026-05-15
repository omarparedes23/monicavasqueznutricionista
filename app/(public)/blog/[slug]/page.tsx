import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getBlogPosts, getBlogPostBySlug } from "@/lib/actions/blog";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Artículo no encontrado" };
  }

  const description = post.contenido_markdown
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*`>_~]/g, "")
    .replace(/\n+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title: `${post.titulo} — Mónica Vásquez`,
    description,
    openGraph: {
      title: post.titulo,
      description,
      ...(post.imagen_url ? { images: [{ url: post.imagen_url }] } : {}),
    },
  };
}

export default async function BlogSlugPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const dateText = post.published_at
    ? format(parseISO(post.published_at), "d 'de' MMMM yyyy", { locale: es })
    : null;

  return (
    <article className="w-full max-w-3xl">
      {/* Back link */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al blog
      </Link>

      {/* Hero image o fallback */}
      {post.imagen_url ? (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl">
          <Image
            src={post.imagen_url}
            alt={post.titulo}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : (
        <div className="mb-8 flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100">
          <span className="text-7xl font-bold text-brand-200">M</span>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
        {post.titulo}
      </h1>

      {/* Date */}
      {dateText && (
        <p className="mb-10 text-sm text-slate-400">{dateText}</p>
      )}

      {/* Divider */}
      <hr className="mb-10 border-slate-100" />

      {/* Content */}
      <MarkdownRenderer content={post.contenido_markdown} />

      {/* Footer back link */}
      <div className="mt-16 border-t border-slate-100 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver todos los artículos
        </Link>
      </div>
    </article>
  );
}
