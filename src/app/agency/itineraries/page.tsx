import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ItinerariesPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AgencyItinerariesPage() {
    const user = await requireAuth();

    if (!user.agency_id) {
        redirect('/onboarding');
    }

    // Mock itineraries - TODO: Create itineraries table
    const mockItineraries = [
        {
            id: '1',
            name: 'Bali Adventure - 5 Days',
            destination: 'Bali, Indonesia',
            days: 5,
            status: 'active' as const,
            created_at: new Date().toISOString(),
            used_count: 12,
        },
        {
            id: '2',
            name: 'Dubai Luxury Tour - 7 Days',
            destination: 'Dubai, UAE',
            days: 7,
            status: 'active' as const,
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            used_count: 8,
        },
        {
            id: '3',
            name: 'Thailand Explorer - 6 Days',
            destination: 'Bangkok & Phuket',
            days: 6,
            status: 'draft' as const,
            created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
            used_count: 0,
        },
    ];

    return (
        <ItinerariesPageClient
            itineraries={mockItineraries}
        />
    );
}
