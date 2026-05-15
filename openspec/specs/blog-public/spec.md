# blog-public Specification

## Purpose

Lectura pública del blog de nutrición. Cubre el listado de artículos publicados y la visualización de un artículo individual. No incluye autenticación ni gestión de contenido (eso es panel profesional).

## Requirements

### Requirement: Blog List Page

The system MUST render a public page at `/blog` that displays all published blog posts ordered by `published_at` descending.

The page MUST revalidate its content every 3600 seconds (1 hour).

The page SHOULD display an empty state message when no posts are published.

#### Scenario: List with posts

- GIVEN the database has one or more published blog posts
- WHEN a visitor navigates to `/blog`
- THEN the page renders a grid of BlogCard components, one per published post
- AND each card links to `/blog/{slug}`

#### Scenario: Empty state

- GIVEN no blog posts are published in the database
- WHEN a visitor navigates to `/blog`
- THEN the page renders without error
- AND displays a friendly message indicating no content is available yet

#### Scenario: Unpublished posts not shown

- GIVEN a blog post exists with `published = false`
- WHEN a visitor navigates to `/blog`
- THEN that post MUST NOT appear in the list

---

### Requirement: Blog Article Page

The system MUST render a public page at `/blog/[slug]` that displays the full content of a published blog post identified by its slug.

The page MUST return a 404 response when the slug does not correspond to a published post.

The page MUST include SEO metadata: `<title>`, meta description, and `og:image` (when `imagen_url` is present).

The page MUST revalidate every 3600 seconds.

#### Scenario: Valid slug

- GIVEN a published post exists with slug `5-habitos-alimentarios-energia`
- WHEN a visitor navigates to `/blog/5-habitos-alimentarios-energia`
- THEN the page renders the post title, tags, published date, and full markdown content
- AND the markdown is rendered as formatted HTML

#### Scenario: Invalid slug returns 404

- GIVEN no published post exists with slug `slug-inexistente`
- WHEN a visitor navigates to `/blog/slug-inexistente`
- THEN the system returns a 404 HTTP response
- AND renders the application's not-found page

#### Scenario: Unpublished post returns 404

- GIVEN a post exists with `published = false` and slug `draft-post`
- WHEN a visitor navigates to `/blog/draft-post`
- THEN the system returns a 404 HTTP response

#### Scenario: SEO metadata present

- GIVEN a published post with titulo "Habitos" and imagen_url set
- WHEN the page is rendered
- THEN the HTML head contains a title tag with the post titulo
- AND an og:image meta tag with the imagen_url value

---

### Requirement: Landing Blog Preview

The system SHOULD display the 3 most recent published blog posts in the landing page (`/`) blog preview section.

The preview MUST use real data from the database, not hardcoded content.

#### Scenario: Recent posts in landing

- GIVEN at least one published blog post exists
- WHEN a visitor loads the landing page `/`
- THEN the blog preview section shows up to 3 real posts from the database

#### Scenario: No posts — landing still renders

- GIVEN no published posts exist
- WHEN a visitor loads the landing page `/`
- THEN the landing page renders without error
- AND the blog preview section shows the hardcoded fallback or empty gracefully

---

### Requirement: Image Domain Configuration

The system MUST be configured to allow images from Cloudflare R2 domains in `next.config.ts`.

#### Scenario: R2 image loads without error

- GIVEN a blog post has `imagen_url` pointing to a `*.r2.dev` domain
- WHEN the BlogCard or article page renders the image
- THEN the image loads without a Next.js domain configuration error
