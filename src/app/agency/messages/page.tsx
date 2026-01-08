import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MessagesPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AgencyMessagesPage() {
    const user = await requireAuth();

    if (!user.agency_id) {
        redirect('/onboarding');
    }

    // Mock notifications/messages - TODO: Implement real notifications
    const mockNotifications = [
        { id: '1', type: 'booking' as const, title: 'New Booking', message: 'John Doe confirmed booking for Bali trip', time: new Date().toISOString(), read: false },
        { id: '2', type: 'payment' as const, title: 'Payment Received', message: '₹50,000 received for booking #1234', time: new Date(Date.now() - 3600000).toISOString(), read: false },
        { id: '3', type: 'task' as const, title: 'Task Due Tomorrow', message: 'Visa application for Sarah pending', time: new Date(Date.now() - 7200000).toISOString(), read: true },
        { id: '4', type: 'system' as const, title: 'System Update', message: 'New features added to the dashboard', time: new Date(Date.now() - 86400000).toISOString(), read: true },
        { id: '5', type: 'booking' as const, title: 'Booking Cancelled', message: 'Customer Mike cancelled Thailand trip', time: new Date(Date.now() - 86400000 * 2).toISOString(), read: true },
    ];

    return (
        <MessagesPageClient
            notifications={mockNotifications}
            currentUser={user.full_name}
        />
    );
}
