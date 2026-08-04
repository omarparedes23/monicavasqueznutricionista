import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const scriptDir = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const env = {}
  const envPath = resolve(scriptDir, '.env.local')
  try {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !line.trim().startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    console.error(`No se encontró ${envPath}. Ejecuta los scripts desde la raíz del proyecto.`)
    process.exit(1)
  }
  return env
}

export function getClient(useServiceRole = true) {
  const env = loadEnv()
  const key = useServiceRole ? env.SUPABASE_SERVICE_ROLE_KEY : env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, key)
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
