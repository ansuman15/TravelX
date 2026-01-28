import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RevenuePageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AdminRevenuePage() {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        redirect('/agency');
    }

    const supabase = await createClient();

    // Get total revenue from all agencies
    const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_date, agency_id');

    // Get agencies with their revenue
    const { data: agencies } = await supabase
        .from('agencies')
        .select('id, name, is_active');

    // Calculate revenue stats
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthRevenue = payments
        ?.filter(p => new Date(p.payment_date) >= thisMonth)
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    const lastMonthRevenue = payments
        ?.filter(p => {
            const date = new Date(p.payment_date);
            return date >= lastMonth && date < thisMonth;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Revenue by agency
    const revenueByAgency = agencies?.map(agency => {
        const agencyRevenue = payments
            ?.filter(p => p.agency_id === agency.id)
            .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        return {
            ...agency,
            revenue: agencyRevenue,
        };
    }).sort((a, b) => b.revenue - a.revenue) || [];

    const revenueData = {
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        growthPercentage: lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : 0,
        revenueByAgency,
    };

    return <RevenuePageClient revenueData={revenueData} />;
}
