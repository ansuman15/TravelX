import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { CustomersPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // SECURITY: Only fetch customers for the user's agency
    const { data: customers, error } = await supabase
        .from('customers')
        .select(`
      *,
      bookings:bookings(count)
    `)
        .eq('agency_id', user.agency_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching customers:', error);
    }

    return (
        <CustomersPageClient initialCustomers={customers || []} />
    );
}
