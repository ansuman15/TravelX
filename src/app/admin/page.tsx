import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { AdminDashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch platform-wide stats
    const { data: agencies } = await supabase
        .from('agencies')
        .select('id, name, is_active, created_at');

    const { data: users } = await supabase
        .from('users')
        .select('id, role, is_active, created_at');

    const { data: bookings } = await supabase
        .from('bookings')
        .select('id, total_amount, amount_paid, status, created_at');

    const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at');

    // Calculate stats
    const totalAgencies = agencies?.length || 0;
    const activeAgencies = agencies?.filter(a => a.is_active).length || 0;
    const totalUsers = users?.length || 0;
    const totalBookings = bookings?.length || 0;
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0) || 0;

    // Recent activity
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newAgenciesThisMonth = agencies?.filter(a => new Date(a.created_at) > thirtyDaysAgo).length || 0;
    const newUsersThisMonth = users?.filter(u => new Date(u.created_at) > thirtyDaysAgo).length || 0;
    const bookingsThisMonth = bookings?.filter(b => new Date(b.created_at) > thirtyDaysAgo).length || 0;
    const revenueThisMonth = payments?.filter(p => new Date(p.created_at) > thirtyDaysAgo).reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0) || 0;

    // Recent agencies
    const recentAgencies = agencies?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5) || [];

    return (
        <AdminDashboardClient
            stats={{
                totalAgencies,
                activeAgencies,
                totalUsers,
                totalBookings,
                totalRevenue,
                newAgenciesThisMonth,
                newUsersThisMonth,
                bookingsThisMonth,
                revenueThisMonth,
            }}
            recentAgencies={recentAgencies}
        />
    );
}
