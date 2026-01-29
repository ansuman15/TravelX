'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// GALLERY TYPES
// ============================================
export interface GalleryItem {
    id: string;
    agency_id: string;
    url: string;
    thumbnail_url: string | null;
    type: 'image' | 'video';
    destination: string | null;
    caption: string | null;
    tags: string[];
    uploaded_by: string | null;
    created_at: string;
}

// ============================================
// GET GALLERY ITEMS
// ============================================
export async function getGalleryItems() {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Gallery fetch error:', error);
        return { data: [] };
    }

    return { data: data || [] };
}

// ============================================
// UPLOAD GALLERY ITEM
// ============================================
export async function uploadGalleryItem(data: {
    url: string;
    type: 'image' | 'video';
    destination?: string;
    caption?: string;
    tags?: string[];
}) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: item, error } = await supabase
        .from('gallery')
        .insert({
            agency_id: user.agency_id,
            url: data.url,
            type: data.type,
            destination: data.destination,
            caption: data.caption,
            tags: data.tags || [],
            uploaded_by: user.id,
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to upload gallery item:', error);
        return { error: error.message };
    }

    revalidatePath('/agency/gallery');
    return { data: item };
}

// ============================================
// DELETE GALLERY ITEM
// ============================================
export async function deleteGalleryItem(id: string) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id)
        .eq('agency_id', user.agency_id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/gallery');
    return { success: true };
}
