import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { CustomersPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    await requireAuth();
    const supabase = await createClient();

    // Fetch customers with booking count
    const { data: customers, error } = await supabase
        .from('customers')
        .select(`
      *,
      bookings:bookings(count)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching customers:', error);
    }

    return (
        <CustomersPageClient initialCustomers={customers || []} />
    );
}
