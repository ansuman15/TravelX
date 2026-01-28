'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireAgencyAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// PACKAGE ACTIONS
// ============================================

interface CreatePackageInput {
    name: string;
    destination: string;
    duration_days: number;
    duration_nights: number;
    description?: string;
    highlights?: string[];
    inclusions?: string[];
    exclusions?: string[];
    base_price?: number;
    category?: string;
    is_active?: boolean;
}

export async function createPackage(input: CreatePackageInput) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('packages')
        .insert({
            agency_id: user.agency_id,
            ...input,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/packages');
    return { data };
}

export async function updatePackage(packageId: string, input: Partial<CreatePackageInput>) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('packages')
        .update(input)
        .eq('id', packageId)
        .eq('agency_id', user.agency_id) // Defensive: ensure agency ownership
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/packages');
    return { data };
}

export async function deletePackage(packageId: string) {
    const user = await requireAgencyAdmin();
    const supabase = await createClient();

    const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId)
        .eq('agency_id', user.agency_id); // Defensive: ensure agency ownership

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/packages');
    return { success: true };
}

export async function togglePackageStatus(packageId: string, isActive: boolean) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('packages')
        .update({ is_active: isActive })
        .eq('id', packageId)
        .eq('agency_id', user.agency_id) // Defensive: ensure agency ownership
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/packages');
    return { data };
}

// ============================================
// ITINERARY ACTIONS
// ============================================

interface CreateItineraryInput {
    package_id?: string;
    booking_id?: string;
    name: string;
    destination: string;
    duration_days: number;
    duration_nights: number;
}

export async function createItinerary(input: CreateItineraryInput) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('itineraries')
        .insert({
            agency_id: user.agency_id,
            ...input,
            version: 1,
            created_by: user.id,
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/packages');
    return { data };
}

export async function updateItinerary(itineraryId: string, input: Partial<CreateItineraryInput>) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('itineraries')
        .update(input)
        .eq('id', itineraryId)
        .eq('agency_id', user.agency_id) // Defensive: ensure agency ownership
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/packages');
    return { data };
}

// ============================================
// ITINERARY DAY ACTIONS
// ============================================

interface ItineraryDayInput {
    itinerary_id: string;
    day_number: number;
    title: string;
    description?: string;
    activities?: string[];
    meals_included?: string[];
    accommodation?: string;
    transport?: string;
    notes?: string;
}

export async function addItineraryDay(input: ItineraryDayInput) {
    await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('itinerary_days')
        .insert(input)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/packages');
    return { data };
}

export async function updateItineraryDay(dayId: string, input: Partial<ItineraryDayInput>) {
    await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('itinerary_days')
        .update(input)
        .eq('id', dayId)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/packages');
    return { data };
}

export async function deleteItineraryDay(dayId: string) {
    await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase
        .from('itinerary_days')
        .delete()
        .eq('id', dayId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/packages');
    return { success: true };
}

export async function reorderItineraryDays(itineraryId: string, dayOrder: { dayId: string; dayNumber: number }[]) {
    await requireAuth();
    const supabase = await createClient();

    // Update each day's number
    for (const item of dayOrder) {
        const { error } = await supabase
            .from('itinerary_days')
            .update({ day_number: item.dayNumber })
            .eq('id', item.dayId)
            .eq('itinerary_id', itineraryId);

        if (error) {
            return { error: error.message };
        }
    }

    revalidatePath('/agency/packages');
    return { success: true };
}
