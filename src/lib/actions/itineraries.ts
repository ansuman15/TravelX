'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// ITINERARY TYPES
// ============================================
export interface Itinerary {
    id: string;
    agency_id: string;
    name: string;
    destination: string | null;
    duration_days: number;
    status: 'draft' | 'active' | 'archived';
    description: string | null;
    cover_image: string | null;
    used_count: number;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    days?: ItineraryDay[];
}

export interface ItineraryDay {
    id: string;
    itinerary_id: string;
    day_number: number;
    title: string | null;
    description: string | null;
    activities: Activity[];
    locations: Location[];
}

export interface Activity {
    id: string;
    time: string;
    title: string;
    description?: string;
    type: 'transport' | 'meal' | 'activity' | 'accommodation' | 'other';
}

export interface Location {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    order: number;
}

// ============================================
// GET ITINERARIES
// ============================================
export async function getItineraries() {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated', data: [] };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    if (error) {
        return { error: error.message, data: [] };
    }

    return { data: data || [] };
}

// ============================================
// GET ITINERARY WITH DAYS
// ============================================
export async function getItinerary(itineraryId: string) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    const { data: itinerary, error } = await supabase
        .from('itineraries')
        .select(`
            *,
            days:itinerary_days(*)
        `)
        .eq('id', itineraryId)
        .eq('agency_id', user.agency_id)
        .single();

    if (error) {
        return { error: error.message };
    }

    // Sort days by day_number
    if (itinerary?.days) {
        itinerary.days.sort((a: ItineraryDay, b: ItineraryDay) => a.day_number - b.day_number);
    }

    return { data: itinerary };
}

// ============================================
// CREATE ITINERARY
// ============================================
export async function createItinerary(formData: {
    name: string;
    destination?: string;
    duration_days?: number;
    description?: string;
}) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    // Create itinerary
    const { data: itinerary, error } = await supabase
        .from('itineraries')
        .insert({
            agency_id: user.agency_id,
            name: formData.name,
            destination: formData.destination,
            duration_days: formData.duration_days || 1,
            description: formData.description,
            status: 'draft',
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // Create empty days
    const days = Array.from({ length: formData.duration_days || 1 }, (_, i) => ({
        itinerary_id: itinerary.id,
        day_number: i + 1,
        title: `Day ${i + 1}`,
        activities: [],
        locations: [],
    }));

    await supabase.from('itinerary_days').insert(days);

    revalidatePath('/agency/itineraries');
    return { data: itinerary };
}

// ============================================
// UPDATE ITINERARY
// ============================================
export async function updateItinerary(
    itineraryId: string,
    formData: {
        name?: string;
        destination?: string;
        duration_days?: number;
        description?: string;
        status?: 'draft' | 'active' | 'archived';
    }
) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('itineraries')
        .update(formData)
        .eq('id', itineraryId)
        .eq('agency_id', user.agency_id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/itineraries');
    return { data };
}

// ============================================
// UPDATE ITINERARY DAY
// ============================================
export async function updateItineraryDay(
    dayId: string,
    formData: {
        title?: string;
        description?: string;
        activities?: Activity[];
        locations?: Location[];
    }
) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('itinerary_days')
        .update(formData)
        .eq('id', dayId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/itineraries');
    return { data };
}

// ============================================
// DELETE ITINERARY
// ============================================
export async function deleteItinerary(itineraryId: string) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', itineraryId)
        .eq('agency_id', user.agency_id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/itineraries');
    return { success: true };
}

// ============================================
// CLONE ITINERARY
// ============================================
export async function cloneItinerary(itineraryId: string) {
    const user = await requireAuth();

    if (!user.agency_id) {
        return { error: 'No agency associated' };
    }

    const supabase = await createClient();

    // Get original itinerary with days
    const { data: original } = await supabase
        .from('itineraries')
        .select('*, days:itinerary_days(*)')
        .eq('id', itineraryId)
        .eq('agency_id', user.agency_id)
        .single();

    if (!original) {
        return { error: 'Itinerary not found' };
    }

    // Create clone
    const { data: clone, error } = await supabase
        .from('itineraries')
        .insert({
            agency_id: user.agency_id,
            name: `${original.name} (Copy)`,
            destination: original.destination,
            duration_days: original.duration_days,
            description: original.description,
            status: 'draft',
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // Clone days
    if (original.days?.length) {
        const clonedDays = original.days.map((day: ItineraryDay) => ({
            itinerary_id: clone.id,
            day_number: day.day_number,
            title: day.title,
            description: day.description,
            activities: day.activities,
            locations: day.locations,
        }));

        await supabase.from('itinerary_days').insert(clonedDays);
    }

    // Increment used_count on original
    await supabase
        .from('itineraries')
        .update({ used_count: original.used_count + 1 })
        .eq('id', itineraryId);

    revalidatePath('/agency/itineraries');
    return { data: clone };
}
