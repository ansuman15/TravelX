'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// SUPPLIERS
// ============================================

export async function createSupplier(formData: {
    name: string;
    category: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    payment_terms?: string;
    default_margin?: number | null;
    notes?: string;
}) {
    await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('suppliers')
        .insert({
            ...formData,
            is_active: true,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/suppliers');
    return { data };
}

export async function updateSupplier(
    supplierId: string,
    formData: {
        name?: string;
        category?: string;
        contact_person?: string;
        phone?: string;
        email?: string;
        address?: string;
        city?: string;
        country?: string;
        payment_terms?: string;
        default_margin?: number | null;
        notes?: string;
        is_active?: boolean;
    }
) {
    await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('suppliers')
        .update(formData)
        .eq('id', supplierId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/suppliers');
    return { data };
}

export async function deleteSupplier(supplierId: string) {
    await requireAuth();

    const supabase = await createClient();

    const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/suppliers');
    return { data: { success: true } };
}
