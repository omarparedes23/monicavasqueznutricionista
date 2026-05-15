# Proposal: blog-module

## Intent

El blog existe en la landing como preview hardcodeado y como acciones/componentes listos, pero las rutas `/blog` y `/blog/[slug]` no existen — cualquier click devuelve 404. Este cambio las implementa como páginas SSG con revalidación.

## Scope

### In Scope
- Página `/blog` — listado paginado de posts publicados con `BlogCard`
- Página `/blog/[slug]` — artículo completo con `MarkdownRenderer` + metadatos SEO
- Actualizar `next.config.ts` con `remotePatterns` para Cloudflare R2 (imagen_url)
- Conectar el blog preview de la landing (`/`) con datos reales de DB (reemplazar hardcoded)

### Out of Scope
- Admin de blog (crear/editar posts) → módulo panel profesional
- Upload de imágenes a R2 → módulo panel profesional
- Paginación con cursor → iteración futura (suficiente con `limit` por ahora)
- Comentarios, likes, newsletter → fuera del MVP

## Capabilities

### New Capabilities
- `blog-public`: Lectura pública del blog — listado y artículo individual con SSG + revalidación

### Modified Capabilities
- None

## Approach

Server Components estáticos con `export const revalidate = 3600`. La página de slug usa `generateStaticParams()` para pre-renderizar todos los posts publicados. Si el slug no existe, `notFound()`. Las imágenes vienen de `imagen_url` (URL pública de R2 o null — `BlogCard` ya maneja ambos casos con fallback). Sin `"use client"` en ninguna página nueva.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/(public)/blog/page.tsx` | New | Listado de posts con BlogCard grid |
| `app/(public)/blog/[slug]/page.tsx` | New | Artículo con MarkdownRenderer + SEO metadata |
| `next.config.ts` | Modified | Agregar remotePatterns para R2 |
| `app/(public)/page.tsx` | Modified | Conectar blog preview con getBlogPosts(3) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| nutri_blog_posts vacía en producción | Low | Ya hay post de test; empty state en UI |
| imagen_url con dominio R2 no configurado en next.config | Low | unoptimized:true actualmente — no bloquea |
| generateStaticParams con 0 posts falla build | Low | Retornar array vacío si no hay posts |

## Rollback Plan

Solo se crean archivos nuevos y se modifica `next.config.ts`. Para revertir:
- Eliminar `app/(public)/blog/` completo
- Revertir `next.config.ts` al estado anterior (1 línea)
- Revertir `app/(public)/page.tsx` al preview hardcodeado

Sin cambios de DB. Sin migraciones. Rollback en < 2 minutos.

## Dependencies

- Tabla `nutri_blog_posts` en Supabase ✅ (confirmado, tiene datos de test)
- `getBlogPosts()` y `getBlogPostBySlug()` ✅ (implementados)
- `BlogCard` y `MarkdownRenderer` ✅ (implementados)

## Success Criteria

- [ ] `/blog` renderiza la lista de posts publicados sin error
- [ ] `/blog/5-habitos-alimentarios-energia` muestra el artículo de test completo
- [ ] `/blog/slug-inexistente` devuelve 404 correctamente
- [ ] La landing muestra posts reales de DB (no hardcodeados)
- [ ] `tsc --noEmit` y `next lint` pasan sin errores
