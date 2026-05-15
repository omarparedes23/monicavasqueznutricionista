# Tasks: blog-module

## Phase 1: Configuración (Infrastructure)

- [x] 1.1 Modificar `next.config.ts` — agregar `remotePatterns` para `*.r2.dev` y `*.r2.cloudflarestorage.com` manteniendo `unoptimized: true`

## Phase 2: Páginas del Blog (Core Implementation)

- [x] 2.1 Crear `app/(public)/blog/page.tsx` — Server Component con `revalidate: 3600`, llamar `getBlogPosts()`, renderizar grid de `BlogCard` con Tailwind, incluir empty state ("Próximamente..." o similar)
- [x] 2.2 Crear `app/(public)/blog/[slug]/page.tsx` — `generateStaticParams()` retorna slugs de todos los posts publicados (array vacío si no hay), `generateMetadata()` con title + description + og:image, `await params` (Next.js 15), llamar `getBlogPostBySlug(slug)`, `notFound()` si null, renderizar header (imagen, titulo, tags, fecha) + `<MarkdownRenderer />`

## Phase 3: Integración Landing (Wiring)

- [x] 3.1 Modificar `app/(public)/page.tsx` — importar `getBlogPosts` y `BlogCard`, reemplazar los 3 artículos hardcodeados del blog preview con `await getBlogPosts(3)`, manejar caso de array vacío con fallback visual

## Phase 4: Verificación

- [x] 4.1 Ejecutar `tsc --noEmit` — PASÓ sin errores (cache .next limpiado primero)
- [x] 4.2 `next lint` deprecado en v15.5 — ESLint 9 requiere eslint.config.js (pre-existente, no bloqueante)
- [ ] 4.3 Verificar en browser: `/blog` muestra el post de test "5 habitos alimentarios..."
- [ ] 4.4 Verificar en browser: `/blog/5-habitos-alimentarios-energia` renderiza el artículo completo con markdown
- [ ] 4.5 Verificar en browser: `/blog/slug-que-no-existe` devuelve página 404
- [ ] 4.6 Verificar en browser: landing `/` muestra el post de test en el preview del blog
