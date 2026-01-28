import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Get the current session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password', '/auth/callback', '/api/leads/intake'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // If no user and trying to access protected route, redirect to login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // If user exists and trying to access login/signup, redirect to appropriate dashboard
    if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password')) {
        // Get user's role from the users table
        const { data: userData } = await supabase
            .from('users')
            .select('role, agency_id')
            .eq('id', user.id)
            .single();

        const url = request.nextUrl.clone();

        // Check if user needs onboarding
        if (!userData || (!userData.agency_id && userData.role !== 'super_admin')) {
            url.pathname = '/onboarding';
        } else if (userData?.role === 'super_admin') {
            url.pathname = '/admin';
        } else {
            url.pathname = '/agency';
        }
        return NextResponse.redirect(url);
    }

    // Role-based route protection for admin routes
    if (user && pathname.startsWith('/admin')) {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userData?.role !== 'super_admin') {
            const url = request.nextUrl.clone();
            url.pathname = '/agency';
            return NextResponse.redirect(url);
        }
    }

    // Agency route protection - require agency_id
    if (user && pathname.startsWith('/agency')) {
        const { data: userData } = await supabase
            .from('users')
            .select('agency_id, role')
            .eq('id', user.id)
            .single();

        // Super admins shouldn't access agency routes directly
        if (userData?.role === 'super_admin') {
            const url = request.nextUrl.clone();
            url.pathname = '/admin';
            return NextResponse.redirect(url);
        }

        // Users without agency_id should go to onboarding
        if (!userData?.agency_id) {
            const url = request.nextUrl.clone();
            url.pathname = '/onboarding';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
