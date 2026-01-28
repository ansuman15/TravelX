import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { ReportsPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const user = await requireAuth();
    const supabase = await createClient();

    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    // Fetch bookings with more details
    const { data: bookings } = await supabase
        .from('bookings')
        .select('id, status, total_amount, amount_paid, created_at, destination, assigned_to')
        .order('created_at', { ascending: false });

    // Fetch leads with assigned user
    const { data: leads } = await supabase
        .from('leads')
        .select('id, status, source, created_at, assigned_to')
        .order('created_at', { ascending: false });

    // Fetch payments this month
    const { data: paymentsThisMonth } = await supabase
        .from('payments')
        .select('amount, payment_mode, created_at')
        .gte('created_at', startOfMonth);

    // Fetch payments last month
    const { data: paymentsLastMonth } = await supabase
        .from('payments')
        .select('amount')
        .gte('created_at', startOfLastMonth)
        .lt('created_at', startOfMonth);

    // Fetch customers
    const { data: customers } = await supabase
        .from('customers')
        .select('id, created_at');

    // Fetch staff users
    const { data: staffUsers } = await supabase
        .from('users')
        .select('id, full_name, role')
        .in('role', ['agent', 'manager', 'agency_admin']);

    // Fetch suppliers with booking services
    const { data: suppliers } = await supabase
        .from('suppliers')
        .select('id, name, category, default_margin');

    // Fetch booking services for supplier revenue
    const { data: bookingServices } = await supabase
        .from('booking_services')
        .select('supplier_id, cost_price, sell_price');

    // Calculate stats
    const thisMonthRevenue = paymentsThisMonth?.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0) || 0;
    const lastMonthRevenue = paymentsLastMonth?.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0) || 0;
    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    const totalBookings = bookings?.length || 0;
    const confirmedBookings = bookings?.filter(b => b.status === 'confirmed' || b.status === 'completed').length || 0;
    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.amount_paid || 0), 0) || 0;
    const pendingAmount = bookings?.reduce((sum, b) => sum + ((b.total_amount || 0) - (b.amount_paid || 0)), 0) || 0;

    // Leads stats
    const totalLeads = leads?.length || 0;
    const convertedLeads = leads?.filter(l => l.status === 'converted' || l.status === 'booked').length || 0;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Lead sources breakdown
    const leadsBySource = leads?.reduce((acc, l) => {
        const source = l.source || 'direct';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    // Bookings by destination (count)
    const bookingsByDestination = bookings?.reduce((acc, b) => {
        const dest = b.destination?.split(',')[0]?.trim() || 'Other';
        acc[dest] = (acc[dest] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    // Revenue by destination
    const revenueByDestination = bookings?.reduce((acc, b) => {
        const dest = b.destination?.split(',')[0]?.trim() || 'Other';
        acc[dest] = (acc[dest] || 0) + (b.amount_paid || 0);
        return acc;
    }, {} as Record<string, number>) || {};

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });

        const revenue = bookings?.filter(b => {
            const created = new Date(b.created_at);
            return created >= monthStart && created <= monthEnd;
        }).reduce((sum, b) => sum + (b.amount_paid || 0), 0) || 0;

        monthlyRevenue.push({ month: monthName, revenue });
    }

    // Payment modes breakdown
    const paymentModes = paymentsThisMonth?.reduce((acc, p) => {
        if (p.amount > 0) {
            acc[p.payment_mode] = (acc[p.payment_mode] || 0) + p.amount;
        }
        return acc;
    }, {} as Record<string, number>) || {};

    // Staff productivity stats
    const staffStats = (staffUsers || []).map(staff => {
        const staffLeads = leads?.filter(l => l.assigned_to === staff.id).length || 0;
        const staffBookings = bookings?.filter(b => b.assigned_to === staff.id) || [];
        const staffRevenue = staffBookings.reduce((sum, b) => sum + (b.amount_paid || 0), 0);
        const staffConverted = leads?.filter(l => l.assigned_to === staff.id && (l.status === 'converted' || l.status === 'booked')).length || 0;

        return {
            id: staff.id,
            name: staff.full_name,
            role: staff.role,
            leads: staffLeads,
            converted: staffConverted,
            conversionRate: staffLeads > 0 ? (staffConverted / staffLeads) * 100 : 0,
            bookings: staffBookings.length,
            revenue: staffRevenue,
        };
    }).sort((a, b) => b.revenue - a.revenue);

    // Supplier margins
    const supplierMargins = (suppliers || []).map(supplier => {
        const services = bookingServices?.filter(s => s.supplier_id === supplier.id) || [];
        const totalCost = services.reduce((sum, s) => sum + (s.cost_price || 0), 0);
        const totalSell = services.reduce((sum, s) => sum + (s.sell_price || 0), 0);
        const margin = totalSell > 0 ? ((totalSell - totalCost) / totalSell) * 100 : (supplier.default_margin || 0);

        return {
            id: supplier.id,
            name: supplier.name,
            category: supplier.category,
            totalCost,
            totalSell,
            margin,
            transactions: services.length,
        };
    }).filter(s => s.transactions > 0 || s.margin > 0).sort((a, b) => b.margin - a.margin);

    return (
        <ReportsPageClient
            stats={{
                thisMonthRevenue,
                lastMonthRevenue,
                revenueGrowth,
                totalBookings,
                confirmedBookings,
                totalRevenue,
                pendingAmount,
                totalLeads,
                convertedLeads,
                conversionRate,
                totalCustomers: customers?.length || 0,
            }}
            leadsBySource={leadsBySource}
            bookingsByDestination={bookingsByDestination}
            revenueByDestination={revenueByDestination}
            monthlyRevenue={monthlyRevenue}
            paymentModes={paymentModes}
            staffStats={staffStats}
            supplierMargins={supplierMargins}
        />
    );
}

