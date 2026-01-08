import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SubscriptionsPageClient } from './page-client';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage() {
    const user = await requireAuth();

    if (user.role !== 'super_admin') {
        redirect('/agency');
    }

    const supabase = await createClient();

    // Fetch all agencies with subscription info
    const { data: agencies } = await supabase
        .from('agencies')
        .select(`
            id,
            name,
            email,
            subscription_plan,
            subscription_status,
            max_staff,
            is_active,
            created_at,
            users:users(count)
        `)
        .order('created_at', { ascending: false });

    const agenciesWithUserCount = (agencies || []).map(a => ({
        ...a,
        user_count: a.users?.[0]?.count || 0,
    }));

    // Calculate subscription stats
    const plans = {
        basic: agenciesWithUserCount.filter(a => a.subscription_plan === 'basic').length,
        pro: agenciesWithUserCount.filter(a => a.subscription_plan === 'pro').length,
        enterprise: agenciesWithUserCount.filter(a => a.subscription_plan === 'enterprise').length,
    };

    const activeSubscriptions = agenciesWithUserCount.filter(a => a.subscription_status === 'active' && a.is_active).length;

    return (
        <SubscriptionsPageClient
            agencies={agenciesWithUserCount}
            stats={{ plans, activeSubscriptions }}
        />
    );
}
