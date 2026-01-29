'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// GUIDE TYPES
// ============================================
export interface Guide {
    id: string;
    agency_id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    email: string | null;
    languages: string[];
    experience_years: number;
    skills: string[];
    bio: string | null;
    status: 'active' | 'inactive' | 'on_leave';
    rating: number | null;
    total_tours: number;
    created_at: string;
}

// ============================================
// GET GUIDES LIST
// ============================================
export async function getGuidesList() {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Guides fetch error:', error);
        return { data: [] };
    }

    return { data: data || [] };
}

// ============================================
// GET GUIDE BY ID
// ============================================
export async function getGuide(id: string) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('id', id)
        .eq('agency_id', user.agency_id)
        .single();

    if (error) {
        return { error: error.message };
    }

    return { data };
}

// ============================================
// CREATE GUIDE
// ============================================
export async function createGuide(data: {
    full_name: string;
    phone?: string;
    email?: string;
    languages?: string[];
    experience_years?: number;
    skills?: string[];
    bio?: string;
}) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: guide, error } = await supabase
        .from('guides')
        .insert({
            agency_id: user.agency_id,
            full_name: data.full_name,
            phone: data.phone,
            email: data.email,
            languages: data.languages || [],
            experience_years: data.experience_years || 0,
            skills: data.skills || [],
            bio: data.bio,
            status: 'active',
            total_tours: 0,
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create guide:', error);
        return { error: error.message };
    }

    revalidatePath('/agency/guides');
    return { data: guide };
}

// ============================================
// UPDATE GUIDE
// ============================================
export async function updateGuide(id: string, data: Partial<Guide>) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase
        .from('guides')
        .update(data)
        .eq('id', id)
        .eq('agency_id', user.agency_id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/guides');
    return { success: true };
}

// ============================================
// DELETE GUIDE
// ============================================
export async function deleteGuide(id: string) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', id)
        .eq('agency_id', user.agency_id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/guides');
    return { success: true };
}
