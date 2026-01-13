import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CalendarPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AgencyCalendarPage() {
    const user = await requireAuth();
    // Note: agency_id check is handled by the layout

    const supabase = await createClient();

    // Get bookings for calendar
    const { data: bookings } = await supabase
        .from('bookings')
        .select('id, customer_name, package_name, start_date, end_date, status')
        .eq('agency_id', user.agency_id)
        .gte('start_date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())
        .order('start_date', { ascending: true });

    return (
        <CalendarPageClient
            bookings={bookings || []}
        />
    );
}
