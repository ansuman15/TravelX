'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { requireSuperAdmin, requireAgencyAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// AGENCY MANAGEMENT (Super Admin Only)
// ============================================

export async function createAgency(formData: {
    name: string;
    slug: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    subscription_plan?: string;
}) {
    await requireSuperAdmin();

    const supabase = await createAdminClient();

    // Validate slug is unique
    const { data: existing } = await supabase
        .from('agencies')
        .select('id')
        .eq('slug', formData.slug)
        .single();

    if (existing) {
        return { error: 'Agency slug already exists' };
    }

    const { data, error } = await supabase
        .from('agencies')
        .insert({
            name: formData.name,
            slug: formData.slug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            subscription_plan: formData.subscription_plan || 'basic',
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/agencies');
    return { data };
}

export async function updateAgency(
    agencyId: string,
    formData: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        is_active?: boolean;
        subscription_plan?: string;
    }
) {
    await requireSuperAdmin();

    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from('agencies')
        .update(formData)
        .eq('id', agencyId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/agencies');
    return { data };
}

export async function suspendAgency(agencyId: string) {
    return updateAgency(agencyId, { is_active: false });
}

export async function activateAgency(agencyId: string) {
    return updateAgency(agencyId, { is_active: true });
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function createUser(formData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role: 'agency_admin' | 'agency_staff';
    staff_role?: 'sales' | 'operations' | 'visa' | 'accountant';
    agency_id: string;
}) {
    const currentUser = await requireAgencyAdmin();

    // Verify the agency exists and user has access
    if (currentUser.role !== 'super_admin' && currentUser.agency_id !== formData.agency_id) {
        return { error: 'Unauthorized to create users for this agency' };
    }

    const supabase = await createAdminClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
    });

    if (authError) {
        return { error: authError.message };
    }

    // Create user profile
    const { data, error } = await supabase
        .from('users')
        .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
            staff_role: formData.staff_role,
            agency_id: formData.agency_id,
        })
        .select()
        .single();

    if (error) {
        // Rollback: delete auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { error: error.message };
    }

    revalidatePath('/agency/staff');
    revalidatePath('/admin/users');
    return { data };
}

export async function createAgencyAdmin(formData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    agency_id: string;
}) {
    await requireSuperAdmin();

    return createUser({
        ...formData,
        role: 'agency_admin',
    });
}

export async function updateUser(
    userId: string,
    formData: {
        full_name?: string;
        phone?: string;
        staff_role?: string;
        is_active?: boolean;
    }
) {
    const currentUser = await requireAgencyAdmin();

    const supabase = await createClient();

    // Verify user is in same agency (unless super admin)
    if (currentUser.role !== 'super_admin') {
        const { data: targetUser } = await supabase
            .from('users')
            .select('agency_id')
            .eq('id', userId)
            .single();

        if (targetUser?.agency_id !== currentUser.agency_id) {
            return { error: 'Unauthorized to update this user' };
        }
    }

    const { data, error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/staff');
    return { data };
}

export async function deactivateUser(userId: string) {
    return updateUser(userId, { is_active: false });
}

export async function activateUser(userId: string) {
    return updateUser(userId, { is_active: true });
}

// ============================================
// PROFILE MANAGEMENT (Self)
// ============================================

export async function updateProfile(formData: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/');
    return { data };
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const supabase = await createClient();

    // Verify current password by re-authenticating
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        return { error: 'Not authenticated' };
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
