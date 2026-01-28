import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { PaymentsPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch payments with booking info
    const { data: payments, error } = await supabase
        .from('payments')
        .select(`
            *,
            booking:bookings(id, booking_number, total_amount, destination, customer:customers(id, full_name)),
            recorded_by_user:users!payments_recorded_by_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });

    // Fetch bookings for payment recording
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            id, booking_number, total_amount, amount_paid, destination,
            customer:customers(id, full_name)
        `)
        .not('status', 'eq', 'cancelled')
        .order('created_at', { ascending: false });

    // Calculate stats
    const totalReceived = payments?.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0) || 0;
    const totalRefunds = payments?.reduce((sum, p) => sum + (p.amount < 0 ? Math.abs(p.amount) : 0), 0) || 0;
    const netAmount = totalReceived - totalRefunds;

    // Outstanding calculation
    const totalDue = bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
    const totalPaid = bookings?.reduce((sum, b) => sum + (b.amount_paid || 0), 0) || 0;
    const outstanding = totalDue - totalPaid;

    if (error) {
        console.error('Error fetching payments:', error);
    }

    return (
        <PaymentsPageClient
            initialPayments={(payments || []) as unknown as Parameters<typeof PaymentsPageClient>[0]['initialPayments']}
            bookings={(bookings || []) as unknown as Parameters<typeof PaymentsPageClient>[0]['bookings']}
            stats={{
                totalReceived,
                totalRefunds,
                netAmount,
                outstanding,
                paymentCount: payments?.length || 0,
            }}
            currentUserId={user.id}
        />
    );
}
