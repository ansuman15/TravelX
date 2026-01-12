import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ItinerariesPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AgencyItinerariesPage() {
    const user = await requireAuth();

    if (!user.agency_id) {
        redirect('/onboarding');
    }

    const supabase = await createClient();

    // Fetch itineraries from database
    const { data: itineraries, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching itineraries:', error);
    }

    // Transform for client component - handle different schema versions
    const formattedItineraries = (itineraries || []).map(it => ({
        id: it.id,
        name: it.name,
        destination: it.destination || '',
        days: it.duration_days || 0,
        // Handle both old schema (is_draft) and new schema (status)
        status: it.status || (it.is_draft ? 'draft' : 'active') as 'draft' | 'active' | 'archived',
        created_at: it.created_at,
        used_count: it.used_count || 0,
    }));

    return (
        <ItinerariesPageClient
            itineraries={formattedItineraries}
        />
    );
}
