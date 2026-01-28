import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { AgenciesPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AdminAgenciesPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch all agencies with user counts
    const { data: agencies } = await supabase
        .from('agencies')
        .select(`
            *,
            users:users(count)
        `)
        .order('created_at', { ascending: false });

    // Transform data
    const agenciesWithCounts = (agencies || []).map(a => ({
        ...a,
        user_count: a.users?.[0]?.count || 0,
    }));

    return (
        <AgenciesPageClient
            agencies={agenciesWithCounts as unknown as Parameters<typeof AgenciesPageClient>[0]['agencies']}
        />
    );
}
