import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export type UserRole = 'super_admin' | 'agency_admin' | 'agency_staff';

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    agency_id: string | null;
    staff_role: string | null;
    is_active: boolean;
}

/**
 * Get the current authenticated user with their profile data
 * Use this in Server Components
 */
export const getUser = cache(async (): Promise<AuthUser | null> => {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) return null;

    return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role as UserRole,
        agency_id: profile.agency_id,
        staff_role: profile.staff_role,
        is_active: profile.is_active,
    };
});

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
    const user = await getUser();

    if (!user) {
        redirect('/login');
    }

    if (!user.is_active) {
        redirect('/login?error=deactivated');
    }

    return user;
}

/**
 * Require specific role - redirects if user doesn't have required role
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
    const user = await requireAuth();

    if (!allowedRoles.includes(user.role)) {
        if (user.role === 'super_admin') {
            redirect('/admin');
        } else {
            redirect('/agency');
        }
    }

    return user;
}

/**
 * Require super admin role
 */
export async function requireSuperAdmin(): Promise<AuthUser> {
    return requireRole(['super_admin']);
}

/**
 * Require agency admin role (or super admin)
 */
export async function requireAgencyAdmin(): Promise<AuthUser> {
    return requireRole(['super_admin', 'agency_admin']);
}

/**
 * Sign out the current user
 */
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}
