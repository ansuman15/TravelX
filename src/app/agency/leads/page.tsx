import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { LeadsPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch leads for this agency
    const { data: leads, error } = await supabase
        .from('leads')
        .select(`
      *,
      assigned_user:users!leads_assigned_to_fkey(id, full_name)
    `)
        .order('created_at', { ascending: false });

    // Fetch staff for assignment dropdown
    const { data: staff } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching leads:', error);
    }

    return (
        <LeadsPageClient
            initialLeads={leads || []}
            staff={staff || []}
            currentUserId={user.id}
        />
    );
}
