import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfilePageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AgencyProfilePage() {
    const user = await requireAuth();

    if (!user.agency_id && user.role !== 'super_admin') {
        redirect('/onboarding');
    }

    const supabase = await createClient();

    // Get agency info
    let agencyName = '';
    if (user.agency_id) {
        const { data: agency } = await supabase
            .from('agencies')
            .select('name')
            .eq('id', user.agency_id)
            .single();
        agencyName = agency?.name || '';
    }

    return (
        <ProfilePageClient
            user={{
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                phone: null,
                avatar_url: null,
            }}
            agencyName={agencyName}
        />
    );
}
