import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next');
    const type = requestUrl.searchParams.get('type');

    // Check for hash fragment parameters (Supabase may send these for password recovery)
    // Note: Hash fragments are not accessible server-side, but we handle the code flow here

    // Handle error parameters from Supabase (e.g., expired OTP link)
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    if (error) {
        console.error('Auth callback error from Supabase:', error, errorDescription);
        const loginUrl = new URL('/login', requestUrl.origin);
        loginUrl.searchParams.set('error', error);
        if (errorDescription) {
            loginUrl.searchParams.set('error_description', errorDescription);
        }
        return NextResponse.redirect(loginUrl);
    }

    if (code) {
        const supabase = await createClient();

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error('Auth callback error:', exchangeError);
            return NextResponse.redirect(new URL('/login?error=auth_error', requestUrl.origin));
        }

        if (data.user) {
            // Check if this is a password recovery flow
            // If next is set to /reset-password or type is recovery, redirect there
            if (next === '/reset-password' || type === 'recovery') {
                return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
            }

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
                // Existing user with agency - go to appropriate dashboard
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
