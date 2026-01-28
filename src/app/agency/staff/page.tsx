import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { StaffPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AgencyStaffPage() {
    const user = await requireAuth();
    // Note: agency_id check is handled by the layout

    const supabase = await createClient();

    // Get staff members for this agency
    const { data: staffMembers } = await supabase
        .from('users')
        .select('*')
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    return (
        <StaffPageClient
            staffMembers={staffMembers || []}
            currentUserId={user.id}
            isAdmin={user.role === 'agency_admin'}
        />
    );
}
