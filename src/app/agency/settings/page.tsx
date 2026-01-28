import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { SettingsPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch agency details
    const { data: agency } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', user.agency_id)
        .single();

    // Fetch agency users
    const { data: users } = await supabase
        .from('users')
        .select('id, full_name, email, phone, role, is_active, created_at')
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: true });

    return (
        <SettingsPageClient
            agency={agency}
            users={users || []}
            currentUser={user}
        />
    );
}
