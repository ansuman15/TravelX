'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// AGENCY SETTINGS
// ============================================

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
    await requireAuth();

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

    revalidatePath('/agency/settings');
    return { data };
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function createUser(formData: {
    full_name: string;
    email: string;
    phone?: string | null;
    role: string;
    password: string;
}) {
    const currentUser = await requireAuth();

    const supabase = await createClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
            full_name: formData.full_name,
        },
    });

    if (authError) {
        // Try with signUp if admin is not available
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.full_name,
                },
            },
        });

        if (signUpError) {
            return { error: signUpError.message };
        }

        if (signUpData.user) {
            // Create user profile
            const { data, error } = await supabase
                .from('users')
                .insert({
                    id: signUpData.user.id,
                    email: formData.email,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    role: formData.role,
                    agency_id: currentUser.agency_id,
                    is_active: true,
                })
                .select()
                .single();

            if (error) {
                return { error: error.message };
            }

            revalidatePath('/agency/settings');
            return { data };
        }
    }

    if (authData?.user) {
        // Create user profile
        const { data, error } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: formData.email,
                full_name: formData.full_name,
                phone: formData.phone,
                role: formData.role,
                agency_id: currentUser.agency_id,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/agency/settings');
        return { data };
    }

    return { error: 'Failed to create user' };
}

export async function updateUser(
    userId: string,
    formData: {
        full_name?: string;
        phone?: string | null;
        role?: string;
        is_active?: boolean;
    }
) {
    await requireAuth();

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

    revalidatePath('/agency/settings');
    return { data };
}

export async function deleteUser(userId: string) {
    await requireAuth();

    const supabase = await createClient();

    // Soft delete - just deactivate
    const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/settings');
    return { data: { success: true } };
}
