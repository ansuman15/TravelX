'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// FEEDBACK TYPES
// ============================================
export interface Feedback {
    id: string;
    agency_id: string;
    booking_id: string | null;
    customer_id: string | null;
    rating: number;
    review: string | null;
    category: string | null;
    created_at: string;
    customer?: {
        full_name: string;
        email: string;
    };
    booking?: {
        destination: string;
        booking_number: string;
    };
}

// ============================================
// GET FEEDBACK LIST
// ============================================
export async function getFeedbackList() {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('feedback')
        .select(`
            *,
            customer:customers(full_name, email),
            booking:bookings(destination, booking_number)
        `)
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    if (error) {
        // Table might not exist yet, return empty
        console.error('Feedback fetch error:', error);
        return { data: [] };
    }

    return { data: data || [] };
}

// ============================================
// GET FEEDBACK STATS
// ============================================
export async function getFeedbackStats() {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data } = await supabase
        .from('feedback')
        .select('rating, created_at')
        .eq('agency_id', user.agency_id);

    if (!data || data.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            monthlyStats: [],
        };
    }

    // Calculate stats
    const totalReviews = data.length;
    const averageRating = data.reduce((acc, f) => acc + (f.rating || 0), 0) / totalReviews;

    // Rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach(f => {
        if (f.rating >= 1 && f.rating <= 5) {
            ratingDistribution[f.rating as 1 | 2 | 3 | 4 | 5]++;
        }
    });

    // Monthly positive/negative over last 6 months
    const now = new Date();
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthData = data.filter(f => {
            const created = new Date(f.created_at);
            return created >= month && created <= monthEnd;
        });
        const positive = monthData.filter(f => f.rating >= 4).length;
        const negative = monthData.filter(f => f.rating <= 2).length;
        monthlyStats.push({
            month: month.toLocaleDateString('en-US', { month: 'short' }),
            positive,
            negative,
        });
    }

    return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution,
        monthlyStats,
    };
}

// ============================================
// CREATE FEEDBACK
// ============================================
export async function createFeedback(data: {
    booking_id?: string;
    customer_id?: string;
    rating: number;
    review?: string;
    category?: string;
}) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase
        .from('feedback')
        .insert({
            agency_id: user.agency_id,
            booking_id: data.booking_id,
            customer_id: data.customer_id,
            rating: data.rating,
            review: data.review,
            category: data.category,
        });

    if (error) {
        console.error('Failed to create feedback:', error);
        return { error: error.message };
    }

    revalidatePath('/agency/feedback');
    return { success: true };
}

// ============================================
// DELETE FEEDBACK
// ============================================
export async function deleteFeedback(id: string) {
    const user = await requireAuth();
    const supabase = await createClient();

    const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id)
        .eq('agency_id', user.agency_id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/feedback');
    return { success: true };
}
