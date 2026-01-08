'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// AGENCY MANAGEMENT (Super Admin)
// ============================================

export async function createAgency(formData: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    gst_number?: string;
}) {
    const user = await requireAuth();

    // Check if super admin
    if (user.role !== 'super_admin') {
        return { error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Generate a unique slug from the agency name
    const baseSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Add a random suffix to make it unique
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

    const { data, error } = await supabase
        .from('agencies')
        .insert({
            ...formData,
            slug: uniqueSlug,
            email: formData.email || `agency-${uniqueSlug}@travelx.app`,
            is_active: true,
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
        phone?: string;
        email?: string;
        address?: string;
        city?: string;
        gst_number?: string;
    }
) {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        return { error: 'Unauthorized' };
    }

    const supabase = await createClient();

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

export async function toggleAgencyStatus(agencyId: string, isActive: boolean) {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        return { error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('agencies')
        .update({ is_active: isActive })
        .eq('id', agencyId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/agencies');
    return { data };
}

export async function deleteAgency(agencyId: string) {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        return { error: 'Unauthorized' };
    }

    const supabase = await createClient();

    // Soft delete - just deactivate and mark as deleted
    const { error } = await supabase
        .from('agencies')
        .update({ is_active: false })
        .eq('id', agencyId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/agencies');
    return { data: { success: true } };
}

// ============================================
// PLATFORM USERS (Super Admin)
// ============================================

export async function getPlatformUsers() {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        return { error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('users')
        .select(`
            *,
            agency:agencies(id, name)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return { error: error.message };
    }

    return { data };
}

export async function updatePlatformUser(
    userId: string,
    formData: {
        role?: string;
        is_active?: boolean;
    }
) {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        return { error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/admin/users');
    return { data };
}
