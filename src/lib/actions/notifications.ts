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
