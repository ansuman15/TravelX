import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { AgencyDashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AgencyDashboardPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch leads stats
    const { data: leads } = await supabase
        .from('leads')
        .select('id, status, created_at');

    // Fetch customers count
    const { count: customersCount } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true });

    // Fetch bookings with payments
    const { data: bookings } = await supabase
        .from('bookings')
        .select('id, status, total_amount, amount_paid, travel_start, travel_end, destination, created_at, customer:customers(full_name)')
        .order('created_at', { ascending: false });

    // Fetch payments for revenue calculation
    const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_date, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Fetch upcoming bookings
    const { data: upcomingBookings } = await supabase
        .from('bookings')
        .select('id, destination, travel_start, travel_end, adults, children, status, customer:customers(full_name)')
        .gte('travel_start', new Date().toISOString())
        .order('travel_start', { ascending: true })
        .limit(5);

    // Calculate stats
    const totalBookings = bookings?.length || 0;
    const totalCustomers = customersCount || 0;
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    const confirmedBookings = bookings?.filter(b => ['confirmed', 'ticketed', 'completed'].includes(b.status)).length || 0;
    const conversionRate = totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : '0';

    // Calculate lead stats by status
    const leadStats = {
        new: leads?.filter(l => l.status === 'new').length || 0,
        contacted: leads?.filter(l => l.status === 'contacted').length || 0,
        quoted: leads?.filter(l => l.status === 'quoted').length || 0,
        negotiating: leads?.filter(l => l.status === 'negotiating').length || 0,
        booked: leads?.filter(l => l.status === 'booked').length || 0,
        lost: leads?.filter(l => l.status === 'lost').length || 0,
    };

    // Calculate booking stats by status
    const bookingStats = {
        total: totalBookings,
        done: bookings?.filter(b => b.status === 'completed').length || 0,
        booked: bookings?.filter(b => ['confirmed', 'ticketed', 'documents_pending'].includes(b.status)).length || 0,
        cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
    };

    // Calculate weekly revenue for chart (last 7 days)
    const weeklyRevenue = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        const dayRevenue = payments?.filter(p => {
            const pDate = p.payment_date || p.created_at;
            return pDate >= dayStart && pDate <= dayEnd;
        }).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        weeklyRevenue.push({
            name: days[new Date(dayStart).getDay()],
            value: dayRevenue,
        });
    }

    // Calculate destinations breakdown
    const destinationCounts: Record<string, number> = {};
    bookings?.forEach(b => {
        if (b.destination) {
            const dest = b.destination.split(',')[0].trim();
            destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
        }
    });

    const topDestinations = Object.entries(destinationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, count], index) => ({
            name,
            value: count,
            color: ['#3F83F8', '#0E9F6E', '#F59E0B', '#EF4444'][index] || '#6B7280',
        }));

    // Recent bookings for table
    const recentBookings = bookings?.slice(0, 5).map(b => {
        const customerData = b.customer as { full_name: string } | { full_name: string }[] | null;
        const customerName = Array.isArray(customerData) ? customerData[0]?.full_name : customerData?.full_name;
        return {
            id: b.id,
            customer: customerName || 'Unknown',
            destination: b.destination || '-',
            amount: b.total_amount,
            status: b.status as 'confirmed' | 'pending' | 'cancelled',
            date: new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        };
    }) || [];

    // Upcoming trips
    const upcomingTrips = upcomingBookings?.map(b => ({
        id: b.id,
        destination: b.destination || 'TBD',
        country: b.destination?.split(',')[1]?.trim() || '',
        startDate: new Date(b.travel_start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        endDate: new Date(b.travel_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        travelers: b.adults + b.children,
        status: b.status === 'confirmed' ? 'upcoming' as const : 'pending' as const,
    })) || [];

    return (
        <AgencyDashboardClient
            stats={{
                totalBookings,
                totalCustomers,
                totalRevenue,
                conversionRate: `${conversionRate}%`,
            }}
            leadStats={leadStats}
            bookingStats={bookingStats}
            weeklyRevenue={weeklyRevenue}
            topDestinations={topDestinations}
            recentBookings={recentBookings}
            upcomingTrips={upcomingTrips}
        />
    );
}
