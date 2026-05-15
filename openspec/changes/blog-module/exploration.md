# Exploration: blog-module

## Current State

### Lo que YA existe (completo y funcional)
- `lib/actions/blog.ts` — `getBlogPosts(limit?)` y `getBlogPostBySlug(slug)` — Server Actions contra tabla `nutri_blog_posts`
- `components/blog/BlogCard.tsx` — card con imagen (next/image fill), tags, fecha, excerpt auto-generado desde markdown
- `components/blog/MarkdownRenderer.tsx` — render completo con react-markdown: h1-h3, p, a, ul, ol, code, blockquote, img, hr
- `types/index.ts` — `BlogPost` y `BlogPostCard` tipados completos
- DB `nutri_blog_posts` — campos: id, titulo, slug, contenido_markdown, imagen_url, tags[], published, published_at

### Lo que FALTA (solo las páginas)
- `app/(public)/blog/page.tsx` — listado de posts en `/blog`
- `app/(public)/blog/[slug]/page.tsx` — artículo individual en `/blog/[slug]`

### Estado de next.config.ts
```ts
images: { unoptimized: true }
```
Con `unoptimized: true`, Next.js NO valida dominios remotos — cualquier URL funciona sin configuración adicional. Eso simplifica la integración con R2 para la fase de lectura.

## Affected Areas

- `app/(public)/blog/page.tsx` — CREAR (no existe)
- `app/(public)/blog/[slug]/page.tsx` — CREAR (no existe)
- `next.config.ts` — agregar `remotePatterns` para R2 cuando se desactive `unoptimized`
- `app/(public)/page.tsx` (landing) — ya tiene preview del blog hardcodeado; conectar con datos reales es OPCIONAL para esta fase

## Approaches

### Para las páginas del blog

**Opción A — Static con revalidación (recomendada)**
- `/blog` → `generateStaticParams` no aplica; página con `revalidate: 3600` (1h)
- `/blog/[slug]` → `generateStaticParams()` con todos los slugs + `revalidate: 3600`
- Pros: SEO óptimo, pre-renderizado, sin DB hit en cada visita
- Cons: imágenes nuevas toman hasta 1h en aparecer (aceptable para blog)
- Effort: Low

**Opción B — Dynamic Server Component (más simple)**
- Ambas páginas como `export const dynamic = 'force-dynamic'`
- Server Component puro, sin caché
- Pros: siempre fresco, sin configurar revalidación
- Cons: DB hit en cada visita, no pre-renderizado
- Effort: Low (más simple aún)

**Recomendación**: Opción A con revalidación de 1h. Es el patrón correcto para un blog y el costo de implementación es mínimo.

### Para Cloudflare R2 — imágenes de blog

**Contexto**: `imagen_url` en `BlogPost` es un string URL completa. La lectura del blog solo necesita que esa URL sea válida y accesible públicamente.

**Opción A — R2 Public Bucket (recomendada para blog)**
- El bucket `monicanutricionista` tiene acceso público habilitado en Cloudflare
- Las imágenes se sirven desde `https://pub-{id}.r2.dev/blog/{filename}`
- La URL completa se guarda en `imagen_url` en la DB
- El componente `BlogCard` y `MarkdownRenderer` las usan directamente
- No requiere signed URLs (contenido público)
- Pros: simple, rápido, sin lógica extra en el servidor
- Cons: imágenes expuestas públicamente (aceptable para blog)
- Effort: Low (solo configurar Cloudflare, agregar domain a next.config)

**Opción B — R2 con Custom Domain**
- Cloudflare permite conectar un custom domain al bucket R2 (ej: `media.monicanutricionista.com`)
- Pros: branding, mejor control CDN con Cloudflare Cache Rules
- Cons: requiere DNS config adicional
- Effort: Medium

**Recomendación para esta fase**: Opción A (R2 público) para lectura. El upload de imágenes desde el panel profesional es una segunda fase.

**Variables de entorno necesarias para R2 (upload — fase profesional)**:
```
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=monicanutricionista
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

## Plan de implementación (blog-module fase lectura)

### Archivos a crear
1. `app/(public)/blog/page.tsx`
   - Server Component
   - Llama `getBlogPosts()` 
   - Grid de `BlogCard` components
   - `export const revalidate = 3600`
   - Estado vacío si no hay posts

2. `app/(public)/blog/[slug]/page.tsx`
   - Server Component
   - Llama `getBlogPostBySlug(slug)`
   - 404 con `notFound()` si no existe
   - Header: imagen portada, titulo, tags, fecha
   - Cuerpo: `<MarkdownRenderer content={post.contenido_markdown} />`
   - `generateStaticParams()` para pre-render
   - `export const revalidate = 3600`

### Archivos a modificar
3. `next.config.ts` — agregar `remotePatterns` para R2 (preparar para cuando se active optimization)
4. `app/(public)/page.tsx` — conectar blog preview con datos reales de DB (OPCIONAL, el hardcodeado funciona)

## Risks
- `nutri_blog_posts` puede no tener la columna `excerpt` en DB (el tipo lo define como opcional `excerpt?: string | null`). El `BlogCard` genera el excerpt desde `contenido_markdown` en runtime, lo que es correcto.
- `unoptimized: true` en next.config desactiva la optimización de imágenes de Next.js — las imágenes de R2 no serán procesadas por el Image Optimization de Vercel. Aceptable para fase inicial.
- Si se activa `unoptimized: false` en el futuro, hay que agregar el dominio R2 a `remotePatterns`.

## Ready for Proposal
Sí. El blog de lectura es straight-forward: 2 páginas nuevas + 1 modificación opcional.
El alcance es: solo lectura pública. El admin de blog (crear/editar posts con upload a R2) va en el módulo del panel profesional.
