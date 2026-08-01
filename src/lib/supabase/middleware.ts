import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isDashboardRoute = path.startsWith('/dashboard');
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');
  const isAdminRoute = path.startsWith('/admin');

  if ((isDashboardRoute || isAdminRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (isAuthRoute && user && path !== '/register/privileged' && path !== '/reset-password') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = profile?.role;

    const deny = path.startsWith('/admin/system-management')
      ? role !== 'SYSTEM_ADMINISTRATOR'
      : !['STUDENT_EXECUTIVE', 'ASSOCIATE_COORDINATOR', 'SYSTEM_ADMINISTRATOR'].includes(role ?? '');

    if (deny) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}