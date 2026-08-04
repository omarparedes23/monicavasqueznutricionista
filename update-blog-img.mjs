import { getClient } from './blog-lib.mjs'

const supabase = getClient()

const slug = process.argv[2]
const url = process.argv[3]

if (!slug || !url) {
  console.log('Uso: node update-blog-img.mjs <slug> <imagen-url>')
  console.log('')
  console.log('Ejemplo:')
  console.log('  node update-blog-img.mjs mi-post https://images.unsplash.com/photo-xxx')
  process.exit(1)
}

const { data, error } = await supabase
  .from('nutri_blog_posts')
  .update({ imagen_url: url })
  .eq('slug', slug)
  .select('id, titulo, slug, imagen_url')

if (error) {
  console.error('ERROR:', error.message)
  process.exit(1)
}

if (!data || data.length === 0) {
  console.error(`No se encontró ningún post con slug "${slug}".`)
  process.exit(1)
}

console.log('Imagen actualizada:', JSON.stringify(data, null, 2))
