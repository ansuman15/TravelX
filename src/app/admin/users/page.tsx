import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { UsersPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch all users with agency info
    const { data: users } = await supabase
        .from('users')
        .select(`
            *,
            agency:agencies(id, name)
        `)
        .order('created_at', { ascending: false });

    return (
        <UsersPageClient
            users={(users || []) as unknown as Parameters<typeof UsersPageClient>[0]['users']}
        />
    );
}
