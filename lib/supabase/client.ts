import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";

/** Cliente Supabase para componentes del lado del cliente (browser) -- */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Obtiene el usuario autenticado desde el cliente */
export async function getBrowserUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}
