import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/onboarding';

    if (code) {
        const supabase = await createClient();

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('Auth callback error:', error);
            return NextResponse.redirect(new URL('/login?error=auth_error', requestUrl.origin));
        }

        if (data.user) {
            // Check if user profile exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id, role, agency_id')
                .eq('id', data.user.id)
                .single();

            if (!existingUser) {
                // New user - redirect to onboarding
                return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
            } else if (!existingUser.agency_id && existingUser.role !== 'super_admin') {
                // User exists but no agency - needs onboarding
                return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
            } else {
                // Existing user with agency - go to dashboard
                if (existingUser.role === 'super_admin') {
                    return NextResponse.redirect(new URL('/admin', requestUrl.origin));
                } else {
                    return NextResponse.redirect(new URL('/agency', requestUrl.origin));
                }
            }
        }
    }

    // Fallback redirect
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
