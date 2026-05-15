# Design: blog-module

## Technical Approach

Dos Server Components estáticos dentro del route group `(public)`, que heredan automáticamente el layout Navbar+footer de `app/(public)/layout.tsx`. Ambas páginas usan `export const revalidate = 3600`. No hay estado del cliente ni `"use client"`. El data fetching ocurre directamente en el Server Component llamando a las Server Actions existentes.

## Architecture Decisions

### Decision: Static con revalidación vs Dynamic

| Opción | Trade-off | Decisión |
|--------|-----------|----------|
| `revalidate: 3600` (ISR) | Pre-renderizado, sin DB hit por visita, caché de 1h | ✅ Elegida |
| `force-dynamic` | Siempre fresco, DB hit en cada visita | ❌ Innecesario para blog |
| `revalidate: 0` | Sin caché, = dynamic | ❌ Peor que force-dynamic |

**Rationale**: El blog no cambia con frecuencia. 1h de caché es aceptable y mejora drásticamente el rendimiento.

### Decision: generateStaticParams safe con 0 posts

`generateStaticParams()` retorna `getBlogPosts()` mapeado a `{ slug }`. Si la DB está vacía, retorna `[]` — Next.js 15 acepta array vacío sin fallar el build. Posts creados después del build se sirven on-demand y se cachean.

### Decision: next.config.ts — mantener unoptimized:true

Con `unoptimized: true` activo, `remotePatterns` no es estrictamente necesario para que las imágenes carguen. Se agrega igual como preparación para cuando se active la optimización. No hay riesgo de romper nada.

## Data Flow

```
/blog
  Browser → Next.js ISR cache (hit) → BlogPage (cached HTML)
  Browser → Next.js ISR cache (miss) → getBlogPosts() → nutri_blog_posts → BlogCard[]

/blog/[slug]
  Browser → generateStaticParams pre-render → getBlogPostBySlug(slug)
           ├─ null → notFound() → 404
           └─ BlogPost → generateMetadata() + MarkdownRenderer → HTML
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/(public)/blog/page.tsx` | Create | Server Component — grid de BlogCard, revalidate:3600, empty state |
| `app/(public)/blog/[slug]/page.tsx` | Create | Server Component — article, generateStaticParams, generateMetadata, notFound |
| `next.config.ts` | Modify | Agregar remotePatterns para *.r2.dev y *.r2.cloudflarestorage.com |
| `app/(public)/page.tsx` | Modify | Reemplazar blog preview hardcoded con getBlogPosts(3) |

## Interfaces / Contracts

```ts
// app/(public)/blog/page.tsx
export const revalidate = 3600;
export default async function BlogPage() { ... }

// app/(public)/blog/[slug]/page.tsx
export const revalidate = 3600;
export async function generateStaticParams(): Promise<{ slug: string }[]>
export async function generateMetadata({ params }: Props): Promise<Metadata>
export default async function BlogSlugPage({ params }: Props) { ... }

// Props type
type Props = { params: Promise<{ slug: string }> }  // Next.js 15: params es Promise
```

> **IMPORTANTE**: En Next.js 15, `params` en page/layout/metadata es un `Promise`. Se debe `await params` antes de acceder a `slug`.

## Testing Strategy

Sin test runner instalado. Verificación manual:

| Layer | Qué verificar | Cómo |
|-------|--------------|------|
| Type check | Sin errores TS | `tsc --noEmit` |
| Lint | Sin warnings | `next lint` |
| Build | Compila sin error | `next build` (local) |
| Manual /blog | Lista el post de test | Browser |
| Manual /blog/slug | Renderiza artículo | Browser |
| Manual /blog/inexistente | 404 | Browser |

## Migration / Rollout

No migration required. Solo archivos nuevos + 2 modificaciones menores. Sin cambios de DB ni schema.

## Open Questions

- Ninguna. El alcance es claro y el código existente cubre todas las dependencias.
