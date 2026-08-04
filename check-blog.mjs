import { getClient } from './blog-lib.mjs'

const supabase = getClient()

const { data, error } = await supabase
  .from('nutri_blog_posts')
  .select('id, titulo, slug, imagen_url, published')
  .order('created_at', { ascending: false })

if (error) {
  console.error('ERROR:', error.message)
  process.exit(1)
}

console.log('Publicados:', data.filter((p) => p.published).length)
console.log('Borradores:', data.filter((p) => !p.published).length)
console.log('')
for (const p of data) {
  console.log(`${p.published ? 'PUB' : 'DRA'} | img=${p.imagen_url ? 'SI' : 'NO'} | ${p.titulo} (${p.slug})`)
}
