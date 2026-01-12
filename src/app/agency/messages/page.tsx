import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MessagesPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AgencyMessagesPage() {
    const user = await requireAuth();

    if (!user.agency_id) {
        redirect('/onboarding');
    }

    const supabase = await createClient();

    // Fetch notifications from database
    const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching notifications:', error);
    }

    // Transform data for client component
    const formattedNotifications = (notifications || []).map(n => ({
        id: n.id,
        type: n.type as 'booking' | 'payment' | 'task' | 'system' | 'message',
        title: n.title,
        message: n.message,
        time: n.created_at,
        read: n.read,
        data: n.data,
    }));

    return (
        <MessagesPageClient
            notifications={formattedNotifications}
            currentUser={user.full_name}
        />
    );
}
