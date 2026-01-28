import { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AgencyLayoutClient } from './layout-client';

// Force dynamic rendering - this layout requires authentication
export const dynamic = 'force-dynamic';

interface AgencyLayoutProps {
    children: ReactNode;
}

export default async function AgencyLayout({ children }: AgencyLayoutProps) {
    const user = await requireAuth();

    // Redirect to onboarding if no agency assigned
    if (!user.agency_id) {
        redirect('/onboarding');
    }

    // Get agency details
    const supabase = await createClient();
    const { data: agency } = await supabase
        .from('agencies')
        .select('name, logo_url')
        .eq('id', user.agency_id)
        .single();

    // Get counts for sidebar badges
    const { count: newLeadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', user.agency_id)
        .eq('status', 'new');

    return (
        <AgencyLayoutClient
            user={{
                name: user.full_name,
                role: user.role,
                email: user.email,
            }}
            agencyName={agency?.name || 'TravelX Agency'}
            badgeCounts={{
                leads: newLeadsCount || 0,
            }}
        >
            {children}
        </AgencyLayoutClient>
    );
}
