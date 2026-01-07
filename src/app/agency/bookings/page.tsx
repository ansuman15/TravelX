import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { BookingsPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch bookings with customer and assigned user
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
      *,
      customer:customers(id, full_name, phone, email),
      assigned_user:users!bookings_assigned_to_fkey(id, full_name)
    `)
        .order('created_at', { ascending: false });

    // Fetch customers for assignment
    const { data: customers } = await supabase
        .from('customers')
        .select('id, full_name, phone, email')
        .order('full_name');

    // Fetch staff for assignment
    const { data: staff } = await supabase
        .from('users')
        .select('id, full_name, role')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching bookings:', error);
    }

    return (
        <BookingsPageClient
            initialBookings={bookings || []}
            customers={customers || []}
            staff={staff || []}
            currentUserId={user.id}
        />
    );
}
