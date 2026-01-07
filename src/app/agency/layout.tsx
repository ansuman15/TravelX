import { ReactNode } from 'react';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { AgencyLayoutClient } from './layout-client';

// Force dynamic rendering - this layout requires authentication
export const dynamic = 'force-dynamic';

interface AgencyLayoutProps {
    children: ReactNode;
}

export default async function AgencyLayout({ children }: AgencyLayoutProps) {
    const user = await requireAuth();

    // Get agency details
    const supabase = await createClient();
    const { data: agency } = await supabase
        .from('agencies')
        .select('name, logo_url')
        .eq('id', user.agency_id)
        .single();

    return (
        <AgencyLayoutClient
            user={{
                name: user.full_name,
                role: user.role,
                email: user.email,
            }}
            agencyName={agency?.name || 'TravelX Agency'}
        >
            {children}
        </AgencyLayoutClient>
    );
}
