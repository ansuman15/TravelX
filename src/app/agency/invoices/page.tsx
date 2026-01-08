import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { InvoicesPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch invoices with booking info
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
            *,
            booking:bookings(id, booking_number, total_amount, destination, customer:customers(id, full_name, email, phone)),
            created_by_user:users!invoices_created_by_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });

    // Fetch bookings for invoice creation
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            id, booking_number, total_amount, amount_paid, destination,
            customer:customers(id, full_name, email, phone)
        `)
        .not('status', 'eq', 'cancelled')
        .order('created_at', { ascending: false });

    // Fetch agency info for invoice header
    const { data: agency } = await supabase
        .from('agencies')
        .select('id, name, phone, email, address, city, gst_number, logo_url')
        .eq('id', user.agency_id)
        .single();

    if (error) {
        console.error('Error fetching invoices:', error);
    }

    return (
        <InvoicesPageClient
            initialInvoices={(invoices || []) as unknown as Parameters<typeof InvoicesPageClient>[0]['initialInvoices']}
            bookings={(bookings || []) as unknown as Parameters<typeof InvoicesPageClient>[0]['bookings']}
            agency={agency}
            currentUserId={user.id}
        />
    );
}
