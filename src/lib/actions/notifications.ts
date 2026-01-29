'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ============================================
// NOTIFICATION TYPES
// ============================================
export interface Notification {
    id: string;
    user_id: string;
    agency_id: string | null;
    type: 'booking' | 'payment' | 'task' | 'system' | 'message';
    title: string;
    message: string | null;
    data: Record<string, unknown> | null;
    read: boolean;
    created_at: string;
}

// ============================================
// GET NOTIFICATIONS
// ============================================
export async function getNotifications(limit = 20) {
    const user = await requireAuth();

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        return { error: error.message, data: [] };
    }

    return { data: data || [] };
}

// ============================================
// GET UNREAD COUNT
// ============================================
export async function getUnreadCount() {
    const user = await requireAuth();

    const supabase = await createClient();

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

    if (error) {
        return { count: 0 };
    }

    return { count: count || 0 };
}

// ============================================
// MARK AS READ
// ============================================
export async function markNotificationAsRead(notificationId: string) {
    const user = await requireAuth();

    const supabase = await createClient();

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/messages');
    return { success: true };
}

// ============================================
// MARK ALL AS READ
// ============================================
export async function markAllNotificationsAsRead() {
    const user = await requireAuth();

    const supabase = await createClient();

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/messages');
    return { success: true };
}

// ============================================
// DELETE NOTIFICATION
// ============================================
export async function deleteNotification(notificationId: string) {
    const user = await requireAuth();

    const supabase = await createClient();

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/agency/messages');
    return { success: true };
}

// ============================================
// CREATE NOTIFICATION (Internal/Admin use)
// ============================================
export async function createNotification(data: {
    user_id: string;
    agency_id?: string;
    type: 'booking' | 'payment' | 'task' | 'system' | 'message';
    title: string;
    message?: string;
    data?: Record<string, unknown>;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: data.user_id,
            agency_id: data.agency_id,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data,
            read: false,
        });

    if (error) {
        console.error('Failed to create notification:', error);
        return { error: error.message };
    }

    return { success: true };
}

// ============================================
// GET NOTIFICATIONS WITH FALLBACK
// ============================================
export async function getNotificationsWithFallback(limit = 10) {
    const user = await requireAuth();
    const supabase = await createClient();

    // First try to get from notifications table
    const { data: dbNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (dbNotifications && dbNotifications.length > 0) {
        const unreadCount = dbNotifications.filter(n => !n.read).length;
        return { data: dbNotifications, unreadCount };
    }

    // Fallback: Generate from recent activity
    const notifications: Array<{
        id: string;
        title: string;
        message: string;
        type: string;
        read: boolean;
        created_at: string;
    }> = [];

    // Recent bookings
    const { data: recentBookings } = await supabase
        .from('bookings')
        .select('id, booking_number, created_at, customer:customers(full_name)')
        .eq('agency_id', user.agency_id)
        .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

    recentBookings?.forEach(b => {
        const c = b.customer as { full_name: string } | { full_name: string }[] | null;
        const name = Array.isArray(c) ? c[0]?.full_name : c?.full_name;
        notifications.push({
            id: `b-${b.id}`,
            title: 'New Booking',
            message: `${name || 'Customer'} - ${b.booking_number}`,
            type: 'booking',
            read: false,
            created_at: b.created_at,
        });
    });

    // Recent payments
    const { data: recentPayments } = await supabase
        .from('payments')
        .select('id, amount, created_at')
        .eq('agency_id', user.agency_id)
        .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

    recentPayments?.forEach(p => {
        notifications.push({
            id: `p-${p.id}`,
            title: 'Payment Received',
            message: `₹${p.amount?.toLocaleString('en-IN') || 0}`,
            type: 'payment',
            read: false,
            created_at: p.created_at,
        });
    });

    // Recent leads
    const { data: recentLeads } = await supabase
        .from('leads')
        .select('id, name, destination, created_at')
        .eq('agency_id', user.agency_id)
        .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

    recentLeads?.forEach(l => {
        notifications.push({
            id: `l-${l.id}`,
            title: 'New Lead',
            message: `${l.name} - ${l.destination || 'Enquiry'}`,
            type: 'task',
            read: false,
            created_at: l.created_at,
        });
    });

    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { data: notifications.slice(0, limit), unreadCount: notifications.length };
}

// ============================================
// GLOBAL SEARCH
// ============================================
export async function globalSearch(query: string) {
    if (!query || query.length < 2) return { results: [] };

    const user = await requireAuth();
    const supabase = await createClient();
    const q = `%${query}%`;

    const results: Array<{
        id: string;
        title: string;
        subtitle: string;
        type: 'customer' | 'booking' | 'lead' | 'package';
        href: string;
    }> = [];

    // Search customers
    const { data: customers } = await supabase
        .from('customers')
        .select('id, full_name, phone')
        .eq('agency_id', user.agency_id)
        .or(`full_name.ilike.${q},phone.ilike.${q}`)
        .limit(4);

    customers?.forEach(c => results.push({
        id: c.id, title: c.full_name, subtitle: c.phone || 'Customer',
        type: 'customer', href: `/agency/customers?search=${c.full_name}`,
    }));

    // Search bookings
    const { data: bookings } = await supabase
        .from('bookings')
        .select('id, booking_number, destination')
        .eq('agency_id', user.agency_id)
        .or(`booking_number.ilike.${q},destination.ilike.${q}`)
        .limit(4);

    bookings?.forEach(b => results.push({
        id: b.id, title: b.booking_number, subtitle: b.destination || 'Booking',
        type: 'booking', href: `/agency/bookings?search=${b.booking_number}`,
    }));

    // Search leads
    const { data: leads } = await supabase
        .from('leads')
        .select('id, name, destination')
        .eq('agency_id', user.agency_id)
        .or(`name.ilike.${q},destination.ilike.${q}`)
        .limit(4);

    leads?.forEach(l => results.push({
        id: l.id, title: l.name, subtitle: l.destination || 'Lead',
        type: 'lead', href: `/agency/leads?search=${l.name}`,
    }));

    return { results: results.slice(0, 8) };
}
