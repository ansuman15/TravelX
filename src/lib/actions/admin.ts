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
    adminName?: string;
    adminEmail?: string;
    adminPassword?: string;
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

    // Generate a secure password if not provided
    const generatedPassword = formData.adminPassword || generateSecurePassword();
    const adminEmail = formData.adminEmail || formData.email || `admin@${uniqueSlug}.travelx.app`;

    // Step 1: Create the agency
    const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .insert({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || `agency-${uniqueSlug}@travelx.app`,
            address: formData.address,
            city: formData.city,
            gst_number: formData.gst_number,
            slug: uniqueSlug,
            is_active: true,
        })
        .select()
        .single();

    if (agencyError) {
        return { error: agencyError.message };
    }

    // Step 2: Create admin user in Supabase Auth
    // Note: This requires service role key which has admin.createUser permission
    // For now, we'll create the user record and they can use password reset
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: generatedPassword,
        options: {
            data: {
                full_name: formData.adminName || `${formData.name} Admin`,
            },
        },
    });

    if (authError) {
        // Rollback agency creation if user creation fails
        await supabase.from('agencies').delete().eq('id', agency.id);
        return { error: `Failed to create admin user: ${authError.message}` };
    }

    // Step 3: Create user profile record linked to agency
    if (authData.user) {
        const { error: profileError } = await supabase
            .from('users')
            .upsert({
                id: authData.user.id,
                email: adminEmail,
                full_name: formData.adminName || `${formData.name} Admin`,
                role: 'agency_admin',
                agency_id: agency.id,
                is_active: true,
            });

        if (profileError) {
            console.error('Failed to create user profile:', profileError);
        }
    }

    revalidatePath('/admin/agencies');

    return {
        data: agency,
        credentials: {
            email: adminEmail,
            password: generatedPassword,
            message: 'Agency created successfully with admin credentials',
        }
    };
}

// Generate a secure random password
function generateSecurePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
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
