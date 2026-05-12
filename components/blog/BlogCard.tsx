import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import type { BlogPost } from "@/types";

function stripMarkdown(raw: string): string {
  return raw
    .replace(/!\[.*?\]\(.*?\)/g, "") // imágenes
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // enlaces
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/`{1,3}[^`]*`{1,3}/g, "") // inline / block code
    .replace(/#{1,6}\s?/g, "") // headers
    .replace(/>\s?/g, "") // blockquotes
    .replace(/\s*[-*]\s+/g, " ") // list items
    .replace(/\s*\d+\.\s+/g, " ") // ordered list items
    .replace(/\n+/g, " ") // newlines
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export function BlogCard({ post, className }: BlogCardProps) {
  const excerpt = truncate(stripMarkdown(post.contenido_markdown), 120);
  const dateText = post.published_at
    ? format(parseISO(post.published_at), "d MMM yyyy", { locale: es })
    : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-slate-100 bg-white",
        "transition-all duration-200 hover:border-brand-100 hover:shadow-md",
        className
      )}
    >
      {post.imagen_url ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={post.imagen_url}
            alt={post.titulo}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-brand-50">
          <span className="text-4xl font-bold text-brand-300">M</span>
        </div>
      )}

      <div className="p-5">
        {post.tags && post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-brand-700">
          {post.titulo}
        </h3>

        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{excerpt}</p>

        {dateText && <p className="text-xs text-slate-400">{dateText}</p>}
      </div>
    </Link>
  );
}
