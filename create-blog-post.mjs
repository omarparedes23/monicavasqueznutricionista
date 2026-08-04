import { readFileSync } from 'fs'
import { getClient, slugify } from './blog-lib.mjs'

const supabase = getClient()

const file = process.argv[2]
if (!file) {
  console.log('Uso: node create-blog-post.mjs <archivo.json>')
  console.log('')
  console.log('El JSON debe tener esta forma:')
  console.log('{')
  console.log('  "titulo": "Título del post",')
  console.log('  "contenido_markdown": "Cuerpo del artículo en Markdown",')
  console.log('  "tags": ["nutrición", "hábitos"] (opcional),')
  console.log('  "imagen_url": "https://... (opcional)",')
  console.log('  "published": true')
  console.log('}')
  console.log('')
  console.log('Si no pones "slug", se genera automáticamente desde el título.')
  process.exit(1)
}

const post = JSON.parse(readFileSync(file, 'utf8'))

if (!post.titulo || !post.contenido_markdown) {
  console.error('ERROR: faltan campos obligatorios: titulo y contenido_markdown.')
  process.exit(1)
}

const insert = {
  titulo: post.titulo,
  slug: post.slug || slugify(post.titulo),
  contenido_markdown: post.contenido_markdown,
  tags: post.tags || null,
  imagen_url: post.imagen_url || null,
  published: post.published ?? true,
  published_at: post.published ?? true ? new Date().toISOString() : null,
}

const { data, error } = await supabase
  .from('nutri_blog_posts')
  .insert(insert)
  .select('id, titulo, slug, imagen_url, published')

if (error) {
  console.error('ERROR:', error.message)
  process.exit(1)
}

console.log('Post creado:', JSON.stringify(data, null, 2))
