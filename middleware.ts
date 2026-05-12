import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard =
    request.nextUrl.pathname.startsWith("/profesional") ||
    request.nextUrl.pathname.startsWith("/paciente");

  // Role-based access control: prevent cross-role navigation
  if (user && isDashboard) {
    const { data: perfil } = await supabase
      .from("nutri_perfiles")
      .select("rol")
      .eq("id", user.id)
      .single();
    const perfilData = perfil as { rol: string } | null;

    if (request.nextUrl.pathname.startsWith("/profesional") && perfilData?.rol !== "profesional") {
      return NextResponse.redirect(new URL("/paciente", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/paciente") && perfilData?.rol === "profesional") {
      return NextResponse.redirect(new URL("/profesional", request.url));
    }
  }

  const isAuth = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register";

  if (isDashboard && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && user) {
    // Redirigir a /dashboard que lee el rol y hace la redirección final
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/login", "/register", "/dashboard", "/profesional/:path*", "/paciente/:path*"],
};
